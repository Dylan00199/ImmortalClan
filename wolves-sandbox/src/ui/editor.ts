import { validateMap, type MapConfig, type Point } from '../config/map';
import type { Engine } from '../sim/world';

export type EditTool = '' | 'add-tree' | 'add-rock' | 'add-water' | 'erase' | 'move-water' | 'move-food' | 'move-den';
export class MapEditor {
  tool: EditTool = '';
  constructor(private engine: Engine) {}
  edit(start: Point, end: Point): void {
    if (!this.tool) return;
    const map = structuredClone(this.engine.world.map), s = map.grid.cellSize;
    if (this.tool.startsWith('add-') || this.tool === 'erase') {
      const x1 = Math.max(0, Math.floor(Math.min(start.x, end.x) / s)), x2 = Math.min(map.grid.cols - 1, Math.floor(Math.max(start.x, end.x) / s));
      const y1 = Math.max(0, Math.floor(Math.min(start.y, end.y) / s)), y2 = Math.min(map.grid.rows - 1, Math.floor(Math.max(start.y, end.y) / s));
      const kinds = this.cellKinds(map);
      for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) kinds[y][x] = this.tool === 'erase' ? '' : this.tool.replace('add-', '');
      map.grid.blocked = kinds.map(row => row.map(v => v ? '1' : '0').join(''));
      map.obstacles = [];
      for (let y = 0; y < map.grid.rows; y++) for (let x = 0; x < map.grid.cols; x++) if (kinds[y][x]) map.obstacles.push({ kind: kinds[y][x] as 'tree' | 'rock' | 'water' | 'cliff', x: x * s, y: y * s, w: s, h: s });
    } else {
      const p = { x: Math.max(0, Math.min(map.world.width - 1, end.x)), y: Math.max(0, Math.min(map.world.height - 1, end.y)) };
      if (this.tool === 'move-den') Object.assign(map.den, p);
      else { const list = this.tool === 'move-water' ? map.waterPoints : map.foodPatches; const closest = list.slice().sort((a, b) => Math.hypot(a.x - start.x, a.y - start.y) - Math.hypot(b.x - start.x, b.y - start.y))[0]; if (closest) Object.assign(closest, p); }
    }
    this.engine.setMap(validateMap(map));
  }
  private cellKinds(map: MapConfig): string[][] {
    const s = map.grid.cellSize, kinds: string[][] = Array.from({ length: map.grid.rows }, (_, y) => Array.from({ length: map.grid.cols }, (_, x) => map.grid.blocked[y][x] === '1' ? 'tree' : ''));
    for (const o of map.obstacles) for (let y = Math.floor(o.y / s); y < Math.ceil((o.y + o.h) / s); y++) for (let x = Math.floor(o.x / s); x < Math.ceil((o.x + o.w) / s); x++) if (kinds[y]?.[x]) kinds[y][x] = o.kind;
    return kinds;
  }
  export(): void { const blob = new Blob([JSON.stringify(this.engine.world.map, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'map.config.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500); }
}
