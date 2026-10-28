import {ACTIONS, type Brain, type Decision, type Emotions, type Observation, type Wolf} from '../sim/types';
import {clamp} from '../sim/emotion';
import {utilityDecision, safestAction} from './utility';
import {challengeTarget} from '../sim/dominance';

export interface LLMAdapter {
    request(observation: unknown): Promise<unknown>;

    requestSync?(observation: unknown): unknown
}

export interface LLMSettings {
    intervalSeconds: number;
    maxCallsPerMinute: number;
    timeoutMs: number
}

export const DEFAULT_LLM: LLMSettings = {intervalSeconds: 25, maxCallsPerMinute: 6, timeoutMs: 5000};

export function compactObservation(o: Observation, chosenAction?: Decision['action']): unknown {
    const w = o.self;
    const rival = challengeTarget(w, o.wolves);
    return {
        time: Math.round(o.time),
        id: w.id,
        name: w.name,
        persona: w.persona,
        health: w.health,
        maxHealth: w.maxHealth,
        attack: w.attack,
        mode: chosenAction ? 'hybrid' : 'decision',
        chosenAction,
        goal: 'Thống trị hai sói còn lại để trở thành bá chủ',
        needs: w.needs,
        emotions: w.emotions,
        traits: w.traits,
        provokeReady: o.time >= w.provokeCooldownUntil,
        isAlpha: o.wolves.filter(v => v.submittedTo === w.id).length === o.wolves.length - 1 && !w.submittedTo,
        alliance: w.allianceWith ? {partnerId: w.allianceWith, targetId: w.allianceTargetId, expiresAt: w.allianceExpiresAt} : undefined,
        hungryMembers: o.wolves.filter(v => v.submittedTo === w.id && v.needs.hunger < 55).map(v => v.id),
        conflicts: o.wolves.filter(v => v.id !== w.id && (v.decision.action === 'QUARREL' || w.decision.action === 'QUARREL')).map(v => v.id),
        dominance: {
            submittedTo: w.submittedTo,
            subjects: o.wolves.filter(v => v.submittedTo === w.id).map(v => v.id),
            wins: w.dominanceWins,
            losses: w.dominanceLosses,
            challengeReady: o.time >= w.challengeCooldownUntil,
            rivalId: rival?.id,
            rivalDistance: rival ? Math.round(Math.hypot(rival.x - w.x, rival.y - w.y)) : null
        },
        nearbyWolves: o.wolves.filter(v => v.id !== w.id).map(v => ({
            id: v.id,
            name: v.name,
            health: v.health,
            maxHealth: v.maxHealth,
            attack: v.attack,
            distance: Math.round(Math.hypot(v.x - w.x, v.y - w.y)),
            submittedTo: v.submittedTo
        })),
        prey: o.prey.map(v => ({
            id: v.id,
            distance: Math.round(Math.hypot(v.x - w.x, v.y - w.y))
        })).filter(v => v.distance < 350),
        threats: o.threats
            .map(v => ({
                id: v.id,
                distance: Math.round(Math.hypot(v.x - w.x, v.y - w.y)),
                health: v.health,
                maxHealth: v.maxHealth,
                attack: v.attack,
            }))
            .filter(v => v.distance < 350),
        memories: w.memories.slice(-4).map(m => ({type: m.type, valence: m.valence, time: Math.round(m.time)}))
    };
}

export function validateReply(raw: unknown): Decision {
    if (typeof raw === 'string') {
        try {
            raw = JSON.parse(raw);
        } catch {
            throw new Error('Invalid JSON');
        }
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Reply must be an object');
    const data = raw as Record<string, unknown>;
    if (typeof data.action !== 'string' || !ACTIONS.includes(data.action as Decision['action'])) throw new Error('Action outside closed list');
    if (typeof data.thought !== 'string' || data.thought.length > 300) throw new Error('Invalid thought');
    if (data.targetId !== undefined && typeof data.targetId !== 'string') throw new Error('Invalid targetId');
    const emotionNudges: Partial<Emotions> = {};
    if (data.appraisal !== undefined) {
        if (!data.appraisal || typeof data.appraisal !== 'object' || Array.isArray(data.appraisal)) throw new Error('Invalid appraisal');
        for (const [key, value] of Object.entries(data.appraisal as Record<string, unknown>)) {
            if (!['joy', 'fear', 'anger', 'sadness', 'curiosity'].includes(key) || typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Invalid appraisal field');
            emotionNudges[key as keyof Emotions] = clamp(value, -.08, .08);
        }
    }
    return {
        action: data.action as Decision['action'],
        targetId: data.targetId as string | undefined,
        thought: data.thought,
        emotionNudges
    };
}

export class MockAdapter implements LLMAdapter {
    requestSync(o: unknown): unknown {
        const d = o as {
            id: string;
            chosenAction?: Decision['action'];
            time: number;
            health: number;
            maxHealth: number;
            needs: { hunger: number; thirst: number; energy: number; safety: number };
            prey: unknown[];
            provokeReady: boolean;
            nearbyWolves: { id: string; name: string; distance: number }[];
            dominance: { challengeReady: boolean; rivalId?: string; rivalDistance: number | null }
            attack: number;
            isAlpha: boolean;
            hungryMembers: string[];
            threats: {
                id: string;
                distance: number;
                health: number;
                maxHealth: number;
                attack: number;
            }[];
        };
        const evaAction = d.needs.energy < 85 || d.health < d.maxHealth * .85 ? 'REST' : d.needs.thirst < 50 ? 'DRINK' : d.needs.hunger < 55 ? 'EAT' : d.provokeReady ? 'PROVOKE' : 'WANDER';
        const threatTarget = d.threats
            .filter(t => t.distance < 150)
            .sort((a, b) => a.distance - b.distance)[0];

        const canFightThreat =
            threatTarget !== undefined &&
            d.health > d.maxHealth * 0.55 &&
            d.attack >= threatTarget.attack;
        const action = d.chosenAction ?? (canFightThreat ? 'ATTACK_THREAT' : d.threats.length ? 'FLEE' : d.id === 'eva' ? evaAction : d.isAlpha && d.hungryMembers.length > 0 ? 'HUNT' : d.needs.thirst < 50 ? 'DRINK' : d.needs.energy < 40 ? 'REST' : d.needs.hunger < 55 ? d.prey.length ? 'HUNT' : 'EAT' : d.dominance.challengeReady && d.dominance.rivalId && d.needs.safety > 35 ? 'CHALLENGE' : d.nearbyWolves.some(v => v.distance < 130) && Math.floor(d.time / 35) % 4 === 0 ? 'FOLLOW' : 'WANDER');
        const thoughts: Partial<Record<Decision['action'], string>> = {
            PROVOKE: 'Ta sẽ gieo nghi kỵ giữa Adam và Oden, còn mình giữ sức chờ cơ hội.',
            CHALLENGE: `Ta muốn ${d.dominance.rivalId ?? 'đối thủ'} quy phục để lên ngôi bá chủ.`,
            DRINK: 'Ta phải uống nước trước khi tranh ngôi.',
            EAT: 'Ta cần ăn để giữ sức mạnh.',
            REST: 'Ta hồi máu, giữ thể lực và đợi thời cơ.',
            FLEE: 'Giữ mạng trước; ngai đầu đàn để sau.',
            WANDER: 'Ta tìm cơ hội tiến gần hai đối thủ.',
            FOLLOW: 'Ta bám theo để quan sát đối thủ.',
            ATTACK_THREAT: 'Mối đe dọa này yếu hơn ta; ta sẽ hạ nó để mạnh lên.',
            HUNT: 'Ta săn mồi để mạnh hơn.'
        };
        return {
            action,
            targetId: action === 'ATTACK_THREAT'
                ? threatTarget?.id
                : action === 'CHALLENGE'
                    ? d.dominance.rivalId
                    : action === 'PROVOKE'
                        ? d.nearbyWolves[0]?.id
                        : undefined,            thought: thoughts[action] ?? 'Ta đang cân nhắc bước tiếp theo để trở thành bá chủ.',
            appraisal: {curiosity: .01}
        };
    }

    async request(o: unknown): Promise<unknown> {
        return this.requestSync(o);
    }
}

export class HttpAdapter implements LLMAdapter {
    constructor(private baseUrl: string, private model: string, private apiKey: string, private timeoutMs: number, private ollama = false) {
    }

    async request(observation: unknown): Promise<unknown> {
        const url = this.ollama ? `${this.baseUrl.replace(/\/$/, '')}/api/chat` : `${this.baseUrl.replace(/\/$/, '')}/chat/completions`;
        const response = await fetch(url, {
            method: 'POST',
            signal: AbortSignal.timeout(this.timeoutMs),
            headers: {'Content-Type': 'application/json', ...(this.apiKey ? {Authorization: `Bearer ${this.apiKey}`} : {})},
            body: JSON.stringify({
                model: this.model,
                stream: false,
                format: this.ollama ? 'json' : undefined,
                messages: [{
                    role: 'system',
                    content: `Mỗi sói muốn khiến hai sói còn lại quy phục để thành bá chủ. Tuân theo persona, máu, sức tấn công, liên minh và quan sát. Đầu đàn phải bảo vệ thành viên và cung cấp thức ăn cho sói đói. Eva ưu tiên giữ sức và khơi xung đột bằng PROVOKE. Oden cân nhắc mọi đối thủ và có thể lập liên minh bằng ALLY. Chọn một hành động: ${ACTIONS.join(', ')}. Trả về JSON {action,targetId,thought,appraisal}; thought viết tiếng Việt, mô tả ý định hiện tại.`
                }, {role: 'user', content: JSON.stringify(observation)}]
            })
        });
        if (!response.ok) throw new Error(`LLM HTTP ${response.status}`);
        const body = await response.json() as {
            message?: { content?: string };
            choices?: { message?: { content?: string } }[]
        };
        return body.message?.content ?? body.choices?.[0]?.message?.content;
    }
}

export class LLMBrain implements Brain {
    private nextAt = 0;
    private pending = false;
    private calls: number[] = [];
    private cached: Decision = {action: 'IDLE', thought: 'Ta đang quan sát đối thủ.'};

    constructor(private adapter: LLMAdapter, private settings: LLMSettings = DEFAULT_LLM, private hybrid = false) {
    }

    wake(): void {
        this.nextAt = 0;
    }

    decide(o: Observation): Decision {
        const w = o.self, utility = utilityDecision(o);
        const critical = safestAction(w, o);
        if (o.time >= this.nextAt && !this.pending) this.call(o, w, utility.action);
        if (this.hybrid) return {
            ...utility,
            thought: this.cached.action === utility.action ? this.cached.thought : utility.thought
        };
        const threatTarget = o.threats
            .filter(t => Math.hypot(t.x - w.x, t.y - w.y) < 150)
            .sort((a, b) =>
                Math.hypot(a.x - w.x, a.y - w.y) -
                Math.hypot(b.x - w.x, b.y - w.y)
            )[0];

        const canFightThreat =
            threatTarget !== undefined &&
            w.health > w.maxHealth * 0.55 &&
            w.attack >= threatTarget.attack;
        if (critical && !(canFightThreat && utility.action === 'ATTACK_THREAT')) {
            return { ...utility, action: 'FLEE', thought: 'Nguy hiểm quá gần, ta phải thoát trước.' };
        }

        if (canFightThreat && utility.action === 'ATTACK_THREAT') {
            return utility;
        }
        const isAlpha = !w.submittedTo && o.wolves.filter(v => v.submittedTo === w.id).length === o.wolves.length - 1;
        if ((isAlpha && ['ATTACK_THREAT', 'HUNT', 'SHARE_FOOD'].includes(utility.action)) || (w.id === 'eva' && ['PROVOKE', 'REST'].includes(utility.action))) return utility;
        if ((this.cached.action === 'EAT' && w.needs.hunger > 95) || (this.cached.action === 'DRINK' && w.needs.thirst > 95) || (this.cached.action === 'REST' && w.needs.energy > 95)) return utility;
        if (this.cached.action === 'CHALLENGE' && (o.time < w.challengeCooldownUntil || !challengeTarget(w, o.wolves))) return utility;
        return this.cached;
    }

    private call(o: Observation, w: Wolf, chosenAction: Decision['action']): void {
        this.calls = this.calls.filter(t => o.time - t < 60);
        if (this.calls.length >= this.settings.maxCallsPerMinute) {
            this.nextAt = o.time + 5;
            return;
        }
        this.calls.push(o.time);
        this.nextAt = o.time + this.settings.intervalSeconds;
        w.stats.llmCalls++;
        const payload = compactObservation(o, this.hybrid ? chosenAction : undefined);
        if (this.adapter.requestSync) {
            try {
                this.cached = validateReply(this.adapter.requestSync(payload));
            } catch {
                w.stats.invalidReplies++;
                w.stats.llmFailures++;
            }
            return;
        }
        this.pending = true;
        const started = Date.now();
        void this.adapter.request(payload).then(raw => {
            this.cached = validateReply(raw);
            w.stats.llmLatencyMs += Date.now() - started;
        }).catch(err => {
            w.stats.llmFailures++;
            if (err instanceof Error && /JSON|action|appraisal|thought|targetId|Reply/.test(err.message)) w.stats.invalidReplies++;
        }).finally(() => {
            this.pending = false;
        });
    }
}
