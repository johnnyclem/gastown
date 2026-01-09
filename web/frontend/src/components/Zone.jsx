import SpriteAnimator from "./SpriteAnimator.jsx";

export default function Zone({ label, position, zIndex, sprite, cols, rows, fallbackEmoji }) {
  return (
    <div className="zone" style={{ ...position, zIndex }}>
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
    </div>
  );
}
