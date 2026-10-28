// UI preview only. Replace this adapter with backend commands and confirmed snapshots.
// Content values and NPC recruitment conditions are placeholders, not approved gameplay.
const names = ['Thanh Nhi', 'Mộc Tử', 'Linh Hà', 'Huyền An'];
const sprites = ['girl', 'miner', 'sage', 'hood'];
const defaultLayout = { player: {x: 900, y: 690}, npcs: [{x: 790, y: 490}, {x: 1120, y: 430}, {x: 650, y: 810}, {x: 1220, y: 800}], nodes: [] };
const initial = (layout, mapVersion) => ({
  version: 3, mapVersion, player: { x: layout.player.x, y: layout.player.y, hp: 100, hpMax: 100, stamina: 100, staminaMax: 100, cultivation: 0, cultivationMax: 100, breakthrough: false },
  resources: { stone: 0, wood: 0, herb: 0, ore: 0 }, villa: false, status: 'IN_PROGRESS',
  npcs: names.map((name, i) => ({ id: i + 1, name, sprite: sprites[i], x: layout.npcs[i].x, y: layout.npcs[i].y, joined: false, alive: true, job: '', activity: 'Dạo quanh', reviveUsed: 0 })),
  events: [{ at: '00:00', text: 'Hành trình tu tiên bắt đầu tại Thanh Vân Sơn Mạch.' }]
});
const nodes = [
  { id: 'stone', label: 'Linh thạch', x: 320, y: 410 }, { id: 'stone2', type: 'stone', label: 'Linh thạch', x: 430, y: 380 },
  { id: 'wood', label: 'Linh mộc', x: 1390, y: 470 }, { id: 'wood2', type: 'wood', label: 'Linh mộc', x: 1490, y: 520 },
  { id: 'herb', label: 'Linh thảo', x: 420, y: 970 }, { id: 'herb2', type: 'herb', label: 'Linh thảo', x: 520, y: 1030 },
  { id: 'ore', label: 'Linh khoáng', x: 1430, y: 920 }, { id: 'ore2', type: 'ore', label: 'Linh khoáng', x: 1340, y: 990 }
];
const clone = value => structuredClone(value);
export class MockService {
  constructor() { this.layout = defaultLayout; this.mapVersion = 'legacy'; this.state = initial(this.layout, this.mapVersion); this.nodes = nodes; this.hall = {x: 900, y: 620}; this.world = {width: 1800, height: 1200}; this.grid = null; }
  canStand(x, y, radius = 10) {
    if (!this.grid) return x >= radius && y >= radius && x < this.world.width - radius && y < this.world.height - radius;
    const {cellSize, cols, rows, blocked} = this.grid;
    return [[-radius,-radius],[radius,-radius],[-radius,radius],[radius,radius]].every(([dx,dy]) => {
      const c = Math.floor((x + dx) / cellSize), r = Math.floor((y + dy) / cellSize);
      return c >= 0 && r >= 0 && c < cols && r < rows && blocked[r][c] === '0';
    });
  }
  nearestOpen(x, y, reserved = [], spacing = 0) {
    const cell = this.grid.cellSize, cx = Math.floor(x / cell), cy = Math.floor(y / cell);
    for (let radius = 0; radius < Math.max(this.grid.cols, this.grid.rows); radius++) {
      let best;
      for (let row = cy - radius; row <= cy + radius; row++) for (let col = cx - radius; col <= cx + radius; col++) {
        if (Math.max(Math.abs(col - cx), Math.abs(row - cy)) !== radius) continue;
        const point = {x: col * cell + cell / 2, y: row * cell + cell / 2};
        if (this.canStand(point.x, point.y) && reserved.every(other => Math.hypot(point.x - other.x, point.y - other.y) >= spacing) && (!best || Math.hypot(point.x - x, point.y - y) < best.distance)) best = {...point, distance: Math.hypot(point.x - x, point.y - y)};
      }
      if (best) return {x: best.x, y: best.y};
    }
    throw new Error('Bản đồ không có vị trí có thể đi lại.');
  }
  configureWorld(config) {
    const {width, height} = config.world, {cols, rows, cellSize, blocked} = config.grid;
    if (width !== cols * cellSize || height !== rows * cellSize || blocked.length !== rows || blocked.some(row => row.length !== cols)) throw new Error('Kích thước bản đồ và dữ liệu va chạm không khớp.');
    this.world = {width, height}; this.grid = config.grid; this.mapVersion = `${config.schemaVersion ?? 1}:${config.seed}:${width}x${height}`;
    const center = {x: width / 2, y: height / 2};
    let hallCell;
    for (let row = 4; row < rows - 4; row++) for (let col = 4; col < cols - 4; col++) {
      const x = col * cellSize + cellSize / 2, y = row * cellSize + cellSize / 2;
      let clear = true;
      for (let dy = -3; dy <= 3 && clear; dy++) for (let dx = -3; dx <= 3; dx++) if (blocked[row + dy][col + dx] !== '0') { clear = false; break; }
      if (clear) {
        const score = Math.hypot(x - center.x, y - center.y);
        if (!hallCell || score < hallCell.score) hallCell = {x, y, score};
      }
    }
    this.hall = hallCell ? {x: hallCell.x, y: hallCell.y} : this.nearestOpen(center.x, center.y);
    const around = (dx, dy) => this.nearestOpen(this.hall.x + dx, this.hall.y + dy);
    const npcOffsets = [[-190,-120],[190,-120],[-190,145],[190,145]];
    const nodeOffsets = [[-320,-210],[-375,-110],[325,-210],[380,-110],[-320,235],[-375,320],[325,235],[380,320]];
    const nodePositions = [];
    for (const [dx,dy] of nodeOffsets) nodePositions.push(this.nearestOpen(this.hall.x + dx, this.hall.y + dy, nodePositions, 75));
    this.layout = {player: around(0, 130), npcs: npcOffsets.map(([dx,dy]) => around(dx,dy)), nodes: nodePositions};
    this.nodes = nodes.map((node, index) => ({...node, ...this.layout.nodes[index]}));
    this.state = initial(this.layout, this.mapVersion);
  }
  snapshot() { const s = clone(this.state); const livingJoined = s.npcs.filter(n => n.joined && n.alive).length; s.previewGoals = { livingJoined, allNpcAlive: livingJoined === 4, villa: s.villa, breakthrough: s.player.breakthrough }; s.previewComplete = s.previewGoals.allNpcAlive && s.previewGoals.villa && s.previewGoals.breakthrough; return s; }
  nearby() {
    const { x, y } = this.state.player;
    const points = [...this.state.npcs.map(n => ({ ...n, kind: 'npc' })), ...this.nodes.map(n => ({ ...n, kind: 'node' }))];
    return points.map(item => ({ ...item, distance: Math.hypot(item.x - x, item.y - y) })).sort((a, b) => a.distance - b.distance)[0];
  }
  log(text) { const elapsed = Math.floor(performance.now() / 1000); this.state.events.unshift({ at: `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`, text }); this.state.events = this.state.events.slice(0, 8); }
  command(type, data = {}) {
    const s = this.state;
    if (type === 'MOVE') { const x = s.player.x + (data.dx || 0), y = s.player.y + (data.dy || 0); if (this.canStand(x, s.player.y)) s.player.x = x; if (this.canStand(s.player.x, y)) s.player.y = y; }
    else if (type === 'CULTIVATE') { s.player.cultivation = Math.min(100, s.player.cultivation + 20); this.log('Bạn tĩnh tâm vận chuyển Tụ Linh Quyết.'); }
    else if (type === 'BREAKTHROUGH') { if (s.player.cultivation < 100) return { ok: false, message: 'Tu vi chưa đủ để xem trạng thái đột phá.' }; s.player.breakthrough = true; this.log('Bạn đã đột phá một lần.'); }
    else if (type === 'INTERACT') { const nearby = this.nearby(); if (!nearby || nearby.distance > 65) return { ok: false, message: 'Hãy đến gần NPC hoặc tài nguyên.' }; if (nearby.kind === 'node') return this.command('GATHER'); const npc = s.npcs.find(n => n.id === nearby.id); if (npc.joined) { this.log(`${npc.name}: Nội dung lời thoại đang chờ thiết kế.`); return { ok: true, message: `${npc.name}: Nội dung lời thoại đang chờ thiết kế.` }; } npc.joined = true; npc.activity = 'Sẵn sàng'; this.log(`${npc.name} đã gia nhập (mô phỏng giao diện; điều kiện chiêu mộ chưa chốt).`); }
    else if (type === 'GATHER') { const nearby = this.nearby(); if (!nearby || nearby.kind !== 'node' || nearby.distance > 65) return { ok: false, message: 'Hãy đến gần điểm tài nguyên.' }; const key = nearby.type || nearby.id; s.resources[key] += 1; this.log(`Thu thập 1 ${nearby.label} (dữ liệu mẫu).`); }
    else if (type === 'ATTACK') { this.log('Thao tác tấn công đã gửi tới bộ mô phỏng. Kết quả chiến đấu cần backend xác nhận.'); return { ok: true, message: 'Đã kích hoạt tấn công mẫu.' }; }
    else if (type === 'BUILD') { s.villa = true; this.log('Biệt viện được hiển thị trên bản đồ (chi phí chưa chốt).'); }
    else if (type === 'ASSIGN') { const npc = s.npcs.find(n => n.id === data.id); if (!npc?.joined) return { ok: false, message: 'Chọn NPC đã gia nhập.' }; npc.job = data.job || ''; npc.activity = npc.job ? 'Đang làm việc' : 'Sẵn sàng'; this.log(`Đã cập nhật công việc của ${npc.name} trong bản xem trước.`); }
    else if (type === 'SAVE') { try { localStorage.setItem('immortalclan.frontend-preview.v3', JSON.stringify(s)); this.log('Đã lưu trạng thái mẫu trong trình duyệt.'); return { ok: true, message: 'Đã lưu bản xem trước trong trình duyệt.' }; } catch { return { ok: false, message: 'Không lưu được trạng thái mẫu.' }; } }
    else if (type === 'LOAD') { try { const saved = JSON.parse(localStorage.getItem('immortalclan.frontend-preview.v3') || localStorage.getItem('immortalclan.frontend-preview.v2') || 'null'); if (!saved || ![2,3].includes(saved.version) || !Array.isArray(saved.npcs) || saved.npcs.length !== 4) return { ok: false, message: 'Chưa có bản lưu mẫu hợp lệ.' }; if (saved.mapVersion !== this.mapVersion || !this.canStand(saved.player.x, saved.player.y)) { saved.player.x = this.layout.player.x; saved.player.y = this.layout.player.y; for (let i = 0; i < saved.npcs.length; i++) { saved.npcs[i].x = this.layout.npcs[i].x; saved.npcs[i].y = this.layout.npcs[i].y; } } saved.version = 3; saved.mapVersion = this.mapVersion; this.state = saved; this.log('Đã tải trạng thái mẫu trong trình duyệt.'); } catch { return { ok: false, message: 'Bản lưu mẫu không hợp lệ.' }; } }
    else if (type === 'NEW') this.state = initial(this.layout, this.mapVersion);
    return { ok: true, state: this.snapshot() };
  }
}
