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
npm run evaluate -- --seeds 30 --hours 0.5 --first-seed 1
```

The canonical map is `../frontend/assets/world/map.png`, `map.config.json` and `map_overlay.png` (v2, 3840×2560). `npm run sync-map` copies them into `public/wolf-map/`; `dev`, `build`, `test`, `compare` and `evaluate` sync automatically. Image dimensions, collision cells and cliff obstacles are checked when loaded. The overlay is drawn above wolves for tree and cliff occlusion. The wolf sheet and its crop manifest are in `public/wolves/`. See [ASSET_NOTES.md](ASSET_NOTES.md) for gaps.

## Controls

- Drag the map to pan and use the mouse wheel to zoom.
- Pause, change speed, enter a seed and reset to reproduce a run.
- Spawn a threat near a selected wolf or drop food on the map.
- Toggle path, obstacle and perception overlays.
- Choose an edit tool, drag across cells to add or remove blocked cells, or click/drag to move the nearest water, food or den point. Export the edited config as JSON.
- Export the run log to compare action shares, need averages, emotion averages, social counts and LLM calls.
- The evaluation command runs repeated seeded simulations and writes a Markdown report plus raw JSON to `reports/`.
- Read each wolf's current intention, short decision thought, recent thought history, and progress toward becoming alpha in the right panel.

## Alpha rivalry

Each wolf aims to make the other two submit. All three start with equal attack (16) and maximum health (100). Killing prey or a threat adds attack and maximum health, up to the caps in `src/config/progression.ts`. A threat has its own health and attack; wolves can choose `ATTACK_THREAT`, take retaliation damage, and earn the kill reward.

Adam is hot-headed and can challenge despite poor energy or a weak health margin. Eva protects her stamina and can provoke distrust between the other two; the resulting pair tries to reach one another and duel within ten simulated seconds. Oden compares effective strength, health, energy, relationships, opponents and ally support before challenging. He can offer Eva a temporary alliance against Adam; Eva's acceptance depends on the current power balance and her condition. The active plan, alliance, fight timer and decision log are visible or exportable.

When a wolf becomes alpha, it can protect submitted members from nearby threats and share food with hungry members. Protection and food sharing increase the member's affection toward the leader. Resting at the den restores health. At zero health a wolf must rest and recover; the prototype has no death state. The loser submits and can challenge again after its cooldown. A wolf is crowned alpha only while both other wolves directly submit to it; defeating an alpha releases that alpha's subjects. Thought text is an observable summary of the decision logic or adapter response, not a hidden reasoning trace.

The panel shows equal starting stats, health, attack, decision changes, abandoned plans, food, protection, alliance and current intention. The export includes events, conflicts and structured decision records with the observed health, strength, emotion, preconditions, plan, action start and result.

## Brain configuration

`src/config/wolves.ts` holds the three IDs, names, traits and brain assignments. The default LLM adapter is deterministic Mock, so no credentials or network call are needed. For a live adapter, copy `.env.example` to `.env` and set `LLM_PROVIDER` to `openai` or `ollama`, plus `LLM_BASE_URL` and `LLM_MODEL`. Set `LLM_API_KEY` if required. The Vite development server holds the key and proxies requests; it is not sent to the browser. A static production build uses Mock unless served with an equivalent proxy.

The LLM is invoked at intervals and after major events. Invalid replies, timeouts and network errors keep the previous safe action. The hybrid brain uses utility decisions and only receives LLM thought text. Threat response is selected using health and attack: wolves able to win may fight, while wolves that cannot safely fight flee. `src/sim` has no browser or rendering imports, and the CLI/evaluator run it headlessly.

## Limitations

The supplied wolf image is a contact sheet with one pose per direction, so action animation uses a static idle fallback. The third wolf reuses the blue pose. Prey and threats use labeled simple shapes because no sprites were provided. The simulation is a comparison prototype, not a multiplayer or persistent game.
