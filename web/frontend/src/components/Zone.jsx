import { useState } from "react";
import SpriteAnimator from "./SpriteAnimator.jsx";

export default function Zone({ label, position, zIndex, sprite, fallbackEmoji }) {
  const [imgError, setImgError] = useState(false);

  // Default config for buildings
  // We assume buildings are static images (1 frame), but we use SpriteAnimator 
  // to ensure pixelated rendering and consistent scaling if needed.
  // If the sprite is a sheet, this will just show the top-left frame.
  const SPRITE_CONFIG = {
    frameWidth: 128,
    frameHeight: 128, 
    totalFrames: 1,
    fps: 0, // Static
    scale: 1
  };

  return (
    <div className="zone" style={{ ...position, zIndex }}>
      <div className="zone-sprite">
        {sprite && !imgError ? (
          <SpriteAnimator 
            src={sprite} 
            frameWidth={SPRITE_CONFIG.frameWidth}
            frameHeight={SPRITE_CONFIG.frameHeight}
            totalFrames={SPRITE_CONFIG.totalFrames}
            fps={SPRITE_CONFIG.fps}
            scale={SPRITE_CONFIG.scale}
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
