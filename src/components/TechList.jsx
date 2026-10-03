import { TECH } from '../data/skills'

export default function TechList({ ids, label }) {
  return (
    <ul className="tech-list" aria-label={label}>
      {ids.map((id) => {
        const tech = TECH[id]
        return (
          <li key={id} className="chip">
            <tech.Icon aria-hidden="true" style={{ color: tech.color }} />
            {tech.name}
          </li>
        )
      })}
    </ul>
  )
}
