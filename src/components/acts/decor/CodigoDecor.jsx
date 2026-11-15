// Act 4: a laptop with an editor. The code lines type themselves in during the hold.
import { CODE_LINES } from '../scene'

export default function CodigoDecor() {
  return (
    <>
      <g className="p" data-part="chrome">
        <path className="s" d="M93 158H507" />
        <circle className="k" cx="114" cy="136" r="6" />
        <circle className="k" cx="134" cy="136" r="6" />
        <path className="s" d="M366 136h110" />
      </g>
      <g className="p" data-part="numbers">
        {[190, 216, 242, 268, 294, 320].map((y) => (
          <path key={y} className="s" d={`M114 ${y}h20`} />
        ))}
      </g>
      <g className="p" data-part="code">
        {CODE_LINES.map((d) => (
          <path key={d} className="s code" pathLength="1" d={d} />
        ))}
      </g>
      <g className="p" data-part="caret">
        <rect className="k caret" x="236" y="308" width="14" height="24" />
      </g>
      <g className="p" data-part="terminal">
        <path className="s" d="M318 318l14 11-14 11M344 340h40" />
      </g>
      <g className="p" data-part="minimap">
        <path className="s" d="M472 190h16M472 206h10M472 222h16M472 238h12M472 254h16" />
      </g>
      <g className="p" data-part="status">
        <circle className="k" cx="118" cy="381" r="2" />
      </g>
      <g className="p" data-part="keys">
        <path className="s" d="M62 426H538" strokeDasharray="12 18" />
        <path className="s" d="M255 412h90" />
      </g>
      <g className="p" data-part="hinge">
        <path className="s" d="M110 400v12M490 400v12" />
      </g>
      <g className="p" data-part="handle">
        <path className="f" d="M540 498h10a15 15 0 0 1 0 30h-10" />
      </g>
      <g className="p" data-part="steam">
        <g className="steam">
          <path className="s" d="M488 466c-10-12 10-18 0-32M514 466c-10-12 10-18 0-32" />
        </g>
      </g>
    </>
  )
}
