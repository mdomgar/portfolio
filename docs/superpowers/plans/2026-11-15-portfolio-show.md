# Portfolio "show" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the freelance-sales portfolio into a scroll "show" that presents Miguel Ángel as a web developer: a Blender-rendered retro PC opening, four illustrated career acts, SolarMetrics, and direct contact.

**Architecture:** Same React Router 7 prerendered site. The real-time three.js scene, the services/process/brief layer and Seenat are removed. The home becomes six sections driven by GSAP ScrollTrigger; the 3D opening is a pre-rendered WebP frame sequence drawn on a canvas and scrubbed by scroll. All copy lives in bilingual data files.

**Tech Stack:** Vite 7, React 19, React Router 7 (framework mode, prerender), GSAP + ScrollTrigger + @gsap/react, Lenis, Vitest + Testing Library, Playwright, Blender 5.2 (headless, Python script).

**Spec:** `docs/superpowers/specs/2026-11-15-portfolio-show-design.md` (read it first; it wins over this plan on intent). Approved throwaway style test, for look and choreography only, never to copy code from: `.superpowers/spike/show/index.html`.

**Who builds what:** Sonnet = tasks 1, 3, 4, 5, 6, 7 · Haiku = tasks 2, 8 · Opus = review after tasks 1, 4, 6, 8 · the coordinating session accepts each phase with screenshots.

## Global Constraints

- Work on branch `portfolio-show`, created from `redesign-3d`. Never push.
- All visible text is real HTML and comes from `src/data/` or `src/i18n/strings.js`, shaped `{ es, en }`. Spanish is rendered. Both languages are always filled in.
- Never invent figures, achievements or responsibilities. Allowed sources for claims: `src/data/experience.js`, `src/data/profile.js`, `src/data/cases/solarmetrics.js`, `src/data/skills.js`.
- Macrosad: describe only what Miguel does. No screenshots, internal tool names or company data.
- Vulcania: text only — name, "Tienda online para una tienda de juegos de mesa de Jaén", status "En construcción". No link, no image, no catalogue, no prices.
- Palette starting point: ink `#121212`, paper `#f1eadd`, white `#fffdf8`, taller `#ff6b2c`, servidores `#35d691`, erp `#b78cff`, codigo `#e4f23a`. Ink on every background must meet WCAG AA; orange text on paper must use `#b83608` or darker (4.5:1).
- Fonts: Clash Display 600/700 (display), Inter (body), JetBrains Mono (short uppercase labels only). Already in `public/fonts/`.
- Illustration: uniform thick ink line, round caps, white fills, no gradients or shadows.
- Motion: large moves are scroll-scrubbed and reversible. With `prefers-reduced-motion: reduce`, and without JavaScript, every piece of content is visible and nothing is pinned.
- Name and role ("Miguel Ángel", "Web developer") visible within 2 s of load, before any sequence frame beyond the first has loaded.
- Do not add dependencies. Remove: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `postprocessing`, `resend`, and `zustand` once nothing imports it.
- `npm run lint`, `npm test` and `npm run build` pass at the end of every task.

## Review Focus

1. **A sequence frame fails to load or loads late** → the opening shows the nearest loaded frame (at worst the first), never a blank canvas, and the page still scrolls. Test in Task 6.
2. **`prefers-reduced-motion: reduce`** → no pins, no scrub; all four acts, both projects and the contact block are visible in normal flow. Test in Tasks 4 and 8.
3. **Viewport 320–375 px wide** → giant words never cause horizontal page scroll and never cover the act text. Test in Task 8.
4. **Resize or orientation change while inside a pinned section** → positions recalculate; no overlapping sections or stuck pin. Test in Task 4 (function-based values + `invalidateOnRefresh`) and checked in Task 8.
5. **Arriving by nav link or URL hash (`#trayectoria`, `#proyectos`, `#contacto`)** → lands at the start of that section with its first content visible, including when the target sits after pinned sections. Test in Task 8.

---

### Task 1: Strip the old site down to a compiling skeleton (Sonnet)

**Files:**
- Delete: `src/scene/` except `src/scene/screens/{dashboard,solar,drawUtils}.js`; `src/store/`; `api/`; `server/`; `src/lib/brief*.js` and tests; `src/data/{brief,services,process,now,sections}.js` and tests that only cover them; `src/data/cases/seenat.js`; `src/routes/privacy.jsx`; components `Hero`, `HeroPortrait`, `Services`, `Process`, `Now`, `Brief`, `WhoAmI`, `Cases`, `Preloader`, `SectionLink`, `TechMarquee` with their CSS and tests; hooks `useHeroSequence`, `usePageScene`, `useSceneCue`, `usePreload`, `useActiveSection`, `useMicroInteractions` with tests; `e2e/brief.spec.js`; `public/img/og-seenat.jpg`.
- Move: `src/scene/screens/{dashboard,solar,drawUtils}.js` → `src/lib/screens/`; trim `index.js` to export `SCREENS` with only `dashboard`.
- Modify: `src/root.jsx`, `src/routes.js`, `src/routes/home.jsx`, `src/data/site.js`, `src/data/cases/index.js`, `src/data/seo.js`, `src/components/ScreenPreview.jsx`, `src/components/Navbar.jsx`, `src/components/Footer.jsx`, `src/i18n/strings.js`, `vercel.json`, `package.json`, remaining tests.

**Interfaces:**
- Produces: `CASE_SLUGS = ['solarmetrics']`; `LEGAL_PATHS = ['/aviso-legal']`; `<Outlet context={{ reducedMotion }}>` (no `ready`); `src/lib/screens/index.js` exporting `SCREENS`; a `Home` that renders `<h1>` with the name and nothing else yet.

- [ ] **Step 1:** Create the branch: `git switch -c portfolio-show`.
- [ ] **Step 2:** Update `src/data/site.test.js` so it asserts `PUBLIC_PATHS` equals `['/', '/casos/solarmetrics', '/aviso-legal']`; add a test in `src/data/site.test.js` reading `vercel.json` and asserting it has permanent redirects `/casos/seenat → /` and `/privacidad → /` and no `functions` key. Run `npm test`; expect these to fail.
- [ ] **Step 3:** Do the deletions and moves above. `src/root.jsx` keeps `Layout`, `ErrorBoundary`, fonts/tokens imports, `Navbar`, `Footer`, `useReducedMotion`, `useSmoothScroll(!reducedMotion)` and the route-change `ScrollTrigger.refresh()`; it loses the preloader, the scene, `inert`, the `<noscript>` CSS and `HydrateFallback`'s brand markup (keep an empty fallback).
- [ ] **Step 4:** Remove the dependencies listed in Global Constraints with `npm uninstall`.
- [ ] **Step 5:** Fix or delete every test that referenced removed code. A test is deleted only if what it covered no longer exists.
- [ ] **Step 6:** Run `npm run lint && npm test && npm run build`. Expected: all pass; `build/client` contains `index.html`, `casos/solarmetrics/index.html`, `aviso-legal/index.html`, `404.html` and no `privacidad` or `casos/seenat`.
- [ ] **Step 7:** `grep -rE "three|@react-three|resend|zustand|sceneStore|seenat" src package.json` returns nothing except the word inside unrelated prose. Commit: `chore: remove the 3D scene, the freelance layer and Seenat`.

### Task 2: Content data (Haiku)

**Files:**
- Modify: `src/data/profile.js`, `src/data/experience.js`, `src/data/content.test.js`, `src/data/data.test.js`
- Create: `src/data/acts.js`, `src/data/capabilities.js`, `src/data/projects.js`, `src/data/acts.test.js`

**Interfaces:**
- Produces:
  - `profile.hero = { role, statement, context }`, all `{ es, en }`. Exact Spanish copy: role `Web developer`; statement `Programo webs y herramientas que la gente usa cada día. Es lo que hago y lo que quiero seguir haciendo.`; context `Jaén · Ahora en Macrosad`. `profile.about.hook` is kept unchanged. Remove `profile.hero.questions/answer/intro/proof`.
  - `ACTS` in `src/data/acts.js`: array of 4 `{ id, experienceId, word: {es,en}, color }` in this order — `taller`/`mecaofi`/`Taller`/`#ff6b2c`, `servidores`/`grupo-avanza`/`Servidores`/`#35d691`, `erp`/`intelec`/`ERP`/`#b78cff`, `codigo`/`macrosad`/`Código`/`#e4f23a`. Plus `getActs(lang)` returning each act merged with its `experience` entry (`role`, `company`, `period`, `tasks`).
  - `capabilities` in `src/data/capabilities.js`: array of 4 `{ id, title: {es,en}, proof: {es,en} }` — React + Node.js apps (proof: Macrosad), own APIs with Java and Spring Boot (proof: Intelec, SolarMetrics), data dashboards (proof: SolarMetrics), servers and networks (proof: Grupo Avanza).
  - `projects` in `src/data/projects.js`: `[{ id: 'solarmetrics', status: 'live', caseSlug: 'solarmetrics' }, { id: 'vulcania', status: 'building', name: 'Vulcania', summary: {es,en}, statusLabel: {es,en} }]`.

- [ ] **Step 1:** Write `src/data/acts.test.js`: `ACTS` has 4 items; every `experienceId` exists in `experience`; `getActs('es')[3].company === 'Macrosad'`; every `word`, capability `title`/`proof` and Vulcania `summary` has non-empty `es` and `en`; `projects.find(p => p.id === 'vulcania')` has no `links`, `image` or `url` key. Run it; expect failure.
- [ ] **Step 2:** Create the three data files and edit `profile.js` as specified. Grupo Avanza's `period` keeps both real periods.
- [ ] **Step 3:** Update `content.test.js` / `data.test.js` for the removed hero fields. Run `npm test`; expect pass.
- [ ] **Step 4:** Commit: `feat: content data for the show`.

### Task 3: Visual language, shell and static sections (Sonnet)

**Files:**
- Modify: `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/pages.css`, `src/components/Navbar.jsx` + CSS, `src/components/Footer.jsx` + CSS, `src/routes/home.jsx`, `src/i18n/strings.js`
- Create: `src/components/{Opening,Today,Acts,Projects,Background,Contact}.jsx` with `src/components/css/*.css` and a test each

**Interfaces:**
- Consumes: Task 2 data.
- Produces: components `Opening`, `Today`, `Acts`, `Projects`, `Background`, `Contact`, each `({ reducedMotion })`. Section ids: `inicio`, `hoy`, `trayectoria`, `proyectos`, `formacion`, `contacto`. CSS custom properties `--ink --paper --white --act-taller --act-servidores --act-erp --act-codigo --font-display --font-body --font-mono`. Class `.giant` for full-width display words (fluid `clamp`, never wider than the viewport by itself).

This task builds the whole page **without scroll animation**: it is the reduced-motion and no-JS version, and later tasks animate on top of it.

- [ ] **Step 1:** Component tests (Testing Library): `Opening` renders an `h1` containing "Miguel Ángel" and the text "Web developer"; `Acts` renders 4 `h2`/`h3` roles with company and period; `Projects` renders a link to `/casos/solarmetrics` and the text "En construcción" with no link inside the Vulcania item; `Contact` renders the copy-email button plus LinkedIn and GitHub links. Run; expect failure.
- [ ] **Step 2:** Replace the dark neon tokens with the palette in Global Constraints; restyle `Navbar` (short name left; `Trayectoria`, `Proyectos`, `Contacto` right; only `Contacto` under 768 px) and `Footer` (© year, name, aviso legal).
- [ ] **Step 3:** Build the six sections per spec §6 as static layouts. `Acts` is four stacked full-colour blocks, each with its giant word, a placeholder box for the illustration, and the fact sheet. `Opening` shows a placeholder box where the sequence will go.
- [ ] **Step 4:** `npm run lint && npm test && npm run build`; expect pass. Capture `/` with Playwright at 1440 and 375 px: no horizontal overflow, no console errors.
- [ ] **Step 5:** Commit: `feat: new visual language and static sections`.

### Task 4: Act illustrations and the pinned show (Sonnet)

**Files:**
- Create: `src/components/acts/ActArt.jsx` (four SVG illustrations: open tower + screwdriver, server rack, monitor with ERP board, laptop with editor), `src/components/acts/ActsStage.jsx`, `src/components/css/Acts.css` additions, `src/components/acts/ActsStage.test.jsx`
- Modify: `src/components/Acts.jsx`

**Interfaces:**
- Consumes: `getActs(lang)`; `gsap`, `ScrollTrigger`, `useGSAP` from `src/lib/gsap.js`.
- Produces: `ActArt({ actId })` (static, used by the stacked layout); `ActsStage({ acts })` (pinned, animated).

- [ ] **Step 1:** Test: with `reducedMotion` true, `Acts` renders four `ActArt` and no element with `data-pinned`; with it false, it renders `ActsStage` and all four fact sheets are still in the DOM. Run; expect failure.
- [ ] **Step 2:** Draw the four illustrations in one shared 600×600 viewBox, in the style of the spike but with more parts per object so the transformation has something to rearrange.
- [ ] **Step 3:** Build `ActsStage`: one pinned stage, scrubbed timeline, per transition — background enters as an opening circle from the object's centre, the giant word enters from the right, drifts and leaves left, parts of the object move/scale into the next object's parts (shared parts keep their element; the rest stagger in), fact sheet swaps. All position values are functions and the trigger uses `invalidateOnRefresh: true`. Under 768 px the stage stacks word, object, sheet vertically.
- [ ] **Step 4:** Capture the section at five scroll stops at 1440 and 375 px; check no word overlaps another and the sheet text is never covered. `npm run lint && npm test && npm run build`; expect pass.
- [ ] **Step 5:** Commit: `feat: the four acts as a pinned scroll show`.

### Task 5: Blender retro PC sequence (Sonnet)

**Files:**
- Create: `scripts/blender/retro_pc.py`, `scripts/blender/README.md`, `public/seq/desktop/0001.webp…`, `public/seq/mobile/0001.webp…`, `src/data/sequence.js`, `src/data/sequence.test.js`

**Interfaces:**
- Produces: `SEQUENCE = { screenColor, desktop: { count, width, height, dir: '/seq/desktop' }, mobile: { count, width, height, dir: '/seq/mobile' } }` and `frameUrl(variant, index)` → `'/seq/desktop/0001.webp'` (1-based, 4-digit).

- [ ] **Step 1:** Test: `frameUrl('desktop', 1) === '/seq/desktop/0001.webp'`; for both variants every file `1..count` exists under `public/`; total size of `public/seq/desktop` ≤ 4 MB and `public/seq/mobile` ≤ 1.5 MB. Run; expect failure.
- [ ] **Step 2:** Write `retro_pc.py`: builds the tower + CRT monitor + keyboard from bevelled primitives, flat emission materials in the palette, black outline (Freestyle or inverted-hull), transparent background, monitor screen as one flat colour equal to `SEQUENCE.screenColor`; animates turn → camera push → screen fills the frame; args `--variant desktop|mobile --out <dir> --frames <n>`; outputs WebP. No real brand names or logos on the model.
- [ ] **Step 3:** Render both variants: `"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/retro_pc.py -- --variant desktop --out public/seq/desktop` (and `mobile`). Desktop ~1600 px wide, 90–120 frames; mobile ~800 px, portrait framing, fewer frames.
- [ ] **Step 4:** Look at frames first, middle and last of each variant. The last frame must be the flat screen colour edge to edge. Run the test; expect pass.
- [ ] **Step 5:** Commit: `feat: Blender-rendered retro PC sequence`.

### Task 6: Scroll-scrubbed opening (Sonnet)

**Files:**
- Create: `src/components/ScrollSequence.jsx`, `src/lib/frameLoader.js`, `src/lib/frameLoader.test.js`, `src/components/ScrollSequence.test.jsx`
- Modify: `src/components/Opening.jsx` + CSS, `src/components/Today.jsx` + CSS, `src/routes/home.jsx` (preload first frame + display font)

**Interfaces:**
- Consumes: `SEQUENCE`, `frameUrl` from Task 5.
- Produces: `createFrameLoader({ urls })` → `{ nearestLoaded(index): HTMLImageElement | null, load(): void }`; `ScrollSequence({ variant, progress })`.

- [ ] **Step 1:** Tests for `frameLoader`: `nearestLoaded(40)` returns frame 1 when only frame 1 has loaded; returns frame 38 when 1, 20 and 38 have loaded; a frame that errors is skipped and never returned. Test for `Opening` with `reducedMotion`: renders an `<img>` of the first frame and no canvas. Run; expect failure.
- [ ] **Step 2:** Implement the loader (first frame eagerly, the rest in idle time, in order) and `ScrollSequence` (canvas sized to the frame, draws `nearestLoaded` on progress change, device-pixel-ratio aware).
- [ ] **Step 3:** Animate `Opening`: pinned; name and role visible immediately as HTML over the first frame; scroll scrubs the sequence while the name moves away; at the end the canvas colour is `SEQUENCE.screenColor`, which is `Today`'s background, so the cut is invisible. `Today` lines then enter with scroll and the tech strip moves horizontally.
- [ ] **Step 4:** Capture at 1440 and 375 px at six scroll stops through the opening; check name legibility on every stop where it is visible, and the seamless join. With network throttled so later frames are missing, the opening still shows an image. `npm run lint && npm test && npm run build`; expect pass.
- [ ] **Step 5:** Commit: `feat: scroll-scrubbed 3D opening`.

### Task 7: Projects, case page and closing (Sonnet)

**Files:**
- Modify: `src/components/Projects.jsx` + CSS, `src/components/CaseStudy.jsx` + CSS, `src/components/Background.jsx` + CSS, `src/components/Contact.jsx` + CSS, `src/components/Reveal.jsx` / `SplitWords.jsx` if reused

**Interfaces:**
- Consumes: `projects`, `getCase('solarmetrics')`, `ScreenPreview` with `SCREENS.dashboard`.

- [ ] **Step 1:** Test: `CaseStudy` for SolarMetrics still renders challenge, built list, decisions, result, next and both external links; `Projects` test from Task 3 still passes.
- [ ] **Step 2:** SolarMetrics as a near-full-screen block: giant name entering with scroll, tagline, live `ScreenPreview`, stack, demo/code links, link to the case page. Vulcania as a quiet "En construcción" row.
- [ ] **Step 3:** Restyle the case page and the legal page to the new language (paper/ink, same type). Closing block: giant closing line and the three contact actions with a scroll entrance.
- [ ] **Step 4:** Captures of `/` (projects through footer) and `/casos/solarmetrics` at 1440 and 375 px. `npm run lint && npm test && npm run build`; expect pass.
- [ ] **Step 5:** Commit: `feat: projects, case page and closing`.

### Task 8: SEO, redirects, docs and end-to-end checks (Haiku)

**Files:**
- Modify: `src/data/seo.js`, `src/lib/seo.js` (JSON-LD: `Person` only, drop `ProfessionalService`), `src/data/legal.js` (remove every mention of the form and of data collection), `scripts/og-images.js`, `README.md`, `e2e/home.spec.js`, `e2e/routes.spec.js`, `e2e/helpers.js`
- Regenerate: `public/img/og-image.jpg`, `public/img/og-solarmetrics.jpg`

- [ ] **Step 1:** `seo.js` copy — title es `Miguel Ángel Domínguez · Web developer`, description es `Web developer en Jaén. Programo aplicaciones y herramientas web con React y Node.js. Trayectoria, proyectos y contacto.`; write the English equivalents; remove the `/privacidad` entry; fix the 404 description (no "servicios").
- [ ] **Step 2:** e2e tests in `e2e/home.spec.js`: (a) `h1` contains "Miguel Ángel" and "Web developer" is visible within 2 s; (b) no console errors and `scrollWidth <= innerWidth` at 1440, 375 and 320 px after scrolling to the bottom; (c) with `reducedMotion: 'reduce'`, the four act roles, "SolarMetrics", "Vulcania" and the contact links are all visible without scrolling inside any pinned area; (d) clicking each nav link leaves the target section's heading in the viewport; (e) resizing from 1440 to 800 px wide while scrolled into `#trayectoria` leaves exactly one act sheet visible. `e2e/routes.spec.js`: `/`, `/casos/solarmetrics`, `/aviso-legal` and an unknown URL return their titles.
- [ ] **Step 3:** Run `npm run og:images`, rewrite `README.md` for the new site (purpose, stack, scripts, how to re-render the sequence, pending items for Miguel: Macrosad text, legal NIF, text review).
- [ ] **Step 4:** `npm run lint && npm test && npm run test:e2e`. Expected: all pass. Any failing e2e check is reported to the coordinator with the screenshot, not worked around.
- [ ] **Step 5:** Commit: `chore: SEO, docs and end-to-end checks for the show`.

### Final review (Opus, then the coordinating session)

- [ ] Opus reviews the whole branch diff against the spec and this plan's Review Focus and returns an ordered list of material problems.
- [ ] Fixes go back to Sonnet. If the 3D opening still falls short after two fix rounds, replace it with the illustrated SVG version using the same choreography (spec §7) and tell Miguel.
- [ ] Coordinator captures 1440 / 1024 / 768 / 375 px, compares with the approved spike and the spec, and reports to Miguel what is done, what is not, and what is pending from him.
