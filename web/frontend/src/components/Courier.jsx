export default function Courier({ start, end, zIndex }) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  return (
    <div
      className="courier"
      style={{
        left: `${start.x}px`,
        top: `${start.y}px`,
        zIndex,
        "--dx": `${deltaX}px`,
        "--dy": `${deltaY}px`
      }}
      aria-hidden="true"
    />
  );
}
