import type { MapConfig, Point } from '../config/map';
import { WOLVES } from '../config/wolves';
import { challengeTarget, recordDominance, subjectsOf } from './dominance';
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
      return { ...position, ...c, health: c.maxHealth, needs: { hunger: 75 - i * 8, thirst: 77 - i * 5, energy: 88 - i * 6, safety: 90 }, emotions: { joy: .35, fear: .08, anger: .06, sadness: .06, curiosity: .32 }, relationships: {}, memories: [], known: { food: map.foodPatches.map(p => ({ x: p.x, y: p.y })), water: map.waterPoints.map(p => ({ x: p.x, y: p.y })), danger: [], den: { x: map.den.x, y: map.den.y } }, decision: { action: 'IDLE', thought: 'Ta muốn thống trị hai sói còn lại.' }, decisionAt: 0, commitmentUntil: 0, socialCooldownUntil: 0, provokeCooldownUntil: 5 + i * 3, challengeCooldownUntil: c.id === 'adam' ? 0 : 8 + i * 4, dominanceWins: 0, dominanceLosses: 0, path: [], speed: 58 + i * 3, foodHeld: 0, thoughts: [{ time: 0, text: 'Ta muốn thống trị hai sói còn lại để thành bá chủ.' }], stats: stats() };
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
  private think(w: Wolf, text: string): void {
    if (w.thoughts[0]?.text === text) return;
    w.thoughts.unshift({ time: this.world.time, text });
    w.thoughts.length = Math.min(5, w.thoughts.length);
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
    if (w.health <= 0) d = { action: 'REST', thought: 'Ta kiệt sức; phải hồi phục trước khi hành động.' };
    if (d.action === 'CHALLENGE') {
      const target = this.world.wolves.find(other => other.id === d.targetId && other.id !== w.id && other.submittedTo !== w.id) ?? challengeTarget(w, this.world.wolves);
      const impulsive = w.id === 'adam';
      const strength = (wolf: Wolf) => wolf.attack * (wolf.health / wolf.maxHealth) * (.5 + wolf.needs.energy / 200);
      const cautious = w.id === 'wolf3' && target && w.health / w.maxHealth > .55 && w.needs.energy > 60 && strength(w) > strength(target) * 1.05;
      const evaReady = w.id === 'eva' && target && w.health / w.maxHealth > .8 && w.needs.energy > 75 && strength(w) > strength(target) * 1.2;
      if (target && this.world.time >= w.challengeCooldownUntil && w.health > 0 && (impulsive || cautious || evaReady) && !this.world.threats.some(t => dist(t, w) < 115)) d = { ...d, targetId: target.id };
      else d = { action: 'WANDER', thought: 'Ta cần giữ sức và chờ cơ hội khác để thách đấu.' };
    }
    if (d.action === 'PROVOKE') {
      const target = this.world.wolves.find(other => other.id === d.targetId && other.id !== w.id) ?? this.world.wolves.find(other => other.id !== w.id);
      if (w.id === 'eva' && target && this.world.time >= w.provokeCooldownUntil && w.needs.energy > 38 && w.health > 25) d = { ...d, targetId: target.id };
      else d = { action: 'WANDER', thought: 'Ta chờ lúc thích hợp để khơi mâu thuẫn.' };
    }
    const changed = d.action !== w.decision.action || d.targetId !== w.decision.targetId;
    w.decision = d; w.decisionAt = this.world.time + 4; w.commitmentUntil = this.world.time + 7; w.stats.decisions++;
    if (changed) { w.path = []; this.log(`${w.name}: ${d.action} - ${d.thought}`, w.id); }
    if (d.thought) this.think(w, d.thought);
    if (d.emotionNudges) w.emotions = updateEmotions(w.emotions, w.traits, 0, d.emotionNudges);
  }
  private destination(w: Wolf): Point | undefined {
    const action = w.decision.action, map = this.world.map;
    if (action === 'DRINK') return this.closest(w, map.waterPoints);
    if (action === 'EAT') return w.foodHeld ? w : this.closest(w, map.foodPatches);
    if (action === 'REST') return map.den;
    if (action === 'HUNT') return this.world.prey.find(p => p.id === w.decision.targetId) ?? this.closest(w, this.world.prey);
    if (['FOLLOW', 'PLAY', 'SHARE_FOOD', 'GROOM', 'QUARREL', 'PROVOKE', 'CHALLENGE'].includes(action)) return this.world.wolves.find(v => v.id === w.decision.targetId);
    if (action === 'FLEE') { const t = this.closest(w, this.world.threats); if (!t) return map.den; return { x: Math.max(0, Math.min(map.world.width - 1, w.x + (w.x - t.x) * 2)), y: Math.max(0, Math.min(map.world.height - 1, w.y + (w.y - t.y) * 2)) }; }
    if (action === 'WANDER' || action === 'GO_TO') return w.path.at(-1) ?? this.pathfinder.nearest({ x: w.x + this.rng.range(-230, 230), y: w.y + this.rng.range(-230, 230) });
    return undefined;
  }
  private closest<T extends Point>(p: Point, items: T[]): T | undefined { return items.slice().sort((a, b) => dist(p, a) - dist(p, b))[0]; }
  private perform(w: Wolf, dt: number): void {
    const target = this.destination(w), a = w.decision.action;
    if (a === 'CHALLENGE' && target && 'id' in target && (target as Wolf).submittedTo === w.id) { w.decisionAt = this.world.time; w.path = []; return; }
    if (target && dist(w, target) > (a === 'FOLLOW' ? 90 : 35)) {
      if (['FOLLOW', 'HUNT', 'PROVOKE', 'CHALLENGE'].includes(a) && w.path.length && dist(w.path.at(-1)!, target) > 64) w.path = [];
      if (!w.path.length) w.path = this.pathfinder.find(w, target);
      const next = w.path[0]; if (next) {
        const d = dist(w, next); if (d < 3) w.path.shift(); else { const speed = w.speed * (a === 'FLEE' ? 1.7 : 1); const move = Math.min(d, speed * dt); w.x += (next.x - w.x) / d * move; w.y += (next.y - w.y) / d * move; }
      }
      return;
    }
    if (a === 'DRINK' && target) { w.needs.thirst = clamp(w.needs.thirst + dt * 8, 0, 100); if (w.needs.thirst > 96) { w.decisionAt = this.world.time; w.commitmentUntil = 0; } }
    if (a === 'EAT' && target) { w.needs.hunger = clamp(w.needs.hunger + dt * 7, 0, 100); if (w.foodHeld > 0) w.foodHeld = Math.max(0, w.foodHeld - dt * 2); if (w.needs.hunger > 96) { w.decisionAt = this.world.time; w.commitmentUntil = 0; } }
    if (a === 'REST' && target) { w.needs.energy = clamp(w.needs.energy + dt * 5, 0, 100); w.health = clamp(w.health + dt * 1.3, 0, w.maxHealth); if (w.needs.energy > 95 && w.health >= w.maxHealth * .9) { w.decisionAt = this.world.time; w.commitmentUntil = 0; } }
    if (a === 'HUNT' && target && 'id' in target && dist(w, target) < 42) {
      const prey = target as Prey; w.foodHeld += 35; w.needs.hunger = clamp(w.needs.hunger + 22, 0, 100); w.emotions.joy = clamp(w.emotions.joy + .1); this.remember(w, 'hunt', prey, .6, [prey.id]); this.log(`${w.name} caught ${prey.id}.`, w.id);
      const zone = this.rng.pick(this.world.map.preySpawnZones); Object.assign(prey, this.pathfinder.nearest({ x: zone.x + this.rng.range(-70, 70), y: zone.y + this.rng.range(-70, 70) })); this.nextPrey++; prey.id = `prey${this.nextPrey + 10}`; w.decisionAt = this.world.time; w.path = [];
    }
    if (a === 'CHALLENGE' && target && 'id' in target && dist(w, target) < 55 && this.world.time >= w.challengeCooldownUntil) this.resolveChallenge(w, target as Wolf);
    if (a === 'PROVOKE' && target && 'id' in target && dist(w, target) < 90 && this.world.time >= w.provokeCooldownUntil) this.resolveProvocation(w, target as Wolf);
    if (['PLAY', 'GROOM', 'SHARE_FOOD', 'QUARREL'].includes(a) && target && 'id' in target && dist(w, target) < 50 && this.world.time >= w.socialCooldownUntil) {
      const mate = target as Wolf, relation = w.relationships[mate.id];
      const positive = a !== 'QUARREL'; relation.trust = clamp(relation.trust + (positive ? .04 : -.07), -1, 1); relation.affection = clamp(relation.affection + (positive ? .06 : -.08), -1, 1);
      w.emotions.joy = clamp(w.emotions.joy + (positive ? .05 : -.06)); if (a === 'SHARE_FOOD' && w.foodHeld > 0) { w.foodHeld -= 5; mate.needs.hunger = clamp(mate.needs.hunger + 8, 0, 100); }
      this.remember(w, a.toLowerCase(), mate, positive ? .4 : -.5, [mate.id]); w.stats.interactions++; this.log(`${w.name} ${a.toLowerCase().replace('_', ' ')} with ${mate.name}.`, w.id); w.socialCooldownUntil = this.world.time + 15; w.decisionAt = this.world.time + 4; if (!positive) this.wake(mate);
    }
  }
  private resolveProvocation(eva: Wolf, target: Wolf): void {
    const other = this.world.wolves.find(w => w.id !== eva.id && w.id !== target.id);
    if (!other) return;
    target.relationships[other.id].trust = clamp(target.relationships[other.id].trust - .25, -1, 1);
    target.relationships[other.id].affection = clamp(target.relationships[other.id].affection - .18, -1, 1);
    target.emotions.anger = clamp(target.emotions.anger + .35);
    target.decision = { action: 'QUARREL', targetId: other.id, thought: `Ta bực ${other.name}; phải nói cho rõ.` };
    target.decisionAt = this.world.time + 9;
    target.commitmentUntil = this.world.time + 9;
    target.path = [];
    eva.needs.energy = clamp(eva.needs.energy - 3, 0, 100);
    eva.provokeCooldownUntil = this.world.time + 45;
    eva.decision = { action: 'WANDER', thought: `${target.name} đang bất hòa với ${other.name}. Ta sẽ giữ sức và quan sát.` };
    eva.decisionAt = this.world.time + 8;
    eva.path = [];
    this.think(target, target.decision.thought);
    this.think(eva, eva.decision.thought);
    this.remember(eva, 'khơi mâu thuẫn', target, .35, [target.id, other.id]);
    this.log(`Eva khơi mâu thuẫn giữa ${target.name} và ${other.name}.`, eva.id);
  }
  private resolveChallenge(challenger: Wolf, defender: Wolf): void {
    const rating = (w: Wolf) => w.health <= 0 ? -1 : w.attack * (.35 + w.health / w.maxHealth * .35 + w.needs.energy / 100 * .3) + w.traits.boldness * 3 + w.traits.aggression * 3 - w.emotions.fear * 4 + this.rng.range(-4, 4);
    const challengerRating = rating(challenger), defenderRating = rating(defender);
    const winner = challengerRating >= defenderRating ? challenger : defender;
    const loser = winner === challenger ? defender : challenger;
    const previousAlpha = this.world.alphaId;
    const crowned = recordDominance(this.world, winner, loser);
    winner.challengeCooldownUntil = this.world.time + (winner.id === 'adam' ? 12 : 32);
    loser.challengeCooldownUntil = this.world.time + (loser.id === 'adam' ? 16 : 38);
    const damage = Math.max(1, Math.round(winner.attack * this.rng.range(.45, .65)));
    const counterDamage = Math.max(1, Math.round(loser.attack * this.rng.range(.12, .22)));
    loser.health = clamp(loser.health - damage, 0, loser.maxHealth);
    winner.health = clamp(winner.health - counterDamage, 0, winner.maxHealth);
    winner.needs.energy = clamp(winner.needs.energy - 7, 0, 100);
    loser.needs.energy = clamp(loser.needs.energy - 12, 0, 100);
    winner.emotions.joy = clamp(winner.emotions.joy + .12);
    loser.emotions.fear = clamp(loser.emotions.fear + .16);
    loser.emotions.anger = clamp(loser.emotions.anger + .09);
    winner.relationships[loser.id].trust = clamp(winner.relationships[loser.id].trust - .05, -1, 1);
    loser.relationships[winner.id].trust = clamp(loser.relationships[winner.id].trust - .12, -1, 1);
    this.remember(winner, 'thắng thách đấu', loser, .8, [loser.id]);
    this.remember(loser, 'thua thách đấu', winner, -.8, [winner.id]);
    const winnerThought = crowned ? `Cả ${this.world.wolves.filter(v => v.id !== winner.id).map(v => v.name).join(' và ')} đã quy phục. Ta là bá chủ!` : `${loser.name} đã quy phục. Ta cần thêm ${2 - subjectsOf(this.world, winner.id).length} sói nữa.`;
    const loserThought = `Ta tạm quy phục ${winner.name}; khi đủ sức, ta sẽ giành lại ngôi đầu.`;
    winner.decision = { action: 'HOWL', thought: winnerThought };
    winner.decisionAt = this.world.time + 6;
    winner.commitmentUntil = 0;
    winner.path = [];
    loser.decision = { action: 'SUBMIT', targetId: winner.id, thought: loserThought };
    loser.decisionAt = this.world.time + 8;
    loser.commitmentUntil = 0;
    loser.path = [];
    this.think(winner, winnerThought);
    this.think(loser, loserThought);
    this.log(`${winner.name} thắng thách đấu; ${loser.name} mất ${damage} máu, ${winner.name} mất ${counterDamage} máu; ${loser.name} quy phục.`, winner.id);
    if (crowned && previousAlpha !== winner.id) this.log(`${winner.name} trở thành bá chủ của bầy.`, winner.id);
    if (!crowned && previousAlpha && previousAlpha !== this.world.alphaId) this.log('Ngôi bá chủ đang bỏ trống.');
  }
  summary(): { wolf: string; brain: string; health: number; attack: number; need: number; topAction: Action; subjects: number; submittedTo: string; alpha: boolean; social: number; decisions: number; calls: number; failures: number }[] {
    return this.world.wolves.map(w => ({ wolf: w.name, brain: w.brain, health: Math.round(w.health), attack: w.attack, need: Math.round(w.stats.needTotal / Math.max(1, w.stats.samples)), topAction: (Object.keys(w.stats.timeByAction) as Action[]).sort((a, b) => w.stats.timeByAction[b] - w.stats.timeByAction[a])[0], subjects: subjectsOf(this.world, w.id).length, submittedTo: w.submittedTo ?? '-', alpha: this.world.alphaId === w.id, social: w.stats.interactions, decisions: w.stats.decisions, calls: w.stats.llmCalls, failures: w.stats.llmFailures }));
  }
}
