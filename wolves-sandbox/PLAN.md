# Wolf Mind Sandbox - implementation plan

1. Inspect the supplied map and wolf sheet; record usable directions and missing animation frames.
2. Build a deterministic TypeScript simulation with validated map data, seeded RNG, pathfinding, needs, emotions, memory, prey and three interchangeable brains.
3. Add a Canvas viewer, controls, debug overlays, edit/export mode and wolf comparison panels.
4. Add provider adapters, a headless comparison command and focused tests; verify build, type check, lint and tests.

This prototype lives in `wolves-sandbox/` so the existing Demo A frontend remains intact.
