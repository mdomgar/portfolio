import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function Reveal({ as: Tag = 'div', children, stagger = 0.08, y = 32, ...rest }) {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()

  useGSAP(
    () => {
      if (reducedMotion) return
      gsap.from(ref.current.children, {
        y,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
      })
    },
    { scope: ref, dependencies: [reducedMotion] },
  )

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  )
}
