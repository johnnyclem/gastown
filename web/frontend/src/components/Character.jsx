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
    </div>
  );
}
