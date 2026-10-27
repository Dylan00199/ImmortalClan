import './style.css';
import { validateMap } from './config/map';
import { DEFAULT_LLM, MockAdapter } from './brains/llm';
import { ProxyAdapter } from './brains/proxy';
import { Renderer } from './render/renderer';
import { Engine } from './sim/world';
import { MapEditor, type EditTool } from './ui/editor';

const root = document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML = `<header class="top"><div><div class="eyebrow">TIÊN TỘC / BEHAVIOR LAB</div><h1>Wolf Mind Sandbox</h1></div><div class="top-meta"><span>THREE MINDS</span><strong id="clock">00:00</strong><span id="status">LOADING</span></div></header>
<main><section class="viewer"><div class="toolbar"><button id="pause">Pause</button><label>Speed <select id="speed"><option>1</option><option>2</option><option>5</option><option>20</option></select>x</label><label>Seed <input id="seed" type="number" value="7"></label><button id="reset">Reset</button><label>Threat near <select id="threat-wolf"><option value="adam">Adam</option><option value="eva">Eva</option><option value="wolf3">Wolf 3</option></select></label><button id="threat">Spawn threat</button><button id="food">Drop food</button><button id="export-log">Export log</button></div>
<div class="canvas-wrap"><canvas id="map" aria-label="Wolf sandbox map"></canvas><div class="map-hint">Drag to pan · Scroll to zoom · Edit mode to change map</div></div>
<div class="under"><label><input id="paths" type="checkbox"> Paths</label><label><input id="obstacles" type="checkbox"> Obstacles</label><label><input id="perception" type="checkbox"> Perception</label><label>Edit map <select id="tool"><option value="">Off</option><option value="add-tree">Add tree</option><option value="add-rock">Add rock</option><option value="add-water">Add water obstacle</option><option value="erase">Erase obstacle</option><option value="move-water">Move water point</option><option value="move-food">Move food patch</option><option value="move-den">Move den</option></select></label><button id="export-map">Export map config</button><span id="fallback">Static animation fallback</span></div></section>
<aside><div class="side-head"><div class="eyebrow">LIVE COMPARISON</div><h2>Three wolves, three brains</h2><p>Watch needs, emotion and decisions respond to the same world.</p></div><div id="wolves"></div><section class="events"><div class="eyebrow">WORLD EVENTS</div><div id="event-list"></div></section></aside></main>`;
const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const canvas = byId<HTMLCanvasElement>('map'); const renderer = new Renderer(canvas);
let engine: Engine; let editor: MapEditor; let original: ReturnType<typeof validateMap>; let paused = false; let speed = 1; let accumulator = 0; let last = performance.now(); let uiAt = 0; let dropFood = false;
const percent = (v: number) => `${Math.max(0, Math.min(100, v)).toFixed(0)}%`;
const escape = (value: string) => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
const bar = (name: string, value: number, emotion = false) => `<div class="bar-row"><span>${name}</span><div class="bar"><i style="width:${percent(emotion ? value * 100 : value)}"></i></div><b>${emotion ? value.toFixed(2) : Math.round(value)}</b></div>`;
function refreshUI(): void {
  if (!engine) return;
  byId('clock').textContent = `${String(Math.floor(engine.world.time / 3600)).padStart(2, '0')}:${String(Math.floor(engine.world.time / 60) % 60).padStart(2, '0')}`;
  byId('status').textContent = paused ? 'PAUSED' : `${speed}X LIVE`;
  byId('wolves').innerHTML = engine.world.wolves.map(w => `<article class="wolf-card ${w.design}"><div class="wolf-title"><div><span class="eyebrow">${w.brain.toUpperCase()} BRAIN</span><h3>${escape(w.name)}</h3></div><strong>${w.decision.action}</strong></div><p class="thought">“${escape(w.thoughts[0] ?? w.decision.thought)}”</p><div class="grid-two"><div><h4>NEEDS</h4>${Object.entries(w.needs).map(([k, v]) => bar(k, v)).join('')}</div><div><h4>EMOTIONS</h4>${Object.entries(w.emotions).map(([k, v]) => bar(k, v, true)).join('')}</div></div><div class="detail"><span>Target: ${escape(w.decision.targetId ?? 'none')}</span><span>Top memory: ${escape(w.memories.at(-1)?.type ?? 'none')}</span><span>Relations: ${Object.entries(w.relationships).map(([id, v]) => `${id} ${v.trust.toFixed(1)}/${v.affection.toFixed(1)}`).join(', ')}</span><span>Social ${w.stats.interactions} · Decisions ${w.stats.decisions} · LLM ${w.stats.llmCalls}/${w.stats.llmFailures} errors/${w.stats.invalidReplies} invalid</span><span>LLM latency ${w.stats.llmCalls ? Math.round(w.stats.llmLatencyMs / w.stats.llmCalls) : 0} ms avg</span><span>Action share: ${Object.entries(w.stats.timeByAction).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a, t]) => `${a} ${Math.round(t / Math.max(.1, engine.world.time) * 100)}%`).join(' · ')}</span></div><details><summary>Thoughts and memories</summary><ul>${w.thoughts.map(t => `<li>${escape(t)}</li>`).join('')}${w.memories.slice(-4).reverse().map(m => `<li>${escape(m.type)} · ${m.strength.toFixed(2)} · ${Math.round(m.time)}s</li>`).join('')}</ul></details></article>`).join('');
  byId('event-list').innerHTML = engine.world.events.slice(-8).reverse().map(e => `<div><time>${Math.floor(e.time)}s</time>${escape(e.text)}</div>`).join('');
  byId('fallback').textContent = renderer.fallback;
}
let llmOptions = { adapter: new MockAdapter() as MockAdapter | ProxyAdapter, llm: DEFAULT_LLM };
function reset(seed: number): void { engine = new Engine(structuredClone(original), seed, llmOptions); editor = new MapEditor(engine); editor.tool = byId<HTMLSelectElement>('tool').value as EditTool; renderer.camera = { x: Math.min(original.world.width - 500, original.den.x), y: original.den.y, zoom: .85 }; accumulator = 0; refreshUI(); }
function download(name: string, value: unknown): void { const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500); }
function frame(now: number): void {
  const elapsed = Math.min(.1, (now - last) / 1000); last = now;
  if (!paused && engine) { accumulator += elapsed * speed; let steps = 0; while (accumulator >= .1 && steps < 60) { engine.step(.1); accumulator -= .1; steps++; } if (steps === 60) accumulator = 0; }
  if (engine) renderer.draw(engine.world, editor.tool);
  if (now - uiAt > 500) { uiAt = now; refreshUI(); }
  requestAnimationFrame(frame);
}
byId('pause').addEventListener('click', () => { paused = !paused; byId('pause').textContent = paused ? 'Resume' : 'Pause'; refreshUI(); });
byId<HTMLSelectElement>('speed').addEventListener('change', e => { speed = Number((e.target as HTMLSelectElement).value); });
byId('reset').addEventListener('click', () => reset(Number(byId<HTMLInputElement>('seed').value) || 7));
byId('threat').addEventListener('click', () => engine.spawnThreat(byId<HTMLSelectElement>('threat-wolf').value));
byId('food').addEventListener('click', () => { dropFood = true; byId('food').textContent = 'Click map...'; });
byId('export-log').addEventListener('click', () => download('wolf-run-log.json', { seed: engine.world.seed, time: engine.world.time, events: engine.world.events, comparison: engine.summary(), wolves: engine.world.wolves.map(w => ({ id: w.id, stats: w.stats, memories: w.memories })) }));
byId('export-map').addEventListener('click', () => editor.export());
byId<HTMLSelectElement>('tool').addEventListener('change', e => { editor.tool = (e.target as HTMLSelectElement).value as EditTool; });
for (const key of ['paths', 'obstacles', 'perception'] as const) byId<HTMLInputElement>(key).addEventListener('change', e => { renderer.overlays[key] = (e.target as HTMLInputElement).checked; });
let drag: { x: number; y: number; cameraX: number; cameraY: number; worldX: number; worldY: number } | undefined;
canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); const p = renderer.screenToWorld(e.clientX, e.clientY); drag = { x: e.clientX, y: e.clientY, cameraX: renderer.camera.x, cameraY: renderer.camera.y, worldX: p.x, worldY: p.y }; });
canvas.addEventListener('pointermove', e => { if (!drag || editor.tool || dropFood) return; renderer.camera.x = drag.cameraX - (e.clientX - drag.x) / renderer.camera.zoom; renderer.camera.y = drag.cameraY - (e.clientY - drag.y) / renderer.camera.zoom; });
canvas.addEventListener('pointerup', e => { if (!drag) return; const start = { x: drag.worldX, y: drag.worldY }, end = renderer.screenToWorld(e.clientX, e.clientY); if (dropFood) { engine.dropFood(end.x, end.y); dropFood = false; byId('food').textContent = 'Drop food'; } else if (editor.tool) editor.edit(start, end); drag = undefined; });
canvas.addEventListener('wheel', e => { e.preventDefault(); renderer.camera.zoom = Math.max(.35, Math.min(2.5, renderer.camera.zoom * (e.deltaY < 0 ? 1.12 : .89))); }, { passive: false });
window.addEventListener('resize', () => renderer.resize());
try {
  const response = await fetch('/wolf-map/map.config.json'); if (!response.ok) throw new Error(`Map config HTTP ${response.status}`);
  original = validateMap(await response.json()); await renderer.load();
  try { const settings = await fetch('/api/llm-config').then(r => r.json()) as { enabled: boolean; maxCallsPerMinute: number; timeoutMs: number }; if (settings.enabled) llmOptions = { adapter: new ProxyAdapter(), llm: { intervalSeconds: 25, maxCallsPerMinute: settings.maxCallsPerMinute, timeoutMs: settings.timeoutMs } }; } catch { /* Static build uses Mock. */ }
  renderer.resize(); reset(original.seed); requestAnimationFrame(frame);
} catch (error) { root.innerHTML = `<div class="fatal"><h1>Map or asset loading failed</h1><pre></pre></div>`; root.querySelector('pre')!.textContent = error instanceof Error ? error.message : String(error); throw error; }
