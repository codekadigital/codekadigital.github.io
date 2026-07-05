/**
 * "Catch the Bones" — mini-juego pixel autocontenido en <canvas>.
 * Sin librerías: requestAnimationFrame, teclado (← →), arrastre/tap táctil.
 * Morcilla se mueve abajo y atrapa huesos que caen. 30 segundos, marcador y récord.
 */

const GAME_SECONDS = 30;
const BEST_KEY = 'codeka:bones-best';

// Hueso pixel-art 13x6 (1 = crema, 2 = sombra)
const BONE_PIXELS = [
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  [0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
];

interface Bone {
  x: number;
  y: number;
  speed: number;
  wobble: number;
  caught: boolean;
  scale: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface GameStrings {
  score: string;
  best: string;
  time: string;
  gameOver: string;
  restart: string;
}

export class BoneGame {
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private last = 0;
  private running = false;
  private timeLeft = GAME_SECONDS;
  private score = 0;
  private best = 0;
  private bones: Bone[] = [];
  private particles: Particle[] = [];
  private spawnTimer = 0;
  private playerX = 0.5; // 0..1
  private targetX = 0.5;
  private keys: Record<string, boolean> = {};
  private morci: HTMLImageElement;
  private morciReady = false;
  private dpr = Math.min(window.devicePixelRatio || 1, 2);
  private cleanup: Array<() => void> = [];
  onEnd?: (score: number, best: number) => void;
  onScore?: (score: number) => void;
  onTime?: (t: number) => void;

  constructor(
    private canvas: HTMLCanvasElement,
    private strings: GameStrings
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d no disponible');
    this.ctx = ctx;
    this.best = Number(localStorage.getItem(BEST_KEY) || 0);

    this.morci = new Image();
    this.morci.src = '/morcilla.webp?v=6';
    this.morci.onload = () => (this.morciReady = true);

    this.bindControls();
    this.resize();
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(canvas);
    this.cleanup.push(() => ro.disconnect());
    this.drawIdle();
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    this.ctx.imageSmoothingEnabled = false;
    if (!this.running) this.drawIdle();
  }

  private bindControls() {
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (this.running) e.preventDefault();
        this.keys[e.key] = true;
      }
    };
    const ku = (e: KeyboardEvent) => (this.keys[e.key] = false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    this.cleanup.push(() => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    });

    const toX = (clientX: number) => {
      const rect = this.canvas.getBoundingClientRect();
      return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    };
    let dragging = false;
    const pd = (e: PointerEvent) => {
      dragging = true;
      this.targetX = toX(e.clientX);
    };
    const pm = (e: PointerEvent) => {
      if (dragging) this.targetX = toX(e.clientX);
    };
    const pu = () => (dragging = false);
    this.canvas.addEventListener('pointerdown', pd);
    window.addEventListener('pointermove', pm);
    window.addEventListener('pointerup', pu);
    this.cleanup.push(() => {
      this.canvas.removeEventListener('pointerdown', pd);
      window.removeEventListener('pointermove', pm);
      window.removeEventListener('pointerup', pu);
    });
  }

  start() {
    this.score = 0;
    this.timeLeft = GAME_SECONDS;
    this.bones = [];
    this.particles = [];
    this.spawnTimer = 0;
    this.running = true;
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    const loop = (t: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min((t - this.last) / 1000, 0.05);
      this.last = t;
      this.update(dt);
      this.draw();
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.running = false;
    this.cleanup.forEach((fn) => fn());
  }

  private update(dt: number) {
    const W = this.canvas.width;
    const H = this.canvas.height;

    this.timeLeft -= dt;
    this.onTime?.(Math.max(0, this.timeLeft));
    if (this.timeLeft <= 0) {
      this.running = false;
      cancelAnimationFrame(this.raf);
      this.best = Math.max(this.best, this.score);
      localStorage.setItem(BEST_KEY, String(this.best));
      this.drawEnd();
      this.onEnd?.(this.score, this.best);
      return;
    }

    // jugador
    const speed = 1.4 * dt;
    if (this.keys['ArrowLeft']) this.targetX -= speed;
    if (this.keys['ArrowRight']) this.targetX += speed;
    this.targetX = Math.min(1, Math.max(0, this.targetX));
    this.playerX += (this.targetX - this.playerX) * Math.min(1, dt * 14);

    // spawn de huesos: acelera con el tiempo
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      const progress = 1 - this.timeLeft / GAME_SECONDS;
      this.spawnTimer = 0.7 - progress * 0.4 + Math.random() * 0.35;
      this.bones.push({
        x: 0.08 + Math.random() * 0.84,
        y: -0.08,
        speed: (0.18 + progress * 0.16 + Math.random() * 0.12),
        wobble: Math.random() * Math.PI * 2,
        caught: false,
        scale: 0.8 + Math.random() * 0.5,
      });
    }

    // física de huesos + colisión
    const morciW = Math.min(W * 0.16, 110 * this.dpr);
    const morciH = morciW * 1.07;
    const px = this.playerX * (W - morciW) + morciW / 2;
    const py = H - morciH * 0.45;

    for (const b of this.bones) {
      b.y += b.speed * dt;
      b.wobble += dt * 3;
      const bx = b.x * W + Math.sin(b.wobble) * 6 * this.dpr;
      const by = b.y * H;
      if (!b.caught && by > py - morciH * 0.65 && Math.abs(bx - px) < morciW * 0.75 && by < H) {
        b.caught = true;
        this.score++;
        this.onScore?.(this.score);
        for (let i = 0; i < 6; i++) {
          this.particles.push({
            x: bx,
            y: by,
            vx: (Math.random() - 0.5) * 160 * this.dpr,
            vy: (-60 - Math.random() * 120) * this.dpr,
            life: 0.6,
          });
        }
      }
    }
    this.bones = this.bones.filter((b) => !b.caught && b.y < 1.1);

    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * this.dpr * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private css(name: string, fallback: string): string {
    return (
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
    );
  }

  private drawBackdrop() {
    const { ctx, canvas } = this;
    ctx.fillStyle = this.css('--surface', '#16161c');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // suelo pixel
    ctx.fillStyle = this.css('--accent-soft', '#3a2430');
    const tile = 8 * this.dpr;
    for (let x = 0; x < canvas.width; x += tile * 2) {
      ctx.fillRect(x, canvas.height - tile, tile, tile);
    }
  }

  private drawBone(bx: number, by: number, scale: number) {
    const { ctx } = this;
    const px = Math.max(2, Math.round(3 * this.dpr * scale));
    const w = BONE_PIXELS[0].length * px;
    const h = BONE_PIXELS.length * px;
    const cream = this.css('--text', '#f4efe7');
    for (let r = 0; r < BONE_PIXELS.length; r++) {
      for (let c = 0; c < BONE_PIXELS[r].length; c++) {
        const v = BONE_PIXELS[r][c];
        if (!v) continue;
        ctx.fillStyle = v === 1 ? cream : 'rgba(0,0,0,0.25)';
        ctx.fillRect(Math.round(bx - w / 2 + c * px), Math.round(by - h / 2 + r * px), px, px);
      }
    }
  }

  private drawMorci() {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    const morciW = Math.min(W * 0.16, 110 * this.dpr);
    const morciH = morciW * 1.07;
    const x = this.playerX * (W - morciW);
    const y = H - morciH - 8 * this.dpr;
    if (this.morciReady) {
      ctx.drawImage(this.morci, x, y, morciW, morciH);
    } else {
      ctx.fillStyle = this.css('--accent', '#f58eb1');
      ctx.fillRect(x, y + morciH * 0.4, morciW, morciH * 0.6);
    }
  }

  private draw() {
    const { ctx, canvas } = this;
    this.drawBackdrop();
    for (const b of this.bones) {
      const bx = b.x * canvas.width + Math.sin(b.wobble) * 6 * this.dpr;
      this.drawBone(bx, b.y * canvas.height, b.scale);
    }
    // partículas corazón (cuadraditos rosas)
    ctx.fillStyle = this.css('--accent', '#f58eb1');
    for (const p of this.particles) {
      const s = Math.max(2, 3 * this.dpr * p.life * 2);
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }
    this.drawMorci();
  }

  private pixelFont(size: number) {
    return `${Math.round(size * this.dpr)}px "Press Start 2P", monospace`;
  }

  private drawIdle() {
    const { ctx, canvas } = this;
    this.drawBackdrop();
    this.drawBone(canvas.width * 0.3, canvas.height * 0.28, 1.4);
    this.drawBone(canvas.width * 0.68, canvas.height * 0.18, 1.1);
    this.drawMorci();
    ctx.fillStyle = this.css('--text-muted', '#a7a2b0');
    ctx.font = this.pixelFont(9);
    ctx.textAlign = 'center';
    ctx.fillText('READY?', canvas.width / 2, canvas.height * 0.5);
  }

  private drawEnd() {
    const { ctx, canvas } = this;
    this.draw();
    ctx.fillStyle = 'rgba(14,14,18,0.72)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = this.css('--accent', '#f58eb1');
    ctx.font = this.pixelFont(13);
    ctx.fillText(`${this.strings.score}: ${this.score}`, canvas.width / 2, canvas.height * 0.42);
    ctx.fillStyle = this.css('--text', '#f4efe7');
    ctx.font = this.pixelFont(8);
    ctx.fillText(`${this.strings.best}: ${this.best}`, canvas.width / 2, canvas.height * 0.52);
  }

  getBest() {
    return this.best;
  }
  isRunning() {
    return this.running;
  }
}
