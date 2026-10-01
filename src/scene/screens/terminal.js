export const TERMINAL_LINES = [
  { text: '$ npm run dev', color: '#e8ecf4' },
  { text: '  VITE v7 ready in 312 ms', color: '#3ddc97' },
  { text: '  ➜ Local: localhost:5173', color: '#00e5ff' },
  { text: '$ git add .', color: '#e8ecf4' },
  { text: '$ git commit -m "feat: 3d desk"', color: '#e8ecf4' },
  { text: '  [redesign-3d] 1 file changed', color: '#8a93a6' },
  { text: '$ npm test', color: '#e8ecf4' },
  { text: '  ✓ all tests passed', color: '#3ddc97' },
]

const SECONDS_PER_LINE = 0.9

export function drawTerminal(ctx, time, width, height, complete = false) {
  const cycleLines = TERMINAL_LINES.length + 3
  const visible = complete
    ? TERMINAL_LINES.length
    : Math.min(TERMINAL_LINES.length, Math.floor(time / SECONDS_PER_LINE) % cycleLines)

  ctx.fillStyle = '#07090f'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#131722'
  ctx.fillRect(0, 0, width, 30)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((color, index) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(18 + index * 18, 15, 5, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.font = '17px "JetBrains Mono", monospace'
  TERMINAL_LINES.slice(0, visible).forEach((line, index) => {
    ctx.fillStyle = line.color
    ctx.fillText(line.text, 14, 62 + index * 28)
  })
  if (Math.floor(time * 2) % 2 === 0) {
    ctx.fillStyle = '#00e5ff'
    ctx.fillRect(14, 62 + visible * 28 - 16, 10, 20)
  }
}
