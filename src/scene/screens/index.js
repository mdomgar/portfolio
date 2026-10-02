import { drawCode } from './code'
import { DASHBOARD_LABELS, drawDashboard } from './dashboard'
import { drawSiteBuild, SITE_BUILD_LABELS } from './siteBuild'
import { drawSeenat, SEENAT_LABELS } from './seenat'

// Three-free: used by the 3D monitors/phone and by the HTML previews (static tier, stacked services, case pages).
export const SCREENS = {
  code: {
    width: 1024,
    height: 368,
    draw: (ctx, time, width, height, complete) => drawCode(ctx, time, width, height, complete),
  },
  dashboard: {
    width: 1024,
    height: 368,
    altKey: 'dashboardAlt',
    draw: (ctx, time, width, height, complete, lang = 'es') =>
      drawDashboard(ctx, time, width, height, complete, DASHBOARD_LABELS[lang] ?? DASHBOARD_LABELS.es),
  },
  'site-build': {
    width: 1024,
    height: 368,
    altKey: 'siteBuildAlt',
    draw: (ctx, time, width, height, complete, lang = 'es') =>
      drawSiteBuild(ctx, time, width, height, complete, SITE_BUILD_LABELS[lang] ?? SITE_BUILD_LABELS.es),
  },
  seenat: {
    width: 360,
    height: 720,
    altKey: 'seenatAlt',
    draw: (ctx, time, width, height, complete, lang = 'es') =>
      drawSeenat(ctx, time, width, height, complete, SEENAT_LABELS[lang] ?? SEENAT_LABELS.es),
  },
}
