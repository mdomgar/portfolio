import { useEffect, useRef, useState } from 'react'
import { frameUrl, SEQUENCE } from '../data/sequence'
import { profile } from '../data/profile'
import { localize } from '../data/localize'
import { useHydrated } from '../hooks/useHydrated'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useLang } from '../i18n/useLang'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { landOnHash } from '../lib/hashLanding'
import ScrollSequence from './ScrollSequence'
import './css/Opening.css'

// Phones, and anything taller than wide, get the portrait frames. The same query picks the preloaded
// frame in routes/home.jsx and the layout in Opening.css.
export const PORTRAIT_QUERY = '(orientation: portrait), (max-width: 767px)'
export const DESKTOP_QUERY = '(orientation: landscape) and (min-width: 768px)'

// Where the computer sits inside each frame (fractions of the frame): the start of the scroll fits this box
// into the free slot beside the text, then the whole frame grows until it covers the viewport.
const DRAWING = {
  desktop: { x0: 0.098, y0: 0.117, x1: 0.881, y1: 0.972 },
  mobile: { x0: 0.095, y0: 0.208, x1: 0.986, y1: 0.889 },
}

// The same boxes as CSS variables on the section: the static (prerender) image is placed with them, so it
// sits exactly where the animated canvas starts and nothing jumps when the page hydrates.
const DRAWING_VARS = Object.fromEntries(
  Object.entries(DRAWING).flatMap(([variant, box]) => {
    const key = variant === 'desktop' ? 'd' : 'm'
    const spec = SEQUENCE[variant]
    return [
      [`--${key}-w`, box.x1 - box.x0],
      [`--${key}-h`, box.y1 - box.y0],
      [`--${key}-cx`, (box.x0 + box.x1) / 2],
      [`--${key}-cy`, (box.y0 + box.y1) / 2],
      [`--${key}-ar`, spec.width / spec.height],
    ]
  }),
)

// First frame that is the flat screen colour edge to edge (measured on the pixels of each set).
const SOLID_FROM = { desktop: 80, mobile: 51 }
// Share of the pin's scroll at which the screen already covers the whole viewport (the frame is cropped to the
// viewport, so a little before the first solid frame). Measured on settled captures; the bar turns ink there.
const NAV_INK_AT = { desktop: 0.8, mobile: 0.835 }

// Scroll length of the pinned opening, in viewport heights.
const SCROLL_SCREENS = 2.6
// Timeline units. The frame sequence plays over 0..END; the screen fills the frame at FILL.
const END = 0.92
const STATIC_FRAME = { desktop: frameUrl('desktop', 1), mobile: frameUrl('mobile', 1) }

function Lead({ lang }) {
  return (
    <div className="opening-lead">
      <p className="opening-statement">{localize(profile.hero.statement, lang)}</p>
      <p className="opening-context label">{localize(profile.hero.context, lang)}</p>
    </div>
  )
}

function Title({ role }) {
  return (
    <h1 id="opening-title" className="opening-title giant">
      <span className="opening-line">{profile.shortName}</span>
      <span className="sr-only">, </span>
      <span className="opening-line opening-role">{role}</span>
    </h1>
  )
}

// The name and the role are one heading at one size. Static (prerender, reduced motion, no JS, short
// windows): the first frame as a plain image. Otherwise a pinned scroll show: the frames scrub on a
// canvas while the name moves away, the computer grows to cover the viewport, and the screen colour
// hands over to the next section.
export default function Opening({ reducedMotion }) {
  const lang = useLang()
  const role = localize(profile.hero.role, lang)
  const hydrated = useHydrated()
  const tooShort = useMediaQuery('(max-height: 539px)')
  const portrait = useMediaQuery(PORTRAIT_QUERY)
  const animated = hydrated && !reducedMotion && !tooShort
  const sectionRef = useRef(null)
  const wasInside = useRef(false)
  const previous = useRef({ hydrated: false, animated: false })

  // Remember whether the visitor is inside the opening, so a switch between the pinned and the static
  // version (reduced motion toggled at runtime) brings them back to its top instead of somewhere arbitrary.
  useEffect(() => {
    if (!hydrated) return undefined
    const update = () => {
      const rect = sectionRef.current?.getBoundingClientRect()
      wasInside.current = !!rect && rect.top <= 0 && rect.bottom > 0
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [hydrated])

  useEffect(() => {
    const before = previous.current
    previous.current = { hydrated, animated }
    if (!hydrated || !before.hydrated || before.animated === animated || !wasInside.current) return undefined
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [hydrated, animated])

  return (
    <section
      id="inicio"
      ref={sectionRef}
      className="opening"
      aria-labelledby="opening-title"
      data-pinned={animated ? '' : undefined}
      style={DRAWING_VARS}
    >
      {animated ? (
        <OpeningShow key={`${lang}-${portrait}`} lang={lang} role={role} variant={portrait ? 'mobile' : 'desktop'} />
      ) : (
        <div className="opening-stage">
          <div className="opening-title-wrap">
            <Title role={role} />
          </div>
          <div className="opening-lead-wrap">
            <Lead lang={lang} />
          </div>
          <div className="opening-seq" aria-hidden="true">
            <picture>
              <source
                media={PORTRAIT_QUERY}
                srcSet={STATIC_FRAME.mobile}
                width={SEQUENCE.mobile.width}
                height={SEQUENCE.mobile.height}
              />
              <img
                className="opening-frame"
                src={STATIC_FRAME.desktop}
                width={SEQUENCE.desktop.width}
                height={SEQUENCE.desktop.height}
                alt=""
                fetchPriority="high"
              />
            </picture>
          </div>
        </div>
      )}
    </section>
  )
}

function OpeningShow({ lang, role, variant }) {
  const stageRef = useRef(null)
  const slotRef = useRef(null)
  const wrapRef = useRef(null)
  const titleRef = useRef(null)
  const leadRef = useRef(null)
  const backdropRef = useRef(null)
  const canvasRef = useRef(null)
  const sequenceRef = useRef(null)
  const [drawn, setDrawn] = useState(false)
  const spec = SEQUENCE[variant]

  useGSAP(
    () => {
      const stage = stageRef.current
      const box = DRAWING[variant]
      const share = (SOLID_FROM[variant] - 1) / (spec.count - 1)
      const FILL = END * share

      // Where the wrapper must sit at the start so the computer fills the free slot. Function-based
      // values, re-read on every refresh: the slot follows the layout.
      const start = () => {
        const W = stage.clientWidth
        const H = stage.clientHeight
        const cover = Math.max(W / spec.width, H / spec.height)
        const bw = (box.x1 - box.x0) * spec.width * cover
        const bh = (box.y1 - box.y0) * spec.height * cover
        const cx = W / 2 + ((box.x0 + box.x1) / 2 - 0.5) * spec.width * cover
        const cy = H / 2 + ((box.y0 + box.y1) / 2 - 0.5) * spec.height * cover
        const slot = slotRef.current.getBoundingClientRect()
        const base = stage.getBoundingClientRect()
        const scale = Math.min(slot.width / bw, slot.height / bh, 1)
        const sx = slot.left - base.left + slot.width / 2
        const sy = slot.top - base.top + slot.height / 2
        return { scale, x: sx - W / 2 - scale * (cx - W / 2), y: sy - H / 2 - scale * (cy - H / 2) }
      }

      const seq = { p: 0 }
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${Math.round(stage.offsetHeight * SCROLL_SCREENS)}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // The frames follow the scroll.
      tl.to(seq, { p: 1, duration: END, onUpdate: () => sequenceRef.current?.setProgress(seq.p) }, 0)

      // The computer grows from its slot until it covers the viewport.
      tl.fromTo(
        wrapRef.current,
        { xPercent: -50, yPercent: -50, x: () => start().x, y: () => start().y, scale: () => start().scale },
        { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1, duration: 0.5, ease: 'power2.inOut', immediateRender: true },
        0,
      )

      // Name, role and statement make room for the dive.
      tl.fromTo(
        leadRef.current,
        { opacity: 1, y: 0 },
        { opacity: 0, y: 40, duration: 0.14, ease: 'power2.in', immediateRender: false },
        0,
      )
      tl.fromTo(
        titleRef.current,
        { opacity: 1, yPercent: 0, scale: 1 },
        { opacity: 0, yPercent: -40, scale: 1.12, duration: 0.22, ease: 'power2.in', immediateRender: false },
        0.02,
      )

      // The end is plain CSS colour, never WebP pixels: a solid backdrop in the screen colour comes up
      // under the canvas, then the canvas fades away over it, so the pin hands over pure ink to the next
      // section.
      tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.07, immediateRender: false }, FILL)
      tl.fromTo(canvasRef.current, { opacity: 1 }, { opacity: 0, duration: 0.05, immediateRender: false }, FILL + 0.08)
      tl.to({}, { duration: 0.0001 }, END)

      // The bar over the screen is ink while the screen is ink: from the moment it fills the frame until
      // the next section has scrolled away.
      const root = document.documentElement
      const ink = ScrollTrigger.create({
        trigger: stage,
        start: () => tl.scrollTrigger.start + (tl.scrollTrigger.end - tl.scrollTrigger.start) * NAV_INK_AT[variant],
        // The pin spacer is not known to an endTrigger's position, so measure from the pin's own end: once it
        // releases, the stage scrolls away and "hoy" follows it directly.
        end: () => {
          const nav = parseInt(getComputedStyle(root).getPropertyValue('--nav-h'), 10) || 64
          const next = document.getElementById('hoy')
          return tl.scrollTrigger.end + stage.offsetHeight + (next ? next.offsetHeight : 0) - nav
        },
        invalidateOnRefresh: true,
        onToggle: (self) => root.classList.toggle('nav-ink', self.isActive),
      })

      landOnHash()
      return () => {
        root.classList.remove('nav-ink')
        ink.kill()
      }
    },
    { scope: stageRef, dependencies: [variant], revertOnUpdate: true },
  )

  return (
    <div className="opening-stage" ref={stageRef}>
      <div className="opening-backdrop" ref={backdropRef} aria-hidden="true" style={{ background: SEQUENCE.screenColor }} />
      <div className="opening-seq" aria-hidden="true">
        <div className="opening-wrap" ref={wrapRef} style={{ '--ar': spec.width / spec.height }}>
          <img
            className="opening-frame"
            src={frameUrl(variant, 1)}
            width={spec.width}
            height={spec.height}
            alt=""
            style={{ visibility: drawn ? 'hidden' : 'visible' }}
          />
          <div className="opening-canvas" ref={canvasRef}>
            <ScrollSequence ref={sequenceRef} variant={variant} onDraw={() => setDrawn(true)} />
          </div>
        </div>
      </div>
      <div ref={slotRef} className="opening-slot" aria-hidden="true" />
      <div ref={titleRef} className="opening-title-wrap">
        <Title role={role} />
      </div>
      <div ref={leadRef} className="opening-lead-wrap">
        <Lead lang={lang} />
      </div>
    </div>
  )
}
