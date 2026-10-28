#!/usr/bin/env python3
"""Procedural pixel-art wilderness map generator for the wolf sandbox.

Usage: python3 map_generator.py [seed] [output_dir]

Outputs:
  map.png          final map image (nearest-neighbour upscaled pixel art)
  map.config.json  collision grid, obstacle rectangles, water points, food patches,
                   den, prey spawn zones, zone labels (all in final image pixels)
"""
import json
import math
import random
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageDraw

SEED = int(sys.argv[1]) if len(sys.argv) > 1 else 7
OUT = sys.argv[2] if len(sys.argv) > 2 else "."

COLS, ROWS = 60, 40          # grid size in tiles
T = 16                       # base tile size in pixels (before upscaling)
SCALE = 2                    # nearest-neighbour upscale factor
CELL = T * SCALE             # final tile size in pixels (32)
W, H = COLS * T, ROWS * T    # base image size

rng = np.random.default_rng(SEED)
rnd = random.Random(SEED)


def smooth_field(cols, rows, octaves=((3, 1.0), (6, 0.55), (12, 0.3))):
    """Multi-octave smooth noise in [0, 1] at tile resolution."""
    out = np.zeros((rows, cols), dtype=np.float32)
    total = 0.0
    for res, amp in octaves:
        small = rng.random((max(2, res * rows // cols + 2), res + 2)).astype(np.float32)
        img = Image.fromarray(small, mode="F").resize((cols, rows), Image.BICUBIC)
        out += np.asarray(img) * amp
        total += amp
    out /= total
    lo, hi = out.min(), out.max()
    return (out - lo) / (hi - lo)


def upscale_field(field, w, h):
    img = Image.fromarray(field.astype(np.float32), mode="F").resize((w, h), Image.BICUBIC)
    return np.asarray(img)


def dilate(mask, r):
    out = mask.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r:
                out |= np.roll(np.roll(mask, dy, axis=0), dx, axis=1)
    return out


def tile_fraction(mask_px):
    """Fraction of True pixels per tile."""
    m = mask_px.reshape(ROWS, T, COLS, T).mean(axis=(1, 3))
    return m


# ---------------------------------------------------------------- terrain fields
xs, ys = np.meshgrid(np.linspace(0, 1, COLS), np.linspace(0, 1, ROWS))
n_water = smooth_field(COLS, ROWS)
n_rock = smooth_field(COLS, ROWS)
n_forest = smooth_field(COLS, ROWS)

lake_bias = np.clip(1 - np.hypot((xs - 0.28) / 0.17, (ys - 0.62) / 0.21), 0, 1)
pond_bias = np.clip(1 - np.hypot((xs - 0.72) / 0.07, (ys - 0.80) / 0.10), 0, 1)
mount_bias = np.clip(1 - np.hypot((xs - 0.88) / 0.27, (ys - 0.16) / 0.36), 0, 1)

water_field = lake_bias + pond_bias + 0.35 * (n_water - 0.5)
rock_field = mount_bias + 0.35 * (n_rock - 0.5)

water_px = upscale_field(water_field, W, H) > 0.33
rock_px = (upscale_field(rock_field, W, H) > 0.42) & ~water_px
sand_px = dilate(water_px, 5) & ~water_px & ~rock_px

# ---------------------------------------------------------------- tile classification
water_frac = tile_fraction(water_px)
rock_frac = tile_fraction(rock_px)
sand_frac = tile_fraction(sand_px)

blocked = np.zeros((ROWS, COLS), dtype=bool)
kind = np.full((ROWS, COLS), "", dtype=object)
for r in range(ROWS):
    for c in range(COLS):
        if water_frac[r, c] > 0.25:
            blocked[r, c] = True
            kind[r, c] = "water"
        elif rock_frac[r, c] > 0.25:
            blocked[r, c] = True
            kind[r, c] = "rock"

# keep a clear band at the map border so wolves do not hug the edge
open_tile = (~blocked) & (water_frac < 0.05) & (rock_frac < 0.05) & (sand_frac < 0.05)

# ---------------------------------------------------------------- den location (needs rock)
def rock_neighbor(r, c):
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            rr, cc = r + dr, c + dc
            if 0 <= rr < ROWS and 0 <= cc < COLS and kind[rr, cc] == "rock":
                return (rr, cc)
    return None


den_target = (0.80 * COLS, 0.42 * ROWS)
best = None
for r in range(ROWS):
    for c in range(COLS):
        if not blocked[r, c]:
            rn = rock_neighbor(r, c)
            if rn is not None:
                d = math.hypot(c - den_target[0], r - den_target[1])
                if best is None or d < best[0]:
                    best = (d, r, c, rn)
if best is None:
    raise SystemExit("No rock found for the den; try another seed")
_, den_r, den_c, den_rock = best

# ---------------------------------------------------------------- trees
trees = []  # (row, col) of trunk tile
clear_zone = np.zeros((ROWS, COLS), dtype=bool)
for r in range(ROWS):
    for c in range(COLS):
        if math.hypot(c - den_c, r - den_r) < 5:
            clear_zone[r, c] = True

for r in range(1, ROWS - 1):
    for c in range(1, COLS - 1):
        if (open_tile[r, c] and n_forest[r, c] > 0.57 and not clear_zone[r, c]
                and rnd.random() < 0.6):
            trees.append((r, c))
            blocked[r, c] = True
            kind[r, c] = "tree"

# ---------------------------------------------------------------- connectivity
def reachable_from(sr, sc):
    seen = np.zeros((ROWS, COLS), dtype=bool)
    q = deque([(sr, sc)])
    seen[sr, sc] = True
    while q:
        r, c = q.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            rr, cc = r + dr, c + dc
            if 0 <= rr < ROWS and 0 <= cc < COLS and not blocked[rr, cc] and not seen[rr, cc]:
                seen[rr, cc] = True
                q.append((rr, cc))
    return seen


reach = reachable_from(den_r, den_c)
for r in range(ROWS):
    for c in range(COLS):
        if not blocked[r, c] and not reach[r, c]:
            blocked[r, c] = True
            kind[r, c] = "tree"
            trees.append((r, c))
reach = reachable_from(den_r, den_c)

# ---------------------------------------------------------------- water points
shore_candidates = []
for r in range(ROWS):
    for c in range(COLS):
        if reach[r, c]:
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    rr, cc = r + dr, c + dc
                    if 0 <= rr < ROWS and 0 <= cc < COLS and kind[rr, cc] == "water":
                        shore_candidates.append((r, c))
                        break
                else:
                    continue
                break
rnd.shuffle(shore_candidates)
water_points = []
for r, c in shore_candidates:
    if all(math.hypot(r - wr, c - wc) >= 6 for wr, wc in water_points):
        water_points.append((r, c))
    if len(water_points) >= 6:
        break

# ---------------------------------------------------------------- food patches and prey zones
meadow = []
for r in range(2, ROWS - 2):
    for c in range(2, COLS - 2):
        if reach[r, c] and n_forest[r, c] < 0.45 and sand_frac[r, c] < 0.05 and not clear_zone[r, c]:
            if all(not (blocked[r + dr, c + dc] and kind[r + dr, c + dc] in ("water", "rock"))
                   for dr in (-2, -1, 0, 1, 2) for dc in (-2, -1, 0, 1, 2)):
                meadow.append((r, c))
rnd.shuffle(meadow)
food_patches = []
for r, c in meadow:
    if all(math.hypot(r - fr, c - fc) >= 7 for fr, fc in food_patches):
        food_patches.append((r, c))
    if len(food_patches) >= 7:
        break

prey_zones = []
for r, c in meadow:
    if all(math.hypot(r - pr, c - pc) >= 12 for pr, pc in prey_zones) and (r, c) not in food_patches:
        prey_zones.append((r, c))
    if len(prey_zones) >= 4:
        break

# ---------------------------------------------------------------- render (base resolution)
img = np.zeros((H, W, 3), dtype=np.uint8)
noise = rng.random((H, W))

GRASS = [(86, 140, 70), (74, 124, 60), (100, 158, 82)]
SAND = [(214, 196, 140), (200, 182, 128), (226, 210, 156)]
WATER = [(64, 112, 170), (52, 98, 152), (80, 130, 186)]
ROCK = [(120, 120, 126), (96, 96, 104), (142, 142, 148)]
FOREST_FLOOR = [(66, 112, 56), (56, 98, 48), (76, 124, 64)]

forest_px = upscale_field(n_forest, W, H) > 0.55


def paint(mask, palette, weights=(0.5, 0.3, 0.2)):
    a = noise
    c0 = (a < weights[0])
    c1 = (a >= weights[0]) & (a < weights[0] + weights[1])
    c2 = a >= weights[0] + weights[1]
    for sel, col in ((c0, palette[0]), (c1, palette[1]), (c2, palette[2])):
        img[mask & sel] = col


grass_px = ~(water_px | rock_px | sand_px)
paint(grass_px & ~forest_px, GRASS)
paint(grass_px & forest_px, FOREST_FLOOR)
paint(sand_px, SAND, (0.55, 0.3, 0.15))
paint(water_px, WATER, (0.6, 0.3, 0.1))
paint(rock_px, ROCK, (0.45, 0.35, 0.2))

# water highlights: short horizontal dashes
ys_w, xs_w = np.nonzero(water_px)
for _ in range(len(ys_w) // 60):
    i = rnd.randrange(len(ys_w))
    y, x = ys_w[i], xs_w[i]
    for dx in range(3):
        if x + dx < W and water_px[y, x + dx]:
            img[y, x + dx] = (150, 190, 226)

# rock highlights and cracks
ys_r, xs_r = np.nonzero(rock_px)
for _ in range(len(ys_r) // 90):
    i = rnd.randrange(len(ys_r))
    y, x = ys_r[i], xs_r[i]
    for k in range(4):
        yy, xx = y + k, x + (k // 2)
        if yy < H and xx < W and rock_px[yy, xx]:
            img[yy, xx] = (66, 66, 74)

# grass tufts and flowers
ys_g, xs_g = np.nonzero(grass_px & ~forest_px)
for _ in range(len(ys_g) // 55):
    i = rnd.randrange(len(ys_g))
    y, x = ys_g[i], xs_g[i]
    if y + 1 < H:
        img[y, x] = (60, 108, 50)
        img[y + 1, x] = (60, 108, 50)
for _ in range(len(ys_g) // 400):
    i = rnd.randrange(len(ys_g))
    y, x = ys_g[i], xs_g[i]
    img[y, x] = rnd.choice([(240, 240, 235), (240, 214, 90), (226, 130, 170)])

edge = rock_px & ~np.roll(rock_px, 1, 0) | rock_px & ~np.roll(rock_px, 1, 1) | rock_px & ~np.roll(rock_px, -1, 0) | rock_px & ~np.roll(rock_px, -1, 1)
img[dilate(edge, 1) & rock_px] = (74, 74, 82)
pil = Image.fromarray(img, mode="RGB")
d = ImageDraw.Draw(pil)


def tile_center(r, c):
    return c * T + T // 2, r * T + T // 2


# den: dark cave mouth drawn on the adjacent rock tile
rr, rc = den_rock
cx, cy = tile_center(rr, rc)
d.ellipse([cx - 11, cy - 11, cx + 11, cy + 8], fill=(150, 150, 156))
d.ellipse([cx - 9, cy - 9, cx + 9, cy + 8], fill=(28, 26, 32))
d.rectangle([cx - 9, cy, cx + 9, cy + 8], fill=(28, 26, 32))
d.ellipse([cx - 5, cy - 4, cx + 5, cy + 6], fill=(14, 12, 18))

# berry bushes on food patches
for r, c in food_patches:
    cx, cy = tile_center(r, c)
    for ox, oy in ((-4, 2), (3, 2), (0, -2), (-1, 4)):
        d.ellipse([cx + ox - 5, cy + oy - 5, cx + ox + 5, cy + oy + 5], fill=(46, 104, 52))
        d.ellipse([cx + ox - 3, cy + oy - 4, cx + ox + 2, cy + oy + 1], fill=(64, 130, 68))
    for _ in range(7):
        bx, by = cx + rnd.randint(-8, 8), cy + rnd.randint(-5, 7)
        d.point((bx, by), fill=(206, 40, 52))
        d.point((bx + 1, by), fill=(160, 24, 40))

# trees drawn back to front with jitter and colour variety so they do not look gridded
CANOPY = [((34, 84, 44), (48, 108, 56), (74, 140, 78)),
          ((40, 92, 52), (58, 120, 64), (88, 152, 86)),
          ((30, 76, 48), (44, 98, 60), (66, 128, 84))]
for r, c in sorted(trees):
    cx, cy = tile_center(r, c)
    cx += rnd.randint(-2, 2)
    cy += rnd.randint(-2, 2)
    dark, mid, light = rnd.choice(CANOPY)
    sz = rnd.choice([8, 9, 10])
    d.rectangle([cx - 1, cy + 1, cx + 1, cy + 7], fill=(96, 64, 38))
    d.ellipse([cx - sz, cy - sz - 2, cx + sz, cy + 4], fill=dark)
    d.ellipse([cx - sz + 1, cy - sz - 2, cx + sz - 3, cy + 1], fill=mid)
    d.ellipse([cx - sz + 3, cy - sz - 1, cx, cy - 4], fill=light)

# scattered decorative stones on open ground (not collision)
for _ in range(60):
    r, c = rnd.randrange(2, ROWS - 2), rnd.randrange(2, COLS - 2)
    if reach[r, c] and kind[r, c] == "" and sand_frac[r, c] < 0.05:
        cx, cy = tile_center(r, c)
        cx += rnd.randint(-5, 5)
        cy += rnd.randint(-5, 5)
        d.ellipse([cx - 3, cy - 2, cx + 3, cy + 2], fill=(132, 132, 138))
        d.ellipse([cx - 3, cy - 1, cx + 2, cy + 2], fill=(104, 104, 112))

big = pil.resize((W * SCALE, H * SCALE), Image.NEAREST)
big.save(f"{OUT}/map.png")

# ---------------------------------------------------------------- export config
def merge_rects():
    rects = []
    for k in ("water", "rock", "tree"):
        runs = {}
        for r in range(ROWS):
            c = 0
            while c < COLS:
                if blocked[r, c] and kind[r, c] == k:
                    c0 = c
                    while c < COLS and blocked[r, c] and kind[r, c] == k:
                        c += 1
                    runs.setdefault((c0, c - c0), []).append(r)
                else:
                    c += 1
        for (c0, length), rows_ in runs.items():
            rows_.sort()
            start = prev = rows_[0]
            for r in rows_[1:] + [None]:
                if r is not None and r == prev + 1:
                    prev = r
                    continue
                rects.append({"kind": k, "x": c0 * CELL, "y": start * CELL,
                              "w": length * CELL, "h": (prev - start + 1) * CELL})
                if r is not None:
                    start = prev = r
    return rects


def center_px(r, c):
    return {"x": c * CELL + CELL // 2, "y": r * CELL + CELL // 2}


config = {
    "seed": SEED,
    "world": {"width": W * SCALE, "height": H * SCALE},
    "grid": {
        "cols": COLS, "rows": ROWS, "cellSize": CELL,
        "blocked": ["".join("1" if blocked[r, c] else "0" for c in range(COLS)) for r in range(ROWS)],
    },
    "obstacles": merge_rects(),
    "waterPoints": [dict(center_px(r, c), radius=CELL) for r, c in water_points],
    "foodPatches": [dict(center_px(r, c), radius=CELL, kind="berry_bush") for r, c in food_patches],
    "den": dict(center_px(den_r, den_c), radius=int(CELL * 1.5)),
    "preySpawnZones": [dict(center_px(r, c), radius=CELL * 4) for r, c in prey_zones],
    "zones": [
        {"name": "Lake", "x": int(0.28 * COLS * CELL), "y": int(0.62 * ROWS * CELL)},
        {"name": "Pond", "x": int(0.72 * COLS * CELL), "y": int(0.80 * ROWS * CELL)},
        {"name": "Rocky hills", "x": int(0.88 * COLS * CELL), "y": int(0.16 * ROWS * CELL)},
    ],
}
with open(f"{OUT}/map.config.json", "w") as f:
    json.dump(config, f, indent=1)

print("map.png", big.size)
print("walkable tiles:", int((~blocked).sum()), "of", COLS * ROWS)
print("trees:", len(trees), "water points:", len(water_points),
      "food patches:", len(food_patches), "prey zones:", len(prey_zones))
print("den tile:", (den_r, den_c))
