import type { Emotions, Memory, Traits } from './types';

export const clamp = (v: number, min = 0, max = 1): number => Math.min(max, Math.max(min, v));
export function updateEmotions(current: Emotions, traits: Traits, dt: number, nudges: Partial<Emotions> = {}): Emotions {
  const baseline: Emotions = { joy: .28 + traits.sociability * .18, fear: .18 - traits.boldness * .12, anger: .08 + traits.aggression * .15, sadness: .08, curiosity: .18 + traits.boldness * .22 };
  const result = { ...current };
  for (const key of Object.keys(result) as (keyof Emotions)[]) result[key] = clamp(current[key] + (baseline[key] - current[key]) * Math.min(1, dt * .015) + clamp(nudges[key] ?? 0, -.15, .15));
  return result;
}
export function decayMemory(memories: Memory[], dt: number): Memory[] {
  return memories.map(m => ({ ...m, strength: m.strength * Math.exp(-dt / 1800) })).filter(m => m.strength > .05);
}
