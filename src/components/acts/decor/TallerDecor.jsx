// Act 1: an open tower in the workshop. Each direct child is one flying part.
export default function TallerDecor() {
  return (
    <>
      <g className="p" data-part="floor">
        <path className="s" d="M96 524H584" />
        <rect className="f" x="210" y="510" width="30" height="12" rx="3" />
        <rect className="f" x="360" y="510" width="30" height="12" rx="3" />
      </g>
      <g className="p" data-part="panel">
        <g transform="rotate(-11 92 318)">
          <rect className="f" x="30" y="150" width="124" height="336" rx="10" />
          <path className="s" d="M52 190h80M52 212h80M52 234h80M52 256h80" />
          <rect className="f" x="62" y="330" width="60" height="26" rx="13" />
          <circle className="k" cx="46" cy="170" r="4" />
          <circle className="k" cx="138" cy="170" r="4" />
          <circle className="k" cx="46" cy="466" r="4" />
          <circle className="k" cx="138" cy="466" r="4" />
        </g>
      </g>
      <g className="p" data-part="power">
        <circle className="f" cx="222" cy="104" r="9" />
        <circle className="k" cx="250" cy="104" r="4" />
        <path className="s" d="M290 104h96" />
      </g>
      <g className="p" data-part="socket">
        <rect className="f" x="212" y="136" width="62" height="62" rx="8" />
      </g>
      <g className="p" data-part="fan">
        <g className="fan">
          <circle className="s" cx="243" cy="167" r="22" />
          <path className="s" d="M243 147v40M223 167h40M229 153l28 28M257 153l-28 28" />
        </g>
      </g>
      <g className="p" data-part="board">
        <circle className="f" cx="218" cy="226" r="6" />
        <circle className="f" cx="238" cy="226" r="6" />
        <circle className="f" cx="258" cy="226" r="6" />
        <path className="s" d="M214 266h122" />
      </g>
      <g className="p" data-part="bays">
        <path className="s" d="M366 148h24M366 210h24M366 272h24" />
      </g>
      <g className="p" data-part="card">
        <path className="s" d="M216 321h44M274 321h60" />
      </g>
      <g className="p" data-part="psu">
        <circle className="s" cx="236" cy="458" r="24" />
        <circle className="k" cx="236" cy="458" r="5" />
        <path className="s" d="M290 438h86M290 454h86M290 470h86" />
      </g>
      <g className="p" data-part="cables">
        <path className="s" d="M240 420C240 372 268 372 268 338" />
        <path className="s" d="M378 298C378 346 338 336 322 372C314 396 292 398 292 420" />
      </g>
      <g className="p" data-part="cord">
        <path className="s" d="M398 462C470 462 470 520 520 520" />
        <rect className="f" x="520" y="504" width="36" height="32" rx="6" />
        <path className="s" d="M556 514h20M556 526h20" />
      </g>
      <g className="p" data-part="driver">
        <g className="driver" transform="rotate(34 500 300)">
          <rect className="f" x="486" y="150" width="30" height="96" rx="13" />
          <path className="s" d="M494 170v56M508 170v56" />
          <rect className="f" x="494" y="246" width="14" height="14" rx="3" />
          <path className="s" d="M501 260v110" />
          <path className="s" d="M492 372h18" />
        </g>
      </g>
      <g className="p" data-part="screw1">
        <circle className="f" cx="450" cy="508" r="10" />
        <path className="s" d="M443 508h14" />
      </g>
      <g className="p" data-part="screw2">
        <circle className="f" cx="486" cy="512" r="10" />
        <path className="s" d="M481 505l10 14" />
      </g>
      <g className="p" data-part="screw3">
        <circle className="f" cx="104" cy="510" r="10" />
        <path className="s" d="M104 502v16" />
      </g>
    </>
  )
}
