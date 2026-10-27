import { ACTIONS, type Brain, type Decision, type Emotions, type Observation, type Wolf } from '../sim/types';
import { clamp } from '../sim/emotion';
import { utilityDecision, safestAction } from './utility';

export interface LLMAdapter { request(observation: unknown): Promise<unknown>; requestSync?(observation: unknown): unknown }
export interface LLMSettings { intervalSeconds: number; maxCallsPerMinute: number; timeoutMs: number }
export const DEFAULT_LLM: LLMSettings = { intervalSeconds: 25, maxCallsPerMinute: 6, timeoutMs: 5000 };
export function compactObservation(o: Observation, chosenAction?: Decision['action']): unknown {
  const w = o.self;
  return { time: Math.round(o.time), id: w.id, mode: chosenAction ? 'hybrid' : 'decision', chosenAction, needs: w.needs, emotions: w.emotions, traits: w.traits,
    nearbyWolves: o.wolves.filter(v => v.id !== w.id).map(v => ({ id: v.id, distance: Math.round(Math.hypot(v.x - w.x, v.y - w.y)) })),
    prey: o.prey.map(v => ({ id: v.id, distance: Math.round(Math.hypot(v.x - w.x, v.y - w.y)) })).filter(v => v.distance < 350),
    threats: o.threats.map(v => ({ id: v.id, distance: Math.round(Math.hypot(v.x - w.x, v.y - w.y)) })).filter(v => v.distance < 350),
    memories: w.memories.slice(-4).map(m => ({ type: m.type, valence: m.valence, time: Math.round(m.time) })) };
}
export function validateReply(raw: unknown): Decision {
  if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { throw new Error('Invalid JSON'); } }
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
  return { action: data.action as Decision['action'], targetId: data.targetId as string | undefined, thought: data.thought, emotionNudges };
}
export class MockAdapter implements LLMAdapter {
  requestSync(o: unknown): unknown {
    const d = o as { chosenAction?: Decision['action']; time: number; needs: { hunger: number; thirst: number; energy: number }; threats: unknown[]; prey: unknown[]; nearbyWolves: { distance: number }[] };
    const action = d.chosenAction ?? (d.threats.length ? 'FLEE' : d.needs.thirst < 50 ? 'DRINK' : d.needs.energy < 40 ? 'REST' : d.needs.hunger < 55 ? d.prey.length ? 'HUNT' : 'EAT' : d.nearbyWolves.some(v => v.distance < 130) && Math.floor(d.time / 35) % 4 === 0 ? 'FOLLOW' : 'WANDER');
    return { action, thought: `Mock appraisal: ${action.toLowerCase()} is the clearest next step.`, appraisal: { curiosity: .01 } };
  }
  async request(o: unknown): Promise<unknown> { return this.requestSync(o); }
}
export class HttpAdapter implements LLMAdapter {
  constructor(private baseUrl: string, private model: string, private apiKey: string, private timeoutMs: number, private ollama = false) {}
  async request(observation: unknown): Promise<unknown> {
    const url = this.ollama ? `${this.baseUrl.replace(/\/$/, '')}/api/chat` : `${this.baseUrl.replace(/\/$/, '')}/chat/completions`;
    const response = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(this.timeoutMs), headers: { 'Content-Type': 'application/json', ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}) }, body: JSON.stringify({ model: this.model, stream: false, format: this.ollama ? 'json' : undefined, messages: [{ role: 'system', content: `Choose one action from: ${ACTIONS.join(', ')}. Return only JSON {action,targetId,thought,appraisal}.` }, { role: 'user', content: JSON.stringify(observation) }] }) });
    if (!response.ok) throw new Error(`LLM HTTP ${response.status}`);
    const body = await response.json() as { message?: { content?: string }; choices?: { message?: { content?: string } }[] };
    return body.message?.content ?? body.choices?.[0]?.message?.content;
  }
}
export class LLMBrain implements Brain {
  private nextAt = 0; private pending = false; private calls: number[] = []; private cached: Decision = { action: 'IDLE', thought: 'Observing.' };
  constructor(private adapter: LLMAdapter, private settings: LLMSettings = DEFAULT_LLM, private hybrid = false) {}
  wake(): void { this.nextAt = 0; }
  decide(o: Observation): Decision {
    const w = o.self, utility = utilityDecision(o);
    const critical = safestAction(w, o);
    if (o.time >= this.nextAt && !this.pending) this.call(o, w, utility.action);
    if (this.hybrid) return { ...utility, thought: this.cached.action === utility.action ? this.cached.thought : utility.thought };
    if (critical) return { ...utility, action: 'FLEE', thought: 'Immediate danger. I must flee.' };
    return this.cached;
  }
  private call(o: Observation, w: Wolf, chosenAction: Decision['action']): void {
    this.calls = this.calls.filter(t => o.time - t < 60);
    if (this.calls.length >= this.settings.maxCallsPerMinute) { this.nextAt = o.time + 5; return; }
    this.calls.push(o.time); this.nextAt = o.time + this.settings.intervalSeconds; w.stats.llmCalls++;
    const payload = compactObservation(o, this.hybrid ? chosenAction : undefined);
    if (this.adapter.requestSync) {
      try { this.cached = validateReply(this.adapter.requestSync(payload)); } catch { w.stats.invalidReplies++; w.stats.llmFailures++; }
      return;
    }
    this.pending = true; const started = Date.now();
    void this.adapter.request(payload).then(raw => { this.cached = validateReply(raw); w.stats.llmLatencyMs += Date.now() - started; }).catch(err => {
      w.stats.llmFailures++; if (err instanceof Error && /JSON|action|appraisal|thought|targetId|Reply/.test(err.message)) w.stats.invalidReplies++;
    }).finally(() => { this.pending = false; });
  }
}
