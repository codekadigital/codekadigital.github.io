/**
 * Sistema de movimiento de Codeka (el "sello Obys"):
 * - Lenis (scroll suave) sincronizado con ScrollTrigger
 * - Preloader coreografiado (una vez por sesión) + intro del hero
 * - Reveals escalonados con máscara al hacer scroll
 * - Cursor personalizado, código Konami y toasts
 *
 * Con prefers-reduced-motion: no se anima nada y todo queda visible.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const INTRO_KEY = 'codeka:intro-seen';
const EASE = 'power3.out';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------- split de titulares en palabras (efecto por líneas/máscara) ---------- */
function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === 'done') {
    return Array.from(el.querySelectorAll<HTMLElement>('.line-inner'));
  }
  const text = el.textContent ?? '';
  el.setAttribute('aria-label', text.trim());
  el.dataset.split = 'done';
  const words = text.trim().split(/\s+/);
  el.textContent = '';
  const inners: HTMLElement[] = [];
  for (const word of words) {
    const mask = document.createElement('span');
    mask.className = 'line-mask';
    mask.style.display = 'inline-block';
    mask.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    inner.style.display = 'inline-block';
    inner.textContent = word;
    mask.appendChild(inner);
    el.appendChild(mask);
    el.appendChild(document.createTextNode(' '));
    inners.push(inner);
  }
  return inners;
}

/* ---------- preloader + intro del hero ---------- */
function runPreloader(onDone: () => void) {
  const pre = document.getElementById('preloader');
  const seen = sessionStorage.getItem(INTRO_KEY);

  if (!pre || seen) {
    pre?.remove();
    onDone();
    return;
  }
  sessionStorage.setItem(INTRO_KEY, '1');

  const counter = pre.querySelector<HTMLElement>('[data-pre-counter]');
  const bar = pre.querySelector<HTMLElement>('[data-pre-bar]');
  const morci = pre.querySelector<HTMLElement>('[data-pre-morci]');
  const label = pre.querySelector<HTMLElement>('[data-pre-label]');

  const state = { n: 0 };
  const tl = gsap.timeline();

  // Morcilla "aparece en pixel": escala en pasos discretos (steps) — guiño 8-bit
  if (morci) {
    tl.fromTo(
      morci,
      { scale: 0, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'steps(5)' },
      0
    );
  }
  if (label) tl.fromTo(label, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.2);

  // contador 0 → 100 (~1.3s)
  tl.to(
    state,
    {
      n: 100,
      duration: 1.3,
      ease: 'power2.inOut',
      onUpdate() {
        if (counter) counter.textContent = String(Math.round(state.n)).padStart(3, '0');
        if (bar) bar.style.transform = `scaleX(${state.n / 100})`;
      },
    },
    0.15
  );

  // salida: contenido del preloader se va, cortina revela el hero (clip-path)
  tl.to(pre.children, { autoAlpha: 0, y: -24, duration: 0.35, ease: 'power2.in' }, '+=0.15');
  tl.to(pre, {
    clipPath: 'inset(0% 0% 100% 0%)',
    duration: 0.9,
    ease: 'power4.inOut',
    onComplete() {
      pre.remove();
    },
  });
  // la intro del hero arranca solapada con la cortina
  tl.add(onDone, '-=0.55');
}

function heroIntro() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const title = hero.querySelector<HTMLElement>('[data-hero-title]');
  const chunks = title ? splitWords(title) : [];
  const rest = hero.querySelectorAll<HTMLElement>('[data-hero-fade]');
  const mascot = hero.querySelector<HTMLElement>('[data-hero-mascot]');

  const tl = gsap.timeline({ defaults: { ease: EASE } });
  if (chunks.length) {
    tl.fromTo(
      chunks,
      { yPercent: 115 },
      { yPercent: 0, duration: 1.0, stagger: 0.07 }
    );
  }
  if (mascot) {
    tl.fromTo(
      mascot,
      { autoAlpha: 0, y: 40, scale: 0.92 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.9 },
      0.35
    );
  }
  if (rest.length) {
    tl.fromTo(
      rest,
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 },
      0.45
    );
  }
}

/* ---------- reveals al hacer scroll ---------- */
function setupReveals() {
  // Titulares de sección: split por palabras con máscara
  document.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    const inners = splitWords(el);
    gsap.set(inners, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        gsap.to(inners, { yPercent: 0, duration: 0.9, ease: EASE, stagger: 0.06 }),
    });
  });

  // Bloques: clip + desplazamiento + fade, en stagger por contenedor
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!items.length) return;
    gsap.set(items, {
      autoAlpha: 0,
      y: 36,
      clipPath: 'inset(0% 0% 18% 0%)',
    });
    ScrollTrigger.create({
      trigger: group,
      start: 'top 82%',
      once: true,
      onEnter: () =>
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.85,
          ease: EASE,
          stagger: 0.1,
          clearProps: 'clipPath',
        }),
    });
  });

  // Elementos sueltos fuera de grupos
  document
    .querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-group] [data-reveal])')
    .forEach((el) => {
      gsap.set(el, { autoAlpha: 0, y: 32 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.85, ease: EASE }),
      });
    });

  // Stickers: pop de pegatina (escala + rotación con rebote). La inclinación
  // base (-2°) vive en CSS sobre la imagen, así se conserva sin animaciones.
  document.querySelectorAll<HTMLElement>('[data-sticker]').forEach((el) => {
    gsap.set(el, { autoAlpha: 0, scale: 0.7, rotation: -8, transformOrigin: '50% 75%' });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        gsap.to(el, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.8)' }),
    });
  });
}

/* ---------- lenis + anclas ---------- */
function setupLenis(): Lenis {
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // navegación por anclas con Lenis
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72, duration: 1.2 });
      history.pushState(null, '', id);
    });
  });
  return lenis;
}

/* ---------- header: fondo al hacer scroll ---------- */
function setupHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- cursor personalizado (solo puntero fino) ---------- */
function setupCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  const pos = { x: -100, y: -100 };
  const target = { x: -100, y: -100 };
  window.addEventListener('pointermove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  });
  gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.22;
    pos.y += (target.y - pos.y) * 0.22;
    dot.style.translate = `${pos.x}px ${pos.y}px`;
  });
  const interactive = 'a, button, [role="button"], input, textarea, select, canvas';
  document.addEventListener('pointerover', (e) => {
    if ((e.target as HTMLElement).closest(interactive)) dot.classList.add('is-hover');
  });
  document.addEventListener('pointerout', (e) => {
    if ((e.target as HTMLElement).closest(interactive)) dot.classList.remove('is-hover');
  });
}

/* ---------- toast ---------- */
export function showToast(message: string, ms = 3200) {
  let toast = document.querySelector<HTMLElement>('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast pixel-label';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => toast!.classList.add('is-visible'));
  window.clearTimeout((toast as any)._t);
  (toast as any)._t = window.setTimeout(() => toast!.classList.remove('is-visible'), ms);
}

/* ---------- código Konami ---------- */
const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];
function setupKonami(toastMsg: string) {
  let i = 0;
  window.addEventListener('keydown', (e) => {
    if (e.code === KONAMI[i]) {
      i++;
      if (i === KONAMI.length) {
        i = 0;
        showToast(toastMsg);
        window.dispatchEvent(new CustomEvent('codeka:konami'));
      }
    } else {
      i = e.code === KONAMI[0] ? 1 : 0;
    }
  });
}

/* ---------- init ---------- */
export function initMotion(opts: { konamiToast: string }) {
  gsap.registerPlugin(ScrollTrigger);
  setupHeader();
  setupKonami(opts.konamiToast);

  if (prefersReducedMotion()) {
    // sin animaciones: fuera preloader, todo visible y scroll nativo
    document.getElementById('preloader')?.remove();
    return;
  }

  setupLenis();
  setupCursor();
  setupReveals();
  runPreloader(heroIntro);
}
