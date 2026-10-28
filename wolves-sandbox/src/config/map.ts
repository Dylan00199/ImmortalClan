export interface Point { x: number; y: number }
export interface Circle extends Point { radius: number }
export interface Obstacle extends Point { kind: 'water' | 'rock' | 'tree' | 'cliff'; w: number; h: number }
export interface MapConfig {
  schemaVersion?: number;
  overlayImage?: string;
  seed: number;
  world: { width: number; height: number };
  grid: { cols: number; rows: number; cellSize: number; blocked: string[] };
  obstacles: Obstacle[];
  waterPoints: Circle[];
  foodPatches: (Circle & { kind: string })[];
  den: Circle;
  preySpawnZones: Circle[];
  zones: (Point & { name: string })[];
}

const object = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Map config: expected object');
  return v as Record<string, unknown>;
};
const number = (v: unknown, label: string, positive = false): number => {
  if (typeof v !== 'number' || !Number.isFinite(v) || (positive && v <= 0)) throw new Error(`Map config: invalid ${label}`);
  return v;
};
const point = (v: unknown, label: string): Point => {
  const o = object(v); return { x: number(o.x, `${label}.x`), y: number(o.y, `${label}.y`) };
};
const circle = (v: unknown, label: string): Circle => {
  const o = object(v); return { ...point(o, label), radius: number(o.radius, `${label}.radius`, true) };
};
const array = (v: unknown, label: string): unknown[] => {
  if (!Array.isArray(v)) throw new Error(`Map config: ${label} must be an array`);
  return v;
};
export function validateMap(raw: unknown): MapConfig {
  const o = object(raw), world = object(o.world), grid = object(o.grid);
  const width = number(world.width, 'world.width', true), height = number(world.height, 'world.height', true);
  const cols = number(grid.cols, 'grid.cols', true), rows = number(grid.rows, 'grid.rows', true);
  const cellSize = number(grid.cellSize, 'grid.cellSize', true);
  if (![cols, rows, cellSize].every(Number.isInteger) || cols * cellSize !== width || rows * cellSize !== height) throw new Error('Map config: grid dimensions mismatch world');
  const blocked = array(grid.blocked, 'grid.blocked');
  if (blocked.length !== rows || blocked.some(row => typeof row !== 'string' || row.length !== cols || /[^01]/.test(row))) throw new Error('Map config: blocked rows must contain exactly cols binary cells');
  const obstacles = array(o.obstacles, 'obstacles').map((v, i) => {
    const item = object(v), kind = item.kind;
    if (kind !== 'water' && kind !== 'rock' && kind !== 'tree' && kind !== 'cliff') throw new Error(`Map config: invalid obstacles[${i}].kind`);
    return { ...point(item, `obstacles[${i}]`), kind: kind as Obstacle['kind'], w: number(item.w, `obstacles[${i}].w`, true), h: number(item.h, `obstacles[${i}].h`, true) };
  });
  const waterPoints = array(o.waterPoints, 'waterPoints').map((v, i) => circle(v, `waterPoints[${i}]`));
  const foodPatches = array(o.foodPatches, 'foodPatches').map((v, i) => {
    const item = object(v); if (typeof item.kind !== 'string' || !item.kind) throw new Error(`Map config: invalid foodPatches[${i}].kind`);
    return { ...circle(item, `foodPatches[${i}]`), kind: item.kind };
  });
  const preySpawnZones = array(o.preySpawnZones, 'preySpawnZones').map((v, i) => circle(v, `preySpawnZones[${i}]`));
  const zones = array(o.zones, 'zones').map((v, i) => {
    const item = object(v); if (typeof item.name !== 'string') throw new Error(`Map config: invalid zones[${i}].name`);
    return { ...point(item, `zones[${i}]`), name: item.name };
  });
  const result: MapConfig = { ...o, seed: number(o.seed, 'seed'), world: { width, height }, grid: { cols, rows, cellSize, blocked: blocked as string[] }, obstacles, waterPoints, foodPatches, den: circle(o.den, 'den'), preySpawnZones, zones };
  if (o.schemaVersion !== undefined) result.schemaVersion = number(o.schemaVersion, 'schemaVersion', true);
  if (o.overlayImage !== undefined) {
    if (typeof o.overlayImage !== 'string' || !/^[a-zA-Z0-9_.-]+\.png$/.test(o.overlayImage)) throw new Error('Map config: invalid overlayImage');
    result.overlayImage = o.overlayImage;
  }
  for (const p of [...waterPoints, ...foodPatches, result.den, ...preySpawnZones, ...zones]) {
    if (p.x < 0 || p.y < 0 || p.x >= width || p.y >= height) throw new Error('Map config: point outside world');
  }
  const coverage = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false));
  for (const obstacle of obstacles) {
    if ([obstacle.x, obstacle.y, obstacle.w, obstacle.h].some(v => v % cellSize !== 0) || obstacle.x < 0 || obstacle.y < 0 || obstacle.x + obstacle.w > width || obstacle.y + obstacle.h > height) throw new Error('Map config: obstacle must align to in-bounds cells');
    for (let y = obstacle.y / cellSize; y < (obstacle.y + obstacle.h) / cellSize; y++) for (let x = obstacle.x / cellSize; x < (obstacle.x + obstacle.w) / cellSize; x++) coverage[y][x] = true;
  }
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (coverage[y][x] !== (result.grid.blocked[y][x] === '1')) throw new Error(`Map config: obstacle/grid mismatch at ${x},${y}`);
  return result;
}
