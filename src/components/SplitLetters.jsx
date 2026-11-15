import './css/SplitLetters.css'

// A word drawn letter by letter so each letter can rise out of its own mask. The real text stays in the
// accessibility tree (sr-only); the letters are decoration.
export default function SplitLetters({ text }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="letters" aria-hidden="true">
        {[...text].map((char, index) => (
          <span key={`${index}-${char}`} className="l">
            <span className="l-inner">{char}</span>
          </span>
        ))}
      </span>
    </>
  )
}
