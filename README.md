# codeka. — Web personal de Karem Quiroz

One-page bilingüe (ES/EN) construida con **Astro 7 + Tailwind 4 + GSAP + Lenis**, con Morcilla 🦴 como mascota interactiva.

## Comandos

```bash
npm install        # dependencias
npm run dev        # servidor de desarrollo → http://localhost:4321
npm run build      # build de producción → dist/
npm run preview    # sirve dist/ en local
npm run check      # typecheck (astro check)
npm run assets     # regenera morcilla transparente, og-image y favicons
```

> El dev server de Astro 7 corre en segundo plano: `npx astro dev stop` para pararlo, `npx astro dev logs` para ver logs.

## ✏️ Contenido

Todo el contenido vive centralizado en **`src/lib/i18n.ts`** (objetos `es`/`en` espejados).

Ya relleno con datos reales: email (karem.quiroz.m@gmail.com), bio (LinkedIn), GitHub y LinkedIn
(también en el JSON-LD de `BaseLayout.astro`), y los 4 proyectos del GitHub de
[codekadigital](https://github.com/codekadigital) con sus demos en GitHub Pages.

Pendiente (opcional):

| Placeholder | Dónde |
|---|---|
| `[[FORMSPREE_ID]]` | `src/lib/i18n.ts` — mientras no lo pongas, el formulario abre el correo (mailto) |
| `[[SITE_URL]]` (si no es codeka.digital) | `astro.config.mjs` (constante `SITE`) y `public/robots.txt` |

También puedes tocar: `stackItems` (tecnologías del marquee), `morciQuotes` (frases de Morcilla),
`projects.items` (añade hasta 6) — siempre en los dos idiomas.

## 🚀 Deploy

La web es 100% estática (`dist/`). Cualquiera de los dos:

**Vercel**
1. Sube el repo a GitHub y en vercel.com → *Add New Project* → importa el repo.
2. Vercel detecta Astro solo (build `astro build`, output `dist`). Deploy.
3. Añade tu dominio en *Settings → Domains*.

**Netlify**
1. netlify.com → *Add new site* → *Import an existing project*.
2. Build command: `npm run build` · Publish directory: `dist`. Deploy.

En ambos casos: cuando tengas dominio final, actualiza `SITE` en `astro.config.mjs` y `public/robots.txt`, y re-despliega.

## ✅ Checklist SEO (auditado)

- [x] HTML semántico (`header/main/section/nav/footer`), **un solo `h1`** por página
- [x] `title` + `meta description` únicos por idioma
- [x] `canonical` por página + **`hreflang`** es/en/x-default
- [x] Open Graph completo + Twitter Cards + **og-image 1200×630** con marca y Morcilla
- [x] JSON-LD: `Person` (jobTitle, sameAs, address) + `WebSite`
- [x] `sitemap-index.xml` (con anotaciones i18n) + `robots.txt` apuntándolo
- [x] Fuentes self-host (`@fontsource`, `font-display: swap`), cero requests a terceros
- [x] Imágenes WebP + PNG fallback, `width/height` (sin CLS), `loading` correcto, `image-rendering: pixelated`
- [x] JS mínimo y diferido: el juego solo carga al entrar en viewport; sin frameworks SPA
- [x] Preloader superpuesto (no bloquea render ni causa CLS) y solo 1ª visita por sesión
- [x] `prefers-reduced-motion`: sin preloader, sin Lenis, sin reveals, todo visible
- [x] Accesibilidad: contraste AA, `alt` descriptivos (Morcilla incluida), foco visible, skip-link, navegación por teclado, `aria-label` en título splitteado, `role="status"` en toasts/bocadillo
- [x] `lang` correcto por idioma, selector de idioma y de tema accesibles

## 🎮 Easter egg

Código Konami en cualquier parte: **↑ ↑ ↓ ↓ ← → ← → B A** → Morcilla despliega el juego a pantalla completa.

## Estructura

```
src/
├─ components/   Header, Preloader, Hero, MorcillaMascot, About, Services,
│                Stack, Projects, Playground, Contact, Footer
├─ layouts/      BaseLayout.astro (SEO, meta, hreflang, JSON-LD, tema)
├─ lib/          i18n.ts (todas las cadenas ES/EN) · motion.ts (GSAP+Lenis+preloader)
│                bone-game.ts (mini-juego canvas)
├─ pages/        index.astro (es) · en/index.astro
└─ styles/       global.css (tokens de marca + Tailwind 4)
scripts/         prepare-assets.mjs (procesado de morcilla.png con sharp)
```

Más contexto sobre cada decisión: **`DECISIONES.md`**.
