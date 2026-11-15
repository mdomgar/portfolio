# Portfolio "show" — diseño

Fecha: 2026-11-15 · Rama de partida: `redesign-3d` · Sustituye en contenido y aspecto a `2026-10-01-portfolio-v2-design.md`.
Prueba de estilo aprobada (desechable, no se reutiliza su código): `.superpowers/spike/show/index.html`.

## 1. Intención

**Lo que dijo Miguel**
- La web ya no es para captar clientes freelance. Es para **enseñar a su red a qué se dedica, su experiencia y de qué es capaz**.
- En primer plano: **es web developer / programador y quiere seguir trabajando de eso**.
- Quiere una web **de espectáculo**: mucha animación ligada al scroll, impresionante, con ilustración. Le gustan como referencia Quang Dinh y Tom de Koning ("no igual, pero algo así").
- Aprobó la línea de la prueba "show en cuatro actos" y pidió **más impacto y más animación**.
- Hay **Blender** disponible (5.2, `C:\Program Files\Blender Foundation\Blender 5.2`) para una pieza 3D "tipo el portfolio del ordenador antiguo".
- Proyectos: **solo SolarMetrics**. Vulcania puede aparecer como "en construcción", sin enseñar de más. Seenat sale.
- Se puede partir de cero.

**Supuestos de Claude (Miguel no los ha confirmado)**
- "Mi red" = contactos de LinkedIn, compañeros y reclutadores. Tras ver la web deben saber qué hace y poder escribirle por LinkedIn o email.
- La "pieza tipo Windows XP" se interpreta como: un ordenador antiguo en 3D que protagoniza la apertura y en cuya pantalla se entra con el scroll.

**Éxito**: en la primera pantalla se lee "Miguel Ángel, web developer"; al terminar el scroll el visitante ha visto la trayectoria, un proyecto real y cómo contactar, y recuerda la web por la apertura y los actos.

## 2. Metas, no-metas y anti-metas

- **Metas**: identidad de web developer en primer plano; espectáculo de scroll memorable; trayectoria legible (puesto, empresa, fechas, qué hizo); SolarMetrics como prueba; contacto directo.
- **No-metas**: servicios, proceso de trabajo, formulario de brief, precios, blog, Lab, selector de idioma visible, modo "explorar".
- **Anti-metas** (sería un fracaso aunque funcione):
  - Texto que no se lee porque algo se mueve o se cruza detrás.
  - Que en móvil o con "reducir movimiento" falte contenido.
  - Que el espectáculo retrase saber quién es: nombre y puesto visibles en menos de 2 s tras la carga.
  - Cifras o logros inventados.

## 3. Restricciones

- Mismo stack: Vite, React 19, React Router 7 en modo framework con prerender estático, GSAP + ScrollTrigger, Lenis. Despliegue en Vercel.
- Todo el texto en HTML real y en `src/data/` con forma `{ es, en }`. Se muestra español.
- Sobre Macrosad solo se describe qué hace Miguel; nada de capturas, nombres de herramientas internas ni datos.
- Vulcania es el proyecto de un cliente: solo nombre, tipo ("tienda online"), estado y, como mucho, una imagen recortada. Sin enlace, sin catálogo, sin precios.
- Accesibilidad AA en contraste; navegación por teclado; `prefers-reduced-motion` respetado.
- Rendimiento: la secuencia 3D no bloquea el primer pintado; se carga de forma progresiva.

## 4. Enfoques considerados

| Enfoque | Qué es | A favor | En contra |
|---|---|---|---|
| A · Cuaderno de taller | Fondo claro, ilustración a tinta, sobrio | Legible, propio | Miguel lo vio "simplón" |
| B · Escritorio de sistema | La web como un ordenador con ventanas | Muy recordable | Mal en móvil; obliga a explorar para leer |
| C · Lo actual corregido | Oscuro + escena 3D en tiempo real | Barato | Estilo muy visto; el texto pelea con la escena |
| **D · Show en actos (elegido)** | Tipografía gigante, color plano por acto, objeto ilustrado que se transforma, todo ligado al scroll | Espectáculo con contenido legible; viable con GSAP | Depende de la calidad de ilustración y del 3D |

Miguel eligió D ("mezcla 1 + 2" de las referencias) y luego pidió subir el impacto. Para eso se añade una **apertura 3D pre-renderizada con Blender**, en lugar de 3D en tiempo real: impresiona igual, pesa menos y no necesita three.js en el navegador.

## 5. Lenguaje visual

- **Color**: tinta `#121212` sobre fondos planos y saturados, uno por bloque. Punto de partida (la prueba): crema `#f1eadd`, naranja `#ff6b2c`, verde `#35d691`, lila `#b78cff`, lima `#e4f23a`, blanco roto `#fffdf8` para rellenos. El constructor puede ajustar tonos manteniendo contraste AA de la tinta sobre cada fondo. El fondo crema de la apertura queda a revisión: si se cambia, que sea por otro color plano con carácter, no por gris ni negro.
- **Tipografía**: Clash Display 600/700 para titulares y palabras gigantes; Inter para texto; JetBrains Mono para etiquetas cortas en mayúsculas. Ya están auto-alojadas en `public/fonts/`.
- **Ilustración**: línea de tinta gruesa y uniforme, extremos redondeados, rellenos blanco roto, sin degradados ni sombras. Objetos de informática dibujados de frente.
- **3D**: mismo lenguaje. Render de Blender con sombreado plano (sin luces realistas) y contorno negro, para que el 3D parezca la ilustración en movimiento y no una foto.
- **Movimiento**: todo lo grande va ligado al scroll (scrub) y es reversible. Entradas con curvas tipo `expo.out` / `power3.inOut`. Nada parpadea ni late de adorno salvo detalles dentro de las ilustraciones (ventilador, LED, cursor).

## 6. Estructura de la home

Una sola página larga. Orden:

### 6.1 Apertura — "Web developer"
- Primera pantalla: nombre gigante **MIGUEL ÁNGEL**, y a la misma altura visual el puesto **Web developer**. Línea de apoyo: lugar (Jaén) y empresa actual (Macrosad).
- Frase principal (a pulir, ver §8): *"Programo webs y herramientas que la gente usa cada día. Es lo que hago y lo que quiero seguir haciendo."*
- Protagonista: un **ordenador antiguo en 3D** (torre + monitor de tubo), renderizado con Blender.
- Con el scroll (sección fijada): el ordenador gira y la cámara **entra en la pantalla del monitor**. La pantalla llena la ventana y se convierte en el fondo de la siguiente sección. Mientras, el nombre se aparta.
- Técnica: secuencia de fotogramas pre-renderizados pintada en un `<canvas>` y recorrida con el scroll. Ver §7.

### 6.2 Qué hago hoy
- Dentro de "la pantalla": bloque sobre lo que sabe hacer como web developer. Titular gigante y 3–4 capacidades, **cada una con su prueba entre paréntesis o debajo** (de dónde sale). Fuentes permitidas: `experience.js` (todos los puestos), el caso SolarMetrics y `skills.js`. Ejemplos válidos con los datos de hoy: aplicaciones con React y Node.js (Macrosad), APIs propias con Java y Spring Boot (Intelec, SolarMetrics), paneles de datos (SolarMetrics), servidores y redes (Grupo Avanza). *(Decisión de Claude.)* Si Miguel aporta su texto de Macrosad, se añade aquí.
- Animación: las líneas se "escriben" o entran una a una con el scroll; cinta de tecnologías en movimiento horizontal.

### 6.3 Cómo llegué aquí — cuatro actos
- Sección fijada como en la prueba: palabra gigante por acto, color de fondo que entra como un círculo que se abre, objeto ilustrado que se transforma, ficha con puesto, empresa, fechas y 1–2 frases.
- Actos y orden: **Taller** (Mecaofi) → **Servidores** (Grupo Avanza) → **ERP** (Intelec) → **Código** (Macrosad). El último acto es el clímax y enlaza con "es lo que quiero seguir haciendo".
- El orden es **temático (del hardware al código), no cronológico estricto**: Grupo Avanza empezó antes que Mecaofi y su segundo periodo se solapa con Intelec. Por eso la sección no se titula ni se numera como línea de tiempo ("De arreglar ordenadores a programarlos", "Acto 01"), y cada ficha muestra sus fechas reales. *(Decisión de Claude, pendiente de confirmar con Miguel.)*
- Mejoras sobre la prueba: transformación del objeto más rica (las piezas se reordenan, no solo aparecen), la palabra gigante con más juego (entra, se desliza, sale), detalles vivos en cada ilustración, y una transición de salida hacia Proyectos.

### 6.4 Proyectos
- **SolarMetrics** a pantalla casi completa: nombre gigante, frase, vista previa animada del panel, tecnologías, enlaces a demo y código, enlace a su página de caso.
- **Vulcania**: fila o tarjeta "En construcción" con nombre, "Tienda online para una tienda de juegos de mesa de Jaén" y estado. Sin enlace.

### 6.5 Formación y stack
- Una línea de formación (doble titulación ASIR + DAM, nota media 9,7) y las tecnologías agrupadas. Breve.

### 6.6 Cierre y contacto
- Titular gigante de cierre y tres acciones: copiar email, LinkedIn, GitHub. Sin formulario.
- Pie: © año, nombre, aviso legal.

### 6.7 Navegación
- Barra mínima fija: nombre corto a la izquierda, a la derecha "Trayectoria", "Proyectos", "Contacto". En móvil, solo "Contacto".

## 7. Apertura 3D con Blender

- **Modelo**: torre beige y monitor de tubo, formas simples (cajas biseladas), con detalles reconocibles: disquetera, rejilla, botón de encendido, teclado. Se modela con un script de Python de Blender guardado en el repo (`scripts/blender/`), para poder regenerarlo.
- **Render**: sombreado plano + contorno (Freestyle o equivalente), fondo transparente o del color de la apertura. Sin marcas ni logos reales.
- **Animación**: 1) giro suave del conjunto, 2) la cámara avanza hacia el monitor, 3) la pantalla llena el encuadre.
- **Salida**: secuencia de imágenes WebP. Objetivo: unos 90–120 fotogramas a ~1600 px de ancho para escritorio y una versión reducida (menos fotogramas, ~800 px) para móvil. Peso total objetivo: ≤ 4 MB escritorio, ≤ 1,5 MB móvil. Va en `public/seq/`.
- **Carga**: el primer fotograma es una imagen normal visible al instante; el resto se precarga en segundo plano; el scroll usa el fotograma más cercano ya cargado.
- **Encaje con la sección siguiente**: la pantalla del monitor se renderiza como un color plano único (el fondo de §6.2), sin contenido dibujado; el CSS de §6.2 usa ese mismo color. Si la paleta cambia, se vuelve a renderizar.
- **Móvil**: la misma coreografía con un segundo render en encuadre vertical (parámetro del script), no un recorte del de escritorio.
- **Respaldos**: con "reducir movimiento" o si la secuencia falla, se muestra el primer fotograma fijo y la página sigue normal. Sin JavaScript, igual.
- **Si el 3D no alcanza la calidad** del resto tras dos rondas de revisión, se sustituye por la ilustración SVG del ordenador con la misma coreografía (zoom a la pantalla). Esto lo decide Claude en la revisión y se lo dice a Miguel. La versión SVG solo se construye si hace falta, no en paralelo.

## 8. Contenido

- Los textos definitivos los redacta el constructor a partir de `src/data/experience.js` y `src/data/profile.js`, en el tono del gancho que ya funciona ("Empecé arreglando ordenadores. Ahora construyo el software que funciona en ellos."), que se conserva.
- **No se inventa nada**: ni cifras, ni logros, ni responsabilidades que no estén en los datos. Si falta material para un acto, la ficha queda corta.
- Fechas de Grupo Avanza: dos periodos reales (marzo–junio 2023 y marzo–agosto 2024); se muestran completos.
- **Pendiente de Miguel** (no bloquea): ampliar con sus palabras qué hace en Macrosad (hoy solo hay dos frases genéricas) y revisar todos los textos antes de publicar.

## 9. Qué se reutiliza y qué se quita

**Se conserva**: React Router + prerender, generación de sitemap/robots/404, SEO por ruta (`src/lib/seo.js`, `src/data/seo.js`), fuentes, `src/data/experience.js`, `src/data/skills.js`, `src/data/cases/solarmetrics.js`, la página de caso de SolarMetrics (re-estilizada al nuevo lenguaje), `CopyEmailButton`, `useReducedMotion`, `useMediaQuery`, `lib/gsap.js`, Lenis, la vista previa dibujada del panel (`ScreenPreview` / pantalla `dashboard`) si se puede extraer sin three.js.

**Se elimina**: toda la escena 3D en tiempo real (`src/scene/`, dependencias `three`, `@react-three/*`, `postprocessing`, `zustand` si queda sin uso), Hero de preguntas, Services, Process, Now, Brief y todo `/api/brief` (`api/`, `server/`, `src/lib/brief*`, `src/data/brief.js`, dependencia `resend`), el caso Seenat y su ruta, la página de privacidad (ya no se recogen datos), los tests de lo eliminado.

**SEO y restos** *(decisiones de Claude)*: se regenera la imagen para redes (`scripts/og-images.js`) y se reescriben título y descripción al nuevo enfoque; se borran `og-seenat.jpg` y las entradas SEO de Seenat; `/casos/seenat` y `/privacidad` redirigen a `/` en `vercel.json`. Los textos nuevos se escriben también en inglés para mantener los datos `{ es, en }` completos. Vulcania va solo con texto, sin imagen.

**Se adapta**: aviso legal (se mantiene, sin referencias al formulario), `README.md`, `src/data/site.js` (rutas: `/`, `/casos/solarmetrics`, `/aviso-legal`, 404), tests de datos y e2e.

## 10. Calidad

- Vitest para datos (bilingües completos, rutas) y componentes con lógica; Playwright: la home carga, cada ruta responde con su título, sin errores de consola ni desbordamiento horizontal a 1440 y 375 px, y con `prefers-reduced-motion` todo el contenido es visible.
- Revisión visual con capturas a 1440, 1024, 768 y 375 px en cada fase.
- `npm run lint`, `npm test` y `npm run build` en verde antes de dar una fase por buena.

## 11. Cómo se construye (reparto)

- **Claude (esta sesión)**: dirección, plan, coordinación y aceptación final.
- **Sonnet**: piezas visuales y de animación (apertura, actos, ilustraciones, script de Blender, proyectos).
- **Haiku**: trabajo mecánico (borrar lo que sobra, datos, rutas, tests, README).
- **Opus**: revisión de cada fase contra este documento y las capturas.
- Trabajo en una rama nueva desde `redesign-3d`. No se hace commit ni push sin que Miguel lo pida.

Fases previstas (el plan las detalla): 1) limpieza y esqueleto nuevo · 2) lenguaje visual y secciones estáticas con contenido · 3) actos · 4) apertura 3D · 5) proyectos, cierre y pulido · 6) revisión final.

## 12. Queda a criterio del constructor

Nombres de componentes y archivos, estructura de CSS, valores exactos de curvas y duraciones, composición fina de cada ilustración, número exacto de fotogramas dentro de los objetivos de peso, redacción final de los textos dentro de las reglas de §8.

## 13. Fuera de alcance

Demo pública de Vulcania, versión en inglés visible, CV descargable, analítica, dominio propio, publicar la web.
