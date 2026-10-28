import type { BrainKind, Traits } from '../sim/types';

export interface WolfConfig { id: string; name: string; brain: BrainKind; design: 'blue' | 'pink'; traits: Traits; persona: string; attack: number; maxHealth: number }

export const WOLVES: WolfConfig[] = [
  { id: 'adam', name: 'Adam', brain: 'utility', design: 'blue', persona: 'Nóng nảy, bốc đồng; muốn là làm ngay, bất chấp hậu quả.', attack: 16, maxHealth: 100, traits: { boldness: .96, sociability: .35, patience: .08, aggression: .94 } },
  { id: 'eva', name: 'Eva', brain: 'llm', design: 'pink', persona: 'Yếu sức, giữ thể lực; chờ thời cơ và gieo mâu thuẫn giữa Adam với Oden.', attack: 16, maxHealth: 100, traits: { boldness: .18, sociability: .78, patience: .88, aggression: .17 } },
  { id: 'wolf3', name: 'Oden', brain: 'hybrid', design: 'blue', persona: 'Trầm ổn, cẩn thận; đánh giá sức mạnh và rủi ro trước khi hành động.', attack: 16, maxHealth: 100, traits: { boldness: .52, sociability: .48, patience: .95, aggression: .38 } },
];
