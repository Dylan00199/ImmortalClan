import type { Wolf, World } from './types';

const distance = (a: Wolf, b: Wolf) => Math.hypot(a.x - b.x, a.y - b.y);

export function subjectsOf(world: World, id: string): Wolf[] {
  return world.wolves.filter(w => w.submittedTo === id);
}

export function challengeTarget(wolf: Wolf, wolves: Wolf[]): Wolf | undefined {
  const candidates = wolves.filter(other => other.id !== wolf.id && other.submittedTo !== wolf.id);
  if (wolf.submittedTo) {
    const master = candidates.find(other => other.id === wolf.submittedTo);
    if (master) return master;
  }
  return candidates.sort((a, b) => distance(wolf, a) - distance(wolf, b))[0];
}

export function recordDominance(world: World, winner: Wolf, loser: Wolf): boolean {
  if (winner.id === loser.id) throw new Error('A wolf cannot dominate itself');
  for (const wolf of world.wolves) if (wolf.submittedTo === loser.id) wolf.submittedTo = undefined;
  winner.submittedTo = undefined;
  loser.submittedTo = winner.id;
  winner.dominanceWins++;
  loser.dominanceLosses++;
  world.alphaId = world.wolves.find(w => !w.submittedTo && subjectsOf(world, w.id).length === world.wolves.length - 1)?.id;
  return world.alphaId === winner.id;
}
