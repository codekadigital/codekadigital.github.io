// Arregla los ojos de morcilla-v3: encoge las pupilas gigantes y recupera
// la esclerótica blanca (look de la Morcilla original).
// Uso: node scripts/fix-eyes.mjs <entrada.png> <salida.png>
import sharp from 'sharp';

const SRC = process.argv[2];
const OUT = process.argv[3];

// zona que contiene ambos ojos (coords de la imagen 1024x1024)
const ROI = { x0: 400, y0: 160, x1: 740, y1: 320 };
const DARK = 90; // umbral de luminancia para "pupila"

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
const inROI = (x, y) => x >= ROI.x0 && x <= ROI.x1 && y >= ROI.y0 && y <= ROI.y1;

// 1) componentes conexas de píxeles oscuros dentro de la ROI
const label = new Int32Array(W * H).fill(-1);
const blobs = [];
for (let y = ROI.y0; y <= ROI.y1; y++) {
  for (let x = ROI.x0; x <= ROI.x1; x++) {
    const p = y * W + x;
    if (label[p] !== -1) continue;
    const i = p * C;
    if (data[i + 3] < 128 || lum(i) >= DARK) continue;

    const id = blobs.length;
    const pixels = [];
    let touchesBorder = false;
    const stack = [p];
    label[p] = id;
    while (stack.length) {
      const q = stack.pop();
      pixels.push(q);
      const qx = q % W, qy = (q / W) | 0;
      if (qx === ROI.x0 || qx === ROI.x1 || qy === ROI.y0 || qy === ROI.y1) touchesBorder = true;
      for (const d of [-1, 1, -W, W]) {
        const n = q + d;
        const nx = n % W, ny = (n / W) | 0;
        if (!inROI(nx, ny) || label[n] !== -1) continue;
        const ni = n * C;
        if (data[ni + 3] < 128 || lum(ni) >= DARK) continue;
        label[n] = id;
        stack.push(n);
      }
    }
    blobs.push({ pixels, touchesBorder });
  }
}

// 2) pupilas = blobs interiores grandes (el contorno/pelaje toca el borde de la ROI)
const pupils = blobs.filter((b) => !b.touchesBorder && b.pixels.length > 2000);
console.log('blobs oscuros:', blobs.length, '→ pupilas detectadas:', pupils.length);
if (pupils.length !== 2) {
  console.error('esperaba 2 pupilas; aborto por seguridad');
  process.exit(1);
}

const WHITE = [252, 250, 248];
const BLACK = [16, 14, 16];

for (const pupil of pupils) {
  let sx = 0, sy = 0;
  for (const p of pupil.pixels) { sx += p % W; sy += (p / W) | 0; }
  const cx = sx / pupil.pixels.length;
  const cy = sy / pupil.pixels.length;
  const r = Math.sqrt(pupil.pixels.length / Math.PI);
  const newR = r * 0.55;             // pupila nueva: ~55% del radio original
  const glint = { x: cx + newR * 0.42, y: cy - newR * 0.45, r: newR * 0.34 };

  // máscara = pupila dilatada 2px (cubre el halo de antialiasing)
  const mask = new Set(pupil.pixels);
  for (let iter = 0; iter < 2; iter++) {
    for (const p of [...mask]) {
      for (const d of [-1, 1, -W, W, -W - 1, -W + 1, W - 1, W + 1]) {
        const n = p + d;
        const nx = n % W, ny = (n / W) | 0;
        if (inROI(nx, ny)) mask.add(n);
      }
    }
  }

  // anillo exterior (pupila vieja - pupila nueva) → blanco
  for (const p of mask) {
    const x = p % W, y = (p / W) | 0;
    if (Math.hypot(x - cx, y - cy) <= newR) continue;
    const i = p * C;
    data[i] = WHITE[0]; data[i + 1] = WHITE[1]; data[i + 2] = WHITE[2];
    data[i + 3] = 255;
  }
  // pupila nueva: disco negro limpio + un brillo (borra los brillos viejos)
  const R = Math.ceil(newR);
  for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) {
    for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
      if (Math.hypot(x - cx, y - cy) > newR) continue;
      const i = (y * W + x) * C;
      const inGlint = Math.hypot(x - glint.x, y - glint.y) <= glint.r;
      const col = inGlint ? WHITE : BLACK;
      data[i] = col[0]; data[i + 1] = col[1]; data[i + 2] = col[2];
      data[i + 3] = 255;
    }
  }
  console.log(`pupila en (${Math.round(cx)},${Math.round(cy)}) r=${r.toFixed(0)} → ${newR.toFixed(0)}`);
}

await sharp(data, { raw: { width: W, height: H, channels: C } }).png().toFile(OUT);
console.log('guardado:', OUT);
