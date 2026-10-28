export class RNG {
  private value: number;
  constructor(seed: number) { this.value = seed >>> 0 || 1; }
  next(): number { this.value = (Math.imul(1664525, this.value) + 1013904223) >>> 0; return this.value / 4294967296; }
  range(min: number, max: number): number { return min + (max - min) * this.next(); }
  pick<T>(items: T[]): T { return items[Math.floor(this.next() * items.length)]; }
}
