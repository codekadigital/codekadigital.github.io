// Procesa el recorte de Karem & Morcilla (fondo negro puro pegado, sin alfa)
// para el sticker de la sección Contacto:
// - flood-fill desde los bordes: solo el negro puro conectado al exterior se
//   vuelve transparente (los negros del sujeto — pelo, Morcilla, cascos — se
//   conservan, igual que las bolsas interiores, para no agujerear el trazado)
// - se come el halo oscuro del borde (píxeles casi negros junto a transparencia)
// - recorte del bounding box + WebP con alfa listo para web
// Uso: node scripts/prepare-sticker.mjs <recorte.png> <public-dir>
import sharp from 'sharp';

const SRC = process.argv[2];
const OUT = process.argv[3];
const WIDTH = 640;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const isBgBlack = (i) => data[i] < 6 && data[i + 1] < 6 && data[i + 2] < 6;

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
  if (!isBgBlack(i)) continue;
  data[i + 3] = 0;
  const x = p % W, y = (p / W) | 0;
  if (x > 0) stack.push(p - 1);
  if (x < W - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - W);
  if (y < H - 1) stack.push(p + W);
}

// resto de silla de cuadros pegado al hombro izquierdo: borra los píxeles
// oscuros de su zona (la manga blanca de la camiseta queda por encima del
// umbral y no se toca). Coordenadas relativas al original de 1167x1558.
{
  // Borde de borrado (x relativo) por altura (y relativa): ancho sobre la
  // oreja (parche de silla hasta ~0.25W), estrecho a la altura de la oreja
  // (nace en ~0.10W) y algo más ancho hacia el hombro/manga.
  const CURVE = [
    [0.530, 0.250],
    [0.605, 0.220],
    [0.618, 0.150],
    [0.640, 0.110],
    [0.800, 0.105],
    [0.870, 0.115],
    [0.950, 0.130],
  ];
  const xCut = (ry) => {
    for (let k = 0; k < CURVE.length - 1; k++) {
      const [y0, x0] = CURVE[k], [y1, x1] = CURVE[k + 1];
      if (ry >= y0 && ry <= y1) return x0 + ((ry - y0) / (y1 - y0)) * (x1 - x0);
    }
    return 0;
  };
  const Y_MIN = Math.round(H * CURVE[0][0]), Y_MAX = Math.round(H * CURVE[CURVE.length - 1][0]);
  for (let y = Y_MIN; y < Y_MAX; y++) {
    const X_MAX = Math.round(W * xCut(y / H));
    for (let x = 0; x < X_MAX; x++) {
      const i = (y * W + x) * C;
      if (data[i + 3] > 0 && data[i] < 140 && data[i + 1] < 140 && data[i + 2] < 140) data[i + 3] = 0;
    }
  }
}

// halo: dos pasadas comiendo píxeles casi negros adyacentes a transparencia
for (let pass = 0; pass < 2; pass++) {
  const transparent = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) transparent[p] = data[p * C + 3] === 0 ? 1 : 0;
  let eaten = 0;
  for (let p = 0; p < W * H; p++) {
    if (transparent[p]) continue;
    const i = p * C;
    const x = p % W, y = (p / W) | 0;
    const nearT =
      (x > 0 && transparent[p - 1]) || (x < W - 1 && transparent[p + 1]) ||
      (y > 0 && transparent[p - W]) || (y < H - 1 && transparent[p + W]);
    if (nearT && data[i] < 45 && data[i + 1] < 45 && data[i + 2] < 45) {
      data[i + 3] = 0;
      eaten++;
    }
  }
  if (!eaten) break;
}

// solo la pieza principal: cualquier componente opaco suelto (motas del
// recorte, líneas claras de la silla) llevaría su propio trazado flotante
{
  const label = new Int32Array(W * H).fill(-1);
  const comps = [];
  for (let s = 0; s < W * H; s++) {
    if (label[s] !== -1 || data[s * C + 3] === 0) continue;
    const id = comps.length;
    let size = 0;
    const st = [s];
    label[s] = id;
    while (st.length) {
      const p = st.pop();
      size++;
      const x = p % W, y = (p / W) | 0;
      if (x > 0 && label[p - 1] === -1 && data[(p - 1) * C + 3] > 0) { label[p - 1] = id; st.push(p - 1); }
      if (x < W - 1 && label[p + 1] === -1 && data[(p + 1) * C + 3] > 0) { label[p + 1] = id; st.push(p + 1); }
      if (y > 0 && label[p - W] === -1 && data[(p - W) * C + 3] > 0) { label[p - W] = id; st.push(p - W); }
      if (y < H - 1 && label[p + W] === -1 && data[(p + W) * C + 3] > 0) { label[p + W] = id; st.push(p + W); }
    }
    comps.push(size);
  }
  const main = comps.indexOf(Math.max(...comps));
  for (let p = 0; p < W * H; p++) if (label[p] !== -1 && label[p] !== main) data[p * C + 3] = 0;
}

// bounding box del contenido con un margen pequeño
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let p = 0; p < W * H; p++) {
  if (data[p * C + 3] > 0) {
    const x = p % W, y = (p / W) | 0;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}
const pad = Math.round(W * 0.01);
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
const region = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };

const out = await sharp(data, { raw: { width: W, height: H, channels: C } })
  .extract(region)
  .resize({ width: WIDTH, withoutEnlargement: true })
  .webp({ quality: 84, alphaQuality: 92 })
  .toFile(`${OUT}/karem-morcilla-sticker.webp`);

console.log('OK →', `${OUT}/karem-morcilla-sticker.webp`, `${out.width}x${out.height}`);
