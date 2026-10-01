import { useEffect, useState } from 'react'
import { usePreload } from '../hooks/usePreload'
import { useT } from '../i18n/useLang'
import './css/Preloader.css'

export default function Preloader({ tasks, reducedMotion, onDone }) {
  const t = useT()
  const { progress, finished } = usePreload(tasks, { minDuration: reducedMotion ? 0 : 1400 })
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('is-loading')
    return () => document.documentElement.classList.remove('is-loading')
  }, [])

  useEffect(() => {
    if (!finished) return undefined
    document.documentElement.classList.remove('is-loading')
    onDone()
    const id = setTimeout(() => setHidden(true), reducedMotion ? 0 : 900)
    return () => clearTimeout(id)
  }, [finished, reducedMotion, onDone])

  if (hidden) return null

  return (
    <div className={`preloader${finished ? ' is-done' : ''}`} role="status" aria-busy={!finished}>
      <span className="sr-only">{t('loading')}</span>
      <p className="preloader-brand" aria-hidden="true">
        &lt;MDG /&gt;
      </p>
      <p className="preloader-count" aria-hidden="true">
        {String(progress).padStart(3, '0')}
      </p>
      <div className="preloader-bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
    </div>
  )
}
