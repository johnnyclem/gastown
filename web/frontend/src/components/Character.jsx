export default function Character({ name, title, position, zIndex }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="character" style={{ ...position, zIndex }} title={title}>
      <div className="character-avatar">{initial}</div>
    </div>
  );
}
