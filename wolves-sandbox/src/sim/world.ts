import type { MapConfig, Point } from '../config/map';
import { WOLVES } from '../config/wolves';
import { LLMBrain, MockAdapter, type LLMAdapter, type LLMSettings, DEFAULT_LLM } from '../brains/llm';
import { UtilityBrain } from '../brains/utility';
import { clamp, decayMemory, updateEmotions } from './emotion';
import { Pathfinder } from './pathfinding';
import { RNG } from './random';
import { ACTIONS, type Action, type Brain, type Decision, type Emotions, type Observation, type Prey, type Wolf, type WolfStats, type World } from './types';

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const blankActions = (): Record<Action, number> => Object.fromEntries(ACTIONS.map(a => [a, 0])) as Record<Action, number>;
const blankEmotions = (): Emotions => ({ joy: 0, fear: 0, anger: 0, sadness: 0, curiosity: 0 });
const stats = (): WolfStats => ({ timeByAction: blankActions(), needTotal: 0, emotionTotal: blankEmotions(), trajectory: [], samples: 0, interactions: 0, decisions: 0, llmCalls: 0, llmLatencyMs: 0, llmFailures: 0, invalidReplies: 0 });
export interface EngineOptions { adapter?: LLMAdapter; llm?: LLMSettings }

export class Engine {
  world: World;
  rng: RNG;
  pathfinder: Pathfinder;
  brains: Map<string, Brain>;
  private nextPrey = 0;
  constructor(map: MapConfig, seed = map.seed, options: EngineOptions = {}) {
    this.rng = new RNG(seed); this.pathfinder = new Pathfinder(map);
    const wolves: Wolf[] = WOLVES.map((c, i) => {
      const position = this.pathfinder.nearest({ x: map.den.x + (i - 1) * 60, y: map.den.y + 105 });
      return { ...position, ...c, needs: { hunger: 75 - i * 8, thirst: 77 - i * 5, energy: 88 - i * 6, safety: 90 }, emotions: { joy: .35, fear: .08, anger: .06, sadness: .06, curiosity: .32 }, relationships: {}, memories: [], known: { food: map.foodPatches.map(p => ({ x: p.x, y: p.y })), water: map.waterPoints.map(p => ({ x: p.x, y: p.y })), danger: [], den: { x: map.den.x, y: map.den.y } }, decision: { action: 'IDLE', thought: 'Watching.' }, decisionAt: 0, commitmentUntil: 0, socialCooldownUntil: 0, path: [], speed: 58 + i * 3, foodHeld: 0, thoughts: [], stats: stats() };
    });
    for (const w of wolves) for (const other of wolves) if (other.id !== w.id) w.relationships[other.id] = { trust: .2, affection: .2 };
    const prey = map.preySpawnZones.slice(0, 5).map((p, i) => { const at = this.pathfinder.nearest({ x: p.x + this.rng.range(-p.radius / 2, p.radius / 2), y: p.y + this.rng.range(-p.radius / 2, p.radius / 2) }); return { id: `prey${i}`, ...at, state: 'GRAZE' as const, energy: 100 }; });
    this.world = { time: 0, seed, map, wolves, prey, threats: [], events: [], revision: 0 };
    const adapter = options.adapter ?? new MockAdapter(), llm = options.llm ?? DEFAULT_LLM;
    this.brains = new Map(wolves.map(w => [w.id, w.brain === 'utility' ? new UtilityBrain() : new LLMBrain(adapter, llm, w.brain === 'hybrid')]));
    this.log('Simulation started.');
  }
  log(text: string, wolfId?: string): void { this.world.events.push({ time: this.world.time, text, wolfId }); if (this.world.events.length > 300) this.world.events.shift(); }
  setMap(map: MapConfig): void { this.world.map = map; this.world.revision++; this.pathfinder.setMap(map); for (const w of this.world.wolves) { w.path = []; Object.assign(w, this.pathfinder.nearest(w)); } }
  spawnThreat(wolfId: string): void {
    const w = this.world.wolves.find(v => v.id === wolfId); if (!w) return;
    const p = this.pathfinder.nearest({ x: w.x + 85, y: w.y + 60 });
    this.world.threats.push({ id: `threat${this.world.time}-${this.world.threats.length}`, ...p, ttl: 40 });
    for (const v of this.world.wolves) if (dist(v, p) < 250) { v.emotions.fear = clamp(v.emotions.fear + .48); v.known.danger.push({ ...p }); this.remember(v, 'threat', p, -.8, [wolfId]); this.wake(v); }
    this.log(`Threat appeared near ${w.name}.`);
  }
  dropFood(x: number, y: number): void { this.world.map.foodPatches.push({ x, y, radius: 28, kind: 'dropped_food' }); for (const w of this.world.wolves) if (dist(w, { x, y }) < 260) this.wake(w); this.log('Food dropped.'); }
  private wake(w: Wolf): void { w.decisionAt = this.world.time; const brain = this.brains.get(w.id); if (brain instanceof LLMBrain) brain.wake(); }
  remember(w: Wolf, type: string, p: Point, valence: number, involvedIds: string[] = []): void {
    w.memories.push({ type, x: p.x, y: p.y, time: this.world.time, valence, involvedIds, strength: 1 });
    if (w.memories.length > 24) w.memories.shift();
  }
  step(dt: number): void {
    if (!(dt > 0 && dt <= .25)) throw new Error('Fixed step must be in (0, 0.25]');
    this.world.time += dt;
    this.world.threats = this.world.threats.filter(t => (t.ttl -= dt) > 0);
    for (const prey of this.world.prey) this.updatePrey(prey, dt);
    for (const w of this.world.wolves) this.updateWolf(w, dt);
  }
  private updatePrey(prey: Prey, dt: number): void {
    const wolf = this.world.wolves.find(w => dist(w, prey) < 115);
    prey.state = wolf ? 'FLEE' : prey.energy < 75 ? 'GRAZE' : 'IDLE';
    prey.energy = Math.min(100, prey.energy + dt * .12);
    if (wolf) { const dx = prey.x - wolf.x, dy = prey.y - wolf.y, len = Math.hypot(dx, dy) || 1; const target = { x: prey.x + dx / len * 30 * dt, y: prey.y + dy / len * 30 * dt }; const c = this.pathfinder.cell(target); if (this.pathfinder.walkable(c[0], c[1])) Object.assign(prey, target); }
  }
  private updateWolf(w: Wolf, dt: number): void {
    const previous = { ...w.needs };
    w.needs.hunger = clamp(w.needs.hunger - dt * .11, 0, 100); w.needs.thirst = clamp(w.needs.thirst - dt * .15, 0, 100); w.needs.energy = clamp(w.needs.energy - dt * .065, 0, 100);
    if ((['hunger', 'thirst', 'energy'] as const).some(k => previous[k] >= 25 && w.needs[k] < 25)) this.wake(w);
    const threat = this.world.threats.find(t => dist(t, w) < 210);
    w.needs.safety = clamp(w.needs.safety + dt * (threat ? -2.7 : .24), 0, 100);
    w.emotions = updateEmotions(w.emotions, w.traits, dt, threat ? { fear: dt * .012 } : {});
    w.memories = decayMemory(w.memories, dt);
    const urgent = threat && dist(threat, w) < 115;
    if (this.world.time >= w.decisionAt || (urgent && w.decision.action !== 'FLEE')) {
      const observation: Observation = { time: this.world.time, self: w, wolves: this.world.wolves, prey: this.world.prey, threats: this.world.threats, map: this.world.map };
      const decision = this.brains.get(w.id)!.decide(observation, dt);
      this.applyDecision(w, decision);
    }
    this.perform(w, dt);
    w.stats.timeByAction[w.decision.action] += dt;
    w.stats.needTotal += (w.needs.hunger + w.needs.thirst + w.needs.energy + w.needs.safety) / 4;
    for (const k of Object.keys(w.emotions) as (keyof Emotions)[]) w.stats.emotionTotal[k] += w.emotions[k];
    w.stats.samples++;
    if (!w.stats.trajectory.length || this.world.time - w.stats.trajectory.at(-1)!.time >= 5) w.stats.trajectory.push({ time: this.world.time, needs: { ...w.needs }, emotions: { ...w.emotions }, action: w.decision.action });
  }
  private applyDecision(w: Wolf, d: Decision): void {
    const changed = d.action !== w.decision.action || d.targetId !== w.decision.targetId;
    w.decision = d; w.decisionAt = this.world.time + 4; w.commitmentUntil = this.world.time + 7; w.stats.decisions++;
    if (changed) { w.path = []; this.log(`${w.name}: ${d.action} - ${d.thought}`, w.id); }
    if (d.thought && w.thoughts[0] !== d.thought) { w.thoughts.unshift(d.thought); w.thoughts.length = Math.min(5, w.thoughts.length); }
    if (d.emotionNudges) w.emotions = updateEmotions(w.emotions, w.traits, 0, d.emotionNudges);
  }
  private destination(w: Wolf): Point | undefined {
    const action = w.decision.action, map = this.world.map;
    if (action === 'DRINK') return this.closest(w, map.waterPoints);
    if (action === 'EAT') return w.foodHeld ? w : this.closest(w, map.foodPatches);
    if (action === 'REST') return map.den;
    if (action === 'HUNT') return this.world.prey.find(p => p.id === w.decision.targetId) ?? this.closest(w, this.world.prey);
    if (['FOLLOW', 'PLAY', 'SHARE_FOOD', 'GROOM', 'QUARREL'].includes(action)) return this.world.wolves.find(v => v.id === w.decision.targetId);
    if (action === 'FLEE') { const t = this.closest(w, this.world.threats); if (!t) return map.den; return { x: Math.max(0, Math.min(map.world.width - 1, w.x + (w.x - t.x) * 2)), y: Math.max(0, Math.min(map.world.height - 1, w.y + (w.y - t.y) * 2)) }; }
    if (action === 'WANDER' || action === 'GO_TO') return w.path.at(-1) ?? this.pathfinder.nearest({ x: w.x + this.rng.range(-230, 230), y: w.y + this.rng.range(-230, 230) });
    return undefined;
  }
  private closest<T extends Point>(p: Point, items: T[]): T | undefined { return items.slice().sort((a, b) => dist(p, a) - dist(p, b))[0]; }
  private perform(w: Wolf, dt: number): void {
    const target = this.destination(w), a = w.decision.action;
    if (target && dist(w, target) > (a === 'FOLLOW' ? 90 : 35)) {
      if (!w.path.length) w.path = this.pathfinder.find(w, target);
      const next = w.path[0]; if (next) {
        const d = dist(w, next); if (d < 3) w.path.shift(); else { const speed = w.speed * (a === 'FLEE' ? 1.7 : 1); const move = Math.min(d, speed * dt); w.x += (next.x - w.x) / d * move; w.y += (next.y - w.y) / d * move; }
      }
      return;
    }
    if (a === 'DRINK' && target) { w.needs.thirst = clamp(w.needs.thirst + dt * 8, 0, 100); if (w.needs.thirst > 96) w.decisionAt = this.world.time; }
    if (a === 'EAT' && target) { w.needs.hunger = clamp(w.needs.hunger + dt * 7, 0, 100); if (w.foodHeld > 0) w.foodHeld = Math.max(0, w.foodHeld - dt * 2); if (w.needs.hunger > 96) w.decisionAt = this.world.time; }
    if (a === 'REST' && target) { w.needs.energy = clamp(w.needs.energy + dt * 5, 0, 100); if (w.needs.energy > 95) w.decisionAt = this.world.time; }
    if (a === 'HUNT' && target && 'id' in target && dist(w, target) < 42) {
      const prey = target as Prey; w.foodHeld += 35; w.needs.hunger = clamp(w.needs.hunger + 22, 0, 100); w.emotions.joy = clamp(w.emotions.joy + .1); this.remember(w, 'hunt', prey, .6, [prey.id]); this.log(`${w.name} caught ${prey.id}.`, w.id);
      const zone = this.rng.pick(this.world.map.preySpawnZones); Object.assign(prey, this.pathfinder.nearest({ x: zone.x + this.rng.range(-70, 70), y: zone.y + this.rng.range(-70, 70) })); this.nextPrey++; prey.id = `prey${this.nextPrey + 10}`; w.decisionAt = this.world.time; w.path = [];
    }
    if (['PLAY', 'GROOM', 'SHARE_FOOD', 'QUARREL'].includes(a) && target && 'id' in target && dist(w, target) < 50 && this.world.time >= w.socialCooldownUntil) {
      const mate = target as Wolf, relation = w.relationships[mate.id];
      const positive = a !== 'QUARREL'; relation.trust = clamp(relation.trust + (positive ? .04 : -.07), -1, 1); relation.affection = clamp(relation.affection + (positive ? .06 : -.08), -1, 1);
      w.emotions.joy = clamp(w.emotions.joy + (positive ? .05 : -.06)); if (a === 'SHARE_FOOD' && w.foodHeld > 0) { w.foodHeld -= 5; mate.needs.hunger = clamp(mate.needs.hunger + 8, 0, 100); }
      this.remember(w, a.toLowerCase(), mate, positive ? .4 : -.5, [mate.id]); w.stats.interactions++; this.log(`${w.name} ${a.toLowerCase().replace('_', ' ')} with ${mate.name}.`, w.id); w.socialCooldownUntil = this.world.time + 15; w.decisionAt = this.world.time + 4; if (!positive) this.wake(mate);
    }
  }
  summary(): { wolf: string; brain: string; need: number; topAction: Action; social: number; decisions: number; calls: number; failures: number }[] {
    return this.world.wolves.map(w => ({ wolf: w.name, brain: w.brain, need: Math.round(w.stats.needTotal / Math.max(1, w.stats.samples)), topAction: (Object.keys(w.stats.timeByAction) as Action[]).sort((a, b) => w.stats.timeByAction[b] - w.stats.timeByAction[a])[0], social: w.stats.interactions, decisions: w.stats.decisions, calls: w.stats.llmCalls, failures: w.stats.llmFailures }));
  }
}
