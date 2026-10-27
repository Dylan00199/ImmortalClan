import { describe, expect, it } from 'vitest';
import mapJson from '../public/wolf-map/map.config.json';
import { validateMap } from '../src/config/map';
import { scoreActions } from '../src/brains/utility';
import { validateReply } from '../src/brains/llm';
import { decayMemory, updateEmotions } from '../src/sim/emotion';
import { Pathfinder } from '../src/sim/pathfinding';
import { Engine } from '../src/sim/world';
import { recordDominance } from '../src/sim/dominance';

const map = validateMap(mapJson);
describe('simulation', () => {
  it('loads supplied map and rejects malformed grid or obstacle coverage', () => { expect(map.world.width).toBe(1920); expect(() => validateMap({ ...mapJson, grid: { ...mapJson.grid, blocked: ['0'] } })).toThrow(); expect(() => validateMap({ ...mapJson, obstacles: [] })).toThrow('obstacle/grid mismatch'); });
  it('raises drinking urgency as thirst falls', () => { const e = new Engine(map, 7), w = e.world.wolves[0]; const o = { time: 0, self: w, wolves: e.world.wolves, prey: e.world.prey, threats: [], map }; const before = scoreActions(o).DRINK; w.needs.thirst = 12; expect(scoreActions(o).DRINK).toBeGreaterThan(before); });
  it('decays emotions toward trait baseline and memory strength over time', () => { const e = new Engine(map, 7), w = e.world.wolves[0]; const next = updateEmotions({ ...w.emotions, fear: .9 }, w.traits, 10); expect(next.fear).toBeLessThan(.9); const m = { type: 'threat', x: 1, y: 1, time: 0, valence: -.5, involvedIds: [], strength: 1 }; expect(decayMemory([m], 60)[0].strength).toBeLessThan(1); });
  it('rejects unknown LLM actions and clamps appraisal', () => { expect(() => validateReply({ action: 'FLY', thought: 'No' })).toThrow(); expect(validateReply({ action: 'REST', thought: 'Tired', appraisal: { fear: 100 } }).emotionNudges?.fear).toBe(.08); });
  it('repeats exactly from a seed with Mock adapter', () => { const a = new Engine(map, 27), b = new Engine(map, 27); for (let i = 0; i < 800; i++) { a.step(.1); b.step(.1); } expect(a.world).toEqual(b.world); });
  it('does not cut blocked corners', () => { const tiny = validateMap({ seed: 1, world: { width: 64, height: 64 }, grid: { cols: 2, rows: 2, cellSize: 32, blocked: ['01', '10'] }, obstacles: [{ kind: 'rock', x: 32, y: 0, w: 32, h: 32 }, { kind: 'rock', x: 0, y: 32, w: 32, h: 32 }], waterPoints: [], foodPatches: [], den: { x: 16, y: 16, radius: 5 }, preySpawnZones: [], zones: [] }); const p = new Pathfinder(tiny); expect(p.find({ x: 16, y: 16 }, { x: 48, y: 48 })).toEqual([]); });
  it('limits repeated social interactions while wolves remain close', () => { const e = new Engine(map, 7); const w = e.world.wolves[0], mate = e.world.wolves[1]; w.x = mate.x; w.y = mate.y; w.foodHeld = 20; w.decision = { action: 'SHARE_FOOD', targetId: mate.id, thought: 'Share.' }; w.decisionAt = 100; for (let i = 0; i < 50; i++) e.step(.1); expect(w.stats.interactions).toBe(1); });
  it('does not reevaluate a satisfied need every tick', () => { const e = new Engine(map, 7); for (let i = 0; i < 3600; i++) e.step(.1); for (const w of e.world.wolves) expect(w.stats.decisions).toBeLessThan(200); });
  it('crowns only a wolf that directly dominates both rivals and lets a loser challenge back', () => {
    const e = new Engine(map, 7), [adam, eva, third] = e.world.wolves;
    expect(recordDominance(e.world, adam, eva)).toBe(false);
    expect(e.world.alphaId).toBeUndefined();
    expect(recordDominance(e.world, adam, third)).toBe(true);
    expect(e.world.alphaId).toBe(adam.id);
    expect(recordDominance(e.world, eva, adam)).toBe(false);
    expect(e.world.alphaId).toBeUndefined();
    expect(adam.submittedTo).toBe(eva.id);
    expect(third.submittedTo).toBeUndefined();
  });
  it('turns the alpha goal into observable challenges and a crown in a seeded run', () => {
    const e = new Engine(map, 7);
    for (let i = 0; i < 3600; i++) e.step(.1);
    expect(e.world.alphaId).toBeTruthy();
    expect(e.world.events.some(event => event.text.includes('thắng thách đấu'))).toBe(true);
    expect(e.world.wolves.every(w => w.thoughts.length > 0)).toBe(true);
  });
  it('makes Adam impulsive, Eva manipulative and Oden cautious', () => {
    const e = new Engine(map, 7), [adam, eva, oden] = e.world.wolves;
    expect(oden.name).toBe('Oden');
    adam.needs.energy = 18; adam.health = 20;
    oden.needs.energy = 45;
    const observation = (self: typeof adam) => ({ time: 20, self, wolves: e.world.wolves, prey: e.world.prey, threats: [], map });
    expect(scoreActions(observation(adam)).CHALLENGE).toBeGreaterThan(0);
    expect(scoreActions(observation(oden)).CHALLENGE).toBe(0);
    expect(scoreActions(observation(eva)).PROVOKE).toBeGreaterThan(0);
    expect(adam.attack).toBeGreaterThan(oden.attack);
    expect(oden.attack).toBeGreaterThan(eva.attack);
  });
  it('lets Eva provoke conflict between the other two wolves', () => {
    const e = new Engine(map, 7), [adam, eva, oden] = e.world.wolves;
    e.world.time = 20;
    eva.x = adam.x; eva.y = adam.y; eva.provokeCooldownUntil = 0;
    eva.decision = { action: 'PROVOKE', targetId: adam.id, thought: 'Khơi mâu thuẫn.' }; eva.decisionAt = 100;
    adam.decisionAt = 100;
    const trust = adam.relationships[oden.id].trust;
    e.step(.1);
    expect(adam.relationships[oden.id].trust).toBeLessThan(trust);
    expect(adam.decision.action).toBe('QUARREL');
    expect(adam.decision.targetId).toBe(oden.id);
    expect(e.world.events.some(event => event.text.includes('khơi mâu thuẫn'))).toBe(true);
  });
  it('applies attack damage in a challenge and restores health while resting', () => {
    const e = new Engine(map, 7), [adam, eva] = e.world.wolves;
    e.world.time = 20;
    adam.x = eva.x; adam.y = eva.y; adam.challengeCooldownUntil = 0;
    adam.decision = { action: 'CHALLENGE', targetId: eva.id, thought: 'Thách đấu.' }; adam.decisionAt = 100;
    const totalHealth = adam.health + eva.health;
    e.step(.1);
    expect(adam.health + eva.health).toBeLessThan(totalHealth);
    eva.x = map.den.x; eva.y = map.den.y;
    eva.decision = { action: 'REST', thought: 'Hồi phục.' }; eva.decisionAt = 100;
    const woundedHealth = eva.health;
    e.step(.1);
    expect(eva.health).toBeGreaterThan(woundedHealth);
  });
});
