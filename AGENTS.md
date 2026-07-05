# web-codeka — notas para agentes

Web personal one-page de Karem Quiroz (marca **Codeka**), bilingüe ES (raíz) / EN (`/en/`).

## Stack
Astro 7 (static) · Tailwind CSS 4 (`@theme inline` sobre CSS vars) · GSAP + ScrollTrigger · Lenis · TypeScript strict.

## Reglas del proyecto
- **Todas las cadenas de contenido viven en `src/lib/i18n.ts`** (objetos `es`/`en` espejados). Nunca hardcodear texto en componentes.
- Tokens de marca en `src/styles/global.css` (`--bg`, `--accent`, etc.); dark por defecto, light vía `:root[data-theme='light']`. Usa las clases mapeadas (`bg-bg`, `text-ink`, `text-accent`, `border-line`).
- Tipografías: Space Grotesk (display), Inter (cuerpo), Press Start 2P (solo micro-labels pixel, clase `.pixel-label`).
- Animaciones: estados iniciales SIEMPRE desde GSAP (sin JS todo debe verse). Respetar `prefers-reduced-motion` en cualquier animación nueva.
- Assets de Morcilla: no editar los de `public/` a mano; regenerar con `npm run assets` (fuente: `scripts/prepare-assets.mjs`).
- El dev server (`npm run dev`) corre como demonio: `npx astro dev stop` / `logs` / `status`.

## Verificación
`npm run check` (0 errores) y `npm run build` deben pasar limpios antes de dar nada por terminado.

## Docs
- `DECISIONES.md`: decisiones de diseño/técnicas y sus porqués.
- `README.md`: placeholders `[[ ]]` pendientes del usuario, deploy, checklist SEO.
