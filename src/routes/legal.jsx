import LegalPage from '../components/LegalPage'
import { legalPages } from '../data/legal'
import { getPageSeo } from '../data/seo'
import { buildMeta } from '../lib/seo'

const PATH = '/aviso-legal'

export const meta = () => buildMeta({ path: PATH, ...getPageSeo(PATH) })

export default function Legal() {
  return <LegalPage page={legalPages.legal} />
}
