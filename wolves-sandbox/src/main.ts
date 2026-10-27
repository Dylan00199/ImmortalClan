import './style.css';
import { validateMap } from './config/map';
import { DEFAULT_LLM, MockAdapter } from './brains/llm';
import { ProxyAdapter } from './brains/proxy';
import { Renderer } from './render/renderer';
import { Engine } from './sim/world';
import { MapEditor, type EditTool } from './ui/editor';

const root = document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML = `<header class="top"><div><div class="eyebrow">TIÊN TỘC / BEHAVIOR LAB</div><h1>Wolf Mind Sandbox</h1></div><div class="top-meta"><span id="alpha">CHƯA CÓ BÁ CHỦ</span><strong id="clock">00:00</strong><span id="status">LOADING</span></div></header>
<main><section class="viewer"><div class="toolbar"><button id="pause">Pause</button><label>Speed <select id="speed"><option>1</option><option>2</option><option>5</option><option>20</option></select>x</label><label>Seed <input id="seed" type="number" value="7"></label><button id="reset">Reset</button><label>Threat near <select id="threat-wolf"><option value="adam">Adam</option><option value="eva">Eva</option><option value="wolf3">Wolf 3</option></select></label><button id="threat">Spawn threat</button><button id="food">Drop food</button><button id="export-log">Export log</button></div>
<div class="canvas-wrap"><canvas id="map" aria-label="Wolf sandbox map"></canvas><div class="map-hint">Drag to pan · Scroll to zoom · Edit mode to change map</div></div>
<div class="under"><label><input id="paths" type="checkbox"> Paths</label><label><input id="obstacles" type="checkbox"> Obstacles</label><label><input id="perception" type="checkbox"> Perception</label><label>Edit map <select id="tool"><option value="">Off</option><option value="add-tree">Add tree</option><option value="add-rock">Add rock</option><option value="add-water">Add water obstacle</option><option value="erase">Erase obstacle</option><option value="move-water">Move water point</option><option value="move-food">Move food patch</option><option value="move-den">Move den</option></select></label><button id="export-map">Export map config</button><span id="fallback">Static animation fallback</span></div></section>
<aside><div class="side-head"><div class="eyebrow">SUY NGHĨ TRỰC TIẾP</div><h2>Ai sẽ làm bá chủ?</h2><p>Mỗi sói muốn hai con còn lại quy phục. Xem chúng đang nghĩ gì, định làm gì và ai đang dẫn đầu.</p></div><div id="wolves"></div><section class="events"><div class="eyebrow">SỰ KIỆN TRONG BẦY</div><div id="event-list"></div></section></aside></main>`;
const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const canvas = byId<HTMLCanvasElement>('map'); const renderer = new Renderer(canvas);
let engine: Engine; let editor: MapEditor; let original: ReturnType<typeof validateMap>; let paused = false; let speed = 1; let accumulator = 0; let last = performance.now(); let uiAt = 0; let dropFood = false;
const percent = (v: number) => `${Math.max(0, Math.min(100, v)).toFixed(0)}%`;
const escape = (value: string) => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
const bar = (name: string, value: number, emotion = false) => `<div class="bar-row"><span>${name}</span><div class="bar"><i style="width:${percent(emotion ? value * 100 : value)}"></i></div><b>${emotion ? value.toFixed(2) : Math.round(value)}</b></div>`;
const actionName: Record<string, string> = { IDLE: 'quan sát', WANDER: 'thăm dò lãnh địa', GO_TO: 'di chuyển', DRINK: 'uống nước', EAT: 'tìm thức ăn', HUNT: 'săn mồi', REST: 'nghỉ ngơi', FLEE: 'bỏ chạy', FOLLOW: 'theo dõi', PLAY: 'chơi cùng bầy', SHARE_FOOD: 'chia thức ăn', GROOM: 'chăm sóc đồng loại', HOWL: 'tru gọi bầy', QUARREL: 'tranh cãi', CHALLENGE: 'thách đấu', SUBMIT: 'tạm quy phục' };
function refreshUI(): void {
  if (!engine) return;
  byId('clock').textContent = `${String(Math.floor(engine.world.time / 3600)).padStart(2, '0')}:${String(Math.floor(engine.world.time / 60) % 60).padStart(2, '0')}`;
  byId('status').textContent = paused ? 'PAUSED' : `${speed}X LIVE`;
  const alpha = engine.world.wolves.find(w => w.id === engine.world.alphaId);
  byId('alpha').textContent = alpha ? `BÁ CHỦ: ${alpha.name.toUpperCase()}` : 'CHƯA CÓ BÁ CHỦ';
  byId('wolves').innerHTML = engine.world.wolves.map(w => {
    const subjects = engine.world.wolves.filter(v => v.submittedTo === w.id);
    const master = engine.world.wolves.find(v => v.id === w.submittedTo);
    const target = engine.world.wolves.find(v => v.id === w.decision.targetId);
    const intent = `${actionName[w.decision.action] ?? w.decision.action}${target ? ` ${target.name}` : ''}`;
    const rank = engine.world.alphaId === w.id ? 'Bá chủ hiện tại' : master ? `Đang quy phục ${master.name}` : 'Đang tranh ngôi';
    return `<article class="wolf-card ${w.design} ${engine.world.alphaId === w.id ? 'alpha-card' : ''}"><div class="wolf-title"><div><span class="eyebrow">${w.brain.toUpperCase()} BRAIN</span><h3>${escape(w.name)}</h3></div><strong>${escape(actionName[w.decision.action] ?? w.decision.action)}</strong></div>
      <div class="goal"><b>MỤC TIÊU: BÁ CHỦ</b><span>Thống trị cả hai sói còn lại</span><div class="goal-track"><i style="width:${subjects.length * 50}%"></i></div><small>${subjects.length}/2 đã quy phục${subjects.length ? `: ${subjects.map(v => escape(v.name)).join(', ')}` : ''} · ${escape(rank)}</small></div>
      <div class="intent"><span>MUỐN LÀM GÌ TIẾP?</span><strong>${escape(intent)}</strong></div>
      <div class="mind"><span>ĐANG NGHĨ</span><p>“${escape(w.decision.thought)}”</p><div class="mind-history">${w.thoughts.slice(0, 3).map(t => `<div><time>${Math.floor(t.time)}s</time>${escape(t.text)}</div>`).join('')}</div></div>
      <div class="grid-two"><div><h4>NHU CẦU</h4>${Object.entries(w.needs).map(([k, v]) => bar(k, v)).join('')}</div><div><h4>CẢM XÚC</h4>${Object.entries(w.emotions).map(([k, v]) => bar(k, v, true)).join('')}</div></div>
      <div class="detail"><span>Thách đấu: ${w.dominanceWins} thắng / ${w.dominanceLosses} thua</span><span>Quan hệ: ${Object.entries(w.relationships).map(([id, v]) => `${id} ${v.trust.toFixed(1)}/${v.affection.toFixed(1)}`).join(', ')}</span><span>Tương tác ${w.stats.interactions} · Quyết định ${w.stats.decisions} · LLM ${w.stats.llmCalls} gọi / ${w.stats.llmFailures} lỗi / ${w.stats.invalidReplies} sai</span><span>Hành động: ${Object.entries(w.stats.timeByAction).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a, t]) => `${a} ${Math.round(t / Math.max(.1, engine.world.time) * 100)}%`).join(' · ')}</span></div><details><summary>Ký ức gần đây</summary><ul>${w.memories.slice(-4).reverse().map(m => `<li>${escape(m.type)} · ${m.strength.toFixed(2)} · ${Math.round(m.time)}s</li>`).join('')}</ul></details></article>`;
  }).join('');
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
byId('export-log').addEventListener('click', () => download('wolf-run-log.json', { seed: engine.world.seed, time: engine.world.time, alphaId: engine.world.alphaId, events: engine.world.events, comparison: engine.summary(), wolves: engine.world.wolves.map(w => ({ id: w.id, submittedTo: w.submittedTo, dominanceWins: w.dominanceWins, dominanceLosses: w.dominanceLosses, thoughts: w.thoughts, stats: w.stats, memories: w.memories })) }));
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
