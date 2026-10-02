import { Fragment } from 'react'
import './css/SplitWords.css'

export default function SplitWords({ text, mask = false, className }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <span className={className}>
      {words.map((word, index) => (
        <Fragment key={`${index}-${word}`}>
          <span className={mask ? 'w w-mask' : 'w'} style={{ '--i': index }}>
            {mask ? <span className="w-inner">{word}</span> : word}
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  )
}
