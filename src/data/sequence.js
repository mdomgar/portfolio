// Pre-rendered Blender opening: a retro PC that turns while the camera flies
// into the monitor until its screen fills the frame. Frames live in public/seq/
// and are regenerated with scripts/blender/retro_pc.py (see its README).

export const SEQUENCE = {
  // Flat colour of the monitor screen in the last frames. The section that
  // follows the opening uses the same ink colour for its background.
  screenColor: '#121212',
  desktop: { count: 96, width: 1600, height: 900, dir: '/seq/desktop' },
  mobile: { count: 60, width: 800, height: 1200, dir: '/seq/mobile' },
}

// 1-based, four-digit frame url: frameUrl('desktop', 1) -> '/seq/desktop/0001.webp'
export function frameUrl(variant, index) {
  return `${SEQUENCE[variant].dir}/${String(index).padStart(4, '0')}.webp`
}
