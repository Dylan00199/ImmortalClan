import type { MapConfig, Point } from '../config/map';

export class Pathfinder {
  private cache = new Map<string, Point[]>();
  constructor(private map: MapConfig) {}
  setMap(map: MapConfig): void { this.map = map; this.cache.clear(); }
  walkable(c: number, r: number): boolean { return c >= 0 && r >= 0 && c < this.map.grid.cols && r < this.map.grid.rows && this.map.grid.blocked[r][c] === '0'; }
  cell(p: Point): [number, number] { const s = this.map.grid.cellSize; return [Math.floor(p.x / s), Math.floor(p.y / s)]; }
  center(c: number, r: number): Point { const s = this.map.grid.cellSize; return { x: c * s + s / 2, y: r * s + s / 2 }; }
  nearest(p: Point): Point {
    const [c, r] = this.cell(p); if (this.walkable(c, r)) return this.center(c, r);
    for (let radius = 1; radius < Math.max(this.map.grid.cols, this.map.grid.rows); radius++) {
      for (let y = r - radius; y <= r + radius; y++) for (let x = c - radius; x <= c + radius; x++) if (this.walkable(x, y)) return this.center(x, y);
    }
    throw new Error('Map has no walkable cell');
  }
  find(from: Point, to: Point): Point[] {
    const a = this.cell(this.nearest(from)), b = this.cell(this.nearest(to));
    const key = `${a[0]},${a[1]}:${b[0]},${b[1]}`; const cached = this.cache.get(key); if (cached) return cached.map(p => ({ ...p }));
    const id = (x: number, y: number) => y * this.map.grid.cols + x;
    const start = id(...a), goal = id(...b), open = new Set([start]), came = new Map<number, number>(), g = new Map([[start, 0]]), f = new Map([[start, Math.hypot(a[0] - b[0], a[1] - b[1])]]);
    while (open.size) {
      let current = -1, best = Infinity;
      for (const n of open) if ((f.get(n) ?? Infinity) < best) { current = n; best = f.get(n)!; }
      if (current === goal) {
        const cells: number[] = [current]; while (came.has(current)) { current = came.get(current)!; cells.push(current); }
        const path = cells.reverse().slice(1).map(n => this.center(n % this.map.grid.cols, Math.floor(n / this.map.grid.cols)));
        this.cache.set(key, path); return path.map(p => ({ ...p }));
      }
      open.delete(current); const cx = current % this.map.grid.cols, cy = Math.floor(current / this.map.grid.cols);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const nx = cx + dx, ny = cy + dy;
        if (!this.walkable(nx, ny) || (dx && dy && (!this.walkable(cx + dx, cy) || !this.walkable(cx, cy + dy)))) continue;
        const next = id(nx, ny), tentative = (g.get(current) ?? Infinity) + Math.hypot(dx, dy);
        if (tentative < (g.get(next) ?? Infinity)) { came.set(next, current); g.set(next, tentative); f.set(next, tentative + Math.hypot(nx - b[0], ny - b[1])); open.add(next); }
      }
    }
    return [];
  }
}
