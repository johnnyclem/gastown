export default function Zone({ label, position, zIndex, sprite, fallbackEmoji }) {
  return (
    <div className="zone" style={{ ...position, zIndex }}>
      <div className="zone-sprite">
        {sprite ? (
          <img src={sprite} alt={label} />
        ) : (
          <div className="zone-fallback" aria-label={label}>
            <span>{fallbackEmoji}</span>
          </div>
        )}
      </div>
      <span className="zone-label">{label}</span>
    </div>
  );
}
