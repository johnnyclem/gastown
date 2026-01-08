import { useState } from "react";

export default function Zone({ label, position, zIndex, sprite, fallbackEmoji }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="zone" style={{ ...position, zIndex }}>
      <div className="zone-sprite">
        {sprite && !imgError ? (
          <img 
            src={sprite} 
            alt={label} 
            onError={() => setImgError(true)}
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
