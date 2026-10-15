export default function PortraitTracers({ segments = [] }) {
  if (!segments.length) return null;
  return <div className="portrait-tracers" aria-hidden="true">
    {segments.map((segment, index) => <span className={`portrait-tracer portrait-tracer-${index}`} key={index} style={{
      left: segment.left,
      top: segment.top,
      width: segment.length,
      transform: `rotate(${segment.angle}rad)`,
    }}><i /></span>)}
  </div>;
}
