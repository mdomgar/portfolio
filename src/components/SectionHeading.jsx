export default function SectionHeading({ id, eyebrow, title }) {
  return (
    <header className="section-heading">
      <span className="section-eyebrow" aria-hidden="true">
        {eyebrow}
      </span>
      <h2 id={id}>{title}</h2>
    </header>
  )
}
