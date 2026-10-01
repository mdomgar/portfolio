# Investigación de contenido para el portfolio de Miguel Ángel Domínguez García

Fecha: 2026-10-01. Investigación de solo lectura (web). La dirección visual (escena 3D "dev desk", paleta midnight neon, motion) se da por decidida; este documento se centra en el CONTENIDO: qué decir, qué secciones, cómo demostrarlo y qué producir.

Objetivos de Miguel: (1) captar clientes freelance (pymes/startups, mercado español primero, sitio ES/EN) y (2) construir marca personal.

Convención de fiabilidad: lo que viene de una fuente lleva su URL. Lo marcado como **[inferencia]** es mi recomendación, no un hecho citado.

---

## 0. Resumen ejecutivo (lo más importante)

1. **Un portfolio con doble objetivo necesita una "puerta delantera" para clientes y una "puerta trasera" para marca.** Los portfolios que mejor lo hacen separan claramente: la home responde en 30 segundos a "¿puede esta persona resolver mi problema?" y el resto (laboratorio, notas, now, uses) construye identidad sin estorbar la conversión. Un estudio de portfolios cita que clientes y reclutas dedican unos 30 segundos antes de decidir si siguen leyendo ([templifica](https://templifica.com/blog/how-to-build-a-developer-portfolio-that-actually-gets-you-hired)).
2. **El mayor hueco de Miguel es la prueba, no el diseño.** Con poca cartera de clientes, la prueba debe venir de: 2–3 casos de estudio con estructura problema → enfoque → resultado (aunque sean proyectos propios o "clientes simulados" bien etiquetados), SolarMetrics bien contado, métricas medibles (Lighthouse, tiempos, horas ahorradas), código abierto y un trabajo real en Macrosad descrito sin romper confidencialidad.
3. **Con una escena 3D inmersiva el riesgo principal es ocultar el contenido.** Bruno Simon puede permitírselo porque su producto ES la experiencia ([Twine](https://www.twine.net/blog/best-freelance-developer-portfolio-examples/)); Miguel necesita además una versión escaneable (HTML real, accesible, con SEO) con propuesta de valor, servicios y contacto. Sugerencia: la escena es el "hero + prueba de habilidad", pero el contenido vive en HTML normal debajo/alrededor y todo es alcanzable sin 3D. **[inferencia]**
4. **El mercado español de pymes se vende por resultados concretos, claridad y cercanía** (llamada/WhatsApp, precio orientativo, proceso, mantenimiento, "el código es tuyo"). Los freelances españoles que más se acercan a eso (David Barreiro, Carlos Torija, el repositorio Portfolio-2026 de EloRC4) lo hacen con: proceso en pasos, post-venta explícito, propiedad del código, FAQ y respuesta en 24 h. Ver sección 1.
5. **Recomendación de IA:** Hero con propuesta de valor → Servicios (3 ofertas definidas) → Casos/Proyectos (3 tarjetas fuertes con métricas) → Proceso → Quién soy (historia corta con gancho) → Laboratorio (demos/experimentos) → Notas (escribir poco pero bien) → Precios orientativos + FAQ → Contacto con CTA doble (llamada de 20 min / email/WhatsApp) + señal de disponibilidad. Páginas secundarias: /now, /uses. Detalle en sección 5.

---

## 1. Portfolios y sitios de referencia (21)

Verificados con lectura directa de la página salvo indicación. Se anota el CONTENIDO destacable, no lo visual.

### 1.1 Referentes internacionales (marca personal + contenido)

| # | Quién / URL | Lo notable en contenido |
|---|---|---|
| 1 | Brittany Chiang, https://brittanychiang.com | Estructura mínima: About → Experiencia → Proyectos destacados → Escritura. Titular que describe el valor ("pixel-perfect, accessible") sin florituras. Proyectos con cifras de adopción (p. ej. instalaciones) y enlace a archivo completo. Twine la cita como ejemplo de mostrar mucha trayectoria sin abrumar ([Twine](https://www.twine.net/blog/best-freelance-developer-portfolio-examples/)). Es más "buscar empleo" que "captar clientes". |
| 2 | Josh W. Comeau, https://www.joshwcomeau.com | Autoridad por contenido educativo: artículos interactivos, "más populares" como prueba social, newsletter a mitad de página, cursos como producto. La prueba de habilidad es el propio contenido. |
| 3 | Bruno Simon, https://bruno-simon.com | Portfolio-juego. Secciones secundarias de comunidad ("logros", "mensajes de visitantes"), un "Behind the scene" que documenta el stack y recursos abiertos (curso, devlog, repo). Convierte el portfolio en un caso de estudio técnico de sí mismo. Muy relevante para una escena 3D. |
| 4 | Rauno Freiberg, https://rauno.me | Manifiesto corto en lugar de bio, archivo de versiones anuales del sitio (iteración visible), "Craft" como sección de piezas de interacción pequeñas. Menos texto, más piezas. |
| 5 | Emil Kowalski, https://emilkowal.ski | Posicionamiento claro ("diseñar con criterio la UI") respaldado por componentes open source con nombre (Sonner, Vaul), cursos y artículos agrupados en 3 temas. Un solo mensaje repetido. |
| 6 | Lee Robinson, https://leerob.com | Contenido sobre diseño: bio breve con credenciales, "notas" por temas, blog cronológico, detalles personales (familia, música) para humanizar. Demuestra que un portfolio puede ser casi solo texto con buenas cosas dentro. |
| 7 | Paco Coursey, https://paco.me | Proyectos open source con identidad (⌘K, next-themes), página "Now" con valores personales, playlists. Credibilidad por herramientas que otros usan. |
| 8 | Olivier Larose, https://olivierlarose.com | Freelance front-end (Montreal): cuadrícula de trabajos con cliente/agencia, año, categorías y stack (Next.js, Shopify, Sanity, animaciones); contacto = un enlace de email. Muestra rango de servicios por ejemplos, no por listas. |
| 9 | Maxime Heckel, https://blog.maximeheckel.com | Blog técnico con "playgrounds" interactivos (shaders, 3D) y también posts personales. Referente de cómo un blog puede ser a la vez prueba de habilidad 3D y marca. |
| 10 | Kent C. Dodds, https://kentcdodds.com | Contador público de lecturas como prueba social, "Call Kent"/"Email Kent" como CTA directo, comunidad Discord. Marca personal muy orientada a audiencia. |
| 11 | Cassie Evans, https://cassie.codes | Citada como ejemplo clásico de especialidad visible (SVG/animación) ([Twine](https://www.twine.net/blog/best-freelance-developer-portfolio-examples/)). **Nota:** en mi lectura de hoy el sitio es una página de despedida; no usar como referente de estructura actual. |
| 12 | Lynn Fisher, https://lynnandtonic.com (solo vía cita) | Citada por Twine como ejemplo de usar el propio portfolio como proyecto personal para demostrar criterio cuando no hay trabajos publicables por NDA ([Twine](https://www.twine.net/blog/best-freelance-developer-portfolio-examples/)). No lo abrí directamente. |
| 13 | Henry Heffernan, https://henryheffernan.com (no verificado) | Referente conocido de portfolio con escritorio 3D/ordenador; mi fetch solo devolvió el título, no pude comprobar cómo presenta el contenido. **Revisar manualmente** como comparativa directa de la escena de Miguel. |

### 1.2 Hispanohablantes (freelance y marca)

| # | Quién / URL | Lo notable en contenido |
|---|---|---|
| 14 | David Barreiro (Alicante), https://davidbarreiro.es/programador-web-freelance/ | Freelance orientado a pymes: 6 servicios, 40+ proyectos por categoría, **proceso de 7 pasos con soporte post-entrega de 100 días**, resultado medible citado en copy (+38 % tiempo medio en página), horario de contacto claro, WhatsApp/teléfono/email. No publica precios ni testimonios (compensa con casos). Ojo: usa porcentajes de habilidad (ver anti-patrones). |
| 15 | Carlos Torija, https://carlostorija.com/desarrollador-web-freelance | Hero con indicadores de confianza, 4 servicios (corporativa, tienda, a medida, rediseño/migración), **condiciones transparentes** (propuesta escrita, hitos con avances visibles, **repositorio del cliente**, garantía/soporte), reseñas verificadas de Malt, FAQ que trata código, pagos y SEO, promesa de respuesta en 24 h. Modelo muy copiable para la parte "oferta". |
| 16 | Marcos Aguilar, https://marcosaguilar.es/colaborador-web-freelancer/ | Se vende como colaborador de agencias y pymes (mantenimiento, seguridad); prueba social = reseñas de Google con casos de emergencia resueltos; CTA = email, teléfono, WhatsApp. Útil: nicho "freelance de confianza para agencias". |
| 17 | Delirisdart, https://delirisdart.com/servicios/desarrollador-web-freelance-para-empresas-pymes/ | **Packs con nombre** (Landing, One, Basik, Pro, Shop) para distintos tamaños de negocio; ofertas adicionales (SEO, mantenimiento, hosting). Ejemplo de productización, aunque con aspecto muy "agencia". |
| 18 | Eloy (EloRC4), PR "Enfoca el portfolio en el servicio freelance de webs para negocios", https://github.com/EloRC4/Portfolio-2026/pull/6 | **Caso paralelo casi exacto a Miguel** (titulado DAW). Reposiciona el portfolio de "buscar trabajo" a "servicio para negocios": hero con propuestas rotativas, 4 servicios (web a medida, SEO, contacto, mantenimiento mensual), casos reescritos como resultados para el cliente, proceso de 5 pasos, quitó skills/educación y proyectos académicos. Sin precios, email como contacto principal. Buena validación de la dirección; no he podido ver el sitio desplegado. |
| 19 | Jordi Garreta (Barcelona), https://jordigarreta.com | Developer creativo freelance con estado "Available for work" en el hero, secciones Work / About / LAB, contacto por WhatsApp o email; Awwwards (3 Site of the Month) ([Awwwards](https://www.awwwards.com/jordi-garreta/)). Modelo de "LAB" y de señal de disponibilidad visible. Clientes de agencia/marca, no pyme. |
| 20 | Álvaro Trigo (reside en Reino Unido, español), https://www.alvarotrigo.com | Prueba de habilidad = librería open source propia (fullPage.js, con miles de estrellas en GitHub), apariciones en podcasts en español e inglés, proyectos comerciales y freelance separados. Muestra el camino "open source → autoridad". |
| 21 | midudev, https://midu.dev; Carlos Azaustre, https://carlosazaustre.es; Manz.dev, https://manz.dev | Marca personal en español (formación): suscripción con prueba gratuita y 7 testimonios (midu), newsletter + libros + cursos + YouTube (Azaustre), directos + recursos gratuitos con mascota (Manz). No son portfolios freelance; sirven de referencia de tono en español cercano y de "contenido como activo". |

Nota de cobertura: la búsqueda de "los mejores portfolios españoles" devolvió sobre todo listados genéricos o perfiles de Malt/Fiverr, no sitios propios. Quedan fuera por no haberlos podido verificar directamente. Conviene que Miguel complete a mano con r/webdev y la comunidad de midudev.

Otras listas útiles: [emmabostian/developer-portfolios](https://github.com/emmabostian/developer-portfolios), [Awwwards (Developer)](https://www.awwwards.com/inspiration_search/developer/), [Twine: mejores portfolios freelance](https://www.twine.net/blog/best-freelance-developer-portfolio-examples/).

---

## 2. Patrones de contenido que convierten a clientes freelance

### 2.1 Propuesta de valor del hero
- Fórmula que se repite en las fuentes: **"Ayudo a [público concreto] a [resultado concreto] sin [el dolor que esperan]"**; el tercer hueco es el que diferencia ([Millo](https://millo.co/landing-page-tactics-freelancers-can-use-to-turn-portfolio-visitors-into-clients)). Ejemplos de la fuente: "ayudo a startups SaaS a convertir features complejas en landings que convierten" frente a "Creative Designer / Passionate Developer".
- Los títulos genéricos tipo "creo experiencias digitales bonitas" aparecen como cosa a evitar en la guía de GreatFrontend ([GreatFrontend](https://www.greatfrontend.com/blog/frontend-developer-portfolio)).
- Ejemplo español citado en el PR de EloRC4: "webs para negocios · rápidas, claras y sin preocupaciones" ([PR](https://github.com/EloRC4/Portfolio-2026/pull/6)). Es mejor que "Creando Experiencias Digitales Únicas" (Delirisdart), pero aún genérico.
- Test útil: leer el titular a alguien ajeno al sector y pedirle que diga a quién ayudas y por qué elegirte ([Millo](https://millo.co/landing-page-tactics-freelancers-can-use-to-turn-portfolio-visitors-into-clients)).
- **[inferencia] Fórmulas candidatas para Miguel (ES):**
  - "Webs y herramientas a medida para pymes de Jaén y toda España: rápidas, que se entienden y que puedes mantener sin depender de nadie."
  - "Convierto tu Excel, tus facturas a mano y tu web antigua en una herramienta que trabaja por ti (React, Node y Odoo)."
  - Línea de apoyo con prueba: "Desarrollador web en Macrosad · DAM con 9,7 · creador de SolarMetrics".

### 2.2 Servicios y enmarcado de la oferta
- Pocos servicios (3–4), nombrados por **resultado** y no por tecnología. Carlos Torija usa 4 bloques; EloRC4 también 4 ([Torija](https://carlostorija.com/desarrollador-web-freelance), [PR](https://github.com/EloRC4/Portfolio-2026/pull/6)).
- Una oferta de mantenimiento mensual es habitual y da ingresos recurrentes (EloRC4, David Barreiro con 100 días de soporte, Marcos Aguilar con mantenimiento/seguridad).
- Productizar: oferta fija con alcance, precio, plazo y proceso de intake ([Twine](https://www.twine.net/blog/productized-services-for-freelance-designers/)). Estructura de 3 niveles (básico / más popular / premium) que hace parecer razonable el del medio, según las fuentes de productización encontradas.

### 2.3 Casos de estudio
Estructura repetida en todas las fuentes: **problema → enfoque → resultado**, con el resultado como número, y los 300–500 palabras suelen bastar ([9am Works](https://www.9am.works/freelancer-academy/blog/freelance-case-studies-portfolio-that-wins-projects), [Fueler](https://fueler.io/blog/how-to-create-a-freelancer-portfolio-website-that-converts-clients)).
- Escribir el problema con las palabras del cliente y sus métricas, no con jerga.
- "Prueba del sujeto": si la mayoría de frases empiezan con "yo/nosotros", es un currículum, no un caso ([9am Works](https://www.9am.works/freelancer-academy/blog/freelance-case-studies-portfolio-that-wins-projects)).
- Para front-end la guía de GreatFrontend añade: contexto, tu rol concreto, decisiones y trade-offs, calidad (accesibilidad, rendimiento, errores, estados vacíos) y siguientes pasos ([GreatFrontend](https://www.greatfrontend.com/blog/frontend-developer-portfolio)).
- Confidencialidad: sustituir nombres por descriptores, usar ratios en lugar de absolutos y negociar permiso de publicación al firmar, no al final ([9am Works](https://www.9am.works/freelancer-academy/blog/freelance-case-studies-portfolio-that-wins-projects)). Aplicable al trabajo en Macrosad.
- Pocos y buenos: tres casos fuertes superan a diez miniaturas ([Millo](https://millo.co/landing-page-tactics-freelancers-can-use-to-turn-portfolio-visitors-into-clients)).

### 2.4 Proceso
- Procesos concretos y visibles: 7 pasos con soporte (Barreiro), 4 fases con propuesta escrita e hitos (Torija), 5 pasos desde una primera conversación (EloRC4). Funcionan porque reducen el miedo del cliente no técnico: quién hace qué, cuándo veo avances, qué pasa después.
- **[inferencia]** Añadir "qué necesito de ti" y "qué NO incluye" por paso.

### 2.5 Prueba social cuando eres junior
Qué usan quienes tienen pocos clientes, según las fuentes y los ejemplos:
- **Proyectos reales desplegados** (2–4, no clones de tutorial); "tu portfolio es lo único que sustituye a la experiencia" y los clones/plantillas de tutorial restan ([Lyrid](https://lyrid.io/post/5-critical-software-engineer-portfolio-mistakes-that-junior-developers-are-making), [Brightcoding](https://blog.brightcoding.dev/2026/08/15/how-to-land-your-first-developer-job-with-no-experience)).
- **Proyecto personal como caso de estudio** cuando hay NDA (caso Lynn Fisher en Twine).
- **Código abierto y contribuciones** (Paco, Emil, Trigo).
- **Escritura / "learning in public"** (Heckel, Lee Robinson).
- **Métricas objetivas** en lugar de testimonios: Lighthouse, tiempo de carga, horas ahorradas (Barreiro cita resultados en copy y no usa testimonios).
- **Reseñas de plataformas** (Malt en Torija, Google en Aguilar) → **[inferencia]** pedir reseña en Google Business Profile o Malt al primer cliente.
- **Un primer cliente a precio reducido o gratis a cambio de testimonio y permiso de caso** (consejo común en guías de primeros clientes, p. ej. [Devlin Peck](https://devlinpeck.com/content/how-to-land-your-first-client)).
- Nota de GreatFrontend: no atribuirte logros de equipo; los revisores comprueban el historial de Git ([freeCodeCamp](https://www.freecodecamp.org/news/i-reviewed-fifty-portfolios-on-reddit-and-this-is-what-i-learned-e5d2b43150bc/)).

### 2.6 Precios / "desde"
- Muchos freelances españoles NO muestran precios (Barreiro, EloRC4, Aguilar) y piden presupuesto; algunos usan packs con nombre (Delirisdart). Mostrar un "desde" filtra y ahorra reuniones; **[inferencia]** para un perfil junior-mid con pocos casos, un "desde X €" por tipo de oferta y "presupuesto cerrado tras llamada gratuita" equilibra transparencia y flexibilidad.
- Referencias de mercado (estimaciones, no oficiales): tarifas freelance en España 2026 junior 25–40 €/h (180–300 €/día), mid 40–65 €/h (300–450 €/día); webs simples/landing 1.500–5.000 € ([Jobrise](https://jobrise.io/es/blog/tarifas-freelance-developer-espana-2026/)). La misma fuente advierte contra precio cerrado sin alcance definido. Miguel debería contrastar con su zona (Jaén) y con lo que cobran agencias locales.

### 2.7 FAQ
- Responder objeciones ocultas: precio, plazos, cómo se cotiza, de quién es el código, mantenimiento, SEO, qué necesito aportar, RGPD/cookies, hosting ([Millo](https://millo.co/landing-page-tactics-freelancers-can-use-to-turn-portfolio-visitors-into-clients), FAQ de [Torija](https://carlostorija.com/desarrollador-web-freelance)).
- Preguntas diferenciales: "¿y si después quiero que otro lo mantenga?", "¿qué pasa si no sé qué necesito?".

### 2.8 Disponibilidad
- Estado visible tipo "Available for work" (Jordi Garreta) o texto explícito de disponibilidad al final de la home (citado por Twine para Seán Halpin). Los españoles añaden horario de atención y promesa de respuesta en 24 h (Barreiro, Torija).
- **[inferencia]** Con trabajo a jornada completa en Macrosad, ser honesto ("acepto 1–2 proyectos al trimestre, a partir de noviembre") es mejor que fingir plena disponibilidad.

### 2.9 CTAs
- Específico y con baja fricción: "Reserva 20 minutos gratis" con microcopy "sin compromiso" supera a "Contacto" ([Millo](https://millo.co/landing-page-tactics-freelancers-can-use-to-turn-portfolio-visitors-into-clients)).
- En España, el canal natural es **WhatsApp + email + llamada**. Barreiro y Aguilar ofrecen teléfono y WhatsApp; EloRC4 solo email; Garreta WhatsApp o email.
- Una acción principal por página y CTA repetido tras hero, tras casos y al final.

### 2.10 Lead magnets
- Poco habituales en freelances individuales españoles que vi; los usan los creadores de contenido (newsletter de Comeau, Azaustre, Dodds).
- **[inferencia]** Opciones livianas para Miguel: "Checklist de 12 puntos antes de encargar una web" (PDF/HTML), mini-auditoría gratuita (Lighthouse + RGPD en 1 página) para webs de negocios locales, o "plantilla de brief".

---

## 3. Patrones de marca personal

### 3.1 About / historia
- Lo memorable combina **un hecho concreto + un valor**, no adjetivos. Lee Robinson mezcla credenciales con familia y música; Paco, valores en su "Now" (aprecio por el trabajo creativo ajeno) ([leerob.com](https://leerob.com), [paco.me](https://paco.me)).
- Evitar el bio genérico sin personalidad ([Freelancers Union](https://blog.freelancersunion.org/2020/01/07/the-top-profile-mistakes-freelancers-make-that-will-lose-you-the-gig/)).
- **[inferencia]** Gancho de historia para Miguel: de soporte técnico a prácticas Odoo a desarrollador en Macrosad; la combinación "he arreglado el ordenador del cliente Y he programado su ERP" es un diferenciador real frente al desarrollador que solo habla de React. Añadir una foto real y un dato de Jaén (identidad local).

### 3.2 /now
- Página de "en qué estoy ahora", como lo que contarías a un amigo al año ([nownownow](https://nownownow.com/about)). Aclara prioridades y ayuda a decir que no. Paco la usa con tono personal. Es barata (un párrafo mensual) y aporta frescura; **[inferencia]** también sirve de señal de disponibilidad ("este trimestre: X, aceptando Y").

### 3.3 Escritura / notas
- Comeau, Emil, Lee, Heckel construyen autoridad escribiendo. Para freelance **[inferencia]** conviene escribir pocos artículos con utilidad para el cliente, no solo para desarrolladores: "Qué cuesta realmente una web en 2026 en España", "Cómo calculé X kWh en SolarMetrics" (caso técnico), "Odoo vs hoja de cálculo para tu pyme". Los portfolios criticados escriben "para otros desarrolladores, no para clientes" ([templifica](https://templifica.com/blog/how-to-build-a-developer-portfolio-that-actually-gets-you-hired)).

### 3.4 Laboratorio / playground
- Jordi Garreta tiene LAB; Rauno "Craft"; Heckel playgrounds interactivos; Bruno Simon logros, mensajes y "Behind the scene".
- Para Miguel: un "Lab" con 4–6 micro-demos (cada una con enlace a código y una frase de qué demuestra), como complemento de la escena 3D. **[inferencia]**

### 3.5 /uses
- Convención de páginas con herramientas y setup ([uses.tech](https://uses.tech)). Encaja con un escritorio 3D: cada objeto del escritorio puede enlazar a su entrada en /uses. **[inferencia]** Valor bajo para clientes, medio para marca.

### 3.6 Elementos interactivos que demuestran habilidad
- Bruno Simon es el ejemplo extremo. El patrón para Miguel: que la escena 3D funcione como **navegación real** del contenido (monitor = proyectos, cuaderno = proceso, etc.) con alternativa accesible. Con "Behind the scene" que explique cómo se hizo (rendimiento, carga, accesibilidad) transformas la escena en el caso de estudio #1. **[inferencia]**

---

## 4. Anti-patrones (con fuentes)

| Anti-patrón | Por qué falla | Fuente |
|---|---|---|
| Barras o porcentajes de habilidad | Autoevaluación sin significado ("85 % en Angular"); mejor "aprendiendo / cómodo" o demostrar con proyectos. Nota: hasta algún freelance español los usa (Barreiro, 95–98 %), no copiarlo. | [freeCodeCamp](https://www.freecodecamp.org/news/i-reviewed-fifty-portfolios-on-reddit-and-this-is-what-i-learned-e5d2b43150bc/), [Lyrid](https://lyrid.io/post/5-critical-software-engineer-portfolio-mistakes-that-junior-developers-are-making) |
| Bio genérica ("desarrollador apasionado") | Indistinguible de miles de perfiles | [Freelancers Union](https://blog.freelancersunion.org/2020/01/07/the-top-profile-mistakes-freelancers-make-that-will-lose-you-the-gig/), [GreatFrontend](https://www.greatfrontend.com/blog/frontend-developer-portfolio) |
| CV convertido en web (Intro > Skills > Proyectos > Contacto idéntico a todos) | Poco memorable, no responde al problema del cliente. EloRC4 eliminó skills y educación al pasar a servicio. | [freeCodeCamp](https://www.freecodecamp.org/news/i-reviewed-fifty-portfolios-on-reddit-and-this-is-what-i-learned-e5d2b43150bc/), [PR](https://github.com/EloRC4/Portfolio-2026/pull/6) |
| Proyectos de tutorial o plantillas | Señal de poca autonomía | [Lyrid](https://lyrid.io/post/5-critical-software-engineer-portfolio-mistakes-that-junior-developers-are-making) |
| Listar todo lo hecho | Abruma; elegir lo mejor | [Fueler](https://fueler.io/blog/mistakes-freelancers-make-when-creating-their-portfolio), [GreatFrontend](https://www.greatfrontend.com/blog/frontend-developer-portfolio) |
| Capturas bonitas sin decisiones ni resultados; "optimizado" sin cifra | Describe para devs, no para clientes | [GreatFrontend](https://www.greatfrontend.com/blog/frontend-developer-portfolio), [templifica](https://templifica.com/blog/how-to-build-a-developer-portfolio-that-actually-gets-you-hired) |
| Animación pesada antes de que cargue el contenido; contacto difícil de encontrar | Pierde al visitante; especialmente relevante para una escena 3D | [GreatFrontend](https://www.greatfrontend.com/blog/frontend-developer-portfolio) |
| Sin enlace a demo o código | No verificable | [freeCodeCamp](https://www.freecodecamp.org/news/i-reviewed-fifty-portfolios-on-reddit-and-this-is-what-i-learned-e5d2b43150bc/) |
| Contribución personal poco clara en trabajos de equipo | Se contrasta con Git | [freeCodeCamp](https://www.freecodecamp.org/news/i-reviewed-fifty-portfolios-on-reddit-and-this-is-what-i-learned-e5d2b43150bc/) |
| Contraste bajo, sin teclado, móvil como añadido | Accesibilidad; con "midnight neon" vigilar contraste de texto | [freeCodeCamp](https://www.freecodecamp.org/news/i-reviewed-fifty-portfolios-on-reddit-and-this-is-what-i-learned-e5d2b43150bc/) |
| Mensaje de "creo experiencias únicas" sin público ni resultado | Genérico (ejemplo real: Delirisdart) | [Delirisdart](https://delirisdart.com/servicios/desarrollador-web-freelance-para-empresas-pymes/) |

---

## 5. Recomendación concreta

### 5.1 Arquitectura de información propuesta (en orden)

Una sola página larga con ancla por sección + escena 3D como navegación alternativa; versión ES por defecto, EN espejo.

1. **Hero (escena 3D + titular)** — Propósito: decir a quién ayudas y qué resultado. Contenido: titular con la fórmula (sección 2.1), subtítulo con una prueba breve (Macrosad, SolarMetrics, DAM 9,7), 2 CTAs ("Reserva 20 min" + "Ver casos"), indicador de disponibilidad. Alternativa HTML/accesible bajo la escena.
2. **Qué puedo hacer por ti (servicios)** — 3 ofertas definidas por resultado. Contenido: nombre, para quién, qué incluye, plazo orientativo, "desde X €". Ver 5.2.
3. **Casos y proyectos (3 tarjetas)** — Prueba. Contenido: SolarMetrics + 2 nuevos (ver 5.3) en formato problema → enfoque → resultado, con cifra, stack, demo y código. Cada tarjeta indica honestamente si es "proyecto propio" o "cliente".
4. **Cómo trabajo (proceso)** — Reduce el miedo del cliente no técnico. 4–5 pasos: llamada → propuesta escrita con alcance y precio cerrado → entrega por hitos con demo → lanzamiento → soporte/mantenimiento. Incluye "el código y la cuenta son tuyos".
5. **Quién soy (about corto)** — Marca. Historia soporte técnico → Odoo → desarrollador en Macrosad; foto; Jaén; 2–3 valores concretos; datos de formación en una línea (no sección de skills).
6. **Laboratorio** — Marca + prueba técnica. 4–6 experimentos (shader, componente, mini-herramienta), cada uno con demo y repo; enlace a "cómo se hizo esta web" (el caso de la escena 3D).
7. **Notas** — Autoridad y SEO. 3–5 artículos útiles para clientes al principio, algunos técnicos.
8. **Precios orientativos y FAQ** — Filtra y ahorra reuniones. 3 packs "desde", cómo se presupuesta, 8–10 preguntas (propiedad del código, mantenimiento, RGPD, plazos, hosting, qué necesito aportar).
9. **Contacto** — Conversión. CTA principal: reservar 20 min (calendario) y secundarios: WhatsApp y email; promesa de respuesta (24–48 h); disponibilidad real (trimestre actual). Formulario corto con tipo de proyecto y presupuesto aproximado (con consentimiento RGPD).
10. **Pie** — Enlaces a /now, /uses, GitHub, LinkedIn, aviso legal/privacidad, selector ES/EN.

Páginas secundarias (no en la home): `/ahora` (now), `/uses`, páginas individuales de casos (indexables, con SEO), `/notas`.

### 5.2 Servicios candidatos (definir 3, no más)
**[inferencia basada en su stack y en lo que piden las pymes]**
1. **Web a medida para tu negocio** (landing o sitio corporativo en React/Astro/Next + SEO básico + RGPD + analítica): para negocios locales y autónomos. Desde ~X €.
2. **Herramientas internas y paneles de datos** (dashboards tipo SolarMetrics, automatizar Excel/informes, formularios y APIs con Node): para pymes con datos dispersos.
3. **Odoo a medida / integraciones** (módulos, informes, conectar web/tienda con Odoo): para pymes que ya usan o quieren un ERP.
Añadir como extra, no como cuarto servicio: **mantenimiento mensual**.

### 5.3 Contenido que Miguel necesita PRODUCIR (dado su historial limitado)

Prioridad alta:
1. **SolarMetrics como caso de estudio completo**: problema (qué dolor resolvía), datos reales (volumen, frecuencia, latencia), decisiones (por qué InfluxDB), resultado en cifras, capturas/GIF, demo pública con datos de ejemplo, repo con README cuidado. Es el proyecto con más potencial; el formato importa más que el proyecto.
2. **Un caso de Macrosad / Odoo (anonimizado si hace falta)**: qué problema, qué hizo él (rol personal), resultado en ratio ("redujo X"), con permiso explícito del empleador. Si no se puede, convertirlo en "caso genérico" ("pyme de distribución de 20 personas").
3. **1–2 proyectos "piloto" con negocio real de Jaén** (gratis o a precio reducido a cambio de testimonio, métricas y permiso de publicar). Es la forma más rápida de tener el primer testimonio verificable.
4. **Testimonios a pedir**: de tutores/compañeros de las prácticas (soporte y Odoo), de Macrosad si autorizan, de profesores del DAM, y de usuarios de SolarMetrics si los hay. Pedirlos con 2–3 frases concretas (qué problema, qué cambió).
5. **Definición escrita de servicios, packs "desde", proceso y FAQ** (en español natural, sin jerga).
6. **Medición propia del sitio**: Lighthouse, peso de la escena 3D, accesibilidad, tiempo de carga móvil. Publicarlos en "Behind the scene" (aprendizaje de Bruno Simon) como prueba de que sabe construir webs rápidas pese a ser 3D.

Prioridad media: 3–5 notas, un /now, un /uses, 4 experimentos en el Lab, newsletter mínima o RSS.

### 5.4 Ideas de proyectos "escaparate" (2–3)

Pensadas para pymes españolas y para su stack (React, Node, Odoo, dashboards). **[inferencia]** Cada una se publica como caso con cifras medibles, demo con datos sintéticos y repo.

**A. "Reservas + WhatsApp" para negocio local (clínica, peluquería, taller, restaurante)**
- Qué es: web con reservas online (React + Node), recordatorios por WhatsApp/email, panel simple para el dueño, sincronización con Google Calendar o con Odoo.
- Por qué convence: toca un dolor real (llamadas, no-shows) y es fácil de explicar. Métrica: reducción de no-shows, tiempo de gestión, puntuación Lighthouse.
- Demostración: demo con negocio ficticio + opción de implantarlo con un negocio real de Jaén como piloto.

**B. "Mi pyme en un panel": dashboard de ventas/inventario conectado a Odoo**
- Qué es: panel React que consume la API de Odoo (o un Postgres/CSV) y muestra ventas, stock, facturas pendientes, alertas por email; versión modelada sobre tu experiencia de prácticas con Odoo y tu dashboard de SolarMetrics.
- Por qué convence: aprovecha su diferenciador (Odoo + datos). Métrica: horas semanales de informes ahorradas, errores evitados.
- Extra de mercado: **Verifactu** aplaza su obligatoriedad a 1 enero 2027 (sociedades) y 1 julio 2027 (resto) ([Holded](https://www.holded.com/es/blog/hacienda-retrasa-entrada-vigor-verifactu), [Legal Today](https://www.legaltoday.com/actualidad-juridica/noticias-de-derecho/hacienda-aplaza-un-ano-hasta-2027-la-entrada-en-vigor-del-sistema-de-facturacion-digital-verifactu-2025-12-02/)); un artículo/mini-herramienta "¿estás listo para Verifactu?" es un gancho de captación oportuno. Verificar fechas y alcance antes de publicar.

**C. "Auditoría y rediseño exprés": antes/después de la web de un negocio local**
- Qué es: tomar la web actual (con permiso) de un negocio, medir (Lighthouse, accesibilidad, cookies/RGPD, SEO local), rediseñarla y publicar el antes/después con cifras. Se puede convertir en lead magnet: "auditoría gratis de 1 página".
- Por qué convence: es el formato de caso con "resultado como número" más fácil de conseguir sin clientes previos (Barreiro cita un +38 % de tiempo en página como ejemplo del tipo de cifra que funciona).
- Aviso: la Ley 11/2023 (transposición de la Directiva europea de accesibilidad) exige accesibilidad a servicios como el comercio electrónico desde el 28 de junio de 2025, con exención para microempresas en servicios; úsalo como argumento comercial prudente y no como amenaza legal ([Fieldfisher](https://www.fieldfisher.com/es-es/locations/espana/actualidad/accesibilidad-obligatoria-claves-de-la-transposicion-accesibility-act), [xictron](https://www.xictron.com/en/blog/accessibility-act-exemptions-microenterprises-2026/)). Verificar con fuente oficial antes de afirmarlo en el sitio.

### 5.5 Riesgos y decisiones abiertas para Miguel
- **Kit Digital**: programa de ayudas a pymes y autónomos con agentes digitalizadores ([Red.es](https://red.es/sites/redes/files/media/documents/NdP_Balance_Programa_Kit_Digital_.pdf)). No pude confirmar su estado vigente en octubre de 2026; si sigue abierto podría ser un canal, pero exige darse de alta como agente. Investigar antes de mencionarlo.
- **Precios en el sitio**: decidir si mostrar "desde" o solo "presupuesto a medida". Mi sugerencia: "desde", más proceso claro.
- **Compatibilidad con empleo en Macrosad**: revisar cláusulas de pluriempleo/exclusividad antes de publicar disponibilidad freelance.
- **Dos públicos en una web** (clientes y marca/empleo): evitar mezclar CV y servicios. Sacar la formación y la experiencia a un bloque corto en "Quién soy" y un PDF de CV aparte. EloRC4 tomó la decisión opuesta (eliminar casi todo lo de empleo) por centrarse solo en freelance.
- **Idiomas**: ES por defecto con EN completo; los casos de estudio en inglés pueden atraer startups, pero los precios y mensaje de pyme local son para el mercado español.
- **Escena 3D y rendimiento/SEO**: contenido real en HTML, no solo dentro del canvas; carga diferida y respeto de "reducir movimiento".

---

## 6. Limitaciones de esta investigación
- Búsqueda web orientada a EE. UU.: pocos portfolios de freelances españoles individuales surgieron de las búsquedas; los ejemplos españoles (Barreiro, Torija, Aguilar, Delirisdart, EloRC4, Garreta, Trigo, midudev, Azaustre, Manz) son los verificados.
- Los resúmenes de las páginas los generó un modelo auxiliar al leerlas; algunas cifras (p. ej. "+50 proyectos", "40+ proyectos") son declaraciones de cada sitio, no verificadas.
- Henry Heffernan no pudo contrastarse. El portfolio de Cassie Evans ahora es una página de despedida.
- Tarifas y fechas de Verifactu/accesibilidad son de fuentes secundarias; verificar con fuente oficial antes de usarlas en copy público.
