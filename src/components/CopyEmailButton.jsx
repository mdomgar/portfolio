import { useEffect, useState } from 'react'
import { FiCopy } from 'react-icons/fi'
import { copyText } from '../lib/clipboard'
import { useT } from '../i18n/useLang'

export default function CopyEmailButton({ email }) {
  const t = useT()
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (status !== 'copied') return undefined
    const id = setTimeout(() => setStatus('idle'), 2500)
    return () => clearTimeout(id)
  }, [status])

  const handleClick = async () => {
    setStatus((await copyText(email)) ? 'copied' : 'failed')
  }

  return (
    <div className="copy-email">
      <button type="button" className="btn btn-primary" onClick={handleClick}>
        <FiCopy aria-hidden="true" />
        {t('copyEmail')}
      </button>
      <p className="copy-email-status" role="status">
        {status === 'copied' && t('emailCopied')}
        {status === 'failed' && (
          <>
            {t('copyFailed')}{' '}
            <a href={`mailto:${email}`} className="mono">
              {email}
            </a>
          </>
        )}
      </p>
    </div>
  )
}
