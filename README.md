# Portfolio · Miguel Ángel Domínguez García

Portfolio personal de Miguel Ángel, web developer en Jaén. La home abre con una secuencia 3D pre-renderizada con Blender que avanza al hacer scroll; después, cuatro actos con su trayectoria profesional, el caso de estudio de SolarMetrics y el bloque de contacto. Textos en español e inglés, con el español como idioma publicado.

## Stack

React 19 · React Router 7 (modo framework, prerender estático con `ssr: false`) · Vite 7 · GSAP + ScrollTrigger (`@gsap/react`) · Lenis · react-icons · Vitest + Testing Library · Playwright · Blender 5.x (solo para regenerar los fotogramas)

## Scripts

```bash
npm install
npm run dev        # desarrollo (http://localhost:5173)
npm test           # tests unitarios (Vitest)
npm run lint       # ESLint
npm run build      # prerender de todas las rutas en build/client
npm run preview    # sirve build/client (http://localhost:4173)
npm run test:e2e   # build + Playwright
npm run og:images  # regenera public/img/og-solarmetrics.jpg
```

## Rutas

- `/`: home (apertura 3D, hoy, actos de la trayectoria, proyectos, contacto).
- `/casos/solarmetrics`: caso de estudio de SolarMetrics.
- `/aviso-legal`: aviso legal.
- Cualquier otra URL: página 404.

## Arquitectura

- `src/root.jsx`: layout raíz con la navbar, el pie y el scroll suave (Lenis). Se monta una vez y persiste entre rutas.
- `src/routes.js` y `src/routes/`: una ruta por página. `src/routes/home.jsx` compone las secciones de la home.
- `src/data/`: todo el contenido (perfil, experiencia, actos, proyectos, casos, SEO y textos legales), en `{ es, en }`. Los textos de interfaz están en `src/i18n/strings.js`.
- `src/data/sequence.js`: número de fotogramas, tamaños y ruta de `public/seq/`. `src/components/Opening.jsx` y `ScrollSequence.jsx` reproducen los fotogramas según el progreso del scroll con GSAP ScrollTrigger.
- `react-router.config.js`: prerenderiza las rutas públicas (`src/data/site.js`) y, al terminar el build, genera `404.html`, `sitemap.xml` y `robots.txt`.
- `src/lib/seo.js`: metaetiquetas Open Graph y JSON-LD (`Person`).

## Secuencia de apertura

Los fotogramas de `public/seq/` los genera Blender a partir de `scripts/blender/retro_pc.py`. Para volver a renderizarlos y ver las opciones (variantes, calidad, número de fotogramas), sigue `scripts/blender/README.md`. Si cambias el número de fotogramas, actualiza `src/data/sequence.js`.

## Contenido

Todo el texto está en `src/data/` y `src/i18n/strings.js`. Antes de publicar, revisa cada texto (ver pendientes).

## Configuración

| Variable | Dónde | Para qué |
|---|---|---|
| `VITE_SITE_URL` | `.env` y Vercel | Dominio público (canonical, Open Graph, sitemap). Ahora: `https://miandoga.vercel.app`. |

## Pendiente de Miguel

1. **Macrosad**: escribir con tus palabras qué haces en Macrosad. El texto actual de `src/data/experience.js` es provisional.
2. **NIF**: añadirlo en `profile.legal.nif` de `src/data/profile.js` (LSSI). La fila del NIF aparece sola cuando deja de ser `null`.
3. **Revisar todos los textos** de `src/data/` y `src/i18n/strings.js` antes de publicar.
4. **Dominio final**: decidir la URL definitiva y fijar `VITE_SITE_URL` en `.env` y en Vercel; después vuelve a desplegar.
