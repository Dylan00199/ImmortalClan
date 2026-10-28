# Map decisions (generator v2)

## Plan followed
Size and grid, elevation and cliffs, biomes, vegetation and props, gameplay points, overlay layer, validation script, debug image. The v1 generator and its files are kept untouched in `v1/`.

## Decisions
- **Size:** 120 x 80 cells, cell size 32 px, 3840 x 2560 px. Art is drawn at 1920 x 1280 base resolution, then upscaled 2x with nearest-neighbour.
- **Determinism:** the generator retries internally with derived seeds (`seed * 1000 + attempt`) until every constraint passes. The attempt used is stored in `stats.attempt`. The same seed, columns and rows always give identical files (checked by `validate_map.py`).
- **Elevation:** smooth noise plus three highland masses, quantized into levels 0 to 3, cleaned with a majority filter. Water and a 3-cell margin around it are forced to level 0.
- **Cliffs:** a cell is a cliff when any of its 8 neighbours is lower. Cliff cells are blocked. The cell is drawn as a cliff face when the cell to its south is lower, otherwise as a stone rim. Shadows fall south and east (light from top-left).
- **Ramps:** 2-cell-wide strips crossing a cliff rim. They are added until every walkable region is joined to the main area, and until there are at least 3. Ramps that later end up cut off by trees or rocks are removed. This is why there are more than 3 ramps.
- **Biomes:** meadow (M), lowland forest (F), pine forest (P), rocky highland (R), lakeshore (S), water (W). Biomes drive which species and decorations appear.
- **Trees:** oak, pine, birch and dead trees. Only the trunk cell blocks movement. Canopies are jittered and drawn into both `map.png` and `map_overlay.png`.
- **Props:** boulders (1x1 and 2x2), fallen logs (2x1) and rock clusters, stumps. Boulders and logs are blocking. Stumps and clusters are decoration.
- **Clearings:** four open 20 x 15 cell meadows on level 0 are kept free of trees and props so chases have room. Cells in a clearing are converted to meadow.
- **Dens:** three dens, each on a cliff face with the walkable cell below it as the den point. `den` is the primary den and is also `dens[0]`.
- **Overlay:** `map_overlay.png` contains tree canopies and the lit top edge of cliff faces. `map.png` already contains them, so a consumer that ignores the overlay still sees a complete map.
- **Obstacle kinds:** `cliff` is a new obstacle kind. A strict v1 loader that rejects unknown kinds must be updated to accept `cliff`. All other v1 fields are unchanged.

## Results for the delivered seed (7)
- Walkable ratio about 0.626, four elevation levels, 14 ramps, 4 clearings.
- 14 water points, 16 food patches, 9 prey zones, 5 lookouts, 3 dens.
- 116 boulders, 28 logs, 40 stumps, 30 rock clusters, about 1977 trees.
- `validate_map.py` passes all checks. A second seed (12) also passes the structural checks.

## Known limitations
- Decorations such as flowers, ferns, reeds, tufts and pebbles are baked into the image and are not listed in the config.
- Highland ground at levels 2 and 3 is rocky by design, so those plateaus look grey. Level 1 plateaus can carry pine forest.
- Generation may reject a few attempts before one passes. The number of rejected attempts depends on the seed.
- Elevation is exported but wolves do not use it yet (for example high ground for perception). That is for the sandbox to decide.
