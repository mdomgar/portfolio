// Geometry of the four illustrations, all in one 600x600 viewBox.
// The main body and nine "chips" (inner panels) are shared by every act: the stage keeps the same
// elements and morphs their attributes, so one object visibly turns into the next. Everything else
// is per-act decor (see ./decor).
export const ACT_IDS = ['taller', 'servidores', 'erp', 'codigo']

export const BODY = {
  taller: { x: 190, y: 90, width: 220, height: 420, rx: 14 },
  servidores: { x: 170, y: 60, width: 260, height: 480, rx: 6 },
  erp: { x: 60, y: 100, width: 480, height: 340, rx: 18 },
  codigo: { x: 90, y: 110, width: 420, height: 290, rx: 16 },
}

const c = (x, y, width, height, rx = 6) => ({ x, y, width, height, rx })

// Index i is the same SVG element in every act. Order is chosen so each chip travels to a
// neighbouring role (tall panel to tall panel, bottom bar to bottom bar).
export const CHIPS = {
  // motherboard, PSU, three drive bays, three RAM sticks, expansion card
  taller: [
    c(202, 122, 146, 170),
    c(202, 420, 196, 76),
    c(358, 122, 40, 52),
    c(358, 184, 40, 52),
    c(358, 246, 40, 52),
    c(278, 136, 12, 78, 4),
    c(298, 136, 12, 78, 4),
    c(318, 136, 12, 78, 4),
    c(202, 304, 146, 34),
  ],
  // storage unit, bottom unit, three top units, three network ports, fifth unit
  servidores: [
    c(186, 274, 228, 84, 4),
    c(186, 434, 228, 56, 4),
    c(186, 76, 228, 56, 4),
    c(186, 142, 228, 56, 4),
    c(186, 208, 228, 56, 4),
    c(368, 90, 30, 26, 4),
    c(368, 156, 30, 26, 4),
    c(368, 222, 30, 26, 4),
    c(186, 368, 228, 56, 4),
  ],
  // sidebar, stand base, search bar, six kanban cards (index 6 is the one that gets dragged)
  erp: [
    c(84, 172, 62, 236),
    c(210, 496, 180, 22, 8),
    c(330, 120, 170, 26, 13),
    c(164, 206, 106, 52),
    c(164, 270, 106, 78),
    c(284, 206, 106, 84),
    c(284, 302, 106, 56),
    c(404, 206, 106, 50),
    c(404, 268, 106, 58),
  ],
  // line-number gutter, keyboard deck, two tabs, terminal, minimap, trackpad, status bar, mug
  codigo: [
    c(102, 168, 44, 198),
    c(36, 412, 528, 58, 14),
    c(158, 122, 88, 26, 8),
    c(254, 122, 88, 26, 8),
    c(300, 300, 150, 56, 8),
    c(462, 170, 36, 120),
    c(236, 436, 128, 24),
    c(102, 374, 396, 14, 4),
    c(470, 484, 70, 64, 12),
  ],
}

// Where the dragged ERP card ends up (it lives in the hold of act 3).
export const ERP_DRAG = { from: { x: 284, y: 302 }, to: { x: 404, y: 338 } }

// Lines of code typed in during act 4: each is `M<x> <y>h<width>`.
export const CODE_LINES = [
  'M162 190h138',
  'M190 216h200',
  'M190 242h130',
  'M218 268h190',
  'M190 294h84',
  'M162 320h66',
]
