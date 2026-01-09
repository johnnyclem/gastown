import SpriteAnimator from "./SpriteAnimator.jsx";

const SPRITE_CONFIG = {
  sheetCols: 3,
  sheetRows: 4,
  frameWidth: 32,
  frameHeight: 48,
  fps: 8,
  scale: 1.5
};

export default function Character({
  name,
  role,
  status,
  sprite,
  title,
  position,
  zIndex
}) {
  const isWorking = status === "WORKING" || status === "MERGING";
  const animationRow = isWorking ? 2 : 0;

  return (
    <div className="character" style={{ ...position, zIndex }} title={title}>
      <div className="character-sprite-container">
        {sprite ? (
          <SpriteAnimator
            src={sprite}
            sheetCols={SPRITE_CONFIG.sheetCols}
            sheetRows={SPRITE_CONFIG.sheetRows}
            frameWidth={SPRITE_CONFIG.frameWidth}
            frameHeight={SPRITE_CONFIG.frameHeight}
            animate
            row={animationRow}
            fps={8}
          />
        ) : (
          <div className="character-avatar">{name?.charAt(0) ?? "?"}</div>
        )}
      </div>
    </div>
  );
}
