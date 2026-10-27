import type { Action, Brain, Decision, Observation, Wolf } from '../sim/types';
import { challengeTarget } from '../sim/dominance';

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
export function scoreActions(o: Observation): Record<Action, number> {
  const w = o.self, n = w.needs, e = w.emotions, t = w.traits;
  const mate = o.wolves.find(v => v.id !== w.id && distance(v, w) < 220);
  const prey = o.prey.find(v => distance(v, w) < 260);
  const threat = o.threats.find(v => distance(v, w) < 250);
  const rival = challengeTarget(w, o.wolves);
  const urgentFear = threat ? Math.max(e.fear, 1 - distance(threat, w) / 250) : e.fear;
  const socialReady = o.time >= w.socialCooldownUntil;
  const challengeReady = o.time >= w.challengeCooldownUntil;
  const subjects = o.wolves.filter(v => v.submittedTo === w.id).length;
  const strength = (wolf: Wolf) => wolf.attack * (wolf.health / wolf.maxHealth) * (.5 + wolf.needs.energy / 200);
  const advantage = rival ? strength(w) / Math.max(1, strength(rival)) : 0;
  const adam = w.id === 'adam', eva = w.id === 'eva', oden = w.id === 'wolf3';
  const challengeAllowed = adam ? w.health > 0 : eva ? w.health / w.maxHealth > .8 && n.energy > 75 && advantage > 1.2 : w.health / w.maxHealth > .55 && n.energy > 60 && advantage > 1.05;
  return {
    IDLE: .13 + t.patience * .12,
    WANDER: .22 + e.curiosity * .6,
    GO_TO: .08,
    DRINK: (100 - n.thirst) / 100 * 1.35,
    EAT: (100 - n.hunger) / 100 * .95 + (w.foodHeld > 0 ? .18 : 0),
    HUNT: prey ? (100 - n.hunger) / 100 * .9 + t.aggression * .27 - urgentFear * .5 : 0,
    REST: eva && (n.energy < 85 || w.health < w.maxHealth * .85) ? 1.45 : oden && (n.energy < 60 || w.health < w.maxHealth * .55) ? 1.25 : w.health < w.maxHealth * .3 ? 1.4 : (100 - n.energy) / 100 * 1.15,
    FLEE: threat ? .55 + urgentFear * 1.25 - t.boldness * .12 : urgentFear > .8 ? .6 : 0,
    FOLLOW: mate ? .1 + t.sociability * .35 + e.fear * .16 : 0,
    PLAY: mate && n.energy > 45 && socialReady ? .18 + e.joy * .55 + t.sociability * .15 : 0,
    SHARE_FOOD: mate && w.foodHeld >= 5 && socialReady ? .2 + t.sociability * .42 : 0,
    GROOM: mate && n.energy > 35 && socialReady ? .15 + t.sociability * .4 : 0,
    HOWL: .08 + e.sadness * .25,
    QUARREL: mate && socialReady ? e.anger * .58 + t.aggression * .12 : 0,
    PROVOKE: eva && o.wolves.length > 2 && o.time >= w.provokeCooldownUntil && n.energy > 38 && w.health > 25 ? .96 : 0,
    CHALLENGE: rival && challengeReady && challengeAllowed ? (adam ? 1.55 : eva ? .88 : .98) + (2 - subjects) * .06 - e.fear * .12 : 0,
    SUBMIT: 0,
  };
}
export function utilityDecision(o: Observation): Decision {
  const scores = scoreActions(o), w = o.self;
  const adam = w.id === 'adam', eva = w.id === 'eva', oden = w.id === 'wolf3';
  if (o.threats.some(t => distance(t, w) < 115)) scores.FLEE = 2;
  if (w.decision.action in scores && o.time < w.commitmentUntil && scores.FLEE < 1.8 && w.id !== 'adam') scores[w.decision.action] += .23;
  const action = (Object.keys(scores) as Action[]).reduce((a, b) => scores[b] > scores[a] ? b : a);
  const mate = o.wolves.filter(v => v.id !== w.id).sort((a, b) => distance(a, w) - distance(b, w))[0];
  const prey = o.prey.slice().sort((a, b) => distance(a, w) - distance(b, w))[0];
  const targetId = action === 'HUNT' ? prey?.id : action === 'CHALLENGE' ? challengeTarget(w, o.wolves)?.id : action === 'PROVOKE' ? o.wolves.filter(v => v.id !== w.id).sort((a, b) => distance(a, w) - distance(b, w))[0]?.id : ['FOLLOW', 'PLAY', 'SHARE_FOOD', 'GROOM', 'QUARREL'].includes(action) ? mate?.id : undefined;
  const rivalName = o.wolves.find(v => v.id === targetId)?.name;
  const reasons: Partial<Record<Action, string>> = { DRINK: 'Ta cần uống nước để còn sức tranh ngôi.', EAT: 'Ta phải ăn để không suy yếu.', HUNT: 'Con mồi kia sẽ giúp ta mạnh hơn.', REST: eva ? 'Ta giữ thể lực và hồi máu, đợi cơ hội thuận lợi.' : oden ? 'Ta hồi phục rồi đánh giá lại tình thế.' : 'Ta nghỉ một chút rồi hành động.', FLEE: 'Nguy hiểm quá gần; giữ mạng trước đã.', FOLLOW: 'Đi gần đồng loại để quan sát điểm yếu của họ.', PLAY: 'Chơi cùng bầy cũng giúp ta hiểu họ.', GROOM: 'Chăm sóc đồng loại để giữ quan hệ tốt.', SHARE_FOOD: 'Chia thức ăn có thể khiến họ tin ta.', QUARREL: 'Ta đang bất hòa với đồng loại.', PROVOKE: `Ta sẽ khiến ${rivalName ?? 'đối thủ'} nghi kỵ sói còn lại, rồi đứng ngoài chờ thời.`, HOWL: 'Ta muốn cả bầy nghe tiếng gọi của mình.', WANDER: oden ? 'Ta quan sát sức mạnh và vị trí từng đối thủ trước khi hành động.' : 'Ta đi tìm cơ hội và quan sát lãnh địa.', CHALLENGE: adam ? `Ta muốn hạ ${rivalName ?? 'đối thủ'} ngay bây giờ!` : oden ? `Ta đã cân nhắc sức mạnh; đây là lúc thách đấu ${rivalName ?? 'đối thủ'}.` : `Ta nắm lợi thế trước ${rivalName ?? 'đối thủ'}; giờ mới nên thách đấu.`, SUBMIT: 'Ta tạm nhường, nhưng vẫn muốn giành lại ngôi đầu.' };
  return { action, targetId, thought: reasons[action] ?? 'Ta đang quan sát bầy.' };
}
export class UtilityBrain implements Brain { decide(o: Observation): Decision { return utilityDecision(o); } }
export function safestAction(w: Wolf, o: Observation): boolean { return w.emotions.fear > .75 || o.threats.some(t => distance(t, w) < 115); }
