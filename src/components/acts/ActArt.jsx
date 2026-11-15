import { BODY, CHIPS } from './scene'
import { DECOR } from './decor'

// The static illustration of one act: body, chips and decor already in place.
// Used by the stacked layout (reduced motion, prerender, no JS). The pinned stage reuses the same
// parts but keeps them in one SVG and morphs them from act to act.
export default function ActArt({ actId }) {
  const Decor = DECOR[actId]
  return (
    <svg className="art-svg" viewBox="0 0 600 600" focusable="false" aria-hidden="true">
      <rect className="f" {...BODY[actId]} />
      {CHIPS[actId].map((chip, index) => (
        <rect key={index} className="f" {...chip} />
      ))}
      <Decor />
    </svg>
  )
}
