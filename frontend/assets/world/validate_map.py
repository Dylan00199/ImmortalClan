#!/usr/bin/env python3
"""Validate map.png and map.config.json produced by map_generator_v2.py.

Usage: python3 validate_map.py [--dir wolf-map] [--skip-determinism]
Exit code is 0 when every check passes and 1 otherwise.
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from collections import deque

from PIL import Image

MIN_COUNTS = {"waterPoints": 12, "foodPatches": 14, "preySpawnZones": 8, "lookouts": 4, "dens": 3, "ramps": 3}


def sha(path):
    with open(path, "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=os.path.dirname(os.path.abspath(__file__)))
    ap.add_argument("--skip-determinism", action="store_true")
    a = ap.parse_args()

    results = []

    def check(name, ok, detail=""):
        results.append((name, ok, detail))
        print(("PASS" if ok else "FAIL"), "-", name, ("(" + detail + ")") if detail else "")

    cfg = json.load(open(os.path.join(a.dir, "map.config.json")))
    img = Image.open(os.path.join(a.dir, "map.png"))
    g = cfg["grid"]
    cols, rows, cell = g["cols"], g["rows"], g["cellSize"]
    blocked = g["blocked"]

    # 1. sizes
    check("map.png size equals world size",
          img.size == (cfg["world"]["width"], cfg["world"]["height"]), f"{img.size}")
    check("grid size times cellSize equals world size",
          cols * cell == cfg["world"]["width"] and rows * cell == cfg["world"]["height"])
    ov_path = os.path.join(a.dir, cfg.get("overlayImage", "map_overlay.png"))
    if os.path.exists(ov_path):
        ov = Image.open(ov_path).convert("RGBA")
        alpha = ov.getchannel("A")
        extrema = alpha.getextrema()
        check("overlay has same size and real transparency", ov.size == img.size and extrema[0] == 0 and extrema[1] > 0,
              f"alpha range {extrema}")
    else:
        check("overlay file exists", False, ov_path)

    # 6. array shapes
    for key, arr in (("grid.blocked", blocked), ("elevation", cfg["elevation"]), ("biomes", cfg["biomes"])):
        check(f"{key} has {rows} rows of length {cols}", len(arr) == rows and all(len(x) == cols for x in arr))

    # 2. obstacles cover exactly blocked cells
    exp = {(r, c) for r in range(rows) for c in range(cols) if blocked[r][c] == "1"}
    cov = {}
    ok_align = True
    for o in cfg["obstacles"]:
        if o["x"] % cell or o["y"] % cell or o["w"] % cell or o["h"] % cell:
            ok_align = False
        for r in range(o["y"] // cell, (o["y"] + o["h"]) // cell):
            for c in range(o["x"] // cell, (o["x"] + o["w"]) // cell):
                cov[(r, c)] = cov.get((r, c), 0) + 1
    check("obstacle rectangles are cell aligned", ok_align)
    check("obstacles cover exactly the blocked cells", set(cov) == exp and all(v == 1 for v in cov.values()),
          f"{len(cov)} covered vs {len(exp)} blocked")

    # reachability from the primary den
    def cell_of(p):
        return int(p["y"] // cell), int(p["x"] // cell)

    sr, sc = cell_of(cfg["den"])
    seen = {(sr, sc)}
    q = deque([(sr, sc)])
    while q:
        r, c = q.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            rr, cc = r + dr, c + dc
            if 0 <= rr < rows and 0 <= cc < cols and blocked[rr][cc] == "0" and (rr, cc) not in seen:
                seen.add((rr, cc))
                q.append((rr, cc))

    # 3. points on walkable, reachable cells
    bad = []
    for key in ("waterPoints", "foodPatches", "preySpawnZones", "lookouts", "dens"):
        for p in cfg[key]:
            if cell_of(p) not in seen:
                bad.append((key, cell_of(p)))
    for rp in cfg["ramps"]:
        r0, c0 = rp["y"] // cell, rp["x"] // cell
        if not any((r, c) in seen for r in range(r0, r0 + rp["h"] // cell) for c in range(c0, c0 + rp["w"] // cell)):
            bad.append(("ramps", (r0, c0)))
    bad.append(("den", cell_of(cfg["den"]))) if cell_of(cfg["den"]) not in seen else None
    check("all points are on walkable cells reachable from the primary den", not bad, str(bad[:5]))

    # 4. counts
    for key, mn in MIN_COUNTS.items():
        n = len(cfg[key])
        check(f"{key} count >= {mn}", n >= mn, str(n))

    # 5. walkable ratio
    ratio = sum(row.count("0") for row in blocked) / (rows * cols)
    check("walkable ratio >= 0.60", ratio >= 0.60, f"{ratio:.3f}")

    # 7. ramps and levels
    levels = {int(ch) for row in cfg["elevation"] for ch in row}
    ok_ramps = True
    for rp in cfg["ramps"]:
        r0, c0 = rp["y"] // cell, rp["x"] // cell
        ls = {int(cfg["elevation"][r][c]) for r in range(r0, r0 + rp["h"] // cell)
              for c in range(c0, c0 + rp["w"] // cell)}
        if not ({rp["from"], rp["to"]} <= ls and abs(rp["from"] - rp["to"]) == 1):
            ok_ramps = False
    check("every ramp connects two adjacent elevation levels", ok_ramps)
    reached_levels = {int(cfg["elevation"][r][c]) for r, c in seen}
    check("every elevation level present is reachable", levels <= reached_levels,
          f"levels {sorted(levels)} reachable {sorted(reached_levels)}")
    check("at least three elevation levels", len(levels) >= 3, str(sorted(levels)))

    # 8. determinism
    if not a.skip_determinism:
        gen = os.path.join(a.dir, "map_generator_v2.py")
        hashes = []
        for _ in range(2):
            with tempfile.TemporaryDirectory() as tmp:
                subprocess.run([sys.executable, gen, "--seed", str(cfg["seed"]), "--out", tmp,
                                "--cols", str(cols), "--rows", str(rows)],
                               check=True, stdout=subprocess.DEVNULL)
                hashes.append(tuple(sha(os.path.join(tmp, f)) for f in ("map.png", "map_overlay.png", "map.config.json")))
        check("same seed gives identical files on two runs", hashes[0] == hashes[1])
        here = tuple(sha(os.path.join(a.dir, f)) for f in ("map.png", "map_overlay.png", "map.config.json"))
        check("delivered files match a fresh run with the same seed", here == hashes[0])

    failed = [n for n, ok, _ in results if not ok]
    print()
    print("RESULT:", "PASS" if not failed else f"FAIL ({len(failed)} failed: {failed})")
    sys.exit(0 if not failed else 1)


if __name__ == "__main__":
    main()
