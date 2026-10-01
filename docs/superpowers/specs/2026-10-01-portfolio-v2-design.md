# Portfolio v2 — diseño (contenido desde cero)

Fecha: 2026-10-01 · Rama: `portfolio-v2` (worktree, parte de `redesign-3d`) · Autoridad: este documento.
Investigación de apoyo: `docs/superpowers/research/2026-10-01-portfolio-content-research.md`.
Supera en contenido a `2026-09-30-portfolio-3d-redesign-design.md`; de aquel se conserva la dirección visual (escena 3D de escritorio, paleta "Midnight neon", movimiento) y la arquitectura de escena.

## 1. Intención

**Qué dijo Miguel**
- La web actual reutiliza su contenido de siempre; quiere pensarla **desde cero**. El diseño visual vale; el contenido no convence.
- Objetivo doble: **captar clientes freelance** y **marca personal** mostrando de lo que es capaz.
- Servicios: **webs para negocios, herramientas web personalizadas, apps móviles**. No Odoo como servicio.
- Sin disponibilidad publicada. Sin segmentar ("pymes y emprendedores"); el mensaje es *lo que puedo construir para ti*.
- Mensajes directos y detallados; animaciones más espectaculares.
- Contacto con **mini-brief guiado**, enviado vía **Vercel + Resend**. **Sin precios** y **sin pregunta de presupuesto**.
- Marca: **Lab de experimentos** y bloque **"Ahora mismo"**. Sin blog.
- Seenat no está terminado; se muestra como "en desarrollo". SolarMetrics fue un proyecto de fin de grado con datos simulados por una API propia; no tiene usuarios ni métricas de uso.
- No puede publicar trabajo de la empresa, pero sí describir qué hace en ella.

**Supuestos**
- Visitante tipo: alguien con una idea o necesidad (negocio, emprendedor, equipo) que llega por recomendación, LinkedIn o Google, y un perfil técnico/reclutador que llega por marca.
- Español por defecto; inglés en la fase D.

**Éxito**: en 30 s el visitante sabe qué le puede construir Miguel, ha visto una prueba creíble y tiene un camino evidente para contarle su proyecto; quien busca marca encuentra piezas que demuestran oficio (escena interactiva, Lab).

## 2. Principios de contenido

1. **Directo y concreto**: frases que nombran el resultado ("una web que te encuentran en Google"), no adjetivos ("experiencias únicas").
2. **Prueba sobre promesa**: cada servicio enlaza a un caso. Nada de porcentajes de habilidad ni bio genérica.
3. **Honestidad visible**: los proyectos llevan etiqueta (`Proyecto de fin de grado`, `En desarrollo`, `Proyecto demo`). No se inventan cifras; si no hay métrica real, se cuenta el reto y las decisiones.
4. **Contenido en HTML real**: todo texto vive en el DOM (indexable, accesible). La escena 3D acompaña y demuestra, nunca contiene información exclusiva.
5. **Todo texto en datos bilingües** `{ es, en }` desde el día uno, aunque el selector llegue en la fase D.

## 3. Mapa del sitio

| Ruta | Contenido |
|---|---|
| `/` | Hero → Servicios → Casos → Cómo trabajo → Quién soy → Lab (avance) → Ahora mismo → Brief → Pie |
| `/casos/solarmetrics` | Caso |
| `/casos/seenat` | Caso + diario de desarrollo |
| `/casos/peluqueria` | Hueco preparado (fase E); no se publica ni se enlaza hasta que exista |
| `/lab` | Experimentos (fase B) |
| `/privacidad`, `/aviso-legal` | Legal |
| `/api/brief` | Función serverless de Vercel |
| 404 | Página propia con vuelta al inicio |

Navegación: logo · Servicios · Casos · Cómo trabajo · Quién soy · Lab (solo desde la fase B) · botón **"Cuéntame tu proyecto"** (lleva al brief). En páginas de caso, los enlaces de sección vuelven a `/` con ancla.

## 4. Home, sección a sección

### 4.1 Hero — secuencia de preguntas

Secuencia de entrada tras la pantalla de carga; cada pregunta tiene su momento en la escena:

| Momento | Texto | Escena 3D |
|---|---|---|
| 1 | **¿Necesitas una web que te traiga clientes?** | Monitor principal: una web que se maqueta sola (pantalla `site-build`) |
| 2 | **¿Una herramienta que sustituya tus Excel?** | Monitor: panel con datos vivos (pantalla `dashboard`, ya existe) |
| 3 | **¿Una app que tus usuarios lleven en el bolsillo?** | Se enciende un **móvil** sobre la mesa con la interfaz de Seenat |
| 4 | **Te la construyo. A medida.** | La cámara se abre al escritorio completo; aparece el retrato (en la fase C, cruzando los brazos) |

- Animación de texto: palabra a palabra, revelado por máscara de abajo arriba, escalonado ~40 ms; salida con `blur` breve + opacidad. La frase 4 es la mayor, con un barrido de brillo neón que la recorre una sola vez.
- Duración total ≈ 6–7 s. **Saltable** con scroll, clic o tecla; en visitas posteriores de la misma sesión (`sessionStorage`) se empieza en el momento 4.
- Bajo la frase final:
  - Texto: *Soy Miguel Ángel, desarrollador web. Te ofrezco mis servicios para crear lo que tu proyecto necesite: una web, una herramienta personalizada o una app móvil, de la idea al lanzamiento.*
  - Línea de prueba (mono, pequeña): *Web Developer en Macrosad · Creador de Seenat y SolarMetrics*.
  - CTA principal **"Cuéntame tu proyecto"** (ancla al brief) · CTA secundario **"Ver casos"**.
  - (Fase B) botón terciario **"Explora mi escritorio"**.
- El nombre gigante en contorno queda como textura de fondo de baja presencia.
- Se eliminan: máquina de escribir de puestos, estadísticas (empresas, nota), indicador de disponibilidad.
- Reduced motion: las tres preguntas y la respuesta visibles a la vez, sin desplazamientos (solo fundido).
- Tier `static`: misma composición sobre el fondo CSS.

### 4.2 Servicios — "Lo que puedo construir para ti"

Sección fijada (pin) con tres tiempos ligados al scroll. Izquierda: mensaje grande; derecha: la escena enfoca la pieza correspondiente.

| | Mensaje | Qué incluye | Prueba |
|---|---|---|---|
| **01 · Tu web** | *Una web que se entiende en 5 segundos y que te encuentran en Google.* | Diseño a medida, móvil primero, velocidad, SEO, aviso legal y cookies. El dominio y el código son tuyos. | Demo peluquería (fase E; hasta entonces sin enlace) |
| **02 · Tu herramienta** | *Si lo haces a mano cada semana, se puede automatizar.* | Paneles, áreas de cliente, gestión interna, informes, conexiones entre sistemas. | SolarMetrics |
| **03 · Tu app** | *Tu idea, en el bolsillo de tus usuarios. iOS y Android a la vez.* | App Flutter, backend, login, notificaciones, privacidad desde el diseño. | Seenat |

- El número grande cambia con efecto contador; el mensaje entra por líneas; una barra fina indica el tiempo actual (1/3, 2/3, 3/3).
- Cámara: pose `service-web` (monitor), `service-tool` (monitor con panel), `service-app` (móvil).
- Móvil (<768 px) y reduced motion: sin pin; tres bloques apilados, cada uno con una imagen estática de la pieza.

### 4.3 Casos

En la home: tarjetas grandes (2 en fase A; 3 cuando exista la demo). Cada tarjeta: etiqueta honesta, nombre, frase de reto→resultado, **dato protagonista** (solo si es real), tecnologías, enlace al caso.

- **SolarMetrics** · *Herramienta a medida · Proyecto de fin de grado*
  - Frase: *De series de números en una base de datos a un panel que se entiende de un vistazo.*
  - Dato protagonista: ninguno numérico; se destaca *"API propia que simula una instalación fotovoltaica en tiempo real"*.
- **Seenat** · *App móvil · En desarrollo*
  - Frase: *Conecta con quien coincidiste esa noche, sin revelar nunca dónde estuviste.*
  - Datos reales: **158 pruebas automáticas en el backend · 0 coordenadas guardadas** (verificar antes de publicar contra el repo de Seenat).

Transición tarjeta → página de caso: la tarjeta se expande a la cabecera del caso (transición compartida ~400 ms, `--ease-in-out`). Con reduced motion: fundido.

### 4.4 Cómo trabajo

| Paso | Titular | Detalle |
|---|---|---|
| 01 | **Me cuentas tu idea** | Aunque no sepas cómo se llama lo que necesitas. Rellenas el mini-brief y te respondo en menos de 48 h. |
| 02 | **Propuesta por escrito** | Alcance, plazos y precio cerrado antes de empezar. Sin letra pequeña. |
| 03 | **Lo construimos juntos** | Entregas por fases y un enlace donde ves el avance cada semana. |
| 04 | **Lanzamiento y después** | El código, el dominio y las cuentas son tuyos. 30 días de soporte incluidos tras el lanzamiento. |

- Una línea neón se dibuja con el scroll uniendo los pasos; cada número se enciende al llegar la línea; su texto entra justo después. La escena se atenúa.
- Reduced motion: línea completa y pasos visibles.

### 4.5 Quién soy

- Gancho: **Empecé arreglando ordenadores. Ahora construyo el software que funciona en ellos.**
- Texto: *Pasé por soporte técnico, después por ERP con Odoo y hoy desarrollo herramientas web en Macrosad. Por eso entiendo tanto la tecnología como a la persona que la usa cada día. Me desenvuelvo bien cuando aparecen problemas: es la parte que más disfruto. Soy de Jaén y trabajo con quien sea, esté donde esté.*
  - Sobre Macrosad solo se describe qué hace Miguel; nunca capturas, nombres de herramientas internas ni datos.
- Trayectoria: línea horizontal de 4 paradas (Mecaofi → Grupo Avanza → Intelec → Macrosad); cada parada muestra puesto y fechas al pasar/tocar/enfocar. Datos de `experience.js`.
- Formación en una línea: *Doble titulación ASIR + DAM · nota media 9,7*.
- "Con qué trabajo": cinta de tecnologías existente (sin porcentajes).
- (Fase D) enlace secundario "Descargar CV".
- Animación: el texto se "lee solo" — cada palabra pasa de opacidad 0.15 a 1 ligada al scroll; las paradas se encienden en cadena. Reduced motion: texto opaco.
- Se eliminan las secciones Experiencia y Educación y la bio anterior.

### 4.6 Lab (avance)

Fase B. En fase A la sección no se renderiza.
Avance: 3 tarjetas en carrusel arrastrable con inercia (momentum, sin umbral rígido; captura de puntero), enlace a `/lab`.

### 4.7 Ahora mismo

Bloque pequeño con fecha visible; datos en `src/data/now.js`:

> **Ahora mismo** · actualizado octubre 2026
> **Construyendo:** herramientas internas en mi trabajo y Seenat, mi app en Flutter.
> **Aprendiendo:** a diseñar interfaces con más oficio.
> **Me gusta:** los problemas difíciles; ahí es donde más aprendo.

Si la fecha tiene más de 120 días, el test de datos falla para recordar actualizarlo.

### 4.8 Brief — "Cuéntame tu proyecto"

Formulario guiado de 4 pasos:

| Paso | Pregunta | Entrada |
|---|---|---|
| 1 | ¿Qué quieres construir? | 4 tarjetas: Una web · Una herramienta · Una app · Aún no lo sé (obligatorio) |
| 2 | Cuéntame un poco más | Texto libre (20–2000 caracteres) con pista según el paso 1; etiquetas rápidas opcionales según tipo (p. ej. web: *Ya tengo web y quiero renovarla*, *Necesito reservas*, *Necesito tienda online*) |
| 3 | ¿Para cuándo? | Lo antes posible · En 1–3 meses · Sin prisa (obligatorio) |
| 4 | ¿Cómo te contacto? | Nombre (obligatorio), email (obligatorio, validado), teléfono (opcional), casilla de privacidad (obligatoria, enlace a `/privacidad`) |

- Éxito: *Recibido, [nombre]. Te respondo en menos de 48 h.* + resumen de lo enviado.
- Animación: pasos que se deslizan en horizontal (≈250 ms, `--ease-out`), barra de progreso neón, tarjetas con `scale(0.97)` al pulsar y brillo al seleccionar, errores junto al campo (sin sacudidas), éxito con un único destello y check que se dibuja.
- Teclado: Enter avanza, foco gestionado al cambiar de paso, anuncios con `aria-live`.
- Borrador en `sessionStorage` (try/catch); se borra al enviar con éxito.
- Error de red/servidor: se conservan los datos, botón **Reintentar** y alternativa *o escríbeme a [email]*.
- Antispam: campo trampa oculto + tiempo mínimo de 3 s desde que se abre el paso 1 hasta el envío.
- Junto al brief: copiar email, LinkedIn, GitHub (componentes existentes).

### 4.9 Pie

© año · nombre · enlaces a Privacidad, Aviso legal, GitHub, LinkedIn · "Hecho con React y Three.js".

## 5. Páginas de caso

Plantilla común `CaseStudy` alimentada por `src/data/cases/*.js`:

1. Cabecera: etiqueta, nombre, frase, tecnologías, enlaces (demo / código cuando existan).
2. **El reto**
3. **Qué construí**
4. **Decisiones clave** (3–5, cada una: decisión + por qué)
5. **Resultado** (cifras solo reales; si no hay, qué se consiguió)
6. **Qué haría distinto / siguiente paso**
7. CTA final: *¿Tienes algo parecido en mente?* → brief.

Contenido:
- **SolarMetrics**: reto (los datos de una instalación solo existen como series numéricas), qué construyó (API propia que genera mediciones simuladas → InfluxDB → frontend React con login, roles, gestión de usuarios y dispositivos, gráficas por inversor), decisiones (InfluxDB para series temporales, API simuladora para poder desarrollar sin hardware, gestión de usuarios), resultado (proyecto de fin de grado entregado; nota si Miguel la confirma), imágenes: `DashboardPreview` animado existente + capturas del proyecto local cuando se generen.
- **Seenat**: reto (compartir Instagram con quien coincidiste sin exponer ubicaciones), qué está construyendo (Flutter + Supabase; presencia por evento o "burbuja" de 200 m; verificación con selfie e Instagram; QR de evento), decisiones de privacidad (no se guardan coordenadas; acceso solo por funciones RPC con RLS; nombres de lugar ocultos con menos de 5 personas; límites de solicitudes), resultado actual (backend con pruebas pgTAP; app en construcción). **Diario de desarrollo**: lista de entradas fechadas en `src/data/cases/seenat.js` (fecha + 1–3 frases). Imágenes: ilustraciones/diagramas propios (flujo de privacidad) y la interfaz del móvil 3D; capturas reales cuando Miguel las tenga.
- Todo dato de Seenat se verifica contra su repositorio antes de publicar.

## 6. Escena 3D

Se reutiliza la arquitectura de `redesign-3d`: lienzo fijo perezoso, `CameraRig` con poses por sección, niveles de calidad, `SceneErrorBoundary`, `SceneFallback` CSS, pérdida de contexto WebGL → `static`, pantallas como `CanvasTexture` con funciones de dibujo puras.

Cambios:
- **Lienzo persistente entre rutas** (montado en el layout raíz); poses nuevas: `hero-q1..q4`, `service-web`, `service-tool`, `service-app`, `process` (atenuado), `about`, `case` (atenuado), `brief`.
- La pose ya no depende solo de la sección visible: un estado `sceneCue` en el store (puesto por la secuencia del hero y por el pin de servicios) tiene prioridad sobre la sección.
- Props nuevos: **móvil** (pantalla `seenat` dibujada en canvas: tarjeta de evento, burbuja, botón Instagram, todo ficticio) y **libreta**.
- Pantallas nuevas: `site-build` (una web que se maqueta: bloques que aparecen, texto que se escribe) y `seenat`.
- Con reduced motion: pantallas estáticas (fotograma completo), cámara salta sin vuelo.
- (Fase B) **Modo explorar**: ver §8.

## 7. Movimiento

Basado en los principios de Emil Kowalski.
- Tokens: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`; duraciones `--dur-press: 140ms`, `--dur-ui: 220ms`, `--dur-panel: 400ms`.
- Interfaz < 300 ms; solo secuencias de presentación (hero, cámara, transiciones de caso) pueden durar más.
- GSAP + ScrollTrigger para todo lo ligado a scroll y pins; transiciones CSS para interfaz (interrumpibles); nada sale de `scale(0)` (mínimo 0.95 + opacidad).
- Solo `transform`, `opacity`, `clip-path` y `filter` (blur ≤ 8px) se animan.
- Hover detrás de `@media (hover: hover) and (pointer: fine)`; `:active` con `scale(0.97)` en todo lo pulsable.
- Escalonados 30–60 ms; nunca bloquean la interacción.
- Acciones de teclado sin animación.
- Reduced motion: se mantienen fundidos y cambios de color; se eliminan desplazamientos, pins, vuelos de cámara y lectura ligada al scroll.

## 8. Fase B — marca

### 8.1 Modo "Explora mi escritorio"
- Entrada: botón en el hero o tecla `E` (fuera de campos de texto). El texto HTML se aparta; órbita limitada (±25° horizontal, ±10° vertical); cada objeto con un punto que late y etiqueta al pasar.
- Objetos → panel: Monitor → casos · Móvil → Seenat + diario · Libreta → cómo trabajo (resumen) · Taza → ahora mismo · Torre → "Cómo está hecha esta web" · Lámpara → luz (existente) · Teclado → terminal (fase D; hasta entonces no interactivo).
- Vuelo de cámara ≈ 900 ms `--ease-in-out`; panel entra desde el lado del objeto (`scale(0.96)` + opacidad, origen hacia el objeto). `Esc` / "Volver" restauran.
- Accesible: lista de botones reales en el DOM (un botón por objeto, orden lógico, `aria-controls` al panel); foco atrapado en el panel abierto y devuelto al cerrar; reduced motion = corte de cámara; táctil = tocar o deslizar entre objetos; tier `static`/`low` = botón oculto.
- Eventos 3D ignoran clics que caen sobre contenido HTML (corrige la incidencia conocida de la lámpara).

### 8.2 `/lab`
- Datos en `src/data/lab.js`: `{ slug, title, summary, demonstrates, preview (vídeo/loop o componente), demoUrl?, codeUrl?, date }`.
- Contenido inicial: **Cómo está hecha esta web** (escena, Lighthouse, peso, accesibilidad, respaldos), **El retrato que cruza los brazos** (fase C; antes, oculto), **Pantallas vivas** (canvas sobre 3D), **Microinteracciones** (magnéticos, inclinación, foco).
- Tarjetas con vista previa en movimiento al hover (solo puntero fino; en táctil, al entrar en pantalla) y estática con reduced motion.

## 9. Arquitectura técnica

- **Vite + React 19 + React Router 7 (modo framework) con `prerender`** de todas las rutas públicas → HTML estático por ruta, hidratación en cliente. `ssr: false` en ejecución; el prerender produce el HTML en build.
  - El código three.js sigue fuera del chunk principal (carga perezosa) y nunca se ejecuta en prerender (guardas `typeof window`).
- Layout raíz: `SceneLayer` + `Navbar` + `<Outlet/>` + `Footer`; preloader solo en la primera carga.
- SEO por ruta (`meta` export de React Router): título, descripción, canonical con `VITE_SITE_URL`, OG/Twitter, imagen OG por caso. `sitemap.xml` generado en build desde la lista de rutas; `robots.txt` lo referencia. JSON-LD `Person` + `ProfessionalService` en `/`.
- **`/api/brief`** (Vercel Function, Node):
  - Valida con el **mismo esquema** que el cliente (`src/lib/briefSchema.js`, sin dependencias de UI).
  - Rechaza: trampa rellena, envío < 3 s, cuerpo > 10 KB, método ≠ POST.
  - Límite simple por IP (5/h, en memoria por instancia; aceptado como best-effort).
  - Envía con Resend a `BRIEF_TO_EMAIL`, `reply_to` = email del cliente, asunto `Nuevo brief: <tipo> — <nombre>`; texto plano y HTML simple, con escape de todo input.
  - Variables: `RESEND_API_KEY`, `BRIEF_TO_EMAIL`, `BRIEF_FROM_EMAIL` (por defecto `onboarding@resend.dev` hasta verificar dominio).
  - Respuestas: `200 {ok:true}` · `400 {error:'invalid', fields}` · `429` · `500 {error:'send_failed'}`. Nunca devuelve detalles internos.
- Datos: `src/data/{profile,services,cases/*,process,experience,now,lab}.js` bilingües; `strings.js` para UI.
- Se eliminan: `Experience`, `Education`, `Projects` (sustituido por `Cases`), `About` (sustituido por `WhoAmI`), `Contact` (sustituido por `Brief`), `HeroPortrait` se conserva, `Typewriter` deja de usarse en el hero.
- Legal: `/privacidad` (responsable, finalidad: responder al brief; base: consentimiento; conservación: 12 meses; destinatario: Resend como encargado; derechos y contacto) y `/aviso-legal` (LSSI: titular, contacto, condiciones). Redactados como base; **Miguel debe revisarlos**.

## 10. Calidad

- Vitest: datos (bilingües completos, rutas únicas, fecha de "ahora mismo" < 120 días), `briefSchema` (casos válidos/ inválidos), handler de `/api/brief` con Resend simulado (200/400/429/500, escape HTML, trampa, tiempo), componentes (hero saltable y estado de sesión, brief: navegación, validación, borrador, error y reintento; servicios en modo apilado; caso).
- **Playwright** (nuevo): `/` carga y muestra el hero final con `?scene=static`; flujo completo del brief contra `/api/brief` simulado; cada ruta prerenderizada responde con su `<title>`; navegación por teclado del brief.
- Lighthouse escritorio en `/` y un caso: rendimiento ≥ 90, accesibilidad 100, SEO 100, buenas prácticas 100.
- Contraste AA en todo texto sobre la escena.
- Comprobación visual a 1440, 1024, 768 y 375 px, `?scene=static` y reduced motion.

## 11. Fases

| Fase | Alcance | Plan |
|---|---|---|
| **A · Núcleo para clientes** | §3–§7 y §9–§10 salvo Lab y modo explorar: rutas + prerender, hero secuencia, servicios con pin, casos (home + 2 páginas), cómo trabajo, quién soy, ahora mismo, brief + `/api/brief`, legal, SEO, 404, props móvil y libreta, pantallas `site-build` y `seenat` | Primer plan |
| **B · Marca** | §8: modo explorar, `/lab`, avance de Lab en la home, "Cómo está hecha esta web" | Plan propio |
| **C · Retrato** | Secuencia de brazos cruzados desde el vídeo de Kling (WebP con transparencia sobre canvas) + entrada en el Lab | Plan propio |
| **D · Extras** | Selector ES/EN con rutas `/en/...`, terminal Ctrl+K, CV PDF ES/EN generado desde los datos | Plan propio |
| **E · Demo peluquería** | Proyecto aparte (repo propio): web de peluquería ficticia con reservas, recordatorios y panel; al terminar, su caso `/casos/peluqueria` y el enlace del servicio 01 | Spec propio |

## 12. Pendiente de Miguel (no bloquea la fase A)

1. Cuenta de Resend y variables en Vercel (se le darán los pasos al llegar al brief).
2. Revisar textos legales.
3. Confirmar que su contrato con Macrosad no impide trabajar como freelance (cláusula de exclusividad) antes de publicar.
4. Capturas de Seenat cuando existan; nota del proyecto de fin de grado si quiere mostrarla.
5. Validar las cifras "48 h" y "30 días" (asumidas como aceptadas).

## 13. Fuera de alcance

Blog/notas, precios o paquetes, presupuesto en el brief, disponibilidad publicada, testimonios (no existen aún), newsletter, analítica con cookies (si se añade analítica, sin cookies).
