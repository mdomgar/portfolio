// Act 2: a server rack. LEDs blink, a patch cable slides into a port during the hold.
const LED_Y = [104, 170, 236, 396, 462]

export default function ServidoresDecor() {
  return (
    <>
      <g className="p" data-part="leds">
        {LED_Y.map((y) => (
          <g key={y}>
            <circle className="k led" cx="210" cy={y} r="6" />
            <circle className="k led" cx="232" cy={y} r="6" />
          </g>
        ))}
      </g>
      <g className="p" data-part="vents">
        {LED_Y.map((y) => (
          <path key={y} className="s" d={`M262 ${y - 9}H344M262 ${y + 9}H344`} />
        ))}
      </g>
      <g className="p" data-part="caddies">
        {[290, 322].map((y) =>
          [202, 250, 298, 346].map((x) => <rect key={`${x}-${y}`} className="f" x={x} y={y} width="40" height="22" rx="4" />),
        )}
        <circle className="k led" cx="214" cy="301" r="3" />
        <circle className="k led" cx="310" cy="333" r="3" />
      </g>
      <g className="p" data-part="rails">
        {[76, 142, 208, 274, 368, 434].map((y) => (
          <g key={y}>
            <circle className="k" cx="178" cy={y + 12} r="3" />
            <circle className="k" cx="422" cy={y + 12} r="3" />
          </g>
        ))}
      </g>
      <g className="p" data-part="loops">
        <path className="s" d="M398 103H450C510 103 510 169 450 169H398" />
      </g>
      <g className="p" data-part="plinth">
        <path className="s" d="M186 508h228" />
        <circle className="f" cx="214" cy="556" r="14" />
        <circle className="f" cx="386" cy="556" r="14" />
        <circle className="k" cx="214" cy="556" r="4" />
        <circle className="k" cx="386" cy="556" r="4" />
      </g>
      <g className="p" data-part="router">
        <rect className="f" x="22" y="388" width="104" height="48" rx="8" />
        <path className="s" d="M44 388l-10-44M104 388l10-44" />
        <circle className="k led" cx="46" cy="412" r="5" />
        <circle className="k led" cx="66" cy="412" r="5" />
        <circle className="k led" cx="86" cy="412" r="5" />
        <path className="s" d="M126 412C150 412 156 462 186 462" />
      </g>
      <g className="p" data-part="plug">
        <path className="s" d="M430 516C470 516 480 548 508 548" />
        <rect className="f" x="508" y="532" width="36" height="32" rx="6" />
        <path className="s" d="M544 540h18M544 556h18" />
      </g>
      <g className="p" data-part="patch">
        <g className="patch">
          <rect className="f" x="402" y="224" width="26" height="22" rx="3" />
          <path className="s" d="M428 235H470C546 235 546 380 482 424C452 446 450 470 430 492" />
        </g>
      </g>
    </>
  )
}
