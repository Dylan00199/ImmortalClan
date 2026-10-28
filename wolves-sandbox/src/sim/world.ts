import type {MapConfig, Point} from '../config/map';
import {WOLVES} from '../config/wolves';
import {challengeTarget, recordDominance, subjectsOf} from './dominance';
import {LLMBrain, MockAdapter, type LLMAdapter, type LLMSettings, DEFAULT_LLM} from '../brains/llm';
import {UtilityBrain} from '../brains/utility';
import {clamp, decayMemory, updateEmotions} from './emotion';
import {Pathfinder} from './pathfinding';
import {RNG} from './random';
import { PROGRESSION } from '../config/progression';
import {
    ACTIONS,
    type Action,
    type Conflict,
    type StrategicPlan,
    type Brain,
    type Decision,
    type Emotions,
    type Observation,
    type Prey,
    type Wolf,
    type WolfStats,
    type World, Threat
} from './types';

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const blankActions = (): Record<Action, number> => Object.fromEntries(ACTIONS.map(a => [a, 0])) as Record<Action, number>;
const blankEmotions = (): Emotions => ({joy: 0, fear: 0, anger: 0, sadness: 0, curiosity: 0});
const stats = (): WolfStats => ({
    preyKills: 0,
    threatKills: 0,
    attackGained: 0,
    maxHealthGained: 0,
    decisionChanges: 0,
    abandonedPlans: 0,
    strategicActions: 0,
    successfulStrategicActions: 0,
    failedStrategicActions: 0,
    actionStartCount: 0,
    actionStartDelayTotal: 0,
    protectionSuccesses: 0,
    protectionFailures: 0,
    foodGiven: 0,
    foodReceived: 0,
    timeByAction: blankActions(),
    needTotal: 0,
    emotionTotal: blankEmotions(),
    trajectory: [],
    samples: 0,
    interactions: 0,
    decisions: 0,
    llmCalls: 0,
    llmLatencyMs: 0,
    llmFailures: 0,
    invalidReplies: 0
});

export interface EngineOptions {
    adapter?: LLMAdapter;
    llm?: LLMSettings
}

export class Engine {
    world: World;
    rng: RNG;
    pathfinder: Pathfinder;
    brains: Map<string, Brain>;
    private nextPrey = 0;

    private rewardKill(wolf: Wolf, kind: 'prey' | 'threat'): void {
        const reward = PROGRESSION.rewards[kind];
        const previousAttack = wolf.attack;
        const previousMaxHealth = wolf.maxHealth;

        wolf.attack = Math.min(
            PROGRESSION.caps.attack,
            wolf.attack + reward.attack,
        );

        wolf.maxHealth = Math.min(
            PROGRESSION.caps.maxHealth,
            wolf.maxHealth + reward.maxHealth,
        );

        const healthGain = wolf.maxHealth - previousMaxHealth;
        wolf.health = Math.min(wolf.maxHealth, wolf.health + healthGain);

        if (kind === 'prey') {
            wolf.stats.preyKills += 1;
        } else {
            wolf.stats.threatKills += 1;
        }

        wolf.stats.attackGained += wolf.attack - previousAttack;
        wolf.stats.maxHealthGained += healthGain;

        this.log(
            `${wolf.name} mạnh lên sau khi hạ ${kind === 'prey' ? 'con mồi' : 'mối đe dọa'}: +${wolf.attack - previousAttack} tấn công, +${healthGain} máu tối đa.`,
            wolf.id,
        );
    }

    constructor(map: MapConfig, seed = map.seed, options: EngineOptions = {}) {
        this.rng = new RNG(seed);
        this.pathfinder = new Pathfinder(map);
        const occupied: Point[] = [];
        const spawnCells: Point[] = [];
        for (let row = 0; row < map.grid.rows; row++) for (let col = 0; col < map.grid.cols; col++) {
            if (!this.pathfinder.walkable(col, row)) continue;
            const cell = this.pathfinder.center(col, row);
            if (dist(cell, map.den) < 360) spawnCells.push(cell);
        }
        const wolves: Wolf[] = WOLVES.map((c, i) => {
            const desired = {x: map.den.x + (i - 1) * 140, y: map.den.y + 135};
            const position = spawnCells.filter(cell => occupied.every(other => dist(cell, other) >= 100))
                .sort((a, b) => dist(a, desired) - dist(b, desired))[0] ?? this.pathfinder.nearest(desired);
            occupied.push(position);
            return {
                ...position, ...c,
                health: c.maxHealth,
                combatCooldownUntil: 0,
                needs: {hunger: 75 - i * 8, thirst: 77 - i * 5, energy: 88 - i * 6, safety: 90},
                emotions: {joy: .35, fear: .08, anger: .06, sadness: .06, curiosity: .32},
                relationships: {},
                memories: [],
                known: {
                    food: map.foodPatches.map(p => ({x: p.x, y: p.y})),
                    water: map.waterPoints.map(p => ({x: p.x, y: p.y})),
                    danger: [],
                    den: {x: map.den.x, y: map.den.y}
                },
                decision: {action: 'IDLE', thought: 'Ta muốn thống trị hai sói còn lại.'},
                decisionAt: 0,
                commitmentUntil: 0,
                socialCooldownUntil: 0,
                provokeCooldownUntil: 5 + i * 3,
                challengeCooldownUntil: c.id === 'adam' ? 0 : 8 + i * 4,
                dominanceWins: 0,
                dominanceLosses: 0,
                path: [],
                speed: 58 + i * 3,
                foodHeld: 0,
                thoughts: [{time: 0, text: 'Ta muốn thống trị hai sói còn lại để thành bá chủ.'}],
                stats: stats()
            };
        });
        for (const w of wolves) for (const other of wolves) if (other.id !== w.id) w.relationships[other.id] = {
            trust: .2,
            affection: .2
        };
        const prey = map.preySpawnZones.slice(0, 5).map((p, i) => {
            const at = this.pathfinder.nearest({
                x: p.x + this.rng.range(-p.radius / 2, p.radius / 2),
                y: p.y + this.rng.range(-p.radius / 2, p.radius / 2)
            });
            return {id: `prey${i}`, ...at, state: 'GRAZE' as const, energy: 100};
        });
        this.world = {time: 0, seed, map, wolves, prey, threats: [], events: [], conflicts: [], decisionLog: [], revision: 0};
        const adapter = options.adapter ?? new MockAdapter(), llm = options.llm ?? DEFAULT_LLM;
        this.brains = new Map(wolves.map(w => [w.id, w.brain === 'utility' ? new UtilityBrain() : new LLMBrain(adapter, llm, w.brain === 'hybrid')]));
        this.log('Simulation started.');
    }

    log(text: string, wolfId?: string): void {
        this.world.events.push({time: this.world.time, text, wolfId});
        if (this.world.events.length > 300) this.world.events.shift();
    }

    setMap(map: MapConfig): void {
        this.world.map = map;
        this.world.revision++;
        this.pathfinder.setMap(map);
        for (const w of this.world.wolves) {
            w.path = [];
            Object.assign(w, this.pathfinder.nearest(w));
        }
    }

    spawnThreat(wolfId: string): void {
        const w = this.world.wolves.find(v => v.id === wolfId);
        if (!w) return;
        const p = this.pathfinder.nearest({x: w.x + 85, y: w.y + 60});
        this.world.threats.push({
            id: `threat${this.world.time}-${this.world.threats.length}`,
            ...p,
            ttl: 40,
            health: 40,
            maxHealth: 40,
            attack: 10,
        });
        for (const v of this.world.wolves) if (dist(v, p) < 250) {
            v.emotions.fear = clamp(v.emotions.fear + .48);
            v.known.danger.push({...p});
            this.remember(v, 'threat', p, -.8, [wolfId]);
            this.wake(v);
        }
        this.log(`Threat appeared near ${w.name}.`);
    }

    dropFood(x: number, y: number): void {
        this.world.map.foodPatches.push({x, y, radius: 28, kind: 'dropped_food'});
        for (const w of this.world.wolves) if (dist(w, {x, y}) < 260) this.wake(w);
        this.log('Food dropped.');
    }

    private wake(w: Wolf): void {
        w.decisionAt = this.world.time;
        const brain = this.brains.get(w.id);
        if (brain instanceof LLMBrain) brain.wake();
    }

    remember(w: Wolf, type: string, p: Point, valence: number, involvedIds: string[] = []): void {
        w.memories.push({type, x: p.x, y: p.y, time: this.world.time, valence, involvedIds, strength: 1});
        if (w.memories.length > 24) w.memories.shift();
    }

    private think(w: Wolf, text: string): void {
        if (w.thoughts[0]?.text === text) return;
        w.thoughts.unshift({time: this.world.time, text});
        w.thoughts.length = Math.min(5, w.thoughts.length);
    }

    step(dt: number): void {
        if (!(dt > 0 && dt <= .25)) throw new Error('Fixed step must be in (0, 0.25]');
        this.world.time += dt;
        this.world.threats = this.world.threats.filter(t => (t.ttl -= dt) > 0);
        for (const prey of this.world.prey) this.updatePrey(prey, dt);
        for (const w of this.world.wolves) this.updateWolf(w, dt);
        this.updateConflicts();
        this.updateAlliances();
    }

    private updatePrey(prey: Prey, dt: number): void {
        const wolf = this.world.wolves.find(w => dist(w, prey) < 115);
        prey.state = wolf ? 'FLEE' : prey.energy < 75 ? 'GRAZE' : 'IDLE';
        prey.energy = Math.min(100, prey.energy + dt * .12);
        if (wolf) {
            const dx = prey.x - wolf.x, dy = prey.y - wolf.y, len = Math.hypot(dx, dy) || 1;
            const target = {x: prey.x + dx / len * 30 * dt, y: prey.y + dy / len * 30 * dt};
            const c = this.pathfinder.cell(target);
            if (this.pathfinder.walkable(c[0], c[1])) Object.assign(prey, target);
        }
    }

    private updateWolf(w: Wolf, dt: number): void {
        const previous = {...w.needs};
        w.needs.hunger = clamp(w.needs.hunger - dt * .11, 0, 100);
        w.needs.thirst = clamp(w.needs.thirst - dt * .15, 0, 100);
        w.needs.energy = clamp(w.needs.energy - dt * .065, 0, 100);
        if ((['hunger', 'thirst', 'energy'] as const).some(k => previous[k] >= 25 && w.needs[k] < 25)) this.wake(w);
        const threat = this.world.threats.find(t => dist(t, w) < 210);
        w.needs.safety = clamp(w.needs.safety + dt * (threat ? -2.7 : .24), 0, 100);
        w.emotions = updateEmotions(w.emotions, w.traits, dt, threat ? {fear: dt * .012} : {});
        w.memories = decayMemory(w.memories, dt);
        const urgent = threat && dist(threat, w) < 115;
        if (this.world.time >= w.decisionAt || (urgent && w.decision.action !== 'FLEE')) {
            const observation: Observation = {
                time: this.world.time,
                self: w,
                wolves: this.world.wolves,
                prey: this.world.prey,
                threats: this.world.threats,
                map: this.world.map
            };
            const conflict = this.world.conflicts.find(c => c.status === 'pending' && (c.firstId === w.id || c.secondId === w.id));
            const conflictPartner = conflict && this.world.wolves.find(v => v.id === (conflict.firstId === w.id ? conflict.secondId : conflict.firstId));
            const decision = conflict && conflictPartner && this.world.time <= conflict.deadline
                ? {action: 'QUARREL' as const, targetId: conflictPartner.id, thought: `Mâu thuẫn với ${conflictPartner.name} đã tới lúc phải giải quyết.`}
                : this.brains.get(w.id)!.decide(observation, dt);
            this.applyDecision(w, decision);
            if (conflict && conflict.status === 'pending') w.decisionAt = Math.min(w.decisionAt, this.world.time + .5);
        }
        this.perform(w, dt);
        w.stats.timeByAction[w.decision.action] += dt;
        w.stats.needTotal += (w.needs.hunger + w.needs.thirst + w.needs.energy + w.needs.safety) / 4;
        for (const k of Object.keys(w.emotions) as (keyof Emotions)[]) w.stats.emotionTotal[k] += w.emotions[k];
        w.stats.samples++;
        if (!w.stats.trajectory.length || this.world.time - w.stats.trajectory.at(-1)!.time >= 5) w.stats.trajectory.push({
            time: this.world.time,
            needs: {...w.needs},
            emotions: {...w.emotions},
            action: w.decision.action
        });
    }

    private applyDecision(w: Wolf, d: Decision): void {
        const requestedAction = d.action;
        const previousAction = w.decision.action;
        const previousTargetId = w.decision.targetId;
        if (w.health <= 0) d = {action: 'REST', thought: 'Ta kiệt sức; phải hồi phục trước khi hành động.'};
        if (d.action === 'CHALLENGE') {
            const target = this.world.wolves.find(other => other.id === d.targetId && other.id !== w.id && other.submittedTo !== w.id) ?? challengeTarget(w, this.world.wolves);
            const impulsive = w.id === 'adam';
            const strength = (wolf: Wolf) => wolf.attack * (wolf.health / wolf.maxHealth) * (.5 + wolf.needs.energy / 200);
            const ally = w.allianceWith && this.world.time < (w.allianceExpiresAt ?? 0)
                ? this.world.wolves.find(v => v.id === w.allianceWith)
                : undefined;
            const support = ally && w.allianceTargetId === target?.id ? strength(ally) * .35 : 0;
            const cautious = w.id === 'wolf3' && target && w.health / w.maxHealth > .55 && w.needs.energy > 60 && strength(w) + support > strength(target) * 1.05;
            const evaReady = w.id === 'eva' && target && w.health / w.maxHealth > .8 && w.needs.energy > 75 && strength(w) > strength(target) * 1.2;
            if (target && this.world.time >= w.challengeCooldownUntil && w.health > 0 && (impulsive || cautious || evaReady) && !this.world.threats.some(t => dist(t, w) < 115)) d = {
                ...d,
                targetId: target.id
            };
            else d = {action: 'WANDER', thought: 'Ta cần giữ sức và chờ cơ hội khác để thách đấu.'};
        }
        if (d.action === 'ALLY') {
            const target = this.world.wolves.find(other => other.id === d.targetId && other.id === 'eva');
            if (w.id !== 'wolf3' || !target || w.allianceWith || target.allianceWith) d = {action: 'WANDER', thought: 'Chưa có điều kiện để lập liên minh.'};
            else d = {...d, targetId: target.id};
        }
        if (d.action === 'PROVOKE') {
            const target = this.world.wolves.find(other => other.id === d.targetId && other.id !== w.id) ?? this.world.wolves.find(other => other.id !== w.id);
            if (w.id === 'eva' && target && this.world.time >= w.provokeCooldownUntil && w.needs.energy > 38 && w.health > 25) d = {
                ...d,
                targetId: target.id
            };
            else d = {action: 'WANDER', thought: 'Ta chờ lúc thích hợp để khơi mâu thuẫn.'};
        }
        const changed = d.action !== previousAction || d.targetId !== previousTargetId;
        if (changed) {
            const previousRecord = [...this.world.decisionLog].reverse().find(record => record.wolfId === w.id && record.result === undefined);
            if (previousRecord && this.isStrategicAction(previousRecord.action)) {
                previousRecord.result = 'abandoned';
                previousRecord.finishedAt = this.world.time;
                previousRecord.resultReason = 'Kế hoạch đổi mục tiêu hoặc hành động trước khi hoàn thành.';
                w.stats.abandonedPlans++;
            }
            w.stats.decisionChanges++;
        }
        const decisionPlan = d.plan ?? this.makePlan(w, d);
        w.decision = {...d, plan: decisionPlan};
        w.decisionAt = this.world.time + 4;
        w.commitmentUntil = this.world.time + 7;
        w.stats.decisions++;
        const hasPendingSameDecision = this.world.decisionLog.some(record => record.wolfId === w.id && record.action === d.action && record.targetId === d.targetId && record.result === undefined);
        if (changed || (this.isStrategicAction(d.action) && !hasPendingSameDecision)) {
            const targetWolf = this.world.wolves.find(v => v.id === d.targetId);
            const targetThreat = this.world.threats.find(v => v.id === d.targetId);
            const relationship = targetWolf ? w.relationships[targetWolf.id] : undefined;
            this.world.decisionLog.push({
                time: this.world.time,
                wolfId: w.id,
                action: d.action,
                targetId: d.targetId,
                thought: d.thought,
                previousAction,
                previousTargetId,
                goal: decisionPlan?.goal ?? (w.submittedTo ? `Giành lại quyền tự chủ và tranh ngôi bá chủ` : 'Khiến hai đối thủ quy phục để trở thành bá chủ'),
                preconditionsMet: requestedAction === d.action,
                state: {
                    health: w.health,
                    maxHealth: w.maxHealth,
                    attack: w.attack,
                    energy: w.needs.energy,
                    hunger: w.needs.hunger,
                    emotions: {...w.emotions},
                    targetHealth: targetWolf?.health ?? targetThreat?.health,
                    targetAttack: targetWolf?.attack ?? targetThreat?.attack,
                    targetTrust: relationship?.trust,
                    targetAffection: relationship?.affection
                },
                plan: decisionPlan,
                emotionTrigger: w.lastEmotionTrigger
            });
            if (this.world.decisionLog.length > 20000) this.world.decisionLog.shift();
            if (changed && this.isStrategicAction(d.action)) w.stats.strategicActions++;
            w.lastEmotionTrigger = undefined;
        }
        if (changed) {
            w.path = [];
            this.log(`${w.name}: ${d.action} - ${d.thought}`, w.id);
        }
        if (d.thought) this.think(w, d.thought);
        if (d.emotionNudges) w.emotions = updateEmotions(w.emotions, w.traits, 0, d.emotionNudges);
    }

    private isStrategicAction(action: Action): boolean {
        return ['HUNT', 'CHALLENGE', 'ATTACK_THREAT', 'PROVOKE', 'ALLY', 'SHARE_FOOD'].includes(action);
    }

    private makePlan(w: Wolf, decision: Decision): StrategicPlan | undefined {
        if (w.id !== 'wolf3') return undefined;
        const target = this.world.wolves.find(v => v.id === decision.targetId);
        if (decision.action === 'ALLY') return {
            goal: 'Lập liên minh tạm thời với Eva để có cơ hội đối phó Adam.',
            steps: ['Tiếp cận Eva', 'Đề nghị cùng nhắm vào Adam', 'Đánh giá lại tương quan sức mạnh sau khi liên minh'],
            success: 'Eva chấp nhận và liên minh còn hiệu lực.',
            abort: 'Eva từ chối, bị tấn công hoặc lợi ích của liên minh không còn.',
            createdAt: this.world.time
        };
        if (decision.action === 'CHALLENGE') return {
            goal: `Thách đấu ${target?.name ?? 'đối thủ'} sau khi cân nhắc máu, sức mạnh, quan hệ và đồng minh.`,
            steps: ['So sánh sức mạnh hiệu dụng với mọi đối thủ', 'Kiểm tra thể lực và hỗ trợ đồng minh', 'Tiếp cận mục tiêu', 'Thách đấu khi điều kiện còn thuận lợi'],
            success: 'Đối thủ quy phục hoặc bị loại khỏi quyền kiểm soát của đầu đàn.',
            abort: 'Mục tiêu biến mất, bị chặn đường hoặc lợi thế sức mạnh không còn.',
            createdAt: this.world.time
        };
        if (decision.action === 'HUNT') return {
            goal: 'Kiếm thức ăn và tăng sức mạnh trước khi tranh ngôi.',
            steps: ['Tiếp cận con mồi', 'Hạ con mồi', 'Cập nhật sức mạnh và đánh giá lại đối thủ'],
            success: 'Con mồi bị hạ và phần thưởng được ghi nhận.',
            abort: 'Con mồi không thể tiếp cận hoặc nguy cơ sinh tồn trở nên cấp thiết.',
            createdAt: this.world.time
        };
        if (decision.action === 'ATTACK_THREAT') return {
            goal: 'Loại bỏ mối đe dọa để bảo vệ bầy và tăng sức mạnh.',
            steps: ['Đánh giá máu và sức tấn công của mối đe dọa', 'Cân nhắc rút lui hoặc gọi đồng minh', 'Tấn công khi xác suất sống sót chấp nhận được'],
            success: 'Mối đe dọa bị hạ.',
            abort: 'Máu thấp, mối đe dọa biến mất hoặc đường tiếp cận bị chặn.',
            createdAt: this.world.time
        };
        return undefined;
    }

    private markActionStarted(w: Wolf, action: Action): void {
        const record = [...this.world.decisionLog].reverse().find(item => item.wolfId === w.id && item.action === action && item.result === undefined && item.startedAt === undefined);
        if (!record) return;
        record.startedAt = this.world.time;
        if (this.isStrategicAction(action)) {
            w.stats.actionStartCount++;
            w.stats.actionStartDelayTotal += Math.max(0, this.world.time - record.time);
        }
    }

    private finishDecision(w: Wolf, action: Action, success: boolean, reason: string): void {
        const record = [...this.world.decisionLog].reverse().find(item => item.wolfId === w.id && item.action === action && item.result === undefined);
        if (!record) return;
        record.finishedAt = this.world.time;
        record.result = success ? 'success' : 'failure';
        record.resultReason = reason;
        if (this.isStrategicAction(action)) {
            if (success) w.stats.successfulStrategicActions++;
            else w.stats.failedStrategicActions++;
        }
    }

    private destination(w: Wolf): Point | undefined {
        const action = w.decision.action, map = this.world.map;
        if (action === 'DRINK') return this.closest(w, map.waterPoints);
        if (action === 'EAT') return w.foodHeld ? w : this.closest(w, map.foodPatches);
        if (action === 'REST') return map.den;
        if (action === 'HUNT') return this.world.prey.find(p => p.id === w.decision.targetId) ?? this.closest(w, this.world.prey);
        if (['FOLLOW', 'PLAY', 'SHARE_FOOD', 'GROOM', 'QUARREL', 'PROVOKE', 'CHALLENGE', 'ALLY'].includes(action)) return this.world.wolves.find(v => v.id === w.decision.targetId);
        if (action === 'ATTACK_THREAT') {
            return this.world.threats.find(t => t.id === w.decision.targetId);
        }
        if (action === 'FLEE') {
            const t = this.closest(w, this.world.threats);
            if (!t) return map.den;
            return {
                x: Math.max(0, Math.min(map.world.width - 1, w.x + (w.x - t.x) * 2)),
                y: Math.max(0, Math.min(map.world.height - 1, w.y + (w.y - t.y) * 2))
            };
        }
        if (action === 'WANDER' || action === 'GO_TO') return w.path.at(-1) ?? this.pathfinder.nearest({
            x: w.x + this.rng.range(-230, 230),
            y: w.y + this.rng.range(-230, 230)
        });
        return undefined;
    }

    private closest<T extends Point>(p: Point, items: T[]): T | undefined {
        return items.slice().sort((a, b) => dist(p, a) - dist(p, b))[0];
    }

    private perform(w: Wolf, dt: number): void {
        const target = this.destination(w), a = w.decision.action;
        if (a === 'CHALLENGE' && target && 'id' in target && (target as Wolf).submittedTo === w.id) {
            w.decisionAt = this.world.time;
            w.path = [];
            return;
        }
        if (target && dist(w, target) > (a === 'FOLLOW' ? 90 : 35)) {
            this.markActionStarted(w, a);
            if (['FOLLOW', 'HUNT', 'PROVOKE', 'CHALLENGE'].includes(a) && w.path.length && dist(w.path.at(-1)!, target) > 64) w.path = [];
            if (!w.path.length) w.path = this.pathfinder.find(w, target);
            const next = w.path[0];
            if (next) {
                const d = dist(w, next);
                if (d < 3) w.path.shift(); else {
                    const speed = w.speed * (a === 'FLEE' ? 1.7 : 1);
                    const move = Math.min(d, speed * dt);
                    w.x += (next.x - w.x) / d * move;
                    w.y += (next.y - w.y) / d * move;
                }
            }
            return;
        }

        if (
            a === 'ATTACK_THREAT' &&
            target &&
            'id' in target &&
            this.world.time >= w.combatCooldownUntil
        ) {
            this.markActionStarted(w, a);
            const enemy = target as Threat;

            enemy.health = Math.max(0, enemy.health - w.attack);
            w.combatCooldownUntil = this.world.time + 1;

            if (enemy.health === 0) {
                this.rewardKill(w, 'threat');
                this.log(`${w.name} đã hạ mối đe dọa ${enemy.id}.`, w.id);
                this.finishDecision(w, a, true, `Đã hạ ${enemy.id}.`);
                const protectedMember = this.world.wolves.find(member => member.submittedTo === w.id && dist(member, enemy) < 175);
                if (protectedMember) {
                    w.stats.protectionSuccesses++;
                    protectedMember.relationships[w.id].affection = clamp(protectedMember.relationships[w.id].affection + .12, -1, 1);
                    protectedMember.emotions.joy = clamp(protectedMember.emotions.joy + .08);
                    protectedMember.lastEmotionTrigger = 'Đầu đàn bảo vệ thành công';
                    protectedMember.stats.protectionSuccesses++;
                    this.log(`${w.name} bảo vệ ${protectedMember.name} khỏi mối đe dọa; thiện cảm tăng.`, w.id);
                }
                this.world.threats = this.world.threats.filter(t => t.id !== enemy.id);
                w.decisionAt = this.world.time;
                w.path = [];
            } else {
                w.health = Math.max(0, w.health - enemy.attack);
                if (w.health <= 0) this.finishDecision(w, a, false, 'Sói kiệt sức trước khi hạ mối đe dọa.');
                this.log(
                    `${w.name} đánh ${enemy.id}; sói còn ${Math.round(w.health)} máu, mối đe dọa còn ${Math.round(enemy.health)} máu.`,
                    w.id,
                );
            }
        }

        if (a === 'DRINK' && target) {
            w.needs.thirst = clamp(w.needs.thirst + dt * 8, 0, 100);
            if (w.needs.thirst > 96) {
                w.decisionAt = this.world.time;
                w.commitmentUntil = 0;
            }
        }
        if (a === 'EAT' && target) {
            w.needs.hunger = clamp(w.needs.hunger + dt * 7, 0, 100);
            if (w.foodHeld > 0) w.foodHeld = Math.max(0, w.foodHeld - dt * 2);
            if (w.needs.hunger > 96) {
                w.decisionAt = this.world.time;
                w.commitmentUntil = 0;
            }
        }
        if (a === 'REST' && target) {
            w.needs.energy = clamp(w.needs.energy + dt * 5, 0, 100);
            w.health = clamp(w.health + dt * 1.3, 0, w.maxHealth);
            if (w.needs.energy > 95 && w.health >= w.maxHealth * .9) {
                w.decisionAt = this.world.time;
                w.commitmentUntil = 0;
            }
        }
        if (a === 'HUNT' && target && 'id' in target && dist(w, target) < 42) {
            const prey = target as Prey;
            this.rewardKill(w, 'prey');
            w.foodHeld += 35;
            w.needs.hunger = clamp(w.needs.hunger + 22, 0, 100);
            w.emotions.joy = clamp(w.emotions.joy + .1);
            this.remember(w, 'hunt', prey, .6, [prey.id]);
            this.log(`${w.name} caught ${prey.id}.`, w.id);
            const zone = this.rng.pick(this.world.map.preySpawnZones);
            Object.assign(prey, this.pathfinder.nearest({
                x: zone.x + this.rng.range(-70, 70),
                y: zone.y + this.rng.range(-70, 70)
            }));
            this.nextPrey++;
            prey.id = `prey${this.nextPrey + 10}`;
            w.decisionAt = this.world.time;
            w.path = [];
        }
        if (a === 'CHALLENGE' && target && 'id' in target && dist(w, target) < 55 && this.world.time >= w.challengeCooldownUntil) this.resolveChallenge(w, target as Wolf);
        if (a === 'PROVOKE' && target && 'id' in target && dist(w, target) < 90 && this.world.time >= w.provokeCooldownUntil) {
            this.markActionStarted(w, a);
            this.resolveProvocation(w, target as Wolf);
        }
        if (a === 'ALLY' && target && 'id' in target && dist(w, target) < 70) {
            this.markActionStarted(w, a);
            this.resolveAlliance(w, target as Wolf);
        }
        if (['PLAY', 'GROOM', 'SHARE_FOOD', 'QUARREL'].includes(a) && target && 'id' in target && dist(w, target) < 50 && this.world.time >= w.socialCooldownUntil) {
            this.markActionStarted(w, a);
            const mate = target as Wolf, relation = w.relationships[mate.id];
            const positive = a !== 'QUARREL';
            relation.trust = clamp(relation.trust + (positive ? .04 : -.07), -1, 1);
            relation.affection = clamp(relation.affection + (positive ? .06 : -.08), -1, 1);
            w.emotions.joy = clamp(w.emotions.joy + (positive ? .05 : -.06));
            if (a === 'SHARE_FOOD' && w.foodHeld > 0) {
                w.foodHeld -= 5;
                mate.needs.hunger = clamp(mate.needs.hunger + 8, 0, 100);
                w.stats.foodGiven++;
                mate.stats.foodReceived++;
                if (w.id === this.world.alphaId && mate.submittedTo === w.id) {
                    mate.relationships[w.id].affection = clamp(mate.relationships[w.id].affection + .12, -1, 1);
                    mate.lastEmotionTrigger = `Đầu đàn ${w.name} chia thức ăn`;
                    mate.emotions.joy = clamp(mate.emotions.joy + .08);
                    this.log(`${w.name} cấp thức ăn cho ${mate.name}; thiện cảm tăng.`, w.id);
                }
                this.finishDecision(w, a, true, `${mate.name} nhận thức ăn.`);
            }
            this.remember(w, a.toLowerCase(), mate, positive ? .4 : -.5, [mate.id]);
            w.stats.interactions++;
            this.log(`${w.name} ${a.toLowerCase().replace('_', ' ')} with ${mate.name}.`, w.id);
            w.socialCooldownUntil = this.world.time + 15;
            w.decisionAt = this.world.time + 4;
            if (!positive) this.wake(mate);
        }
    }

    private updateConflicts(): void {
        for (const conflict of this.world.conflicts) {
            if (conflict.status !== 'pending') continue;
            const first = this.world.wolves.find(w => w.id === conflict.firstId);
            const second = this.world.wolves.find(w => w.id === conflict.secondId);
            if (!first || !second || first.health <= 0 || second.health <= 0) {
                conflict.status = 'blocked';
                conflict.reason = 'Một bên không thể tham chiến.';
                this.log(`Mâu thuẫn ${conflict.id} bị gián đoạn: ${conflict.reason}`);
                continue;
            }
            if (dist(first, second) <= 120) {
                conflict.status = 'engaged';
                this.log(`${first.name} và ${second.name} bắt đầu giao đấu trong thời hạn 10 giây.`);
                this.finishDecision(first, 'QUARREL', true, `Đã giao đấu với ${second.name}.`);
                this.finishDecision(second, 'QUARREL', true, `Đã giao đấu với ${first.name}.`);
                this.resolveChallenge(first, second);
                conflict.status = 'resolved';
                continue;
            }
            if (this.world.time >= conflict.deadline) {
                const path = this.pathfinder.find(first, second);
                conflict.status = 'blocked';
                conflict.reason = path.length ? 'Không tiếp cận kịp trong 10 giây mô phỏng.' : 'Đường đi bị chặn.';
                this.finishDecision(first, 'QUARREL', false, conflict.reason);
                this.finishDecision(second, 'QUARREL', false, conflict.reason);
                this.log(`Mâu thuẫn ${conflict.id} không dẫn tới giao đấu: ${conflict.reason}`);
            }
        }
    }

    private resolveAlliance(oden: Wolf, eva: Wolf): void {
        const adam = this.world.wolves.find(w => w.id === 'adam');
        if (oden.id !== 'wolf3' || eva.id !== 'eva' || !adam || oden.allianceWith || eva.allianceWith) {
            this.finishDecision(oden, 'ALLY', false, 'Liên minh không đủ điều kiện.');
            return;
        }
        const power = (wolf: Wolf) => wolf.attack * wolf.health / wolf.maxHealth * (.5 + wolf.needs.energy / 200);
        const sharedTarget = adam.id;
        const accepts = eva.health > 0 && eva.needs.energy > 25 && (this.world.alphaId === adam.id || power(adam) >= power(oden) * .85);
        if (!accepts) {
            this.finishDecision(oden, 'ALLY', false, 'Eva từ chối vì liên minh hiện không có lợi hoặc chưa an toàn.');
            oden.decisionAt = this.world.time + 6;
            eva.lastEmotionTrigger = 'Từ chối liên minh của Oden';
            this.log('Eva từ chối đề nghị liên minh của Oden.');
            return;
        }
        const expiresAt = this.world.time + 120;
        oden.allianceWith = eva.id;
        eva.allianceWith = oden.id;
        oden.allianceTargetId = sharedTarget;
        eva.allianceTargetId = sharedTarget;
        oden.allianceExpiresAt = expiresAt;
        eva.allianceExpiresAt = expiresAt;
        oden.relationships[eva.id].trust = clamp(oden.relationships[eva.id].trust + .1, -1, 1);
        eva.relationships[oden.id].trust = clamp(eva.relationships[oden.id].trust + .1, -1, 1);
        oden.relationships[eva.id].affection = clamp(oden.relationships[eva.id].affection + .06, -1, 1);
        eva.relationships[oden.id].affection = clamp(eva.relationships[oden.id].affection + .06, -1, 1);
        this.finishDecision(oden, 'ALLY', true, `Liên minh với Eva nhắm vào ${adam.name}.`);
        this.remember(oden, 'lập liên minh', eva, .5, [eva.id, sharedTarget]);
        this.remember(eva, 'chấp nhận liên minh', oden, .4, [oden.id, sharedTarget]);
        oden.lastEmotionTrigger = 'Eva chấp nhận liên minh';
        eva.lastEmotionTrigger = 'Oden đề nghị liên minh';
        this.log(`Eva chấp nhận liên minh tạm thời với Oden để cùng đối phó ${adam.name}.`);
    }

    private updateAlliances(): void {
        for (const wolf of this.world.wolves) {
            if (wolf.allianceWith && this.world.time >= (wolf.allianceExpiresAt ?? 0)) {
                const partner = this.world.wolves.find(v => v.id === wolf.allianceWith);
                wolf.allianceWith = undefined;
                wolf.allianceTargetId = undefined;
                wolf.allianceExpiresAt = undefined;
                if (partner?.allianceWith === wolf.id) {
                    partner.allianceWith = undefined;
                    partner.allianceTargetId = undefined;
                    partner.allianceExpiresAt = undefined;
                }
                this.log(`${wolf.name} và ${partner?.name ?? 'đồng minh'} kết thúc liên minh.`);
            }
        }
    }

    private resolveProvocation(eva: Wolf, target: Wolf): void {
        const other = this.world.wolves.find(w => w.id !== eva.id && w.id !== target.id);
        if (!other) return;
        target.relationships[other.id].trust = clamp(target.relationships[other.id].trust - .25, -1, 1);
        target.relationships[other.id].affection = clamp(target.relationships[other.id].affection - .18, -1, 1);
        target.emotions.anger = clamp(target.emotions.anger + .35);
        target.decision = {action: 'QUARREL', targetId: other.id, thought: `Ta bực ${other.name}; phải nói cho rõ.`};
        target.decisionAt = this.world.time + .5;
        target.commitmentUntil = this.world.time + 10;
        target.path = [];
        eva.needs.energy = clamp(eva.needs.energy - 3, 0, 100);
        eva.provokeCooldownUntil = this.world.time + 45;
        eva.decision = {
            action: 'WANDER',
            thought: `${target.name} đang bất hòa với ${other.name}. Ta sẽ giữ sức và quan sát.`
        };
        eva.decisionAt = this.world.time + 8;
        eva.path = [];
        const conflict: Conflict = {
            id: `conflict-${Math.round(this.world.time * 10)}-${this.world.conflicts.length + 1}`,
            firstId: target.id,
            secondId: other.id,
            createdAt: this.world.time,
            deadline: this.world.time + 10,
            status: 'pending'
        };
        this.world.conflicts.push(conflict);
        target.lastEmotionTrigger = `Eva khơi mâu thuẫn với ${other.name}`;
        other.lastEmotionTrigger = `Eva khơi mâu thuẫn với ${target.name}`;
        this.think(target, target.decision.thought);
        other.decision = {action: 'QUARREL', targetId: target.id, thought: `Ta phải đối mặt với ${target.name} để giải quyết bất hòa.`};
        other.decisionAt = this.world.time + .5;
        other.commitmentUntil = this.world.time + 10;
        other.path = [];
        this.think(other, other.decision.thought);
        this.think(eva, eva.decision.thought);
        this.remember(eva, 'khơi mâu thuẫn', target, .35, [target.id, other.id]);
        this.log(`Eva khơi mâu thuẫn giữa ${target.name} và ${other.name}.`, eva.id);
        this.finishDecision(eva, 'PROVOKE', true, `Đã tạo xung đột ${conflict.id}; hạn giao đấu ${conflict.deadline.toFixed(1)}s.`);
    }

    private resolveChallenge(challenger: Wolf, defender: Wolf): void {
        const activeAllianceSupport = (fighter: Wolf, opponent: Wolf): Wolf | undefined => {
            if (!fighter.allianceWith || fighter.allianceTargetId !== opponent.id || this.world.time >= (fighter.allianceExpiresAt ?? 0)) return undefined;
            const ally = this.world.wolves.find(w => w.id === fighter.allianceWith);
            return ally && ally.health > 0 && dist(ally, fighter) < 220 ? ally : undefined;
        };
        const defenderLeader = defender.submittedTo ? this.world.wolves.find(w => w.id === defender.submittedTo) : undefined;
        const protectingLeader = defenderLeader && defenderLeader.health > 0 && dist(defenderLeader, defender) < 220 ? defenderLeader : undefined;
        const challengerSupport = activeAllianceSupport(challenger, defender);
        const defenderSupport = activeAllianceSupport(defender, challenger) ?? protectingLeader;
        const rating = (w: Wolf, support?: Wolf) => w.health <= 0 ? -1 : w.attack * (.35 + w.health / w.maxHealth * .35 + w.needs.energy / 100 * .3) + w.traits.boldness * 3 + w.traits.aggression * 3 - w.emotions.fear * 4 + (support ? support.attack * .35 : 0) + this.rng.range(-4, 4);
        const challengerRating = rating(challenger, challengerSupport), defenderRating = rating(defender, defenderSupport);
        const winner = challengerRating >= defenderRating ? challenger : defender;
        const loser = winner === challenger ? defender : challenger;
        const previousAlpha = this.world.alphaId;
        const crowned = recordDominance(this.world, winner, loser);
        winner.challengeCooldownUntil = this.world.time + (winner.id === 'adam' ? 12 : 32);
        loser.challengeCooldownUntil = this.world.time + (loser.id === 'adam' ? 16 : 38);
        const damage = Math.max(1, Math.round(winner.attack * this.rng.range(.45, .65)));
        let counterDamage = Math.max(1, Math.round(loser.attack * this.rng.range(.12, .22)));
        loser.health = clamp(loser.health - damage, 0, loser.maxHealth);
        if (winner === defender && protectingLeader) {
            const redirected = Math.round(counterDamage * .7);
            counterDamage -= redirected;
            protectingLeader.health = clamp(protectingLeader.health - redirected, 0, protectingLeader.maxHealth);
            protectingLeader.stats.protectionSuccesses++;
            defender.stats.protectionSuccesses++;
            defender.relationships[protectingLeader.id].affection = clamp(defender.relationships[protectingLeader.id].affection + .12, -1, 1);
            defender.lastEmotionTrigger = `Đầu đàn ${protectingLeader.name} che chắn trong giao đấu`;
            this.log(`${protectingLeader.name} che chắn cho ${defender.name}, giảm sát thương nhận vào.`, protectingLeader.id);
        } else if (protectingLeader) {
            protectingLeader.stats.protectionFailures++;
            defender.stats.protectionFailures++;
            this.log(`${protectingLeader.name} không ngăn được thất bại của ${defender.name}.`, protectingLeader.id);
        }
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
        winner.decision = {action: 'HOWL', thought: winnerThought};
        winner.decisionAt = this.world.time + 6;
        winner.commitmentUntil = 0;
        winner.path = [];
        loser.decision = {action: 'SUBMIT', targetId: winner.id, thought: loserThought};
        loser.decisionAt = this.world.time + 8;
        loser.commitmentUntil = 0;
        loser.path = [];
        this.think(winner, winnerThought);
        this.think(loser, loserThought);
        this.log(`${winner.name} thắng thách đấu; ${loser.name} mất ${damage} máu, ${winner.name} mất ${counterDamage} máu; ${loser.name} quy phục.`, winner.id);
        this.finishDecision(challenger, 'CHALLENGE', winner === challenger, winner === challenger ? `Thắng ${defender.name}.` : `Thua ${defender.name}.`);
        if (crowned && previousAlpha !== winner.id) this.log(`${winner.name} trở thành bá chủ của bầy.`, winner.id);
        if (!crowned && previousAlpha && previousAlpha !== this.world.alphaId) this.log('Ngôi bá chủ đang bỏ trống.');
    }

    summary(): {
        wolf: string;
        brain: string;
        health: number;
        attack: number;
        need: number;
        topAction: Action;
        subjects: number;
        submittedTo: string;
        alpha: boolean;
        social: number;
        decisions: number;
        calls: number;
        failures: number
    }[] {
        return this.world.wolves.map(w => ({
            wolf: w.name,
            brain: w.brain,
            health: Math.round(w.health),
            attack: w.attack,
            need: Math.round(w.stats.needTotal / Math.max(1, w.stats.samples)),
            topAction: (Object.keys(w.stats.timeByAction) as Action[]).sort((a, b) => w.stats.timeByAction[b] - w.stats.timeByAction[a])[0],
            subjects: subjectsOf(this.world, w.id).length,
            submittedTo: w.submittedTo ?? '-',
            alpha: this.world.alphaId === w.id,
            social: w.stats.interactions,
            decisions: w.stats.decisions,
            calls: w.stats.llmCalls,
            failures: w.stats.llmFailures
        }));
    }
}
