import { describe, expect, it } from 'vitest';
import mapJson from '../public/wolf-map/map.config.json';
import { validateMap } from '../src/config/map';
import { scoreActions } from '../src/brains/utility';
import { validateReply } from '../src/brains/llm';
import { decayMemory, updateEmotions } from '../src/sim/emotion';
import { Pathfinder } from '../src/sim/pathfinding';
import { Engine } from '../src/sim/world';

const map = validateMap(mapJson);
describe('simulation', () => {
  it('loads supplied map and rejects malformed grid or obstacle coverage', () => { expect(map.world.width).toBe(1920); expect(() => validateMap({ ...mapJson, grid: { ...mapJson.grid, blocked: ['0'] } })).toThrow(); expect(() => validateMap({ ...mapJson, obstacles: [] })).toThrow('obstacle/grid mismatch'); });
  it('raises drinking urgency as thirst falls', () => { const e = new Engine(map, 7), w = e.world.wolves[0]; const o = { time: 0, self: w, wolves: e.world.wolves, prey: e.world.prey, threats: [], map }; const before = scoreActions(o).DRINK; w.needs.thirst = 12; expect(scoreActions(o).DRINK).toBeGreaterThan(before); });
  it('decays emotions toward trait baseline and memory strength over time', () => { const e = new Engine(map, 7), w = e.world.wolves[0]; const next = updateEmotions({ ...w.emotions, fear: .9 }, w.traits, 10); expect(next.fear).toBeLessThan(.9); const m = { type: 'threat', x: 1, y: 1, time: 0, valence: -.5, involvedIds: [], strength: 1 }; expect(decayMemory([m], 60)[0].strength).toBeLessThan(1); });
  it('rejects unknown LLM actions and clamps appraisal', () => { expect(() => validateReply({ action: 'FLY', thought: 'No' })).toThrow(); expect(validateReply({ action: 'REST', thought: 'Tired', appraisal: { fear: 100 } }).emotionNudges?.fear).toBe(.08); });
  it('repeats exactly from a seed with Mock adapter', () => { const a = new Engine(map, 27), b = new Engine(map, 27); for (let i = 0; i < 800; i++) { a.step(.1); b.step(.1); } expect(a.world).toEqual(b.world); });
  it('does not cut blocked corners', () => { const tiny = validateMap({ seed: 1, world: { width: 64, height: 64 }, grid: { cols: 2, rows: 2, cellSize: 32, blocked: ['01', '10'] }, obstacles: [{ kind: 'rock', x: 32, y: 0, w: 32, h: 32 }, { kind: 'rock', x: 0, y: 32, w: 32, h: 32 }], waterPoints: [], foodPatches: [], den: { x: 16, y: 16, radius: 5 }, preySpawnZones: [], zones: [] }); const p = new Pathfinder(tiny); expect(p.find({ x: 16, y: 16 }, { x: 48, y: 48 })).toEqual([]); });
  it('limits repeated social interactions while wolves remain close', () => { const e = new Engine(map, 7); const w = e.world.wolves[0], mate = e.world.wolves[1]; w.x = mate.x; w.y = mate.y; w.foodHeld = 20; w.decision = { action: 'SHARE_FOOD', targetId: mate.id, thought: 'Share.' }; w.decisionAt = 100; for (let i = 0; i < 50; i++) e.step(.1); expect(w.stats.interactions).toBe(1); });
});
