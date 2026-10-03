import { useEffect } from 'react'
import { profile } from '../data/profile'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { FINAL_MOMENT, useHeroSequence } from '../hooks/useHeroSequence'
import { useSceneCue } from '../hooks/useSceneCue'
import { useSceneStore } from '../store/sceneStore'
import HeroPortrait from './HeroPortrait'
import SplitWords from './SplitWords'
import './css/Hero.css'

function questionState(index, moment) {
  const own = index + 1
  if (moment === FINAL_MOMENT) return 'settled'
  if (moment === own) return 'active'
  return moment > own ? 'past' : 'upcoming'
}

export default function Hero({ ready, reducedMotion }) {
  const lang = useLang()
  const t = useT()
  const { moment, instant } = useHeroSequence({ running: ready, reducedMotion })
  const final = moment === FINAL_MOMENT
  useSceneCue(final ? null : `hero-q${moment}`)
  // After the cue above is released (same commit, earlier effect): a key skip snaps the camera too.
  useEffect(() => {
    if (final && instant) useSceneStore.getState().requestCameraSnap()
  }, [final, instant])
  const shown = final && ready
  const answer = localize(profile.hero.answer, lang)

  return (
    <section
      id="hero"
      className="hero"
      aria-labelledby="hero-title"
      data-ready={ready ? 'true' : 'false'}
      data-moment={moment}
      data-reduced={reducedMotion ? 'true' : 'false'}
      data-instant={instant ? 'true' : 'false'}
    >
      <p className="hero-bgname" aria-hidden="true">
        Miguel Ángel
      </p>
      <div className="container hero-content">
        <ol className="hero-questions">
          {profile.hero.questions.map((question, index) => (
            <li key={question.es} className="hero-q" data-state={questionState(index, moment)} style={{ '--i': index }}>
              <SplitWords text={localize(question, lang)} mask />
            </li>
          ))}
        </ol>
        {/* data-text feeds the ::after neon sweep, so the answer is a single text node in the DOM. */}
        <h1 id="hero-title" className="hero-answer" data-text={answer} data-state={final ? 'active' : 'upcoming'}>
          <SplitWords text={answer} mask />
        </h1>
        <div className="hero-body" data-visible={shown ? 'true' : 'false'}>
          <p className="hero-intro">{localize(profile.hero.intro, lang)}</p>
          <p className="hero-proof mono">{localize(profile.hero.proof, lang)}</p>
          <div className="hero-ctas">
            <a className="btn btn-primary" href="#brief">
              {t('ctaBrief')}
            </a>
            <a className="btn" href="#casos">
              {t('heroCtaCases')}
            </a>
          </div>
        </div>
      </div>
      <HeroPortrait reducedMotion={reducedMotion} visible={shown} />
    </section>
  )
}
