# Portfolio · Miguel Ángel Domínguez García

Web para captar clientes y marca personal: un escritorio de developer en 3D (React Three Fiber) detrás de contenido HTML real y accesible. Home con hero en secuencia, servicios, casos, cómo trabajo, quién soy, ahora mismo y un brief guiado; páginas de caso de SolarMetrics y Seenat; privacidad y aviso legal.

## Stack

React 19 · React Router 7 (modo framework, prerender estático) · Vite 7 · three.js + @react-three/fiber/drei/postprocessing · GSAP + ScrollTrigger · Lenis · zustand · Resend (Vercel Function) · Vitest + Testing Library · Playwright

## Scripts

```bash
npm install
npm run dev        # desarrollo (http://localhost:5173)
npm test           # tests unitarios
npm run lint       # ESLint
npm run build      # prerender de todas las rutas en build/client
npm run preview    # sirve build/client como Vercel (http://localhost:4173)
npm run test:e2e   # build + Playwright con el Chrome del sistema
npm run og:images  # regenera public/img/og-<caso>.jpg
```

## Arquitectura

- `src/root.jsx`: layout raíz. La escena 3D (`src/scene/`), la navbar, el pie y el preloader se montan una vez y persisten entre rutas.
- `src/routes.js` + `src/routes/`: home, casos, legales y 404. `react-router.config.js` prerenderiza todas las rutas públicas (`src/data/site.js`) y, al terminar el build, genera `404.html`, `sitemap.xml` y `robots.txt`.
- La cámara elige pose con `resolvePoseId` (`src/scene/poses.js`): el `sceneCue` del hero y del pin de servicios manda sobre la sección visible.
- `/api/brief` (`api/brief.js` → `server/briefHandler.js`) valida con el mismo `src/lib/briefSchema.js` que el formulario y envía el correo con Resend.
- three.js solo se carga bajo demanda y nunca durante el prerender.

## Contenido

Todo el texto está en `src/data/` y `src/i18n/strings.js`, en español e inglés (la web muestra español; el selector llega en la fase D). `src/data/now.js` debe actualizarse al menos cada 120 días: un test falla para recordarlo.

## Configuración

| Variable | Dónde | Para qué |
|---|---|---|
| `VITE_SITE_URL` | `.env` y Vercel | Dominio público (canonical, Open Graph, sitemap). Por defecto `https://miandoga.vercel.app`. |
| `RESEND_API_KEY` | Vercel (no en `.env`) | Clave de Resend para enviar el brief. |
| `BRIEF_TO_EMAIL` | Vercel | Dónde llegan los briefs. |
| `BRIEF_FROM_EMAIL` | Vercel (opcional) | Remitente. Sin dominio verificado: `onboarding@resend.dev`. |

En `npm run dev` no existe `/api/brief`: el formulario mostrará el error con "Reintentar" y el email. El envío real se prueba en Vercel; el flujo completo, con la API simulada, en `npm run test:e2e`.

## Calidad del 3D

La calidad se detecta sola (`src/scene/quality.js`). Para probar un nivel concreto añade `?scene=high|medium|low|static`; `static` muestra el fondo sin WebGL.

## Imágenes

`scripts/process-images.py` genera la foto, el logo y la imagen general para redes (ver el script). Las imágenes por caso salen de `npm run og:images`.

## Pendiente de Miguel antes de publicar

1. **Resend**: crear la cuenta en https://resend.com con tu email, ir a *API Keys* → *Create API Key* (permiso *Sending access*) y copiar la clave (empieza por `re_`). Con `onboarding@resend.dev` como remitente, Resend solo entrega al email de tu propia cuenta: usa ese mismo email en `BRIEF_TO_EMAIL`. Si más adelante verificas un dominio en *Domains*, cambia `BRIEF_FROM_EMAIL` a una dirección de ese dominio.
2. **Vercel**: en el proyecto → *Settings* → *Environment Variables*, añadir `RESEND_API_KEY`, `BRIEF_TO_EMAIL` y (opcional) `BRIEF_FROM_EMAIL` para *Production* y *Preview*, y `VITE_SITE_URL` si el dominio no es `https://miandoga.vercel.app`. Volver a desplegar después de guardarlas.
3. **Probar el brief en producción**: enviar uno real desde la web desplegada y comprobar que llega, con "Responder a" apuntando al email escrito en el formulario.
4. **Textos legales**: revisar `src/data/legal.js` y añadir tu NIF (y domicilio si quieres darlo completo) en `profile.legal` de `src/data/profile.js`; la fila NIF aparece sola cuando no es `null`.
5. **Seenat**: confirmar con `npx supabase test db` el número real de pruebas del backend. La web dice "160+" (`src/data/cases/seenat.js`); déjalo así salvo que el número real sea menor. Revisar también el diario de desarrollo del mismo archivo.
6. **Capturas de Seenat**: aún no hay; el caso usa una vista previa dibujada. Añadir capturas reales de la app cuando las tengas.
7. **Nota del TFG de SolarMetrics**: añadirla al caso (`src/data/cases/solarmetrics.js`) si quieres mostrarla.
8. **Copy por revisar**: etiquetas rápidas del brief para herramienta y app (`src/data/brief.js`), "48 h" y "30 días" del proceso.
9. **Contrato con Macrosad**: confirmar que no impide trabajar como freelance antes de publicar.
