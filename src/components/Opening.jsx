import { profile } from '../data/profile'
import { localize } from '../data/localize'
import { useLang } from '../i18n/useLang'
import './css/Opening.css'

// The name and the role are one heading at one size; on a phone each line wraps by word.
// `.opening-seq` is the slot the pre-rendered 3D sequence will fill: empty, it is a plain box.
export default function Opening({ reducedMotion: _reducedMotion }) {
  const lang = useLang()
  const role = localize(profile.hero.role, lang)

  return (
    <section id="inicio" className="opening" aria-labelledby="opening-title">
      <h1 id="opening-title" className="opening-title giant">
        <span className="opening-line">{profile.shortName}</span>
        <span className="sr-only">, </span>
        <span className="opening-line opening-role">{role}</span>
      </h1>
      <div className="opening-lead">
        <p className="opening-statement">{localize(profile.hero.statement, lang)}</p>
        <p className="opening-context label">{localize(profile.hero.context, lang)}</p>
      </div>
      <div className="opening-seq" aria-hidden="true" />
    </section>
  )
}
