export default function Character({ name, role, status, sprite, title, position, zIndex }) {
  const isIdle = status === "IDLE";
  const isWorking = status === "WORKING";

  return (
    <div
      className={`character ${isIdle ? "character-idle" : ""}`}
      style={{ ...position, zIndex }}
      title={title}
    >
      <div 
        className="character-sprite"
        style={sprite ? { backgroundImage: `url(${sprite})` } : {}}
      >
        {!sprite && (
          <div className="character-avatar">{name?.charAt(0) ?? "?"}</div>
        )}
      </div>
      {isWorking && <div className="status-indicator">🔨</div>}
      {isIdle && <div className="status-indicator">💤</div>}
    </div>
  );
}