import {copyFileSync, mkdirSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const source = fileURLToPath(new URL('../../frontend/assets/world/', import.meta.url));
const destination = fileURLToPath(new URL('../public/wolf-map/', import.meta.url));
const config = JSON.parse(readFileSync(new URL('../../frontend/assets/world/map.config.json', import.meta.url), 'utf8'));
const files = ['map.png', 'map.config.json', ...(config.overlayImage ? [config.overlayImage] : [])];

for (const name of files) {
  if (!/^[\w.-]+$/.test(name)) throw new Error(`Invalid map asset name: ${name}`);
}
for (const name of files.filter(name => name.endsWith('.png'))) {
  const png = readFileSync(new URL(`../../frontend/assets/world/${name}`, import.meta.url));
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  if (width !== config.world.width || height !== config.world.height) throw new Error(`${name} dimensions do not match map.config.json`);
}

mkdirSync(destination, {recursive: true});
for (const name of files) copyFileSync(new URL(`../../frontend/assets/world/${name}`, import.meta.url), new URL(`../public/wolf-map/${name}`, import.meta.url));
console.log(`Synced ${files.join(', ')} from ${source} to ${destination}`);
