# DECISIONES.md — Web personal Codeka

Decisiones tomadas de forma autónoma durante la construcción, con su porqué.
Las que te afectan directamente están marcadas con ⚠️.

## Stack y versiones

- **Astro 7 (no 5).** El prompt pedía Astro 5, pero `npm create astro@latest` instala hoy Astro 7 (julio 2026). Es la versión estable actual, la API que usamos (i18n, sitemap, output static, islas) es idéntica, y arrancar un proyecto nuevo con una major de hace dos años sería mala idea para mantenimiento. Todo el checklist se cumple igual.
- **Tailwind CSS v4** vía `@tailwindcss/vite` (lo que instala `astro add tailwind` ahora). Los tokens de marca se definen como CSS custom properties en `src/styles/global.css` y se mapean con `@theme inline`, así el toggle de tema funciona en runtime (`bg-bg`, `text-ink`, `text-accent`…).
- El dev server de Astro 7 corre como **demonio en background**: se para con `npx astro dev stop`, logs con `npx astro dev logs`.

## Marca e imagen

- ⚠️ **Dominio asumido: `https://codeka.digital`** (por el nombre de tu carpeta de proyectos). Está en `astro.config.mjs` (constante `SITE`) y en `public/robots.txt`. **Si tu dominio es otro, cámbialo en esos dos sitios.**
- **Fondo blanco de `morcilla.png`: eliminado programáticamente** (opción recorte, no pastilla). Escribí `scripts/prepare-assets.mjs` (usa `sharp`): hace *flood-fill desde los bordes*, así los blancos interiores (ojos, corazones del pijama, hueso del portátil) se conservan intactos. Genera:
  - `public/morcilla.png` (transparente, fallback) y `public/morcilla.webp` (producción)
  - `public/og-image.png` (1200×630, marca + Morcilla)
  - `public/apple-touch-icon.png` y `public/favicon-64.png` (cabeza de Morcilla)
  - Se regenera con `npm run assets` (el original vive en `scripts/morcilla-original.png`).
- **Favicon SVG**: corazón pixel-art rosa sobre charcoal, dibujado a mano (`public/favicon.svg`).
- `image-rendering: pixelated` en todos los usos de Morcilla para mantener el pixel nítido.

## Cambios posteriores (2026-07-05, misma sesión)

- **Cuerpo: Inter → Poppins** (petición de Karem), pesos 400/500 self-host. Tamaños del texto del hero unificados.
- **Ilustración definitiva: la v1 original** (los ojos que Karem quería). El script ahora además: vacía bolsas de fondo encerradas (hueco diadema-cabeza, semilla en `HOLES`) y elimina el halo claro del borde con varias pasadas (umbral 185 para no comerse el rosa).
- Las imágenes de Morcilla llevan `?v=N` para invalidar caché del navegador al cambiarlas — subir el número en MorcillaMascot, Preloader y bone-game si se regeneran.

- **Tipografía display: Space Grotesk → Syne** (elegida por Karem entre Syne/Unbounded/Sora). Pesos 500/700/800 self-host con `@fontsource/syne`. Se relajó el letter-spacing negativo (Syne ya tiene carácter propio) y el hero usa peso 800.
- **Ilustración v2**: `morcilla-v2.png` (desde Descargas de Windows) reemplaza a la original; viene con transparencia nativa, así que `scripts/prepare-assets.mjs` ahora detecta alpha (>5% de píxeles transparentes) y omite la eliminación de fondo. Todos los assets regenerados con `npm run assets`.

## Diseño y animación

- **Preloader**: solo la primera vez por sesión (`sessionStorage`), ~1.5 s: Morcilla aparece "en pasos" (easing `steps()`, guiño 8-bit), contador 000→100 en Press Start 2P, barra rosa, y salida con cortina `clip-path` que revela el hero. Con `prefers-reduced-motion` no existe.
- **Reveals**: titulares partidos por palabras con máscara (`overflow:hidden` + `yPercent`), bloques con `clip-path` + translate + fade en stagger, easing `power3.out`. Estados iniciales los pone GSAP: **sin JavaScript la web es 100% visible** (importante para SEO y robustez).
- **Lenis** sincronizado con ScrollTrigger vía `gsap.ticker`; también gestiona el scroll de las anclas del menú. Desactivado con `prefers-reduced-motion`.
- **Cursor personalizado**: punto rosa con lerp que crece sobre interactivos; solo `pointer: fine` (nunca en táctil).
- **Light mode opcional** con toggle accesible en el header (dark por defecto, persistido en `localStorage`, sin flash gracias a un script inline en `<head>`).

## El juego

- **"Atrapa los huesos" completo** (no stub): canvas 2D sin librerías, en `src/lib/bone-game.ts`. Flechas ← →, arrastre táctil, 30 s, marcador, récord en `localStorage`, partículas al atrapar. Carga *lazy*: el módulo se importa solo cuando la sección entra en viewport (IntersectionObserver).
- **Código Konami** (↑↑↓↓←→←→BA): toast en Press Start 2P + el juego se abre a pantalla completa en un overlay (cierra con Esc o ✕).
- La mascota del hero reacciona a hover (teclea rápido), y a click/tap (salto + corazones + frases rotativas en bocadillo pixel).

## Formulario de contacto

- Sin `<form action>` que rompa: JavaScript intercepta el submit. Si `FORMSPREE_ID` (en `src/lib/i18n.ts`) sigue siendo placeholder, cae a **mailto:** con el mensaje precargado; cuando pongas tu ID real de Formspree, enviará por `fetch` a su API con mensajes de éxito/error localizados.

## SEO

- `hreflang` es/en/x-default, canonical por idioma, OG + Twitter Cards completos, JSON-LD `Person` + `WebSite`, sitemap con `@astrojs/sitemap` (i18n), `robots.txt`, un solo `h1` por página, HTML semántico.
- Fuentes self-host con `@fontsource` (`font-display: swap` de serie, sin peticiones a Google).
- El título del hero usa `aria-label` con el texto completo tras el split de palabras (el split es `aria-hidden`), así lectores de pantalla y crawlers ven "Karem Quiroz" intacto.

## Pendiente / TODO

- ⚠️ Rellenar los placeholders `[[ ]]` (lista completa en el README).
- Los 4 proyectos son tarjetas placeholder; añade hasta 6 duplicando entradas en `projects.items` de `src/lib/i18n.ts` (los dos idiomas).
- Si quieres analítica, añádela tú (Plausible/GA4) — no instalé ninguna por privacidad y CWV.
