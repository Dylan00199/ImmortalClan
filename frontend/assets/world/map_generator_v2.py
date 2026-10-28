#!/usr/bin/env python3
"""Procedural pixel-art wilderness map generator, version 2 (schemaVersion 2).

Usage:
    python3 map_generator_v2.py --seed 7 --out . --cols 120 --rows 80

Outputs (in --out):
    map.png                   final map (cols*32 x rows*32 px, nearest-neighbour upscale of base art)
    map_overlay.png           transparent layer with tree canopies and cliff top edges (draw above wolves)
    map.config.json           schema v2 (all schema v1 fields are kept unchanged)
    map_collision_debug.png   debug view of collision, elevation, ramps and gameplay points

Light comes from the top-left. Everything is drawn by code at base resolution, then upscaled 2x.
The generator retries internally with derived seeds until all constraints pass, so a given
(seed, cols, rows) always produces the same files.
"""
import argparse
import json
import math
import os
import random
from collections import deque

import numpy as np
from PIL import Image, ImageDraw

T = 16                 # base tile size in pixels
SCALE = 2              # nearest-neighbour upscale factor
CELL = T * SCALE       # final cell size in pixels
MIN_WALKABLE = 0.60
D4 = [(1, 0), (-1, 0), (0, 1), (0, -1)]
D8 = [(dr, dc) for dr in (-1, 0, 1) for dc in (-1, 0, 1) if (dr, dc) != (0, 0)]

# ------------------------------------------------------------------ palette (single place)
PAL = {
    "grass": [(86, 140, 70), (74, 124, 60), (100, 158, 82)],
    "forest": [(66, 112, 56), (56, 98, 48), (76, 124, 64)],
    "pine": [(52, 90, 58), (44, 78, 50), (62, 104, 68)],
    "rocky": [(128, 122, 112), (108, 102, 94), (146, 140, 130)],
    "sand": [(214, 196, 140), (200, 182, 128), (226, 210, 156)],
    "water": [(64, 112, 170), (52, 98, 152), (80, 130, 186)],
    "tuft": (60, 108, 50),
    "needle": (92, 70, 48),
    "level_tint": [1.0, 1.07, 1.14, 1.2],
    "cliff_face": (112, 104, 98),
    "cliff_lit": (176, 170, 156),
    "cliff_dark": (92, 86, 82),
    "cliff_base": (70, 64, 64),
    "edge_light": (150, 144, 134),
    "edge_mid": (96, 90, 86),
    "edge_dark": (66, 62, 62),
    "trunk": (96, 64, 38),
    "oak": [((34, 84, 44), (48, 108, 56), (74, 140, 78)),
            ((40, 92, 52), (58, 120, 64), (88, 152, 86)),
            ((30, 76, 48), (44, 98, 60), (66, 128, 84))],
    "pine_tree": ((30, 78, 52), (44, 102, 64)),
    "birch_trunk": (226, 226, 218),
    "birch_mark": (54, 54, 56),
    "birch_canopy": ((86, 138, 62), (116, 168, 78)),
    "dead": (84, 62, 48),
    "boulder": ((112, 110, 116), (150, 150, 156), (60, 60, 68)),
    "moss": (84, 130, 60),
    "log": ((104, 72, 44), (140, 104, 66), (150, 116, 76)),
    "stump": ((110, 78, 48), (156, 120, 76), (120, 90, 56)),
    "flowers": [[(240, 240, 235), (240, 214, 90)], [(226, 130, 170), (250, 190, 210)],
                [(120, 140, 230), (170, 190, 250)], [(230, 120, 60), (250, 170, 90)]],
    "reed": ((92, 110, 52), (130, 90, 50)),
    "fern": (34, 96, 44),
    "berry_leaf": ((46, 104, 52), (64, 130, 68)),
    "berry": ((206, 40, 52), (160, 24, 40)),
    "cave": ((150, 144, 134), (28, 26, 32), (14, 12, 18)),
}


class GenError(Exception):
    pass


def dilate(mask, r):
    out = mask.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r:
                out |= np.roll(np.roll(mask, dy, axis=0), dx, axis=1)
    return out


def build(seed, cols, rows, attempt):
    R, C = rows, cols
    W, H = C * T, R * T
    rng = np.random.default_rng(seed)
    rnd = random.Random(seed)
    tree_scale = max(0.5, 1.0 - 0.06 * attempt)

    def smooth(octaves=((3, 1.0), (6, 0.55), (12, 0.3), (24, 0.15))):
        out = np.zeros((R, C), dtype=np.float32)
        total = 0.0
        for res, amp in octaves:
            small = rng.random((max(2, res * R // C + 2), res + 2)).astype(np.float32)
            out += np.asarray(Image.fromarray(small).resize((C, R), Image.BICUBIC)) * amp
            total += amp
        out /= total
        return (out - out.min()) / (out.max() - out.min() + 1e-9)

    def up(field):
        return np.asarray(Image.fromarray(field.astype(np.float32)).resize((W, H), Image.BICUBIC))

    def frac(mask_px):
        return mask_px.reshape(R, T, C, T).mean(axis=(1, 3))

    xs, ys = np.meshgrid(np.linspace(0, 1, C), np.linspace(0, 1, R))

    def blob(cx, cy, rx, ry):
        return np.clip(1 - np.hypot((xs - cx) / rx, (ys - cy) / ry), 0, 1)

    # ---------------------------------------------------------------- water
    water_field = (blob(0.26, 0.66, 0.14, 0.19) + blob(0.72, 0.80, 0.06, 0.09)
                   + blob(0.50, 0.38, 0.05, 0.08) + 0.35 * (smooth() - 0.5))
    water_px = up(water_field) > 0.33
    sand_px = dilate(water_px, 5) & ~water_px
    water_cell = frac(water_px) > 0.25
    sand_cell = (frac(sand_px) > 0.15) & ~water_cell

    # ---------------------------------------------------------------- elevation
    n_el = smooth(((2, 1.0), (4, 0.6), (8, 0.35)))
    bias = np.zeros((R, C), dtype=np.float32)
    for cx, cy, rx, ry, amp in ((0.85, 0.20, 0.22, 0.30, 1.0), (0.12, 0.20, 0.14, 0.20, 0.7),
                                (0.50, 0.92, 0.18, 0.12, 0.6)):
        bias += amp * blob(cx, cy, rx, ry)
    f = 0.45 * n_el + bias
    q = np.quantile(f, [0.64, 0.80, 0.91])
    lvl = ((f >= q[0]).astype(np.int8) + (f >= q[1]) + (f >= q[2])).astype(np.int8)
    for _ in range(2):
        pad = np.pad(lvl, 1, mode="edge")
        counts = np.stack([sum((pad[1 + dy:1 + dy + R, 1 + dx:1 + dx + C] == k).astype(np.int8)
                               for dy in (-1, 0, 1) for dx in (-1, 0, 1)) for k in range(4)])
        lvl = counts.argmax(0).astype(np.int8)
    lvl[dilate(water_cell, 3)] = 0

    def cliff_mask(lv):
        pad = np.pad(lv, 1, mode="constant", constant_values=127)
        m = np.zeros((R, C), dtype=bool)
        for dy, dx in D8:
            m |= pad[1 + dy:1 + dy + R, 1 + dx:1 + dx + C] < lv
        return m

    cliff = cliff_mask(lvl) & ~water_cell
    kind = np.full((R, C), "", dtype=object)
    kind[water_cell] = "water"
    kind[cliff] = "cliff"
    blocked = kind != ""
    ramp = np.zeros((R, C), dtype=bool)
    ramps = []
    cliff_cells = [(r, c) for r in range(R) for c in range(C) if cliff[r, c]]

    def label():
        lab = -np.ones((R, C), dtype=int)
        sizes = []
        for r in range(R):
            for c in range(C):
                if not blocked[r, c] and lab[r, c] < 0:
                    k = len(sizes)
                    lab[r, c] = k
                    q_ = deque([(r, c)])
                    n = 0
                    while q_:
                        a, b = q_.popleft()
                        n += 1
                        for dr, dc in D4:
                            rr, cc = a + dr, b + dc
                            if 0 <= rr < R and 0 <= cc < C and not blocked[rr, cc] and lab[rr, cc] < 0:
                                lab[rr, cc] = k
                                q_.append((rr, cc))
                    sizes.append(n)
        return lab, sizes

    def ramp_options(lab):
        """Yield (cells, d, L, label_i, label_l) for every valid ramp strip."""
        out = []
        for hr, hc in cliff_cells:
            if ramp[hr, hc]:
                continue
            L = int(lvl[hr, hc])
            if L < 1:
                continue
            for dr, dc in D4:
                for pr, pc in ((dc, dr), (-dc, -dr)):
                    h, h2 = (hr, hc), (hr + pr, hc + pc)
                    i, i2 = (hr - dr, hc - dc), (h2[0] - dr, h2[1] - dc)
                    l, l2 = (hr + dr, hc + dc), (h2[0] + dr, h2[1] + dc)
                    cells = [i, i2, h, h2, l, l2]
                    if any(not (0 <= a < R and 0 <= b < C) for a, b in cells):
                        continue
                    if any(ramp[a, b] or water_cell[a, b] for a, b in cells):
                        continue
                    if not (cliff[h] and cliff[h2]):
                        continue
                    if not (lvl[i] == L and lvl[i2] == L and lvl[h2] == L
                            and lvl[l] == L - 1 and lvl[l2] == L - 1):
                        continue
                    if any(blocked[a, b] for a, b in (i, i2, l, l2)):
                        continue
                    out.append((cells, (dr, dc), L, lab[i], lab[l]))
        return out

    def apply_ramp(cells, d, L):
        for a, b in cells:
            blocked[a, b] = False
            kind[a, b] = ""
            ramp[a, b] = True
        rs = [a for a, b in cells]
        cs = [b for a, b in cells]
        ramps.append({"cells": cells, "d": d, "from": L, "to": L - 1,
                      "bbox": (min(cs), min(rs), max(cs) - min(cs) + 1, max(rs) - min(rs) + 1)})

    for _ in range(80):
        lab, sizes = label()
        if not sizes:
            raise GenError("no walkable land")
        main = int(np.argmax(sizes))
        others = {k for k in range(len(sizes)) if k != main and sizes[k] >= 10}
        if not others:
            break
        cands = [o for o in ramp_options(lab)
                 if (o[3] == main and o[4] in others) or (o[4] == main and o[3] in others)]
        if not cands:
            break
        cells, d, L, _, _ = rnd.choice(cands)
        apply_ramp(cells, d, L)

    lab, sizes = label()
    main = int(np.argmax(sizes))
    guard = 0
    while len(ramps) < 3 and guard < 20:
        guard += 1
        cands = [o for o in ramp_options(lab) if o[3] == main and o[4] == main]
        rnd.shuffle(cands)
        placed = False
        for cells, d, L, _, _ in cands:
            cen = (sum(a for a, b in cells) / 6, sum(b for a, b in cells) / 6)
            if all(math.hypot(cen[0] - (sum(a for a, b in rp["cells"]) / 6),
                              cen[1] - (sum(b for a, b in rp["cells"]) / 6)) >= 12 for rp in ramps):
                apply_ramp(cells, d, L)
                placed = True
                break
        if not placed:
            break
        lab, sizes = label()
        main = int(np.argmax(sizes))
    if len(ramps) < 3:
        raise GenError("fewer than 3 ramps")

    # ---------------------------------------------------------------- biomes
    forest_n = smooth()
    rock_n = smooth()
    biome = np.full((R, C), "M", dtype="<U1")
    fc = forest_n > 0.52
    biome[fc & (lvl == 0)] = "F"
    biome[fc & (lvl >= 1)] = "P"
    biome[(lvl >= 2) | ((lvl >= 1) & (rock_n > 0.62))] = "R"
    biome[sand_cell] = "S"
    biome[water_cell] = "W"

    # ---------------------------------------------------------------- dens (on cliff faces)
    lab, sizes = label()
    main = int(np.argmax(sizes))
    den_cands = []
    for r in range(R - 1):
        for c in range(C):
            if (cliff[r, c] and not ramp[r, c] and lvl[r + 1, c] < lvl[r, c] and not blocked[r + 1, c]
                    and not ramp[r + 1, c] and lab[r + 1, c] == main and 1 < c < C - 2):
                den_cands.append((r, c))
    if len(den_cands) < 3:
        raise GenError("not enough cliff faces for dens")
    target = (0.30 * R, 0.80 * C)
    den_cands.sort(key=lambda p: (math.hypot(p[0] - target[0], p[1] - target[1]), p))
    dens = [den_cands[0]]
    for p in rnd.sample(den_cands, len(den_cands)):
        if len(dens) >= 3:
            break
        if all(math.hypot(p[0] - a, p[1] - b) >= 25 for a, b in dens):
            dens.append(p)
    if len(dens) < 3:
        raise GenError("could not place 3 dens")

    reserve = np.zeros((R, C), dtype=bool)
    for r, c in dens:
        reserve[max(0, r - 2):r + 5, max(0, c - 3):c + 4] = True
    for rp in ramps:
        for a, b in rp["cells"]:
            reserve[max(0, a - 2):a + 3, max(0, b - 2):b + 3] = True

    # ---------------------------------------------------------------- clearings (open meadows)
    good = (lvl == 0) & ~blocked & ~sand_cell & ~reserve & ~ramp
    integ = np.pad(good.astype(np.int32).cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    ww, wh = 20, 15
    windows = []
    for r in range(0, R - wh + 1, 2):
        for c in range(0, C - ww + 1, 2):
            s = integ[r + wh, c + ww] - integ[r, c + ww] - integ[r + wh, c] + integ[r, c]
            if s == ww * wh:
                windows.append((r, c))
    rnd.shuffle(windows)
    clearing = np.zeros((R, C), dtype=bool)
    chosen = []
    for r, c in windows:
        if len(chosen) >= 4:
            break
        if all(abs(r - a) >= wh or abs(c - b) >= ww for a, b in chosen):
            chosen.append((r, c))
            clearing[r:r + wh, c:c + ww] = True
    if len(chosen) < 3:
        raise GenError("fewer than 3 open clearings")
    biome[clearing] = "M"
    forest_n[clearing] = np.minimum(forest_n[clearing], 0.3)

    # ---------------------------------------------------------------- trees
    trees = []
    order = [(r, c) for r in range(1, R - 1) for c in range(1, C - 1)]
    rnd.shuffle(order)
    for r, c in order:
        if blocked[r, c] or clearing[r, c] or reserve[r, c] or sand_cell[r, c]:
            continue
        b = biome[r, c]
        fn = forest_n[r, c]
        sp = None
        if b == "F":
            if rnd.random() < 0.50 * tree_scale:
                sp = "oak" if rnd.random() < 0.7 else "birch"
        elif b == "P":
            if rnd.random() < 0.42 * tree_scale:
                sp = "pine" if rnd.random() < 0.88 else "birch"
        elif b == "R":
            if fn > 0.45 and rnd.random() < 0.12:
                sp = "pine" if rnd.random() < 0.5 else "dead"
            elif rnd.random() < 0.025:
                sp = "dead"
        elif b == "M":
            if fn > 0.44 and rnd.random() < 0.06:
                sp = "birch" if rnd.random() < 0.6 else "oak"
            elif rnd.random() < 0.012:
                sp = "oak" if rnd.random() < 0.5 else "birch"
        if sp:
            trees.append((r, c, sp))
            blocked[r, c] = True
            kind[r, c] = "tree"

    # ---------------------------------------------------------------- rocks, logs, stumps
    props = []

    def free(r, c, allow_clearing=False):
        return (0 <= r < R and 0 <= c < C and not blocked[r, c] and not reserve[r, c]
                and not sand_cell[r, c] and not ramp[r, c] and (allow_clearing or not clearing[r, c]))

    wt = {"R": 1.0, "M": 0.25, "F": 0.12, "P": 0.25}
    tries, placed = 0, 0
    while placed < max(60, C * R // 100) and tries < 8000:
        tries += 1
        r, c = rnd.randrange(1, R - 1), rnd.randrange(1, C - 1)
        if free(r, c) and rnd.random() < wt.get(biome[r, c], 0):
            blocked[r, c] = True
            kind[r, c] = "rock"
            props.append({"type": "boulder", "r": r, "c": c, "w": 1, "h": 1, "blocking": True})
            placed += 1
    tries, placed = 0, 0
    while placed < 20 and tries < 6000:
        tries += 1
        r, c = rnd.randrange(1, R - 2), rnd.randrange(1, C - 2)
        cells = [(r, c), (r + 1, c), (r, c + 1), (r + 1, c + 1)]
        if all(free(a, b) for a, b in cells) and rnd.random() < wt.get(biome[r, c], 0) * 1.5:
            for a, b in cells:
                blocked[a, b] = True
                kind[a, b] = "rock"
            props.append({"type": "boulder", "r": r, "c": c, "w": 2, "h": 2, "blocking": True})
            placed += 1
    tries, placed = 0, 0
    while placed < 28 and tries < 6000:
        tries += 1
        r, c = rnd.randrange(1, R - 1), rnd.randrange(1, C - 2)
        if biome[r, c] in ("F", "P") and free(r, c) and free(r, c + 1):
            for a, b in ((r, c), (r, c + 1)):
                blocked[a, b] = True
                kind[a, b] = "tree"
            props.append({"type": "log", "r": r, "c": c, "w": 2, "h": 1, "blocking": True})
            placed += 1
    tries, placed = 0, 0
    while placed < 40 and tries < 6000:
        tries += 1
        r, c = rnd.randrange(1, R - 1), rnd.randrange(1, C - 1)
        if biome[r, c] in ("F", "P", "M") and free(r, c, True):
            props.append({"type": "stump", "r": r, "c": c, "w": 1, "h": 1, "blocking": False})
            placed += 1
    boulders1 = [p for p in props if p["type"] == "boulder"][:30]
    for p in boulders1:
        for dr, dc in rnd.sample(D8, len(D8)):
            r, c = p["r"] + dr, p["c"] + dc
            if free(r, c, True):
                props.append({"type": "rock_cluster", "r": r, "c": c, "w": 1, "h": 1, "blocking": False})
                break

    # ---------------------------------------------------------------- fill unreachable pockets
    lab, sizes = label()
    main = int(np.argmax(sizes))
    for r in range(R):
        for c in range(C):
            if not blocked[r, c] and lab[r, c] != main:
                blocked[r, c] = True
                kind[r, c] = "tree"
                trees.append((r, c, "oak" if lvl[r, c] == 0 else "pine"))
    lab, sizes = label()
    main = int(np.argmax(sizes))
    reach = (lab == main)

    # drop ramps that ended up cut off from the main walkable area by trees or rocks
    keep = []
    for rp in ramps:
        if any(reach[a, b] for a, b in rp["cells"]):
            keep.append(rp)
            continue
        for a, b in rp["cells"]:
            ramp[a, b] = False
            if cliff[a, b]:
                kind[a, b] = "cliff"
                blocked[a, b] = True
                trees[:] = [t for t in trees if (t[0], t[1]) != (a, b)]
    ramps[:] = keep
    if len(ramps) < 3:
        raise GenError("fewer than 3 reachable ramps")

    for r, c in dens:
        if not reach[r + 1, c]:
            raise GenError("den not reachable")
    walkable_ratio = float((~blocked).mean())
    if walkable_ratio < MIN_WALKABLE:
        raise GenError(f"walkable ratio {walkable_ratio:.2f} too low")

    # ---------------------------------------------------------------- gameplay points
    def greedy(cands, count, min_d, existing=()):
        chosen_ = list(existing)
        out_ = []
        for p in cands:
            if all(math.hypot(p[0] - a, p[1] - b) >= min_d for a, b in chosen_):
                chosen_.append(p)
                out_.append(p)
                if len(out_) >= count:
                    break
        return out_

    near_wc = dilate((kind == "water") | (kind == "cliff"), 2)
    water_adj = dilate(water_cell, 1)
    cand = [(r, c) for r in range(R) for c in range(C)
            if reach[r, c] and not blocked[r, c] and not ramp[r, c] and water_adj[r, c]]
    rnd.shuffle(cand)
    water_pts = greedy(cand, 14, 8)
    if len(water_pts) < 12:
        water_pts = greedy(cand, 14, 5)
    if len(water_pts) < 12:
        raise GenError("not enough water points")

    cand = [(r, c) for r in range(2, R - 2) for c in range(2, C - 2)
            if reach[r, c] and not blocked[r, c] and biome[r, c] in ("M", "F") and not near_wc[r, c]
            and not reserve[r, c]]
    rnd.shuffle(cand)
    food_pts = greedy(cand, 16, 7)
    if len(food_pts) < 14:
        raise GenError("not enough food patches")

    walk_int = np.pad((~blocked).astype(np.int32).cumsum(0).cumsum(1), ((1, 0), (1, 0)))

    def walk_frac(r, c, rad):
        r0, r1, c0, c1 = max(0, r - rad), min(R, r + rad + 1), max(0, c - rad), min(C, c + rad + 1)
        s = walk_int[r1, c1] - walk_int[r0, c1] - walk_int[r1, c0] + walk_int[r0, c0]
        return s / ((r1 - r0) * (c1 - c0))

    cand = [(r, c) for r in range(4, R - 4) for c in range(4, C - 4)
            if reach[r, c] and biome[r, c] == "M" and walk_frac(r, c, 4) >= 0.7]
    rnd.shuffle(cand)
    cand.sort(key=lambda p: not clearing[p[0], p[1]])
    prey_pts = greedy(cand, 9, 10)
    if len(prey_pts) < 8:
        raise GenError("not enough prey zones")

    cliff_near = dilate(cliff, 1)
    cand = [(r, c) for r in range(R) for c in range(C)
            if reach[r, c] and lvl[r, c] >= 1 and not cliff_near[r, c] and not blocked[r, c]]
    rnd.shuffle(cand)
    cand.sort(key=lambda p: -lvl[p[0], p[1]])
    look_pts = greedy(cand, 5, 15)
    if len(look_pts) < 4:
        raise GenError("not enough lookouts")

    # ---------------------------------------------------------------- render ground
    noise = rng.random((H, W))
    img = np.zeros((H, W, 3), dtype=np.uint8)
    lvl_px = np.kron(lvl, np.ones((T, T), dtype=np.int8))
    forest_px = up(forest_n) > 0.52
    rocky_px = ((up(rock_n) > 0.62) & (lvl_px >= 1)) | (lvl_px >= 2)
    m_water = water_px
    m_sand = sand_px & ~water_px
    m_rocky = rocky_px & ~m_water & ~m_sand
    taken = m_water | m_sand | m_rocky
    m_pine = forest_px & (lvl_px >= 1) & ~taken
    m_forest = forest_px & (lvl_px == 0) & ~taken
    m_grass = ~(taken | m_pine | m_forest)

    def paint(mask, pal, weights=(0.5, 0.3, 0.2)):
        c0 = noise < weights[0]
        c1 = (noise >= weights[0]) & (noise < weights[0] + weights[1])
        c2 = noise >= weights[0] + weights[1]
        for sel, col in ((c0, pal[0]), (c1, pal[1]), (c2, pal[2])):
            img[mask & sel] = col

    paint(m_grass, PAL["grass"])
    paint(m_forest, PAL["forest"])
    paint(m_pine, PAL["pine"])
    paint(m_rocky, PAL["rocky"], (0.45, 0.35, 0.2))
    paint(m_sand, PAL["sand"], (0.55, 0.3, 0.15))
    paint(m_water, PAL["water"], (0.6, 0.3, 0.1))
    img[m_pine & (noise > 0.965)] = PAL["needle"]
    tint = np.array(PAL["level_tint"])[lvl_px][..., None]
    img = np.clip(img.astype(np.float32) * np.where(m_water[..., None], 1.0, tint), 0, 255).astype(np.uint8)

    # cliff drop shadows (light from top-left, shadow falls south and east)
    for r, c in cliff_cells:
        if ramp[r, c]:
            continue
        y0, x0 = r * T, c * T
        if r + 1 < R and lvl[r + 1, c] < lvl[r, c] and y0 + T < H:
            blk = img[y0 + T:y0 + T + 4, x0:x0 + T].astype(np.float32) * 0.74
            img[y0 + T:y0 + T + 4, x0:x0 + T] = blk.astype(np.uint8)
        elif c + 1 < C and lvl[r, c + 1] < lvl[r, c] and x0 + T < W:
            blk = img[y0:y0 + T, x0 + T:x0 + T + 3].astype(np.float32) * 0.8
            img[y0:y0 + T, x0 + T:x0 + T + 3] = blk.astype(np.uint8)

    # water glints, grass tufts
    wy, wx = np.nonzero(water_px)
    for _ in range(len(wy) // 60):
        i = rnd.randrange(len(wy))
        y, x = wy[i], wx[i]
        for dx in range(3):
            if x + dx < W and water_px[y, x + dx]:
                img[y, x + dx] = (150, 190, 226)
    gy, gx = np.nonzero(m_grass)
    for _ in range(len(gy) // 55):
        i = rnd.randrange(len(gy))
        y, x = gy[i], gx[i]
        if y + 1 < H:
            img[y, x] = PAL["tuft"]
            img[y + 1, x] = PAL["tuft"]
    ry_, rx_ = np.nonzero(m_rocky)
    for _ in range(len(ry_) // 120):
        i = rnd.randrange(len(ry_))
        y, x = ry_[i], rx_[i]
        for k in range(4):
            if y + k < H and x + k // 2 < W and m_rocky[y + k, x + k // 2]:
                img[y + k, x + k // 2] = (84, 80, 74)

    pil = Image.fromarray(img, mode="RGB")
    d = ImageDraw.Draw(pil)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    do = ImageDraw.Draw(overlay)

    def center(r, c):
        return c * T + T // 2, r * T + T // 2

    # ---------------------------------------------------------------- cliffs
    for r, c in cliff_cells:
        if ramp[r, c]:
            continue
        x0, y0 = c * T, r * T
        face = r + 1 < R and lvl[r + 1, c] < lvl[r, c]
        if face:
            d.rectangle([x0, y0, x0 + T - 1, y0 + T - 1], fill=PAL["cliff_face"])
            d.rectangle([x0, y0, x0 + T - 1, y0 + 2], fill=PAL["cliff_lit"])
            do.rectangle([x0, y0, x0 + T - 1, y0 + 1], fill=PAL["cliff_lit"])
            d.rectangle([x0, y0 + T - 2, x0 + T - 1, y0 + T - 1], fill=PAL["cliff_base"])
            for x in range(x0 + 2, x0 + T, 4):
                ln = rnd.randint(5, 10)
                d.line([(x, y0 + 3), (x, y0 + 3 + ln)], fill=PAL["cliff_dark"])
            for _ in range(5):
                d.point((x0 + rnd.randrange(T), y0 + rnd.randrange(3, T - 2)), fill=PAL["cliff_dark"])
        else:
            for dr, dc in D4:
                rr, cc = r + dr, c + dc
                if 0 <= rr < R and 0 <= cc < C and lvl[rr, cc] < lvl[r, c]:
                    lit = (dr, dc) in ((-1, 0), (0, -1))
                    body = PAL["edge_light"] if lit else PAL["edge_mid"]
                    rim = PAL["edge_mid"] if lit else PAL["edge_dark"]
                    if dr == -1:
                        d.rectangle([x0, y0, x0 + T - 1, y0 + 3], fill=body)
                        d.line([(x0, y0), (x0 + T - 1, y0)], fill=rim)
                    elif dr == 1:
                        d.rectangle([x0, y0 + T - 4, x0 + T - 1, y0 + T - 1], fill=body)
                        d.line([(x0, y0 + T - 1), (x0 + T - 1, y0 + T - 1)], fill=rim)
                    elif dc == -1:
                        d.rectangle([x0, y0, x0 + 3, y0 + T - 1], fill=body)
                        d.line([(x0, y0), (x0, y0 + T - 1)], fill=rim)
                    else:
                        d.rectangle([x0 + T - 4, y0, x0 + T - 1, y0 + T - 1], fill=body)
                        d.line([(x0 + T - 1, y0), (x0 + T - 1, y0 + T - 1)], fill=rim)
            for dr, dc in ((-1, -1), (-1, 1), (1, -1), (1, 1)):
                rr, cc = r + dr, c + dc
                if 0 <= rr < R and 0 <= cc < C and lvl[rr, cc] < lvl[r, c]:
                    px = x0 if dc == -1 else x0 + T - 4
                    py = y0 if dr == -1 else y0 + T - 4
                    d.rectangle([px, py, px + 3, py + 3], fill=PAL["edge_mid"])

    # den cave mouths on cliff faces
    for r, c in dens:
        cx, cy = center(r, c)
        ring, dark, deep = PAL["cave"]
        d.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=ring)
        d.rectangle([cx - 7, cy, cx + 7, cy + T // 2 - 1], fill=ring)
        d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=dark)
        d.rectangle([cx - 5, cy, cx + 5, cy + T // 2 - 1], fill=dark)
        d.ellipse([cx - 3, cy - 3, cx + 3, cy + 4], fill=deep)

    # ramps: sloped stripes along the travel direction
    for rp in ramps:
        dr, dc = rp["d"]
        for a, b in rp["cells"]:
            x0, y0 = b * T, a * T
            for k in range(0, T, 4):
                if dr != 0:
                    d.line([(x0, y0 + k), (x0 + T - 1, y0 + k)], fill=(120, 96, 66))
                    d.line([(x0, y0 + k + 1), (x0 + T - 1, y0 + k + 1)], fill=(158, 128, 88))
                else:
                    d.line([(x0 + k, y0), (x0 + k, y0 + T - 1)], fill=(120, 96, 66))
                    d.line([(x0 + k + 1, y0), (x0 + k + 1, y0 + T - 1)], fill=(158, 128, 88))

    # ---------------------------------------------------------------- ground decoration
    meadow_cells = [(r, c) for r in range(R) for c in range(C)
                    if biome[r, c] == "M" and not blocked[r, c] and not ramp[r, c]]
    for _ in range(70):
        r, c = rnd.choice(meadow_cells)
        cx, cy = center(r, c)
        cx += rnd.randint(-6, 6)
        cy += rnd.randint(-6, 6)
        pal = rnd.choice(PAL["flowers"])
        for _ in range(rnd.randint(12, 30)):
            px = int(cx + rnd.gauss(0, 4.5))
            py = int(cy + rnd.gauss(0, 3.5))
            if 0 <= px < W - 1 and 0 <= py < H:
                col = rnd.choice(pal)
                d.point((px, py), fill=col)
                if rnd.random() < 0.3:
                    d.point((px + 1, py), fill=col)
    shore = [(r, c) for r in range(R) for c in range(C) if sand_cell[r, c] and water_adj[r, c]]
    for r, c in shore:
        if rnd.random() < 0.4:
            for _ in range(rnd.randint(2, 4)):
                x = c * T + rnd.randrange(T)
                y = r * T + rnd.randrange(4, T)
                ln = rnd.randint(5, 7)
                d.line([(x, y), (x, y - ln)], fill=PAL["reed"][0])
                d.point((x, y - ln), fill=PAL["reed"][1])
    for r in range(R):
        for c in range(C):
            if biome[r, c] in ("F", "P") and not blocked[r, c] and rnd.random() < 0.06:
                cx, cy = center(r, c)
                for dx, dy in ((-3, -3), (0, -4), (3, -3)):
                    d.line([(cx, cy), (cx + dx, cy + dy)], fill=PAL["fern"])
            if biome[r, c] in ("M", "R") and not blocked[r, c] and rnd.random() < 0.05:
                cx, cy = center(r, c)
                d.point((cx + rnd.randint(-5, 5), cy + rnd.randint(-5, 5)), fill=(132, 132, 138))
                d.point((cx + rnd.randint(-5, 5), cy + rnd.randint(-5, 5)), fill=(104, 104, 112))

    # ---------------------------------------------------------------- props
    def boulder(cx, cy, rad):
        base, lit, dark = PAL["boulder"]
        d.ellipse([cx - rad, cy - rad + 1, cx + rad, cy + rad], fill=dark)
        d.ellipse([cx - rad + 1, cy - rad + 1, cx + rad - 1, cy + rad - 1], fill=base)
        d.ellipse([cx - rad + 2, cy - rad + 2, cx + 1, cy + 1], fill=lit)
        for _ in range(3):
            d.point((cx - rad // 2 + rnd.randint(-1, 2), cy - rad // 2 + rnd.randint(-1, 2)), fill=PAL["moss"])

    for p in props:
        r, c = p["r"], p["c"]
        if p["type"] == "boulder":
            if p["w"] == 1:
                cx, cy = center(r, c)
                boulder(cx, cy + 1, 6)
            else:
                boulder((c + 1) * T, (r + 1) * T, 13)
        elif p["type"] == "log":
            cx, cy = (c + 1) * T, r * T + T // 2
            body, hi, cap = PAL["log"]
            d.rectangle([cx - 14, cy - 4, cx + 14, cy + 5], fill=body)
            d.line([(cx - 14, cy - 4), (cx + 14, cy - 4)], fill=hi)
            for x in range(cx - 10, cx + 12, 5):
                d.line([(x, cy - 2), (x, cy + 3)], fill=(80, 54, 32))
            d.ellipse([cx - 17, cy - 5, cx - 10, cy + 6], fill=cap)
            d.ellipse([cx - 15, cy - 2, cx - 12, cy + 3], fill=body)
        elif p["type"] == "stump":
            cx, cy = center(r, c)
            body, top, ring = PAL["stump"]
            d.ellipse([cx - 4, cy - 2, cx + 4, cy + 4], fill=body)
            d.ellipse([cx - 4, cy - 3, cx + 4, cy + 1], fill=top)
            d.ellipse([cx - 2, cy - 2, cx + 2, cy], fill=ring)
        elif p["type"] == "rock_cluster":
            cx, cy = center(r, c)
            for _ in range(rnd.randint(3, 4)):
                ox, oy, rr_ = rnd.randint(-5, 5), rnd.randint(-4, 4), rnd.randint(2, 3)
                d.ellipse([cx + ox - rr_, cy + oy - rr_ + 1, cx + ox + rr_, cy + oy + rr_], fill=PAL["boulder"][2])
                d.ellipse([cx + ox - rr_ + 1, cy + oy - rr_ + 1, cx + ox + rr_ - 1, cy + oy + rr_ - 1],
                          fill=PAL["boulder"][0])

    # berry bushes on food patches
    for r, c in food_pts:
        cx, cy = center(r, c)
        for ox, oy in ((-4, 2), (3, 2), (0, -2), (-1, 4)):
            d.ellipse([cx + ox - 5, cy + oy - 5, cx + ox + 5, cy + oy + 5], fill=PAL["berry_leaf"][0])
            d.ellipse([cx + ox - 3, cy + oy - 4, cx + ox + 2, cy + oy + 1], fill=PAL["berry_leaf"][1])
        for _ in range(7):
            bx, by = cx + rnd.randint(-8, 8), cy + rnd.randint(-5, 7)
            d.point((bx, by), fill=PAL["berry"][0])
            d.point((bx + 1, by), fill=PAL["berry"][1])

    # ---------------------------------------------------------------- trees (back to front)
    def both(fn):
        fn(d)
        fn(do)

    for r, c, sp in sorted(trees):
        cx, cy = center(r, c)
        cx += rnd.randint(-2, 2)
        cy += rnd.randint(-2, 2)
        if sp == "oak":
            dark, mid, light = rnd.choice(PAL["oak"])
            sz = rnd.choice([8, 9, 10])
            d.rectangle([cx - 1, cy + 1, cx + 1, cy + 7], fill=PAL["trunk"])

            def canopy(g, dark=dark, mid=mid, light=light, sz=sz, cx=cx, cy=cy):
                g.ellipse([cx - sz, cy - sz - 2, cx + sz, cy + 4], fill=dark)
                g.ellipse([cx - sz + 1, cy - sz - 2, cx + sz - 3, cy + 1], fill=mid)
                g.ellipse([cx - sz + 3, cy - sz - 1, cx, cy - 4], fill=light)
            both(canopy)
        elif sp == "pine":
            d.rectangle([cx - 1, cy + 2, cx + 1, cy + 7], fill=PAL["trunk"])
            dk, lt = PAL["pine_tree"]

            def canopy(g, dk=dk, lt=lt, cx=cx, cy=cy):
                for apex, base, hw in ((cy - 20, cy - 11, 5), (cy - 15, cy - 5, 7), (cy - 9, cy + 2, 9)):
                    g.polygon([(cx, apex), (cx - hw, base), (cx + hw, base)], fill=dk)
                    g.polygon([(cx, apex), (cx - hw, base), (cx, base)], fill=lt)
            both(canopy)
        elif sp == "birch":
            d.rectangle([cx - 1, cy - 4, cx + 1, cy + 7], fill=PAL["birch_trunk"])
            d.point((cx, cy - 2), fill=PAL["birch_mark"])
            d.point((cx, cy + 2), fill=PAL["birch_mark"])
            d.point((cx + 1, cy + 5), fill=PAL["birch_mark"])
            dk, lt = PAL["birch_canopy"]

            def canopy(g, dk=dk, lt=lt, cx=cx, cy=cy):
                g.ellipse([cx - 7, cy - 14, cx + 7, cy - 1], fill=dk)
                g.ellipse([cx - 6, cy - 14, cx + 3, cy - 6], fill=lt)
            both(canopy)
        else:
            col = PAL["dead"]
            d.rectangle([cx - 1, cy - 8, cx + 1, cy + 7], fill=col)
            d.line([(cx, cy - 5), (cx - 6, cy - 11)], fill=col)
            d.line([(cx, cy - 3), (cx + 5, cy - 9)], fill=col)
            d.line([(cx, cy - 8), (cx + 2, cy - 14)], fill=col)
        if sp in ("oak", "pine", "birch") and rnd.random() < 0.12:
            mx, my = cx + rnd.choice([-6, 6]), cy + 7
            d.rectangle([mx, my, mx + 2, my + 1], fill=(206, 50, 50))
            d.point((mx + 1, my), fill=(240, 240, 235))

    # ---------------------------------------------------------------- export
    big = pil.resize((W * SCALE, H * SCALE), Image.NEAREST)
    over = overlay.resize((W * SCALE, H * SCALE), Image.NEAREST)

    def merge_rects():
        rects = []
        for k in ("water", "rock", "tree", "cliff"):
            runs = {}
            for r in range(R):
                c = 0
                while c < C:
                    if blocked[r, c] and kind[r, c] == k:
                        c0 = c
                        while c < C and blocked[r, c] and kind[r, c] == k:
                            c += 1
                        runs.setdefault((c0, c - c0), []).append(r)
                    else:
                        c += 1
            for (c0, length), rws in sorted(runs.items()):
                rws.sort()
                start = prev = rws[0]
                for r in rws[1:] + [None]:
                    if r is not None and r == prev + 1:
                        prev = r
                        continue
                    rects.append({"kind": k, "x": c0 * CELL, "y": start * CELL,
                                  "w": length * CELL, "h": (prev - start + 1) * CELL})
                    if r is not None:
                        start = prev = r
        return rects

    def cp(r, c):
        return {"x": c * CELL + CELL // 2, "y": r * CELL + CELL // 2}

    def centroid(mask):
        ys_, xs_ = np.nonzero(mask)
        if len(ys_) == 0:
            return None
        return {"x": int(xs_.mean() * CELL + CELL // 2), "y": int(ys_.mean() * CELL + CELL // 2)}

    # water components for zone names
    wl = -np.ones((R, C), dtype=int)
    wsizes = []
    for r in range(R):
        for c in range(C):
            if water_cell[r, c] and wl[r, c] < 0:
                k = len(wsizes)
                wl[r, c] = k
                qq = deque([(r, c)])
                n = 0
                while qq:
                    a, b = qq.popleft()
                    n += 1
                    for dr, dc in D4:
                        rr, cc = a + dr, b + dc
                        if 0 <= rr < R and 0 <= cc < C and water_cell[rr, cc] and wl[rr, cc] < 0:
                            wl[rr, cc] = k
                            qq.append((rr, cc))
                wsizes.append(n)
    zones = []
    for nm, k in zip(("Lake", "Pond"), np.argsort(wsizes)[::-1][:2]):
        ce = centroid(wl == k)
        if ce:
            zones.append(dict(name=nm, **ce))
    for nm, mask in (("Pine Highlands", biome == "P"), ("Lowland Forest", biome == "F"),
                     ("Rocky Ridge", lvl >= 2)):
        ce = centroid(mask)
        if ce:
            zones.append(dict(name=nm, **ce))
    mm = np.zeros((R, C), dtype=bool)
    mr, mc = chosen[0]
    mm[mr:mr + wh, mc:mc + ww] = True
    zones.append(dict(name="Meadow", **centroid(mm)))

    prop_out = [{"type": p["type"], "x": p["c"] * CELL, "y": p["r"] * CELL,
                 "w": p["w"] * CELL, "h": p["h"] * CELL, "blocking": p["blocking"]} for p in props]
    den_out = [dict(cp(r + 1, c), radius=int(CELL * 1.5)) for r, c in dens]
    config = {
        "schemaVersion": 2,
        "seed": None,
        "world": {"width": W * SCALE, "height": H * SCALE},
        "grid": {"cols": C, "rows": R, "cellSize": CELL,
                 "blocked": ["".join("1" if blocked[r, c] else "0" for c in range(C)) for r in range(R)]},
        "obstacles": merge_rects(),
        "waterPoints": [dict(cp(r, c), radius=CELL) for r, c in water_pts],
        "foodPatches": [dict(cp(r, c), radius=CELL, kind="berry_bush") for r, c in food_pts],
        "den": den_out[0],
        "preySpawnZones": [dict(cp(r, c), radius=CELL * 4) for r, c in prey_pts],
        "zones": zones,
        "elevation": ["".join(str(int(lvl[r, c])) for c in range(C)) for r in range(R)],
        "biomes": ["".join(biome[r, c] for c in range(C)) for r in range(R)],
        "biomeLegend": {"M": "meadow", "F": "lowland forest", "P": "pine forest",
                        "R": "rocky highland", "S": "lakeshore", "W": "water"},
        "ramps": [{"x": rp["bbox"][0] * CELL, "y": rp["bbox"][1] * CELL, "w": rp["bbox"][2] * CELL,
                   "h": rp["bbox"][3] * CELL, "from": rp["from"], "to": rp["to"]} for rp in ramps],
        "lookouts": [dict(cp(r, c), radius=CELL * 3, level=int(lvl[r, c])) for r, c in look_pts],
        "dens": den_out,
        "props": prop_out,
        "overlayImage": "map_overlay.png",
        "stats": {"walkableRatio": round(walkable_ratio, 4), "trees": len(trees),
                  "attempt": attempt, "clearings": len(chosen)},
    }
    return big, over, config, dict(lvl=lvl, ramp=ramp, kind=kind, blocked=blocked)


def debug_image(big, config):
    im = big.convert("RGBA")
    ov = Image.new("RGBA", im.size, (0, 0, 0, 0))
    dd = ImageDraw.Draw(ov)
    tints = {1: (255, 255, 0, 40), 2: (255, 150, 0, 60), 3: (255, 0, 0, 80)}
    cell = config["grid"]["cellSize"]
    for r, row in enumerate(config["elevation"]):
        for c, ch in enumerate(row):
            if int(ch) in tints:
                dd.rectangle([c * cell, r * cell, c * cell + cell - 1, r * cell + cell - 1], fill=tints[int(ch)])
    cols = {"water": (40, 80, 255, 110), "rock": (255, 255, 255, 110),
            "tree": (255, 40, 40, 100), "cliff": (150, 0, 200, 130)}
    for o in config["obstacles"]:
        dd.rectangle([o["x"], o["y"], o["x"] + o["w"] - 1, o["y"] + o["h"] - 1], fill=cols[o["kind"]])
    for rp in config["ramps"]:
        dd.rectangle([rp["x"], rp["y"], rp["x"] + rp["w"] - 1, rp["y"] + rp["h"] - 1], fill=(0, 255, 0, 150))
    for p in config["waterPoints"]:
        dd.ellipse([p["x"] - 14, p["y"] - 14, p["x"] + 14, p["y"] + 14], fill=(0, 255, 255, 240))
    for p in config["foodPatches"]:
        dd.ellipse([p["x"] - 14, p["y"] - 14, p["x"] + 14, p["y"] + 14], fill=(255, 0, 200, 240))
    for p in config["dens"]:
        dd.ellipse([p["x"] - 16, p["y"] - 16, p["x"] + 16, p["y"] + 16], fill=(255, 255, 0, 255))
    for p in config["lookouts"]:
        dd.ellipse([p["x"] - 16, p["y"] - 16, p["x"] + 16, p["y"] + 16], outline=(255, 255, 255, 255), width=5)
    for p in config["preySpawnZones"]:
        dd.ellipse([p["x"] - p["radius"], p["y"] - p["radius"], p["x"] + p["radius"], p["y"] + p["radius"]],
                   outline=(255, 160, 0, 255), width=4)
    out = Image.alpha_composite(im, ov).convert("RGB")
    return out.resize((1920, int(1920 * out.size[1] / out.size[0])), Image.NEAREST)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--out", default=".")
    ap.add_argument("--cols", type=int, default=120)
    ap.add_argument("--rows", type=int, default=80)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    last = None
    for attempt in range(40):
        try:
            big, over, config, _ = build(a.seed * 1000 + attempt, a.cols, a.rows, attempt)
            break
        except GenError as e:
            last = e
            print(f"attempt {attempt} rejected: {e}")
    else:
        raise SystemExit(f"generation failed: {last}")
    config["seed"] = a.seed
    big.save(os.path.join(a.out, "map.png"))
    over.save(os.path.join(a.out, "map_overlay.png"))
    with open(os.path.join(a.out, "map.config.json"), "w") as fh:
        json.dump(config, fh, indent=1)
    debug_image(big, config).save(os.path.join(a.out, "map_collision_debug.png"))
    s = config["stats"]
    print("map.png", big.size, "| walkable", s["walkableRatio"], "| trees", s["trees"], "| attempt", s["attempt"])
    print("ramps", len(config["ramps"]), "water", len(config["waterPoints"]), "food", len(config["foodPatches"]),
          "prey", len(config["preySpawnZones"]), "lookouts", len(config["lookouts"]), "dens", len(config["dens"]))


if __name__ == "__main__":
    main()
