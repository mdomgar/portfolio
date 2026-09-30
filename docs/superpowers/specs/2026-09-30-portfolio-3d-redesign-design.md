# Rediseño 3D inmersivo del portfolio — Documento de diseño

- **Fecha:** 2026-09-30
- **Autor:** Miguel Ángel Domínguez García (con Claude)
- **Estado:** Pendiente de revisión

## 1. Objetivo

Rediseñar el portfolio para que sea **llamativo, potente y memorable** sin perder profesionalidad, con el fin de conseguir trabajo o proyectos como **Web Developer / Full Stack**. Quien contrata debe quedar impresionado en los primeros segundos y, aun así, poder leer rápido experiencia, proyectos y contacto.

### Criterios de éxito
- Hero con impacto: escritorio de developer en 3D + foto de Miguel recortada en primer plano (animación de cruzar brazos en fase 3).
- Todo el contenido es HTML real: legible sin 3D, indexable y accesible.
- Lighthouse: rendimiento ≥ 80 (escritorio), accesibilidad ≥ 95.
- Funciona en móvil (3D simplificado o imagen estática).
- Web en ES/EN, CV descargable en ES/EN, terminal con Ctrl+K.
- `npm run lint` sin errores, `npm run build` correcto, tests en verde.

### Fuera de alcance
- Formulario de contacto (descartado: solo copiar email, mailto y LinkedIn).
- Generación del vídeo/imágenes por IA (lo hace Miguel con los prompts de la sección 9).
- Backend o CMS: el contenido vive en archivos de datos del repo.

## 2. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Dirección visual | 3D inmersivo |
| Concepto 3D | Setup de developer low-poly, construido en código (sin modelos externos) |
| Foto + 3D | Miguel recortado en primer plano junto al escritorio; al hacer scroll la cámara entra en el monitor |
| Arquitectura | **Opción A**: canvas 3D fijo detrás + contenido HTML encima, scroll → cámara |
| Paleta | **A. Midnight neon** |
| Animación de brazos | Fotograma inicial generado con IA → vídeo con Kling (inicio/fin) → secuencia WebP |
| Extras | CV descargable (ES/EN), idiomas ES/EN, terminal Ctrl+K |
| Contacto | Sin formulario: copiar email + mailto + LinkedIn |
| SolarMetrics en el monitor | Mini dashboard animado recreado en código (no hay vídeo) |
| Último trabajo | "Técnico Power BI" → **Web Developer** (Macrosad, dic. 2025 – actualidad). Ya aplicado en `App.jsx` |

## 3. Recorrido de la página

1. **Preloader**: contador 0→100 % mientras cargan el 3D y la foto.
2. **Hero**: cámara abierta al escritorio nocturno. Miguel en primer plano (estático en fases 1–2; animación de brazos una vez tras el preloader en fase 3), nombre gigante detrás, rol con efecto máquina de escribir (`Web Developer` → `Full Stack` → `Backend lover`), badge "🟢 Disponible", botones "Ver proyectos" y "Descargar CV" (este último aparece en la fase 2, cuando existan los PDFs).
3. **Sobre mí**: la cámara orbita el escritorio; aparece un grid bento (Jaén, puesto actual, cifras animadas, stack) y una marquesina infinita de logos de tecnologías.
4. **Experiencia**: línea de tiempo que se rellena con el scroll, de más reciente a más antigua; Web Developer @ Macrosad destacado. El 3D queda de fondo, atenuado.
5. **Proyectos**: la cámara hace zoom al monitor principal, que muestra el dashboard animado de SolarMetrics; al lado, el caso de estudio (problema, solución, stack, Live Demo y GitHub).
6. **Educación**: tarjetas compactas con notas medias (9.7/10 y 9.4/10).
7. **Contacto**: la cámara se aleja; "¿Hablamos?" gigante, botón de copiar email con aviso, mailto y LinkedIn.
8. **Siempre visibles**: navbar fija con selector ES/EN y botón de terminal; Ctrl+K abre la terminal.

## 4. Estética

### Paleta Midnight neon (tokens en `styles/tokens.css`)
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#07080d` | Fondo general / niebla 3D |
| `--surface` | `#131722` | Tarjetas, terminal |
| `--accent` | `#00e5ff` | Cian principal (enlaces, LEDs, resplandor) |
| `--accent-2` | `#7c5cff` | Violeta secundario (degradados, LED de la mesa) |
| `--warm` | `#ffb454` | Luz cálida de la lámpara, detalles |
| `--text` | `#e8ecf4` | Texto principal |
| `--text-muted` | `#8a93a6` | Texto secundario |

Todos los pares de texto/fondo deben cumplir contraste WCAG AA.

### Tipografía
- Display (nombre, títulos): *Clash Display* (Fontshare) o *Space Grotesk* como alternativa.
- Texto: *Inter*.
- Código/terminal: *JetBrains Mono*.

### Escena 3D ("developer trabajando de noche")
- Mesa de madera oscura con tira LED inferior (cian → violeta) que ilumina el suelo.
- Monitor ultrapanorámico (protagonista): código tecleándose solo en la vista general; dashboard de SolarMetrics en la sección de proyectos.
- Monitor vertical con una terminal parpadeando.
- Teclado mecánico con ola RGB, ratón y alfombrilla.
- Taza con vapor, planta, lámpara de luz cálida, auriculares en soporte, torre con pegatina de React, olivo pequeño en maceta (guiño a Jaén).
- Sala oscura con niebla, partículas de polvo en el haz de la lámpara y bloom en las fuentes de luz.
- Interacción: parallax de cámara con el ratón; al pasar por encima de objetos, reaccionan (más vapor en la taza, otro efecto en el teclado, la lámpara se enciende o se apaga).

### Microinteracciones
Scroll suave (Lenis), revelado de textos al entrar en pantalla, botones magnéticos, foco de luz que sigue al cursor sobre las tarjetas y tarjetas con inclinación 3D.

## 5. Arquitectura técnica

### Dependencias
- **Se mantienen**: `react`, `react-dom`, `react-icons`, `vite`, `@vitejs/plugin-react`, ESLint.
- **Se añaden**: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `gsap`, `@gsap/react`, `lenis`, `zustand`.
- **Desarrollo**: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
- **Se eliminan**: `react-tsparticles`, `tsparticles-engine`, `tsparticles-slim`.

### Estructura
```
src/
  data/          profile.js, experience.js, projects.js, education.js, skills.js
                 (cada texto como { es, en })
  i18n/          LanguageContext.jsx, es.js, en.js (textos de interfaz)
  scene/         SceneCanvas.jsx, Desk.jsx, Monitors.jsx, SolarDashboardScreen.jsx,
                 Keyboard.jsx, Props.jsx (taza, planta, lámpara, auriculares, olivo),
                 CameraRig.jsx, Effects.jsx, SceneFallback.jsx
  components/    Preloader, Navbar, LanguageToggle, Hero, HeroPortrait, About (bento),
                 TechMarquee, Experience, Projects, Education, Contact, Terminal
  terminal/      commands.js (parser y comandos, sin React → testeable)
  hooks/         useQualityTier.js, useReducedMotion.js
  store/         sceneStore.js (zustand: sección activa y progreso)
  styles/        tokens.css, global.css
public/
  img/           portrait.webp/avif (recorte transparente), og-image.jpg, desk-fallback.webp
  cv/            cv-miguel-angel-es.pdf, cv-miguel-angel-en.pdf
  seq/           (fase 3) frames de la animación de brazos
```

### Flujo de datos
- **Contenido**: `data/*` → componentes de sección, que eligen `es`/`en` según `LanguageContext`.
- **Scroll → 3D**: cada sección registra un ScrollTrigger que escribe en `sceneStore` la sección activa y el progreso (0–1). `CameraRig` lee el store en `useFrame` e interpola posición y objetivo de cámara hacia el punto de vista de esa sección (hero → órbita → timeline con cámara atenuada → zoom al monitor → alejamiento).
- **Lenis ↔ GSAP**: Lenis dirige el scroll y se sincroniza con `ScrollTrigger.update` en el ticker de GSAP.
- **Monitor**: `SolarDashboardScreen` se renderiza como HTML en la pantalla (Drei `<Html transform occlude>`) solo durante la sección de proyectos; el resto del tiempo muestra una textura de código ligera.

### Idiomas
- Contexto propio, sin librería. Idioma inicial: el guardado en `localStorage` o, si no hay, el del navegador (por defecto `es`).
- Al cambiar de idioma se actualizan `<html lang>`, `document.title` y la meta description.
- Los textos en inglés los redacta Claude y los revisa Miguel.

### Terminal (Ctrl+K)
- Panel flotante accesible (rol `dialog`, foco atrapado, Esc para cerrar), también se abre con un botón en la navbar.
- Comandos: `help`, `whoami`, `experience`, `projects`, `skills`, `contact` (copia el email), `cv` (descarga el CV del idioma activo), `lang es|en`, `goto <sección>`, `clear` y el easter egg `sudo hire-me`.
- `terminal/commands.js` es una función pura: `(input, context) → { output, effect }`.

### CV
- Se genera a partir de `data/*` con el primer puesto como **Web Developer @ Macrosad**.
- Dos PDFs estáticos (ES/EN) en `public/cv/`, con diseño limpio para imprimir y detalles de la paleta.
- Contacto en el CV: email, LinkedIn y Jaén (sin teléfono salvo que Miguel lo pida).
- Si cambian los datos, se regeneran con un script (`npm run cv`).

### Rendimiento
- El canvas 3D se carga en diferido (`React.lazy` + `Suspense`); el HTML y el preloader aparecen al instante.
- `useQualityTier`: detecta el dispositivo (núcleos, memoria, ancho de pantalla, `PerformanceMonitor` de Drei) → nivel `high` / `medium` / `low` / `static`. En `medium` se desactivan las sombras, en `low` se quita el bloom y se baja el DPR, y en `static` se muestra `desk-fallback.webp`.
- Imágenes: la foto nueva de Miguel (fondo blanco) → se le quita el fondo en local con `rembg` (se pedirá permiso antes de instalarlo) → recorte WebP/AVIF transparente de unos 150 KB con un ligero contorno de luz cian aplicado en CSS; captura de SolarMetrics optimizada. `foto-perfil.JPG` (3,9 MB) se elimina.
- `prefers-reduced-motion`: sin movimientos de cámara, sin animación automática de brazos (se ve el fotograma final), sin Lenis; solo fundidos.

### SEO y accesibilidad
- Meta description, Open Graph y Twitter card con `og-image.jpg`, favicon propio, `lang` dinámico.
- Enlaces de solo icono con `aria-label`, orden de encabezados correcto, foco visible, navegación por teclado completa.
- El canvas 3D es decorativo (`aria-hidden`).

## 6. Gestión de errores
- **Sin WebGL, contexto perdido o error en la escena**: un `ErrorBoundary` alrededor del canvas → `SceneFallback` (imagen estática). El resto de la web no se ve afectado.
- **La secuencia de brazos falla o tarda**: se muestra `portrait.webp` estático.
- **El portapapeles no está disponible**: se muestra el email seleccionable y se ofrece mailto.
- **Idioma guardado inválido**: se vuelve a `es`.

## 7. Pruebas
- **Unitarias (Vitest)**: parser y comandos de la terminal, cambio de idioma y persistencia, selección de `useQualityTier` según las capacidades simuladas, datos (todas las entradas tienen `es` y `en`).
- **Componentes (Testing Library)**: la terminal se abre con Ctrl+K y se cierra con Esc; copiar email muestra el aviso; `LanguageToggle` cambia los textos.
- **Manual/visual**: revisión en el navegador a 1440 px, 768 px y 375 px; modo de movimiento reducido; fallback sin WebGL.
- **Calidad**: `npm run lint`, `npm run build`, Lighthouse (rendimiento ≥ 80 escritorio, accesibilidad ≥ 95).

## 8. Correcciones de contenido
- Erratas: "trabajdor" → "trabajador", "Admninistrador" → "Administración", "mi mismo" → "mí mismo", "Sobre mi" → "Sobre mí", "Contactame" → "Contáctame".
- Notas: "9.7 / 9" → "9.7 / 10", "9.4 / 9" → "9.4 / 10".
- Experiencia ordenada de más reciente a más antigua.
- README real del proyecto (descripción, stack, scripts, cómo regenerar el CV).
- Limpieza de restos de la plantilla de Vite, imports sin usar y errores de lint.

## 9. Flujo de la animación de brazos (fase 3)
1. **Fotograma inicial** (Miguel, en Gemini/Nano Banana o ChatGPT) con la foto actual:
   > "Keep the exact same person, face, hair, shirt, white background, lighting, camera angle and framing. Only change the pose: arms relaxed and hanging naturally at his sides. Photorealistic, same resolution."
2. **Vídeo** (Miguel, Kling *Start & End Frames*): inicio = imagen generada, fin = foto actual.
   > "Static locked-off camera. The man calmly crosses his arms over his chest with a confident, professional attitude. Natural subtle movement, no camera motion, plain white background."

   Generar 3–4 versiones y elegir la de manos más naturales.
3. **Procesado** (Claude): extraer unos 50 fotogramas, quitar el fondo a cada uno, exportar a WebP con transparencia (unos 2–3 MB en total), carga progresiva y como póster el fotograma final (= foto actual).
4. **Reproducción**: `HeroPortrait` dibuja la secuencia en un `<canvas>` una vez tras el preloader; si falla o hay movimiento reducido, muestra el fotograma final.

## 10. Fases
1. **Base**: dependencias, tokens, datos, escena 3D completa con cámara por scroll, hero con foto estática recortada, todas las secciones, rendimiento, SEO, accesibilidad y correcciones de contenido.
2. **Extras**: idiomas ES/EN, terminal Ctrl+K, CVs en PDF ES/EN.
3. **Animación**: integrar la secuencia de brazos cuando Miguel entregue el MP4.

## 11. Material pendiente de Miguel
- Revisar los textos en inglés.
- (Fase 3) MP4 de la animación generado en Kling.
- (Opcional) Teléfono para el CV.
