import { localize } from '../data/localize'
import { profile } from '../data/profile'
import { TECH_GROUPS } from '../data/skills'
import { useLang, useT } from '../i18n/useLang'
import TechList from './TechList'
import './css/Background.css'

export default function Background() {
  const lang = useLang()
  const t = useT()

  return (
    <section id="formacion" className="section background" aria-labelledby="background-title">
      <div className="container">
        <h2 id="background-title" className="background-title">
          {t('backgroundTitle')}
        </h2>
        <p className="background-education">{localize(profile.about.education, lang)}</p>
        <div className="background-groups">
          {TECH_GROUPS.map((group) => {
            const title = localize(group.title, lang)
            return (
              <div key={group.id} className="background-group">
                <p className="label background-group-title" aria-hidden="true">
                  {title}
                </p>
                <TechList ids={group.ids} label={title} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
