import { profile } from '../data/profile'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'

export default function OwnerDetails({ legal }) {
  const lang = useLang()
  const t = useT()
  return (
    <dl className="legal-owner">
      <div>
        <dt>{t('legalHolder')}</dt>
        <dd>{legal.holder}</dd>
      </div>
      {legal.nif && (
        <div>
          <dt>{t('legalNif')}</dt>
          <dd>{legal.nif}</dd>
        </div>
      )}
      <div>
        <dt>{t('legalAddress')}</dt>
        <dd>{localize(legal.address, lang)}</dd>
      </div>
      <div>
        <dt>{t('legalEmail')}</dt>
        <dd>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </dd>
      </div>
    </dl>
  )
}
