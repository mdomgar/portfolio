import { getActs } from '../data/acts'
import { useLang, useT } from '../i18n/useLang'
import './css/Acts.css'

// Four stacked colour blocks. The order is thematic (hardware to code), not chronological, so each
// fact sheet shows its real period. `.act-art` is the slot for the act's illustration.
export default function Acts({ reducedMotion: _reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const acts = getActs(lang)

  return (
    <section id="trayectoria" className="acts" aria-labelledby="acts-title">
      <header className="acts-intro">
        <h2 id="acts-title" className="acts-title">
          {t('actsTitle')}
        </h2>
      </header>
      {acts.map((act, index) => (
        <article key={act.id} className="act" data-act={act.id}>
          <div className="act-inner">
            <p className="giant act-word" aria-hidden="true">
              {act.word}
            </p>
            <div className="act-sheet">
              <p className="act-count label">
                {t('actLabel')} {String(index + 1).padStart(2, '0')} / {String(acts.length).padStart(2, '0')}
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
            </div>
            <div className="act-art" data-act={act.id} aria-hidden="true" />
          </div>
        </article>
      ))}
    </section>
  )
}
