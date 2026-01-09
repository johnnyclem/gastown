export default function TrafficLayer({ width, height, links }) {
  if (!links.length) {
    return null;
  }

  return (
    <svg
      className="traffic-layer"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {links.map((link) => (
        <line
          key={link.id}
          className="traffic-line"
          x1={link.start.x}
          y1={link.start.y}
          x2={link.end.x}
          y2={link.end.y}
        />
      ))}
    </svg>
  );
}
