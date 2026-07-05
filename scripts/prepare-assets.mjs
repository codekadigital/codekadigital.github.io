// Procesa morcilla.png: elimina el fondo blanco por flood-fill desde los bordes
// (los blancos interiores — ojos, corazones — se conservan), y genera assets.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = process.argv[2];
const OUT = process.argv[3]; // public dir

mkdirSync(OUT, { recursive: true });

const img = sharp(SRC).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

// Si la imagen ya trae transparencia (>5% de píxeles), no hay fondo que quitar.
let alreadyTransparent = 0;
for (let p = 0; p < W * H; p++) if (data[p * C + 3] < 10) alreadyTransparent++;
const hasAlpha = alreadyTransparent / (W * H) > 0.05;

if (!hasAlpha) {
  const isBgWhite = (i) => data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235;

  // flood fill desde los 4 bordes
  const visited = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) { stack.push(x); stack.push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { stack.push(y * W); stack.push(y * W + W - 1); }

  while (stack.length) {
    const p = stack.pop();
    if (visited[p]) continue;
    visited[p] = 1;
    const i = p * C;
    if (!isBgWhite(i)) continue;
    data[i + 3] = 0; // transparente
    const x = p % W, y = (p / W) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - W);
    if (y < H - 1) stack.push(p + W);
  }

  // Bolsas de fondo encerradas (no conectadas al borde exterior), p. ej. el
  // hueco entre la diadema y la cabeza. Semillas en coords relativas (x, y).
  const HOLES = [[0.472, 0.118]];
  for (const [rx, ry] of HOLES) {
    const seed = Math.round(ry * H) * W + Math.round(rx * W);
    const si = seed * C;
    if (data[si] > 225 && data[si + 1] > 225 && data[si + 2] > 225 && data[si + 3] > 0) {
      const hstack = [seed];
      while (hstack.length) {
        const p = hstack.pop();
        const i = p * C;
        if (data[i + 3] === 0) continue;
        if (!(data[i] > 225 && data[i + 1] > 225 && data[i + 2] > 225)) continue;
        data[i + 3] = 0;
        const x = p % W, y = (p / W) | 0;
        if (x > 0) hstack.push(p - 1);
        if (x < W - 1) hstack.push(p + 1);
        if (y > 0) hstack.push(p - W);
        if (y < H - 1) hstack.push(p + W);
      }
    } else {
      console.warn('HOLE seed sin blanco en', rx, ry, '— se ignora');
    }
  }

  // Elimina el halo claro del borde: varias pasadas comiendo píxeles claros
  // adyacentes a transparencia, hasta llegar al contorno oscuro del dibujo.
  // (Los blancos interiores — ojos, corazones — no tocan la transparencia.
  //  Umbral 185: por encima del gris del halo, por debajo del rosa de marca.)
  for (let pass = 0; pass < 4; pass++) {
    const transparent = new Uint8Array(W * H);
    for (let p = 0; p < W * H; p++) transparent[p] = data[p * C + 3] === 0 ? 1 : 0;
    let eaten = 0;
    for (let p = 0; p < W * H; p++) {
      if (transparent[p]) continue;
      const i = p * C;
      const x = p % W, y = (p / W) | 0;
      const nearT =
        (x > 0 && transparent[p - 1]) || (x < W - 1 && transparent[p + 1]) ||
        (y > 0 && transparent[p - W]) || (y < H - 1 && transparent[p + W]) ||
        (x > 0 && y > 0 && transparent[p - W - 1]) ||
        (x < W - 1 && y > 0 && transparent[p - W + 1]) ||
        (x > 0 && y < H - 1 && transparent[p + W - 1]) ||
        (x < W - 1 && y < H - 1 && transparent[p + W + 1]);
      const l = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      if (nearT && l > 185) {
        data[i + 3] = 0;
        eaten++;
      }
    }
    if (!eaten) break;
  }
} else {
  console.log('imagen con transparencia nativa: se omite la eliminación de fondo');
}

const base = sharp(data, { raw: { width: W, height: H, channels: C } });

// Recorta el bounding box del contenido con margen
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let p = 0; p < W * H; p++) {
  if (data[p * C + 3] > 0) {
    const x = p % W, y = (p / W) | 0;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}
const pad = Math.round(W * 0.02);
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
const region = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };

const cropped = base.clone().extract(region);
const buf = await cropped.png().toBuffer();

// PNG transparente (fallback) + WebP para producción, tamaño web razonable
await sharp(buf).resize({ width: 880, withoutEnlargement: true, kernel: 'nearest' }).png().toFile(`${OUT}/morcilla.png`);
await sharp(buf).resize({ width: 880, withoutEnlargement: true, kernel: 'nearest' }).webp({ quality: 92, alphaQuality: 95 }).toFile(`${OUT}/morcilla.webp`);

// Favicons: cabeza aprox (mitad superior) → apple-touch + png 32
const head = await sharp(buf).extract({
  left: Math.round(region.width * 0.14),
  top: 0,
  width: Math.round(region.width * 0.72),
  height: Math.round(region.height * 0.52),
}).toBuffer();
await sharp({ create: { width: 640, height: 640, channels: 4, background: '#0E0E12' } })
  .composite([{ input: await sharp(head).resize(520, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer(), gravity: 'centre' }])
  .png().toFile(`${OUT}/apple-touch-icon.png`);
await sharp(head).resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(`${OUT}/favicon-64.png`);

// OG image 1200x630: fondo charcoal, marca y Morcilla
const morciOg = await sharp(buf).resize({ height: 470 }).toBuffer();
const ogSvg = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0E0E12"/>
  <circle cx="1050" cy="80" r="300" fill="#F58EB1" opacity="0.07"/>
  <circle cx="120" cy="580" r="220" fill="#F58EB1" opacity="0.05"/>
  <text x="80" y="245" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="86" fill="#F4EFE7">Karem Quiroz</text>
  <text x="80" y="330" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="42" fill="#F58EB1">AI Full Stack Web Developer</text>
  <text x="80" y="400" font-family="DejaVu Sans, sans-serif" font-size="28" fill="#A7A2B0">AI Digital Products · Automation · Senior SEO</text>
  <text x="80" y="545" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="30" fill="#F4EFE7">codeka<tspan fill="#F58EB1">.</tspan></text>
  <rect x="80" y="565" width="56" height="6" fill="#F58EB1"/>
</svg>`);
await sharp(ogSvg)
  .composite([{ input: morciOg, left: 800, top: 630 - 470 - 40 }])
  .png().toFile(`${OUT}/og-image.png`);

console.log('OK', region, `${W}x${H}`);
