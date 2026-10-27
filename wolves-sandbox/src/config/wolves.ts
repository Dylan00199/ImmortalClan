import type { BrainKind, Traits } from '../sim/types';

export interface WolfConfig { id: string; name: string; brain: BrainKind; design: 'blue' | 'pink'; traits: Traits }

export const WOLVES: WolfConfig[] = [
  { id: 'adam', name: 'Adam', brain: 'utility', design: 'blue', traits: { boldness: .72, sociability: .55, patience: .45, aggression: .67 } },
  { id: 'eva', name: 'Eva', brain: 'llm', design: 'pink', traits: { boldness: .38, sociability: .82, patience: .71, aggression: .28 } },
  { id: 'wolf3', name: 'Wolf 3', brain: 'hybrid', design: 'blue', traits: { boldness: .55, sociability: .63, patience: .59, aggression: .42 } },
];
