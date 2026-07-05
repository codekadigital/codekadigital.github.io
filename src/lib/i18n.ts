export type Lang = 'es' | 'en';

export const DEFAULT_LANG: Lang = 'es';

/** Ruta equivalente en el otro idioma (para hreflang y el switcher) */
export function altPath(lang: Lang): string {
  return lang === 'es' ? '/en/' : '/';
}

export function homePath(lang: Lang): string {
  return lang === 'es' ? '/' : '/en/';
}

const es = {
  meta: {
    title: 'Karem Quiroz — AI Full Stack Web Developer · Codeka',
    description:
      'Karem Quiroz (Codeka): AI Full Stack Web Developer en Madrid. Productos digitales con IA, automatización y SEO senior. Webs rápidas, bien posicionadas y con carácter.',
    ogAlt: 'Karem Quiroz — Codeka, con Morcilla la teckel pixel-art',
  },
  nav: {
    about: 'Sobre mí',
    services: 'Servicios',
    projects: 'Proyectos',
    playground: 'Playground',
    contact: 'Contacto',
    themeToggle: 'Cambiar tema claro/oscuro',
    langSwitch: 'Switch to English',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    skipToContent: 'Saltar al contenido',
  },
  preloader: {
    loading: 'cargando…',
  },
  hero: {
    greeting: 'Hola, soy',
    name: 'Karem Quiroz',
    aka: 'en el mundo tech me conocen como',
    akaName: 'codeka',
    role: 'AI Full Stack Web Developer',
    specialties: ['AI Digital Products', 'Automation', 'Senior SEO'],
    tagline:
      'Creo productos digitales con IA que posicionan, convierten y se sienten vivos. Hago que las buenas ideas funcionen de verdad.',
    ctaPrimary: 'Hablemos',
    ctaSecondary: 'Ver proyectos',
    location: 'Madrid, España · remoto',
    morciLabel: '~ ella es morcilla · mi partner ~',
    morciAlt:
      'Morcilla, perrita teckel en pixel-art con gafas, pijama rosa de corazones, cascos rosas y un portátil con logo de hueso: la inspiración y compañera de Karem',
    scrollHint: 'scroll',
  },
  about: {
    eyebrow: 'Sobre mí',
    title: 'Técnica de día, ilustradora de siempre.',
    paragraphs: [
      'Soy Karem Quiroz Molina, aunque en el mundo tech me conocen como codeka. Desarrolladora frontend y especialista en ecommerce, SEO y SEM, con años de marketing digital a las espaldas. Hoy construyo producto digital en el lab digital de Grupo CECOP, en Madrid.',
      'Lo que me hace distinta: junto tres mundos que casi nunca se tocan. Escribo código de producción, audito SEO como una obsesa del detalle y dibujo mis propios personajes. Morcilla, mi teckel pixelada, es mi inspiración y mi compañera de teclado.',
      'Si tu proyecto necesita rigor técnico sin perder la chispa, ya somos dos.',
    ],
    factsTitle: 'Datos rápidos',
    facts: [
      { label: 'Base', value: 'Madrid, ES' },
      { label: 'Modo', value: 'Remoto · Freelance' },
      { label: 'Enfoque', value: 'IA + Web + SEO' },
      { label: 'Mascota', value: 'Morcilla 🦴' },
    ],
  },
  services: {
    eyebrow: 'Servicios',
    title: 'Lo que hago (y hago bien)',
    items: [
      {
        icon: 'lucide:sparkles',
        title: 'AI Digital Products',
        copy: 'De la idea al producto: integro LLMs y automatización inteligente en experiencias que la gente usa de verdad.',
      },
      {
        icon: 'lucide:terminal',
        title: 'Full Stack Web Dev',
        copy: 'Webs y apps rápidas, accesibles y mantenibles. TypeScript, arquitectura limpia y rendimiento de serie.',
      },
      {
        icon: 'lucide:zap',
        title: 'Automation',
        copy: 'Flujos que trabajan mientras duermes: integraciones, pipelines y bots que eliminan lo repetitivo.',
      },
      {
        icon: 'lucide:search',
        title: 'Senior SEO',
        copy: 'SEO técnico y de contenido con años de oficio. No prometo magia: prometo método, datos y resultados.',
      },
    ],
  },
  stack: {
    eyebrow: 'Stack',
    title: 'Herramientas de cabecera',
  },
  projects: {
    eyebrow: 'Proyectos',
    title: 'Trabajo seleccionado',
    visit: 'Ver proyecto',
    items: [
      {
        title: 'Ópticas Tu Mirada',
        desc: 'MVP de la nueva web para la cadena de ópticas: one-page estática, moderna y responsive, con las tiendas reales y lista para validar.',
        tags: ['One-page', 'HTML/CSS/JS', 'Retail'],
        url: 'https://codekadigital.github.io/opticas-tu-mirada/',
      },
      {
        title: 'CECOP Marketing Hub',
        desc: 'Demo visual del hub de marketing para los asociados del grupo: recursos y campañas reunidos en un solo sitio.',
        tags: ['Producto interno', 'Demo', 'Marketing'],
        url: 'https://codekadigital.github.io/cecop-marketing-hub-demo/',
      },
      {
        title: 'Unióticas',
        desc: 'Prototipo web para el grupo de ópticas, con foco en claridad, marca y conversión.',
        tags: ['MVP', 'Web', 'Ópticas'],
        url: 'https://codekadigital.github.io/unioticas/',
      },
      {
        title: 'Dashboard Asociado',
        desc: 'Panel para asociados: la información clave de su negocio reunida en un dashboard sencillo.',
        tags: ['Dashboard', 'UX'],
        url: 'https://github.com/codekadigital/dashboard-asociado',
      },
    ],
  },
  playground: {
    eyebrow: 'Playground',
    title: 'Atrapa los huesos',
    subtitle:
      'Mi lado creativo tiene patas cortas. Mueve a Morcilla con las flechas ← → (o arrastra con el dedo) y atrapa todos los huesos que puedas en 30 segundos.',
    start: 'Jugar',
    restart: 'Otra vez',
    score: 'Huesos',
    best: 'Récord',
    time: 'Tiempo',
    gameOver: '¡Tiempo! Morcilla está orgullosa de ti.',
    hint: 'psst… prueba el código konami ^^vv<><>BA',
    canvasLabel: 'Minijuego: Morcilla atrapa huesos que caen',
    close: 'Cerrar juego',
  },
  contact: {
    eyebrow: 'Contacto',
    title: '¿Construimos algo juntas/os?',
    copy: 'Cuéntame tu proyecto. Respondo rápido (Morcilla vigila mi bandeja de entrada).',
    emailLabel: 'o escríbeme directamente a',
    form: {
      name: 'Nombre',
      email: 'Email',
      message: 'Cuéntame tu proyecto',
      submit: 'Enviar mensaje',
      sending: 'Enviando…',
      success: '¡Recibido! Te contesto muy pronto. 🦴',
      error: 'Algo falló. Escríbeme directamente al email de abajo.',
      mailtoSubject: 'Hola Karem — proyecto',
    },
    socials: [
      { label: 'GitHub', url: 'https://github.com/codekadigital', icon: 'lucide:github' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/karem-quiroz/', icon: 'lucide:linkedin' },
    ],
  },
  footer: {
    tagline: 'Hecho con Astro, GSAP y muchos huesitos.',
    morciSays: 'morcilla dice: gracias por scrollear hasta aquí',
    rights: 'Codeka — Karem Quiroz',
    backToTop: 'Volver arriba',
  },
  konami: {
    toast: '🦴 ¡CÓDIGO KONAMI! Morcilla desbloquea el modo juego…',
  },
};

const en: typeof es = {
  meta: {
    title: 'Karem Quiroz — AI Full Stack Web Developer · Codeka',
    description:
      'Karem Quiroz (Codeka): AI Full Stack Web Developer based in Madrid. AI digital products, automation and senior SEO. Fast, well-ranked websites with personality.',
    ogAlt: 'Karem Quiroz — Codeka, with Morcilla the pixel-art dachshund',
  },
  nav: {
    about: 'About',
    services: 'Services',
    projects: 'Projects',
    playground: 'Playground',
    contact: 'Contact',
    themeToggle: 'Toggle light/dark theme',
    langSwitch: 'Cambiar a español',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    skipToContent: 'Skip to content',
  },
  preloader: {
    loading: 'loading…',
  },
  hero: {
    greeting: 'Hi, I’m',
    name: 'Karem Quiroz',
    aka: 'in the tech world you may know me as',
    akaName: 'codeka',
    role: 'AI Full Stack Web Developer',
    specialties: ['AI Digital Products', 'Automation', 'Senior SEO'],
    tagline:
      'I create AI-powered digital products that rank, convert and feel alive. I make good ideas actually work.',
    ctaPrimary: 'Let’s talk',
    ctaSecondary: 'See projects',
    location: 'Madrid, Spain · remote-friendly',
    morciLabel: '~ she’s morcilla · my partner ~',
    morciAlt:
      'Morcilla, a pixel-art dachshund with glasses, pink heart pajamas and pink headphones, typing on a laptop with a bone logo: Karem’s inspiration and sidekick',
    scrollHint: 'scroll',
  },
  about: {
    eyebrow: 'About',
    title: 'Engineer by day, illustrator always.',
    paragraphs: [
      'I’m Karem Quiroz Molina — codeka in the tech world. Frontend developer and ecommerce, SEO & SEM specialist with years of digital marketing behind me. These days I build digital products at Grupo CECOP’s digital lab in Madrid.',
      'What makes me different: I bridge three worlds that rarely meet. I ship production code, audit SEO with obsessive attention to detail, and draw my own characters. Morcilla, my pixel dachshund, is my inspiration and keyboard-side companion.',
      'If your project needs technical rigor without losing its spark, we already have something in common.',
    ],
    factsTitle: 'Quick facts',
    facts: [
      { label: 'Base', value: 'Madrid, ES' },
      { label: 'Mode', value: 'Remote · Freelance' },
      { label: 'Focus', value: 'AI + Web + SEO' },
      { label: 'Sidekick', value: 'Morcilla 🦴' },
    ],
  },
  services: {
    eyebrow: 'Services',
    title: 'What I do (well)',
    items: [
      {
        icon: 'lucide:sparkles',
        title: 'AI Digital Products',
        copy: 'From idea to product: I integrate LLMs and smart automation into experiences people actually use.',
      },
      {
        icon: 'lucide:terminal',
        title: 'Full Stack Web Dev',
        copy: 'Fast, accessible, maintainable websites and apps. TypeScript, clean architecture, performance by default.',
      },
      {
        icon: 'lucide:zap',
        title: 'Automation',
        copy: 'Workflows that run while you sleep: integrations, pipelines and bots that kill repetitive work.',
      },
      {
        icon: 'lucide:search',
        title: 'Senior SEO',
        copy: 'Technical and content SEO with years of craft. No magic promised: method, data and results.',
      },
    ],
  },
  stack: {
    eyebrow: 'Stack',
    title: 'Tools I reach for',
  },
  projects: {
    eyebrow: 'Projects',
    title: 'Selected work',
    visit: 'View project',
    items: [
      {
        title: 'Ópticas Tu Mirada',
        desc: 'MVP for the optics chain’s new website: a modern, responsive static one-pager with real store data, ready to validate.',
        tags: ['One-page', 'HTML/CSS/JS', 'Retail'],
        url: 'https://codekadigital.github.io/opticas-tu-mirada/',
      },
      {
        title: 'CECOP Marketing Hub',
        desc: 'Visual demo of the marketing hub for the group’s associates: resources and campaigns gathered in one place.',
        tags: ['Internal product', 'Demo', 'Marketing'],
        url: 'https://codekadigital.github.io/cecop-marketing-hub-demo/',
      },
      {
        title: 'Unióticas',
        desc: 'Web prototype for the optics group, focused on clarity, brand and conversion.',
        tags: ['MVP', 'Web', 'Optics'],
        url: 'https://codekadigital.github.io/unioticas/',
      },
      {
        title: 'Dashboard Asociado',
        desc: 'Associate panel: the key numbers of their business gathered in one simple dashboard.',
        tags: ['Dashboard', 'UX'],
        url: 'https://github.com/codekadigital/dashboard-asociado',
      },
    ],
  },
  playground: {
    eyebrow: 'Playground',
    title: 'Catch the bones',
    subtitle:
      'My creative side has short legs. Move Morcilla with the ← → arrow keys (or drag with your finger) and catch as many bones as you can in 30 seconds.',
    start: 'Play',
    restart: 'Play again',
    score: 'Bones',
    best: 'Best',
    time: 'Time',
    gameOver: 'Time’s up! Morcilla is proud of you.',
    hint: 'psst… try the konami code ^^vv<><>BA',
    canvasLabel: 'Mini-game: Morcilla catches falling bones',
    close: 'Close game',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Shall we build something together?',
    copy: 'Tell me about your project. I reply fast (Morcilla keeps an eye on my inbox).',
    emailLabel: 'or email me directly at',
    form: {
      name: 'Name',
      email: 'Email',
      message: 'Tell me about your project',
      submit: 'Send message',
      sending: 'Sending…',
      success: 'Got it! I’ll get back to you very soon. 🦴',
      error: 'Something went wrong. Email me directly below.',
      mailtoSubject: 'Hi Karem — project',
    },
    socials: [
      { label: 'GitHub', url: 'https://github.com/codekadigital', icon: 'lucide:github' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/karem-quiroz/', icon: 'lucide:linkedin' },
    ],
  },
  footer: {
    tagline: 'Built with Astro, GSAP and plenty of tiny bones.',
    morciSays: 'morcilla says: thanks for scrolling this far',
    rights: 'Codeka — Karem Quiroz',
    backToTop: 'Back to top',
  },
  konami: {
    toast: '🦴 KONAMI CODE! Morcilla unlocks game mode…',
  },
};

/** Frases de Morcilla al interactuar (bocadillo pixel) */
export const morciQuotes: Record<Lang, string[]> = {
  es: ['¡guau!', 'deploy ok ✓', '*teclea más rápido*', 'SEO = huesitos', '¿otro café?', 'git push 🦴'],
  en: ['woof!', 'deploy ok ✓', '*types faster*', 'SEO = treats', 'more coffee?', 'git push 🦴'],
};

/** Tecnologías del marquee (compartidas entre idiomas) */
export const stackItems: string[] = [
  'TypeScript',
  'Astro',
  'React',
  'Node.js',
  'Python',
  'Claude API',
  'LangChain',
  'Tailwind CSS',
  'GSAP',
  'PostgreSQL',
  'Supabase',
  'n8n',
  'Screaming Frog',
  'GA4 / GSC',
  'Figma',
  'Aseprite',
];

const translations: Record<Lang, typeof es> = { es, en };

export function useTranslations(lang: Lang) {
  return translations[lang];
}

/** Email de contacto */
export const EMAIL = 'karem.quiroz.m@gmail.com';
/** ID de Formspree — si se deja como placeholder, el formulario cae a mailto */
export const FORMSPREE_ID = '[[FORMSPREE_ID]]';
