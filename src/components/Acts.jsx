import { useSyncExternalStore } from 'react'
import { getActs } from '../data/acts'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useLang, useT } from '../i18n/useLang'
import ActArt from './acts/ActArt'
import ActsStage from './acts/ActsStage'
import './css/Acts.css'

const noopSubscribe = () => () => {}
// False while prerendering and during hydration, true afterwards: the server HTML and the first client
// render are both the complete static version, so there is nothing to mismatch.
const useHydrated = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

// Four colour blocks. The order is thematic (hardware to code), not chronological, so each fact sheet
// shows its real period. Static and stacked for reduced motion, short windows, prerender and no JS;
// otherwise one pinned, scroll-driven stage.
export default function Acts({ reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const acts = getActs(lang)
  const hydrated = useHydrated()
  const tooShort = useMediaQuery('(max-height: 539px)')
  const showStage = hydrated && !reducedMotion && !tooShort

  return (
    <section id="trayectoria" className="acts" aria-labelledby="acts-title">
      <header className="acts-intro">
        <h2 id="acts-title" className="acts-title">
          {t('actsTitle')}
        </h2>
      </header>
      {showStage ? (
        <ActsStage key={lang} acts={acts} label={t('actLabel')} />
      ) : (
        acts.map((act, index) => (
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
              <div className="act-art" data-act={act.id} aria-hidden="true">
                <ActArt actId={act.id} />
              </div>
            </div>
          </article>
        ))
      )}
    </section>
  )
}
