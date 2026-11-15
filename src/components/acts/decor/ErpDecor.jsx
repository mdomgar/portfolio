// Act 3: a monitor showing an ERP board. A cursor drags one card to the next column.
const LINE_CARDS = [
  [164, 206],
  [164, 270],
  [284, 206],
  [404, 206],
  [404, 268],
]

export default function ErpDecor() {
  return (
    <>
      <g className="p" data-part="chrome">
        <path className="s" d="M63 156H537" />
        <circle className="k" cx="86" cy="134" r="7" />
        <circle className="k" cx="108" cy="134" r="7" />
        <circle className="k" cx="130" cy="134" r="7" />
      </g>
      <g className="p" data-part="menu">
        {[196, 224, 252].map((y) => (
          <circle key={y} className="s" cx="115" cy={y} r="8" />
        ))}
        <circle className="f" cx="115" cy="378" r="14" />
      </g>
      <g className="p" data-part="headers">
        <path className="s" d="M164 188h60M284 188h60M404 188h60" />
        <circle className="k" cx="250" cy="188" r="7" />
        <circle className="k" cx="370" cy="188" r="7" />
        <circle className="k" cx="490" cy="188" r="7" />
      </g>
      <g className="p" data-part="lines">
        {LINE_CARDS.map(([x, y]) => (
          <path key={`${x}-${y}`} className="s" d={`M${x + 16} ${y + 20}h56M${x + 16} ${y + 34}h34`} />
        ))}
      </g>
      <g className="p" data-part="tags">
        <rect className="f" x="228" y="316" width="26" height="14" rx="7" />
        <rect className="f" x="348" y="256" width="26" height="14" rx="7" />
        <rect className="f" x="468" y="298" width="26" height="14" rx="7" />
      </g>
      <g className="p" data-part="progress">
        <path className="s" d="M180 330h74" />
      </g>
      <g className="p" data-part="drag-lines">
        <path className="s" d="M300 322h56M300 336h34" />
      </g>
      <g className="p" data-part="neck">
        <rect className="f" x="262" y="440" width="76" height="56" rx="6" />
      </g>
      <g className="p" data-part="power">
        <circle className="k" cx="300" cy="424" r="4" />
        <path className="s" d="M236 534h128" />
      </g>
      <g className="p" data-part="check">
        <g className="pop">
          <circle className="f" cx="486" cy="236" r="12" />
          <path className="s" d="M480 236l4 5 8-10" />
        </g>
      </g>
      <g className="p" data-part="cursor">
        <path className="k" stroke="#fffdf8" strokeWidth="4" strokeLinejoin="round" d="M330 330l52 28-22 6 14 26-12 6-14-26-16 16z" />
      </g>
    </>
  )
}
