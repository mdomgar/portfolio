import { DASHBOARD_LABELS, drawDashboard } from './dashboard'

// Canvas drawings shown as HTML previews (case pages).
export const SCREENS = {
  dashboard: {
    width: 1024,
    height: 368,
    altKey: 'dashboardAlt',
    draw: (ctx, time, width, height, complete, lang = 'es') =>
      drawDashboard(ctx, time, width, height, complete, DASHBOARD_LABELS[lang] ?? DASHBOARD_LABELS.es),
  },
}
