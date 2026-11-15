import './css/DeviceFrame.css'

// A browser window drawn in the ink-line style, with a flat plate offset behind it. The dark dashboard
// sits inside it as the "screen". Pure markup: the home page animates the parts it knows by class name.
export default function DeviceFrame({ children, className = '' }) {
  return (
    <div className={`device ${className}`.trim()}>
      <div className="device-plate" aria-hidden="true" />
      <div className="device-tilt">
        <div className="device-window">
          <div className="device-bar" aria-hidden="true">
            <span className="device-dot" />
            <span className="device-dot" />
            <span className="device-dot" />
            <span className="device-url" />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
