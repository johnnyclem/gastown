import SpriteAnimator from "./SpriteAnimator.jsx";

export default function Zone({ label, position, zIndex, sprite, cols, rows, fallbackEmoji, interactive, onClick }) {
  return (
    <div
      className={`zone${interactive ? " zone-interactive" : ""}`}
      style={{ ...position, zIndex }}
      onClick={onClick}
    >
      <div className="zone-sprite">
        {sprite ? (
          <SpriteAnimator
            src={sprite}
            sheetCols={cols}
            sheetRows={rows}
            animate={false}
            row={0}
            fps={0}
          />
        ) : (
          <div className="zone-fallback" aria-label={label}>
            <span>{fallbackEmoji}</span>
          </div>
        )}
      </div>
      <span className="zone-label">{label}</span>
      {interactive && <div className="interaction-arrow">▼</div>}
    </div>
  );
}
