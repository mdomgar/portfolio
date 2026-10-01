# Portfolio · Miguel Ángel Domínguez García

Portfolio personal con un escritorio de developer en 3D (React Three Fiber) detrás de un contenido HTML accesible: sobre mí, experiencia, proyectos, educación y contacto.

## Stack

React 19 · Vite 7 · three.js + @react-three/fiber/drei/postprocessing · GSAP + ScrollTrigger · Lenis · zustand · Vitest + Testing Library

## Scripts

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # tests
npm run lint     # ESLint
npm run build    # build de producción en dist/
```

## Configuración

La URL pública del sitio se define con `VITE_SITE_URL` en `.env` (por defecto `https://miandoga.vercel.app`). Vite la inyecta en las etiquetas `canonical` y Open Graph de `index.html`; cámbiala si el sitio se publica en otro dominio.

## Contenido

Todo el texto está en `src/data/` (contenido) y `src/i18n/strings.js` (interfaz), en español e inglés.

## Calidad del 3D

La calidad se detecta sola (`src/scene/quality.js`). Para probar un nivel concreto añade `?scene=high|medium|low|static` a la URL; `static` muestra el fondo sin WebGL.

## Imágenes

`scripts/process-images.py` genera `public/img/*` (foto recortada, logo e imagen para redes) a partir de `scripts/source/portrait-original.webp`:

```bash
python -m venv scripts/.venv
scripts/.venv/Scripts/python -m pip install "rembg[cpu]" pillow
scripts/.venv/Scripts/python scripts/process-images.py scripts/source/portrait-original.webp
```
