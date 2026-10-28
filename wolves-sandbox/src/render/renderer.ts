import type {MapConfig, Point} from '../config/map';
import type {World, Wolf} from '../sim/types';

type Direction = 'up' | 'down' | 'left' | 'right';
type Frame = { path: string; rect: [number, number, number, number] };
type Manifest = { designs: Record<string, { idle: Record<Direction, Frame[]> }> };

export interface Overlays {
    paths: boolean;
    obstacles: boolean;
    perception: boolean
}

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private mapImage = new Image();
    private mapOverlay?: HTMLImageElement;
    private sprites = new Map<string, HTMLCanvasElement>();
    private directions = new Map<string, Direction>();
    private last = new Map<string, Point>();
    camera = {x: 960, y: 640, zoom: .7};
    overlays: Overlays = {paths: false, obstacles: false, perception: false};
    fallback = 'Static idle poses used for all actions';

    constructor(public canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D unavailable');
        this.ctx = ctx;
    }

    async load(map: MapConfig): Promise<void> {
        const [manifest, sheet] = await Promise.all([fetch('/wolves/assets.manifest.json').then(r => r.json()) as Promise<Manifest>, this.loadImage('/wolves/sheet.png')]);
        this.mapImage = await this.loadImage('/wolf-map/map.png');
        if (this.mapImage.naturalWidth !== map.world.width || this.mapImage.naturalHeight !== map.world.height) throw new Error('Map image dimensions do not match map.config.json');
        if (map.overlayImage) {
            this.mapOverlay = await this.loadImage(`/wolf-map/${map.overlayImage}`);
            if (this.mapOverlay.naturalWidth !== map.world.width || this.mapOverlay.naturalHeight !== map.world.height) throw new Error('Map overlay dimensions do not match map.config.json');
        }
        for (const [design, animations] of Object.entries(manifest.designs)) for (const [direction, frames] of Object.entries(animations.idle)) {
            const [x, y, w, h] = frames[0].rect;
            const crop = document.createElement('canvas');
            crop.width = w;
            crop.height = h;
            const c = crop.getContext('2d')!;
            c.drawImage(sheet, x, y, w, h, 0, 0, w, h);
            const pixels = c.getImageData(0, 0, w, h);
            for (let i = 0; i < pixels.data.length; i += 4) {
                const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
                if (r < 35 && g < 35 && b < 35) pixels.data[i + 3] = 0;
            }
            c.putImageData(pixels, 0, 0);
            this.sprites.set(`${design}:${direction}`, crop);
        }
    }

    private loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Cannot load ${url}`));
            image.src = url;
        });
    }

    resize(): void {
        const scale = devicePixelRatio || 1;
        const bounds = this.canvas.getBoundingClientRect();
        this.canvas.width = Math.max(1, Math.floor(bounds.width * scale));
        this.canvas.height = Math.max(1, Math.floor(bounds.height * scale));
    }

    screenToWorld(x: number, y: number): Point {
        const r = this.canvas.getBoundingClientRect();
        return {
            x: (x - r.left - r.width / 2) / this.camera.zoom + this.camera.x,
            y: (y - r.top - r.height / 2) / this.camera.zoom + this.camera.y
        };
    }

    draw(world: World, editTool = ''): void {
        const c = this.ctx, width = this.canvas.width, height = this.canvas.height,
            scale = this.canvas.width / this.canvas.getBoundingClientRect().width;
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.fillStyle = '#1b2019';
        c.fillRect(0, 0, width, height);
        c.setTransform(scale * this.camera.zoom, 0, 0, scale * this.camera.zoom, width / 2 - this.camera.x * scale * this.camera.zoom, height / 2 - this.camera.y * scale * this.camera.zoom);
        c.imageSmoothingEnabled = false;
        c.drawImage(this.mapImage, 0, 0);
        if (this.overlays.obstacles || editTool) {
            const s = world.map.grid.cellSize;
            for (let y = 0; y < world.map.grid.rows; y++) for (let x = 0; x < world.map.grid.cols; x++) if (world.map.grid.blocked[y][x] === '1') {
                c.fillStyle = 'rgba(236,76,61,.34)';
                c.fillRect(x * s, y * s, s, s);
            }
        }
        this.drawCircle(c, world.map.den, 47, '#e7bb72', 'DEN');
        world.map.waterPoints.forEach(p => this.drawCircle(c, p, 13, '#79c8e6', ''));
        world.map.foodPatches.forEach(p => this.drawCircle(c, p, 11, '#b9d975', ''));
        if (this.overlays.paths) for (const w of world.wolves) {
            c.strokeStyle = w.design === 'pink' ? '#ffaaba' : '#a7d2ff';
            c.lineWidth = 3;
            c.beginPath();
            c.moveTo(w.x, w.y);
            for (const p of w.path) c.lineTo(p.x, p.y);
            c.stroke();
        }
        for (const prey of world.prey) {
            c.fillStyle = '#f2ddaa';
            c.fillRect(prey.x - 7, prey.y - 5, 14, 10);
            c.fillRect(prey.x - 4, prey.y - 10, 3, 7);
            c.fillRect(prey.x + 2, prey.y - 10, 3, 7);
        }
        for (const threat of world.threats) {
            c.fillStyle = '#ed5454';
            c.beginPath();
            c.arc(threat.x, threat.y, 15, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#fff';
            c.font = 'bold 17px sans-serif';
            c.fillText('!', threat.x - 3, threat.y + 6);
        }
        for (const wolf of world.wolves) this.drawWolf(c, wolf, world.alphaId === wolf.id);
        if (this.mapOverlay) c.drawImage(this.mapOverlay, 0, 0);
        if (this.overlays.perception) for (const w of world.wolves) {
            c.strokeStyle = 'rgba(255,255,255,.55)';
            c.lineWidth = 2;
            c.beginPath();
            c.arc(w.x, w.y, 220, 0, Math.PI * 2);
            c.stroke();
        }
        for (const z of world.map.zones) {
            c.fillStyle = 'rgba(20,24,20,.7)';
            c.fillRect(z.x - 48, z.y - 15, 96, 22);
            c.fillStyle = '#fff';
            c.font = '14px sans-serif';
            c.textAlign = 'center';
            c.fillText(z.name, z.x, z.y);
        }
        c.textAlign = 'start';
    }

    private drawCircle(c: CanvasRenderingContext2D, p: Point, radius: number, color: string, label: string): void {
        c.fillStyle = color;
        c.globalAlpha = .8;
        c.beginPath();
        c.arc(p.x, p.y, radius, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
        if (label) {
            c.fillStyle = '#222';
            c.font = 'bold 14px sans-serif';
            c.textAlign = 'center';
            c.fillText(label, p.x, p.y + 4);
            c.textAlign = 'start';
        }
    }

    private drawWolf(c: CanvasRenderingContext2D, w: Wolf, alpha: boolean): void {
        const prior = this.last.get(w.id);
        let dir = this.directions.get(w.id) ?? 'down';
        if (prior && Math.hypot(w.x - prior.x, w.y - prior.y) > .2) dir = Math.abs(w.x - prior.x) > Math.abs(w.y - prior.y) ? w.x > prior.x ? 'right' : 'left' : w.y > prior.y ? 'down' : 'up';
        this.directions.set(w.id, dir);
        this.last.set(w.id, {x: w.x, y: w.y});
        const sprite = this.sprites.get(`${w.design}:${dir}`);
        c.fillStyle = 'rgba(0,0,0,.4)';
        c.beginPath();
        c.ellipse(w.x, w.y + 17, 27, 9, 0, 0, Math.PI * 2);
        c.fill();
        if (sprite) c.drawImage(sprite, w.x - 34, w.y - 52, 68, 76); else {
            c.fillStyle = w.design === 'pink' ? '#f69dac' : '#88b0db';
            c.fillRect(w.x - 17, w.y - 25, 34, 45);
        }
        c.fillStyle = '#271f1d';
        c.fillRect(w.x - 25, w.y - 100, 50, 7);
        c.fillStyle = w.health / w.maxHealth < .3 ? '#e56c59' : '#88d285';
        c.fillRect(w.x - 24, w.y - 99, 48 * w.health / w.maxHealth, 5);
        if (alpha) {
            c.fillStyle = '#e9c765';
            c.beginPath();
            c.moveTo(w.x - 16, w.y - 67);
            c.lineTo(w.x - 16, w.y - 79);
            c.lineTo(w.x - 8, w.y - 73);
            c.lineTo(w.x, w.y - 84);
            c.lineTo(w.x + 8, w.y - 73);
            c.lineTo(w.x + 16, w.y - 79);
            c.lineTo(w.x + 16, w.y - 67);
            c.closePath();
            c.fill();
        }
        c.fillStyle = '#fff';
        c.font = 'bold 15px sans-serif';
        c.textAlign = 'center';
        c.fillText(w.name, w.x, w.y - 58);
        c.font = '11px sans-serif';
        c.fillText(w.decision.action === 'ATTACK_THREAT'
            ? 'ĐÁNH ĐE DỌA'
            : w.decision.action === 'CHALLENGE' ? 'THÁCH ĐẤU' : w.decision.action === 'SUBMIT' ? 'QUY PHỤC' : w.decision.action === 'PROVOKE' ? 'KHƠI MÂU THUẪN' : w.decision.action, w.x, w.y + 38);
        c.textAlign = 'start';
    }
}
