import mayorSprite from "../assets/char_mayor.png";
import engineerSprite from "../assets/char_engineer.png";
import polecatSprite from "../assets/char_polecat.png";

const roleSprites = {
  mayor: mayorSprite,
  engineer: engineerSprite,
  polecat: polecatSprite
};

export default function Character({
  name,
  title,
  position,
  zIndex,
  role,
  status
}) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";
  const sprite = roleSprites[role];
  const isIdle = status === "IDLE";
  const isWorking = status === "WORKING";

  return (
    <div
      className={`character${isIdle ? " is-idle" : ""}`}
      style={{ ...position, zIndex }}
      title={title}
    >
      <div className="character-avatar">
        {sprite ? (
          <img src={sprite} alt={name} />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      {(isWorking || isIdle) && (
        <div className={`character-status${isWorking ? " is-working" : ""}`}>
          {isWorking ? "⚒️" : "💤"}
        </div>
      )}
import SpriteAnimator from "./SpriteAnimator.jsx";

const SPRITE_CONFIG = {
  sheetCols: 3,
  sheetRows: 4,
  frameWidth: 32,
  frameHeight: 48,
  fps: 8,
  scale: 1.5 // Adjusted scale to be visible but not huge
};

export default function Character({ name, role, status, sprite, title, position, zIndex }) {
  const isWorking = status === "WORKING" || status === "MERGING";
  
  // Logic: 
  // Working -> Row 2 (Right/Side view usually action)
  // Idle/Default -> Row 0 (Down/Front view)
  const animationRow = isWorking ? 2 : 0;

  return (
    <div
      className="character"
      style={{ ...position, zIndex }}
      title={title}
    >
      <div className="character-sprite-container">
        {sprite ? (
          <SpriteAnimator 
            src={sprite}
            sheetCols={SPRITE_CONFIG.sheetCols}
            sheetRows={SPRITE_CONFIG.sheetRows}
            frameWidth={SPRITE_CONFIG.frameWidth}
            frameHeight={SPRITE_CONFIG.frameHeight}
            animate={true}
            row={animationRow}
            fps={SPRITE_CONFIG.fps}
            scale={SPRITE_CONFIG.scale}
          />
        ) : (
          <div className="character-avatar">{name?.charAt(0) ?? "?"}</div>
        )}
      </div>
    </div>
  );
}