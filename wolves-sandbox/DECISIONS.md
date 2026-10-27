# Decisions

- Built this as a separate Vite app in `wolves-sandbox/` to preserve the existing Demo A frontend and scope.
- The only wolf art supplied is one 1024 x 637 PNG contact sheet. No individual PNGs or animation sequence was supplied. Use its eight static poses as directional frames at runtime and label animation fallbacks in the UI.
- The supplied map/config are copied unchanged from `frontend/assets/world/` into this app. World coordinates remain map pixels.
- Use the deterministic Mock provider by default. Network adapters are optional and run only when explicitly configured in environment variables.
- The wolf IDs and third wolf name are centralized in `src/config/wolves.ts`.
- Store map edits in memory until exported; loading the page resets to the supplied map config.
- For the contact sheet, crop and color-key its near-black background in an offscreen canvas at load time. The original source is preserved.
