// Procesa la foto de Karem & Morcilla para la sección Sobre mí:
// - versión duotono de marca (charcoal → crema) que casa con el tema
// - versión color (se revela al hover)
// Uso: node scripts/prepare-photo.mjs <foto.jpg> <public-dir>
import sharp from 'sharp';

const SRC = process.argv[2];
const OUT = process.argv[3];
const WIDTH = 920;

// extremos del duotono (tokens de marca)
const DARK = [18, 16, 24];    // ~#121018, charcoal
const LIGHT = [244, 239, 231]; // #f4efe7, crema

const base = sharp(SRC).rotate().resize({ width: WIDTH, withoutEnlargement: true });

// color
await base.clone().webp({ quality: 82 }).toFile(`${OUT}/karem-morcilla-color.webp`);

// duotono: luminancia normalizada → lerp entre DARK y LIGHT
const { data, info } = await base
  .clone()
  .grayscale()
  .normalise()
  .gamma(1.05)
  .raw()
  .toBuffer({ resolveWithObject: true });

const px = info.width * info.height;
const outBuf = Buffer.alloc(px * 3);
for (let p = 0; p < px; p++) {
  const t = data[p * info.channels] / 255;
  outBuf[p * 3] = Math.round(DARK[0] + (LIGHT[0] - DARK[0]) * t);
  outBuf[p * 3 + 1] = Math.round(DARK[1] + (LIGHT[1] - DARK[1]) * t);
  outBuf[p * 3 + 2] = Math.round(DARK[2] + (LIGHT[2] - DARK[2]) * t);
}

await sharp(outBuf, { raw: { width: info.width, height: info.height, channels: 3 } })
  .webp({ quality: 82 })
  .toFile(`${OUT}/karem-morcilla-duo.webp`);

console.log('OK →', `${OUT}/karem-morcilla-duo.webp`, '+ color', `${info.width}x${info.height}`);
