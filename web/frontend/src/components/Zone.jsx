export default function Zone({
  label,
  position,
  zIndex,
  imageSrc,
  fallbackEmoji
}) {
  return (
    <div className="zone" style={{ ...position, zIndex }}>
      <div className="zone-sprite">
        {imageSrc ? (
          <img src={imageSrc} alt={label} />
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
