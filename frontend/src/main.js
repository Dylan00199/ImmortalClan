import { MockService } from './mock-service.js';

const $ = selector => document.querySelector(selector);
const service = new MockService();
const canvas = $('#world');
const ctx = canvas.getContext('2d');
const WORLD = { width: 1800, height: 1200, hallX: 900, hallY: 620 };
let worldMapImage;
let worldOverlayImage;
const art = {};
let selectedNpc = 1;
let toastTimer;
let menuOpen = false;
let hallOpen = false;
let playerSprite = 'male';
let playerDirection = 'front';
let camera = { x: 0, y: 0 };
const keys = new Set();
const keyDirections = { arrowup: [0,-1], w: [0,-1], arrowdown: [0,1], s: [0,1], arrowleft: [-1,0], a: [-1,0], arrowright: [1,0], d: [1,0] };
const assetPaths = {
  tree: 'assets/environment/tree.png', flower: 'assets/environment/flower.png', stone: 'assets/environment/stone.png',
  male: 'assets/player/male.png', female: 'assets/player/female.png', girl: 'assets/characters/girl.png', miner: 'assets/characters/miner.png', sage: 'assets/characters/sage.png', hood: 'assets/characters/hood.png'
};
for (const [name, path] of Object.entries(assetPaths)) {
  const image = new Image(); image.src = `./${path}`; image.onload = () => { draw(); drawPortraits(); }; art[name] = image;
}
const ready = image => image?.complete && image.naturalWidth > 0;
function img(image,x,y,w,h=w){if(ready(image))ctx.drawImage(image,Math.round(x-w/2),Math.round(y-h),Math.round(w),Math.round(h));}
const framePosition={front:[0,0],back:[1,0],left:[0,1],right:[1,1]};
function drawPlayerFrame(context,image,direction,x,y,width,height){
  if(!ready(image))return;
  const [col,row]=framePosition[direction];const cellW=image.width/2,cellH=image.height/2;
  context.drawImage(image,col*cellW+cellW*.105,row*cellH+cellH*.045,cellW*.79,cellH*.91,Math.round(x-width/2),Math.round(y-height),width,height);
}
function drawPortraits(){
  const portrait=$('#playerPortrait'),p=portrait.getContext('2d');p.imageSmoothingEnabled=false;p.clearRect(0,0,portrait.width,portrait.height);drawPlayerFrame(p,art[playerSprite],'front',portrait.width/2,62,36,58);
  for(const preview of document.querySelectorAll('[data-preview]')){const c=preview.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,preview.width,preview.height);drawPlayerFrame(c,art[preview.dataset.preview],'front',preview.width/2,62,36,58);}
}
function sign(x,y,text,active=false){ctx.font='700 11px "Be Vietnam Pro",sans-serif';const w=Math.ceil(ctx.measureText(text).width)+19;ctx.fillStyle=active?'#183629eb':'#172721da';ctx.fillRect(x-w/2,y-24,w,23);ctx.strokeStyle=active?'#e5c37b':'#967d54';ctx.lineWidth=2;ctx.strokeRect(x-w/2,y-24,w,23);ctx.fillStyle=active?'#ffe7a7':'#e8dbc1';ctx.fillText(text,x-w/2+9,y-8);}
function hall(x,y,built){
  if(!built){ctx.fillStyle='#9f9676';ctx.fillRect(x-76,y-26,152,62);ctx.fillStyle='#6f815d';ctx.fillRect(x-65,y-18,130,46);ctx.strokeStyle='#c9bb8d';ctx.lineWidth=4;ctx.strokeRect(x-76,y-26,152,62);sign(x,y-43,'NỀN BIỆT VIỆN · NHẤN E');return;}
  ctx.fillStyle='#b8a482';ctx.fillRect(x-72,y-46,144,77);
  ctx.strokeStyle='#594c39';ctx.lineWidth=4;ctx.strokeRect(x-72,y-46,144,77);
  ctx.fillStyle='#965441';ctx.beginPath();ctx.moveTo(x-91,y-44);ctx.lineTo(x,y-111);ctx.lineTo(x+91,y-44);ctx.lineTo(x+70,y-39);ctx.lineTo(x,y-89);ctx.lineTo(x-70,y-39);ctx.closePath();ctx.fill();
  ctx.fillStyle='#6e392d';ctx.fillRect(x-21,y-12,42,43);
  ctx.fillStyle='#d5c098';ctx.fillRect(x-62,y-17,20,23);ctx.fillRect(x+42,y-17,20,23);
  ctx.fillStyle='#d6b66e';ctx.fillRect(x-7,y+16,14,12);sign(x,y-112,'TỪ ĐƯỜNG · NHẤN E',true);
}
function draw(){
  if (!worldMapImage) return;
  const s=service.snapshot(),p=s.player;
  camera.x=Math.max(0,Math.min(WORLD.width-canvas.width,p.x-canvas.width/2));camera.y=Math.max(0,Math.min(WORLD.height-canvas.height,p.y-canvas.height/2));
  ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(worldMapImage,-Math.round(camera.x),-Math.round(camera.y));
  ctx.save();ctx.translate(-Math.round(camera.x),-Math.round(camera.y));
  for(const n of service.nodes){let labelY=n.y-32;if(n.id.startsWith('stone')||n.id.startsWith('ore')){img(art.stone,n.x,n.y,84,69);labelY=n.y-72;}else if(n.id.startsWith('wood')){img(art.tree,n.x,n.y,176,162);labelY=n.y-165;}else img(art.flower,n.x,n.y,28,24);sign(n.x,labelY,n.label);}
  hall(WORLD.hallX,WORLD.hallY,s.villa);
  for(const n of s.npcs){if(!n.alive)continue;img(art[n.sprite],n.x,n.y,37,37);sign(n.x,n.y-37,n.name,n.joined);}
  drawPlayerFrame(ctx,art[playerSprite],playerDirection,p.x,p.y,32,48);sign(p.x,p.y-53,'BẠN',true);
  if(worldOverlayImage)ctx.drawImage(worldOverlayImage,0,0);
  ctx.restore();
}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800);}
function nearHall(){const p=service.snapshot().player;return Math.hypot(p.x-WORLD.hallX,p.y-WORLD.hallY)<105;}
function setHall(open){hallOpen=open;$('#hallOverlay').hidden=!open;if(open){keys.clear();render();}}
function setMenu(open){menuOpen=open;$('#menuOverlay').hidden=!open;if(open)keys.clear();}
function interact(){const s=service.snapshot();if(nearHall()){if(!s.villa){command('BUILD');toast('Biệt viện hiển thị ở vị trí này (chi phí chưa chốt).');}else setHall(true);return;}command('INTERACT');}
function command(type,data){const result=service.command(type,data);if(result.message)toast(result.message);render();return result;}
function render(){const s=service.snapshot(),p=s.player;
  drawPortraits();
  for(const [key,value,max] of [['hp',p.hp,p.hpMax],['stamina',p.stamina,p.staminaMax],['cultivation',p.cultivation,p.cultivationMax]]){$(`#${key}Bar`).style.width=`${Math.round(value/max*100)}%`;$(`#${key}Text`).textContent=`${value}/${max}`;}
  for(const [key,id] of [['stone','stoneCount'],['wood','woodCount'],['herb','herbCount'],['ore','oreCount']])$(`#${id}`).textContent=s.resources[key];
  const goals=s.previewGoals;const completed=[goals.allNpcAlive,goals.villa,goals.breakthrough].filter(Boolean).length;$('#objectiveMini b').textContent=`${completed}/3`;
  $('#questText').textContent=s.previewComplete?'Đã đủ ba điều kiện hoàn thành trong bản mô phỏng.':!s.villa?'Tìm tài nguyên, chiêu mộ đồng hành và xây biệt viện.':'Biệt viện đã xây. Vào từ đường để quản lý gia tộc.';
  const nearest=service.nearby();let prompt='Đến gần NPC hoặc tài nguyên để tương tác';if(nearHall())prompt=s.villa?'Vào từ đường để quản lý gia tộc':'Xây biệt viện tại vị trí này (mô phỏng)';else if(nearest?.distance<65)prompt=nearest.kind==='npc'?`Nói chuyện với ${nearest.name}`:`Thu thập ${nearest.label}`;$('#interactionText').textContent=prompt;$('#interaction').classList.toggle('muted',!nearHall()&&(!nearest||nearest.distance>=65));
  $('#breakthroughBtn').disabled=p.breakthrough;$('#zoneName').textContent=nearHall()?'Sân biệt viện':'Thanh Vân Sơn Mạch';
  $('#hallGoals').replaceChildren(...[['4 NPC còn sống',goals.allNpcAlive],['Biệt viện tồn tại',goals.villa],['Đột phá một lần',goals.breakthrough]].map(([name,done])=>{const el=document.createElement('div');el.className=done?'done':'';el.textContent=`${done?'✓':'○'} ${name}`;return el;}));
  $('#npcList').replaceChildren(...s.npcs.map(n=>{const el=document.createElement('div');el.className=`npc-card${selectedNpc===n.id?' selected':''}`;el.innerHTML=`<img src="./assets/characters/${n.sprite}.png" alt=""><div><b></b><small></small></div><em></em>`;el.querySelector('b').textContent=n.name;el.querySelector('small').textContent=n.joined?(n.job?({GATHER:'Thu thập',CULTIVATE:'Tu luyện',GUARD:'Canh gác',HUNT:'Săn yêu thú'}[n.job]):'Chưa giao việc'):'Chưa gia nhập';el.querySelector('em').textContent=n.joined?n.activity:'An toàn';el.onclick=()=>{selectedNpc=n.id;render();};return el;}));
  const selected=s.npcs.find(n=>n.id===selectedNpc);$('#selectedNpcName').textContent=selected?.name||'Chọn một thành viên';$('#jobSelect').value=selected?.job||'';$('#assignBtn').disabled=!selected?.joined;draw();
}
$('#menuBtn').onclick=()=>setMenu(true);$('#closeMenuBtn').onclick=$('#resumeBtn').onclick=()=>setMenu(false);$('#closeHallBtn').onclick=$('#exitHallBtn').onclick=()=>setHall(false);
for(const button of document.querySelectorAll('[data-player]'))button.onclick=()=>{playerSprite=button.dataset.player;for(const option of document.querySelectorAll('[data-player]'))option.classList.toggle('chosen',option===button);render();};
$('#attackBtn').onclick=()=>command('ATTACK');$('#gatherBtn').onclick=()=>command('GATHER');$('#cultivateBtn').onclick=()=>command('CULTIVATE');$('#breakthroughBtn').onclick=()=>command('BREAKTHROUGH');
$('#saveBtn').onclick=()=>command('SAVE');$('#loadBtn').onclick=()=>command('LOAD');$('#assignBtn').onclick=()=>command('ASSIGN',{id:selectedNpc,job:$('#jobSelect').value});
window.addEventListener('keydown',event=>{const key=event.key.toLowerCase();if(key==='escape'){if(hallOpen)setHall(false);else setMenu(!menuOpen);return;}if(hallOpen||menuOpen||document.activeElement?.tagName==='SELECT')return;if(keyDirections[key]||[' ','e','g','c','b'].includes(key))event.preventDefault();if(keyDirections[key])keys.add(key);if(event.repeat)return;if(key==='e')interact();if(key===' ')command('ATTACK');if(key==='g')command('GATHER');if(key==='c')command('CULTIVATE');if(key==='b')command('BREAKTHROUGH');});
window.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
for(const button of document.querySelectorAll('[data-move]')){const direction={up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}[button.dataset.move];button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);keys.add(direction);});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>keys.delete(direction));}
let last=performance.now();function tick(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!hallOpen&&!menuOpen){let dx=0,dy=0;for(const key of keys){const d=keyDirections[key];if(d){dx+=d[0];dy+=d[1];}}if(dx||dy){playerDirection=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'back':'front');const length=Math.hypot(dx,dy);service.command('MOVE',{dx:dx/length*190*dt,dy:dy/length*190*dt});render();}}requestAnimationFrame(tick);}requestAnimationFrame(tick);
const loadImage = path => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error(`Không tải được ${path}`)); image.src = path; });
async function loadWorldMap(){
  try {
    const response = await fetch('./assets/world/map.config.json');
    if(!response.ok)throw new Error(`Không tải được map.config.json (${response.status}).`);
    const config = await response.json();
    const [mapImage, overlayImage] = await Promise.all([loadImage('./assets/world/map.png'), config.overlayImage ? loadImage(`./assets/world/${config.overlayImage}`) : Promise.resolve(null)]);
    if(mapImage.naturalWidth!==config.world.width||mapImage.naturalHeight!==config.world.height)throw new Error('Ảnh bản đồ và cấu hình không cùng kích thước.');
    if(overlayImage&&(overlayImage.naturalWidth!==config.world.width||overlayImage.naturalHeight!==config.world.height))throw new Error('Lớp phủ bản đồ và cấu hình không cùng kích thước.');
    service.configureWorld(config);
    WORLD.width=config.world.width;WORLD.height=config.world.height;WORLD.hallX=service.hall.x;WORLD.hallY=service.hall.y;
    worldMapImage=mapImage;worldOverlayImage=overlayImage;
    render();
  }catch(error){console.error(error);toast(error.message||'Không tải được bản đồ mới.');}
}
loadWorldMap();
