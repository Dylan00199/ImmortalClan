import { readFileSync } from 'node:fs';
import { validateMap } from './config/map';
import { Engine } from './sim/world';

const args = process.argv.slice(2);
const option = (name: string, fallback: number): number => { const i = args.indexOf(name); return i >= 0 ? Number(args[i + 1]) : fallback; };
const hours = option('--hours', 1), seed = option('--seed', 7);
if (!Number.isFinite(hours) || hours <= 0 || hours > 48 || !Number.isInteger(seed)) throw new Error('Use --hours 0..48 and integer --seed');
const map = validateMap(JSON.parse(readFileSync(new URL('../public/wolf-map/map.config.json', import.meta.url), 'utf8')));
const engine = new Engine(map, seed);
const steps = Math.round(hours * 3600 / .1);
for (let i = 0; i < steps; i++) engine.step(.1);
console.log(`Seed ${seed} | ${hours} simulated hour(s) | ${steps} fixed steps`);
console.table(engine.summary());
for (const w of engine.world.wolves) {
  const top = Object.entries(w.stats.timeByAction).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([a, s]) => `${a} ${(s / engine.world.time * 100).toFixed(1)}%`).join(', ');
  const avgEmotion = Object.fromEntries(Object.entries(w.stats.emotionTotal).map(([k, v]) => [k, (v / w.stats.samples).toFixed(2)]));
  console.log(`${w.name}: ${top}; emotions ${JSON.stringify(avgEmotion)}; LLM avg latency ${w.stats.llmCalls ? Math.round(w.stats.llmLatencyMs / w.stats.llmCalls) : 0}ms; invalid ${w.stats.invalidReplies}`);
}
