import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { DECOR } from './decor'
import { ACT_IDS, BODY, CHIPS, CODE_LINES, ERP_DRAG } from './scene'

// Small ink marks that drift at different speeds behind everything (parallax). They live in a lane
// that never crosses the fact sheet.
const MARKS = [
  { x: 8, y: 10, kind: 'plus', size: 22 },
  { x: 34, y: 22, kind: 'ring', size: 16 },
  { x: 62, y: 6, kind: 'dash', size: 34 },
  { x: 86, y: 18, kind: 'plus', size: 16 },
  { x: 18, y: 44, kind: 'dash', size: 26 },
  { x: 74, y: 40, kind: 'ring', size: 22 },
  { x: 48, y: 58, kind: 'plus', size: 14 },
  { x: 92, y: 62, kind: 'dash', size: 30 },
  { x: 26, y: 74, kind: 'ring', size: 12 },
  { x: 66, y: 80, kind: 'plus', size: 24 },
  { x: 10, y: 90, kind: 'dash', size: 22 },
  { x: 84, y: 92, kind: 'ring', size: 18 },
]

// Timeline units. Transition k starts at STARTS[k-1]; the new object has landed ~1.7 units later and
// then plays its own little scene (the "hold").
const STARTS = [1, 3.6, 6.2]
const HOLD_AT = 1.7
const TOTAL = 9.1
const SCROLL_SCREENS = 4.6

const part = (group, name) => group.find((el) => el.dataset.part === name)

export default function ActsStage({ acts, label }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const stage = root.current
      const all = (selector) => gsap.utils.toArray(selector, stage)
      const bgs = all('.stage-bg')
      const words = all('.stage-word')
      const chars = words.map((word) => Array.from(word.querySelectorAll('.ch')))
      const sheetKids = all('.stage-sheet').map((sheet) => Array.from(sheet.children))
      const ticks = all('.stage-tick b')
      const marks = all('.stage-mark')
      const body = stage.querySelector('.stage-body')
      const chips = all('.stage-chip')
      const art = stage.querySelector('.stage-art')
      const tilt = stage.querySelector('.stage-tilt')
      const parts = all('.stage-decor').map((group) => Array.from(group.children))
      const vw = () => window.innerWidth

      // Fly-in / fly-out direction of every part: away from the middle of the drawing.
      const fly = new Map()
      parts.flat().forEach((el, index) => {
        let cx = 300
        let cy = 300
        try {
          const box = el.getBBox()
          cx = box.x + box.width / 2
          cy = box.y + box.height / 2
        } catch {
          /* no layout (tests): fall back to a fixed direction */
        }
        let dx = cx - 300
        let dy = cy - 300
        const len = Math.hypot(dx, dy) || 1
        dx /= len
        dy /= len
        fly.set(el, { dx, dy, spin: (index % 2 ? 1 : -1) * (10 + (index % 3) * 7) })
      })
      const fromX = (_i, el) => fly.get(el).dx * 150
      const fromY = (_i, el) => fly.get(el).dy * 150
      const fromRot = (_i, el) => fly.get(el).spin
      const outX = (_i, el) => fly.get(el).dx * 190
      const outY = (_i, el) => fly.get(el).dy * 190
      const outRot = (_i, el) => -fly.get(el).spin * 1.4

      gsap.set(parts.flat(), { transformOrigin: '50% 50%' })
      gsap.set(tilt, { transformOrigin: '50% 50%' })

      // Geometry that depends on the layout: always functions, re-read on every refresh.
      const drift = (word) => () => -Math.max(vw() * 0.04, word.offsetWidth + 2 * word.offsetLeft - vw())
      const gone = (word) => () => -(word.offsetWidth + word.offsetLeft + 80)
      const origin = () => `${art.offsetLeft + art.offsetWidth / 2}px ${art.offsetTop + art.offsetHeight / 2}px`
      const circle = (radius) => () => `circle(${radius}% at ${origin()})`

      // Entrance of act 1, scrubbed while the stage scrolls into view (before it pins).
      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: stage, start: 'top 85%', end: 'top top', scrub: 0.5, invalidateOnRefresh: true },
      })
      intro
        .fromTo(
          parts[0],
          { x: fromX, y: fromY, rotation: fromRot, scale: 0.5, autoAlpha: 0 },
          { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, ease: 'back.out(1.8)', duration: 0.7, stagger: 0.04 },
          0,
        )
        .fromTo(chars[0], { yPercent: 110, rotation: 10 }, { yPercent: 0, rotation: 0, stagger: 0.05, duration: 0.7 }, 0.1)
        .fromTo(sheetKids[0], { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 }, 0.45)
        .fromTo(ticks[0], { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'none' }, 0.2)

      // Extra touch: the object leans with the scroll speed and settles when it stops.
      const setTilt = gsap.quickTo(tilt, 'rotation', { duration: 0.7, ease: 'power3.out' })
      const idle = gsap.delayedCall(0.15, () => setTilt(0)).pause()

      // The pinned show.
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${Math.round(stage.offsetHeight * SCROLL_SCREENS)}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setTilt(gsap.utils.clamp(-4, 4, self.getVelocity() / -300))
            idle.restart(true)
          },
        },
      })
      gsap.set(bgs.slice(1), { clipPath: circle(0) })

      // Hold of act 1: the screwdriver wiggles, a loose screw hops.
      tl.fromTo(
        part(parts[0], 'driver'),
        { rotation: 0 },
        { rotation: -9, duration: 0.16, yoyo: true, repeat: 3, ease: 'sine.inOut', immediateRender: false },
        0.1,
      ).fromTo(
        part(parts[0], 'screw1'),
        { y: 0, rotation: 0 },
        { y: -34, rotation: 200, duration: 0.32, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false },
        0.2,
      )
      tl.fromTo(words[0], { x: 0 }, { x: drift(words[0]), duration: 0.9, ease: 'none', immediateRender: false }, 0)

      for (let i = 1; i < ACT_IDS.length; i += 1) {
        const at = STARTS[i - 1]
        const id = ACT_IDS[i]
        const prev = i - 1
        const exitFrom = prev === 0 ? { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1 } : null
        const exitTo = {
          x: outX,
          y: outY,
          rotation: outRot,
          scale: 0.6,
          autoAlpha: 0,
          duration: 0.55,
          ease: 'power3.in',
          stagger: 0.025,
        }

        // Old parts leave, each in its own direction.
        if (exitFrom) tl.fromTo(parts[prev], exitFrom, { ...exitTo, immediateRender: false }, at)
        else tl.to(parts[prev], exitTo, at)

        // Fact sheet out.
        const sheetOut = { y: -22, opacity: 0, duration: 0.3, stagger: 0.03, ease: 'power2.in' }
        if (prev === 0) tl.fromTo(sheetKids[prev], { y: 0, opacity: 1 }, { ...sheetOut, immediateRender: false }, at)
        else tl.to(sheetKids[prev], sheetOut, at)

        // The next colour opens as a circle from the middle of the object.
        tl.fromTo(bgs[i], { clipPath: circle(0) }, { clipPath: circle(150), duration: 1.05, ease: 'power2.inOut' }, at + 0.1)

        // Words: the old one leaves left letter by letter, the new one comes in from the right.
        tl.to(words[prev], { x: gone(words[prev]), duration: 1.05 }, at)
        tl.to(chars[prev], { yPercent: -45, rotation: -8, stagger: 0.02, duration: 0.5, ease: 'power2.in' }, at)
        tl.fromTo(words[i], { x: vw }, { x: 0, duration: 1.05 }, at + 0.1)
        tl.fromTo(
          chars[i],
          { yPercent: 115, rotation: 10 },
          { yPercent: 0, rotation: 0, stagger: 0.04, duration: 0.7, ease: 'back.out(1.7)' },
          at + 0.45,
        )

        // The shared structure morphs: body and chips keep their elements and change shape.
        tl.to(body, { attr: BODY[id], duration: 0.85 }, at + 0.2)
        chips.forEach((chip, j) => tl.to(chip, { attr: CHIPS[id][j], duration: 0.85 }, at + 0.2 + j * 0.03))

        // New parts fly in and overshoot.
        tl.fromTo(
          parts[i],
          { x: fromX, y: fromY, rotation: fromRot, scale: 0.5, autoAlpha: 0 },
          { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, ease: 'back.out(1.8)', duration: 0.7, stagger: 0.03 },
          at + 0.75,
        )

        // New fact sheet in, line by line.
        tl.fromTo(
          sheetKids[i],
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.45, ease: 'power3.out' },
          at + 0.9,
        )
        tl.fromTo(ticks[i], { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'none' }, at)

        // The word drifts while the act holds.
        tl.to(words[i], { x: drift(words[i]), duration: 1.4, ease: 'none' }, at + 1.15)
      }

      // Holds: each object plays its own scene.
      const [, rack, erp, code] = parts
      tl.fromTo(
        part(rack, 'patch').querySelector('.patch'),
        { x: 44 },
        { x: 0, duration: 0.8, ease: 'power3.out' },
        STARTS[0] + HOLD_AT,
      )

      const dx = ERP_DRAG.to.x - ERP_DRAG.from.x
      const dy = ERP_DRAG.to.y - ERP_DRAG.from.y
      const t2 = STARTS[1] + HOLD_AT
      tl.to(chips[6], { attr: { x: ERP_DRAG.to.x, y: ERP_DRAG.to.y }, duration: 0.9, ease: 'power2.inOut' }, t2)
      tl.to([part(erp, 'drag-lines'), part(erp, 'cursor')], { x: dx, y: dy, duration: 0.9, ease: 'power2.inOut' }, t2)
      tl.fromTo(
        part(erp, 'check').querySelector('.pop'),
        { scale: 0, transformOrigin: '50% 50%' },
        { scale: 1, duration: 0.3, ease: 'back.out(3)' },
        t2 + 0.8,
      )

      // Code is typed in line by line; the caret follows.
      const t3 = STARTS[2] + HOLD_AT
      const typed = Array.from(part(code, 'code').children)
      const caret = part(code, 'caret').querySelector('.caret')
      gsap.set(typed, { strokeDasharray: 1 })
      const lineDur = 0.12
      CODE_LINES.forEach((d, k) => {
        const [, sx, y, w] = /M(\d+) (\d+)h(\d+)/.exec(d).map(Number)
        const start = t3 + k * lineDur
        tl.fromTo(typed[k], { strokeDashoffset: 1.02 }, { strokeDashoffset: 0, duration: lineDur, ease: 'none' }, start)
        tl.fromTo(caret, { x: sx + 6 - 236, y: y - 320 }, { x: sx + w + 8 - 236, y: y - 320, duration: lineDur, ease: 'none' }, start)
      })

      // Ink marks drift at their own speeds for the whole show.
      tl.to(
        marks,
        { y: (i) => (i % 2 ? -1 : 1) * (50 + (i % 5) * 22), rotation: (i) => (i % 3 ? 70 : -90), ease: 'none', duration: TOTAL },
        0,
      )
      // Pad the timeline to its exact length: no dead scroll after the last act.
      tl.to({}, { duration: 0.0001 }, TOTAL)

      let alive = true
      document.fonts?.ready.then(() => alive && ScrollTrigger.refresh())
      return () => {
        alive = false
      }
    },
    { scope: root },
  )

  return (
    <div className="stage" data-pinned ref={root}>
      {acts.map((act) => (
        <div key={act.id} className="stage-bg" data-act={act.id} aria-hidden="true" />
      ))}
      <div className="stage-marks" aria-hidden="true">
        {MARKS.map((mark, index) => (
          <span
            key={index}
            className={`stage-mark ${mark.kind}`}
            style={{ left: `${mark.x}%`, top: `${mark.y}%`, '--s': `${mark.size}px` }}
          />
        ))}
      </div>
      <div className="stage-words" aria-hidden="true">
        {acts.map((act) => (
          <p key={act.id} className="stage-word">
            {Array.from(act.word).map((ch, index) => (
              <span key={index} className="ch">
                {ch}
              </span>
            ))}
          </p>
        ))}
      </div>
      <div className="stage-art" aria-hidden="true">
        <div className="stage-tilt">
          <svg className="stage-svg art-svg" viewBox="0 0 600 600" focusable="false">
            <rect className="f stage-body" {...BODY.taller} />
            {CHIPS.taller.map((chip, index) => (
              <rect key={index} className="f stage-chip" {...chip} />
            ))}
            {ACT_IDS.map((id) => {
              const Decor = DECOR[id]
              return (
                <g key={id} className="stage-decor" data-act={id}>
                  <Decor />
                </g>
              )
            })}
          </svg>
        </div>
      </div>
      <div className="stage-sheets">
        {acts.map((act, index) => (
          <article key={act.id} className="stage-sheet act-sheet" data-act={act.id}>
            <p className="act-count label">
              {label} {String(index + 1).padStart(2, '0')} / {String(acts.length).padStart(2, '0')}
            </p>
            <h3 className="act-role">{act.role}</h3>
            <p className="act-meta label">
              {act.company} · {act.period}
            </p>
            <ul className="act-tasks">
              {act.tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="stage-ticks" aria-hidden="true">
        {acts.map((act) => (
          <i key={act.id} className="stage-tick">
            <b />
          </i>
        ))}
      </div>
    </div>
  )
}
