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
  return {
    IDLE: .13 + t.patience * .12,
    WANDER: .22 + e.curiosity * .6,
    GO_TO: .08,
    DRINK: (100 - n.thirst) / 100 * 1.35,
    EAT: (100 - n.hunger) / 100 * .95 + (w.foodHeld > 0 ? .18 : 0),
    HUNT: prey ? (100 - n.hunger) / 100 * .9 + t.aggression * .27 - urgentFear * .5 : 0,
    REST: (100 - n.energy) / 100 * 1.15,
    FLEE: threat ? .55 + urgentFear * 1.25 - t.boldness * .12 : urgentFear > .8 ? .6 : 0,
    FOLLOW: mate ? .1 + t.sociability * .35 + e.fear * .16 : 0,
    PLAY: mate && n.energy > 45 && socialReady ? .18 + e.joy * .55 + t.sociability * .15 : 0,
    SHARE_FOOD: mate && w.foodHeld >= 5 && socialReady ? .2 + t.sociability * .42 : 0,
    GROOM: mate && n.energy > 35 && socialReady ? .15 + t.sociability * .4 : 0,
    HOWL: .08 + e.sadness * .25,
    QUARREL: mate && socialReady ? e.anger * .58 + t.aggression * .12 : 0,
    CHALLENGE: rival && challengeReady && n.energy > 32 && n.safety > 35 ? .68 + t.boldness * .25 + t.aggression * .25 + (2 - subjects) * .1 - e.fear * .25 : 0,
    SUBMIT: 0,
  };
}
export function utilityDecision(o: Observation): Decision {
  const scores = scoreActions(o), w = o.self;
  if (o.threats.some(t => distance(t, w) < 115)) scores.FLEE = 2;
  if (w.decision.action in scores && o.time < w.commitmentUntil && scores.FLEE < 1.8) scores[w.decision.action] += .23;
  const action = (Object.keys(scores) as Action[]).reduce((a, b) => scores[b] > scores[a] ? b : a);
  const mate = o.wolves.filter(v => v.id !== w.id).sort((a, b) => distance(a, w) - distance(b, w))[0];
  const prey = o.prey.slice().sort((a, b) => distance(a, w) - distance(b, w))[0];
  const targetId = action === 'HUNT' ? prey?.id : action === 'CHALLENGE' ? challengeTarget(w, o.wolves)?.id : ['FOLLOW', 'PLAY', 'SHARE_FOOD', 'GROOM', 'QUARREL'].includes(action) ? mate?.id : undefined;
  const rivalName = o.wolves.find(v => v.id === targetId)?.name;
  const reasons: Partial<Record<Action, string>> = { DRINK: 'Ta cần uống nước để còn sức tranh ngôi.', EAT: 'Ta phải ăn để không suy yếu.', HUNT: 'Con mồi kia sẽ giúp ta mạnh hơn.', REST: 'Ta cần hồi sức trước lần thách đấu tiếp theo.', FLEE: 'Nguy hiểm quá gần; giữ mạng trước đã.', FOLLOW: 'Đi gần đồng loại để quan sát điểm yếu của họ.', PLAY: 'Chơi cùng bầy cũng giúp ta hiểu họ.', GROOM: 'Chăm sóc đồng loại để giữ quan hệ tốt.', SHARE_FOOD: 'Chia thức ăn có thể khiến họ tin ta.', QUARREL: 'Ta đang bất hòa với đồng loại.', HOWL: 'Ta muốn cả bầy nghe tiếng gọi của mình.', WANDER: 'Ta đi tìm cơ hội và quan sát lãnh địa.', CHALLENGE: `Ta sẽ thách đấu ${rivalName ?? 'đối thủ'} để họ quy phục.`, SUBMIT: 'Ta tạm nhường, nhưng vẫn muốn giành lại ngôi đầu.' };
  return { action, targetId, thought: reasons[action] ?? 'Ta đang quan sát bầy.' };
}
export class UtilityBrain implements Brain { decide(o: Observation): Decision { return utilityDecision(o); } }
export function safestAction(w: Wolf, o: Observation): boolean { return w.emotions.fear > .75 || o.threats.some(t => distance(t, w) < 115); }
