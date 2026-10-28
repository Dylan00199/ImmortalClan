# Asset notes

## Inspected files

- `public/wolf-map/map.png`: 1920 x 1280 pixel RGB image supplied in the repository.
- `public/wolf-map/map.config.json`: 60 x 40 cells at 32 pixels, with blocked cells, obstacles, water, berry patches, den, prey spawn zones and labels.
- `public/wolves/sheet.png`: 1024 x 637 pixel RGB image supplied in the chat. Two wolf designs, each shown front, back, left and right on a near-black background.

No `WOLF_ASSET_DIR` was provided and no individual wolf PNGs were present. The manifest therefore records one source sheet with eight source rectangles. Each directional pose has one frame. Walk, hunt, rest and social animations fall back to idle; the app flags this. The third wolf reuses the blue wolf pose and is labeled in the UI. The rendered sheet is color-keyed at runtime; a few dark edge pixels may be lost. No new art or audio was created or downloaded.
