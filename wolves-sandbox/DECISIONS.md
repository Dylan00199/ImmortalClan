# Decisions

- Built this as a separate Vite app in `wolves-sandbox/` to preserve the existing Demo A frontend and scope.
- The only wolf art supplied is one 1024 x 637 PNG contact sheet. No individual PNGs or animation sequence was supplied. Use its eight static poses as directional frames at runtime and label animation fallbacks in the UI.
- The supplied map/config are copied unchanged from `frontend/assets/world/` into this app. World coordinates remain map pixels.
- Use the deterministic Mock provider by default. Network adapters are optional and run only when explicitly configured in environment variables.
- The wolf IDs and third wolf name are centralized in `src/config/wolves.ts`.
- Store map edits in memory until exported; loading the page resets to the supplied map config.
- For the contact sheet, crop and color-key its near-black background in an offscreen canvas at load time. The original source is preserved.
- Interpret the requested alpha goal as direct submission from both other wolves. Challenges use existing traits, energy and fear plus seeded randomness; they cost energy, have cooldowns, and do not cause injury. A former subject is released when its leader loses.
- Show current intention and the latest short decision thoughts in the sidebar. These are generated decision summaries, not a model's private reasoning. Save them and dominance outcomes in exported run logs.
