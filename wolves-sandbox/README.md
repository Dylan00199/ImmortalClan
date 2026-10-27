# Wolf Mind Sandbox

Browser prototype for comparing utility, LLM and hybrid decisions in three wolves. It is separate from the existing Demo A frontend and does not alter that game's scope.

## Run

From this directory, with Node.js 20 or later and npm available:

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally <http://localhost:5173>. On this machine, `pnpm install` and `pnpm dev` work with the bundled pnpm runtime.

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run compare -- --hours 1 --seed 7
```

The app loads `public/wolf-map/map.png` and `map.config.json` as supplied. The latter is validated at startup. The wolf sheet and its crop manifest are in `public/wolves/`. See [ASSET_NOTES.md](ASSET_NOTES.md) for gaps.

## Controls

- Drag the map to pan and use the mouse wheel to zoom.
- Pause, change speed, enter a seed and reset to reproduce a run.
- Spawn a threat near a selected wolf or drop food on the map.
- Toggle path, obstacle and perception overlays.
- Choose an edit tool, drag across cells to add or remove blocked cells, or click/drag to move the nearest water, food or den point. Export the edited config as JSON.
- Export the run log to compare action shares, need averages, emotion averages, social counts and LLM calls.
- Read each wolf's current intention, short decision thought, recent thought history, and progress toward becoming alpha in the right panel.

## Alpha rivalry

Each wolf aims to make the other two submit. When ready, it pursues a rival and challenges them. The result uses traits, energy, fear and the seeded random generator. A challenge costs energy but causes no injury. The loser submits and can challenge again after its cooldown. A wolf is crowned alpha only while both other wolves directly submit to it; defeating an alpha releases that alpha's subjects. Immediate danger and urgent needs take priority over challenges. The thought text is an observable summary of the decision logic or adapter response, not a hidden reasoning trace. The exported log includes each wolf's recent thoughts and dominance results.

## Brain configuration

`src/config/wolves.ts` holds the three IDs, names, traits and brain assignments. The default LLM adapter is deterministic Mock, so no credentials or network call are needed. For a live adapter, copy `.env.example` to `.env` and set `LLM_PROVIDER` to `openai` or `ollama`, plus `LLM_BASE_URL` and `LLM_MODEL`. Set `LLM_API_KEY` if required. The Vite development server holds the key and proxies requests; it is not sent to the browser. A static production build uses Mock unless served with an equivalent proxy.

The LLM is invoked at intervals and after major events. Invalid replies, timeouts and network errors keep the previous safe action. The hybrid brain uses utility decisions and only receives LLM thought text. Immediate danger always triggers the utility flee decision. `src/sim` has no browser or rendering imports, and the CLI runs it headlessly.

## Limitations

The supplied wolf image is a contact sheet with one pose per direction, so action animation uses a static idle fallback. The third wolf reuses the blue pose. Prey and threats use labeled simple shapes because no sprites were provided. The simulation is a comparison prototype, not a multiplayer or persistent game.
