import { TECH } from '../data/skills'

const ITEMS = Object.entries(TECH)

export default function TechMarquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <ul className="marquee-track">
        {[...ITEMS, ...ITEMS].map(([id, tech], index) => (
          <li key={`${id}-${index}`} className="marquee-item" data-duplicate={index >= ITEMS.length || undefined}>
            <tech.Icon style={{ color: tech.color }} />
            <span>{tech.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
