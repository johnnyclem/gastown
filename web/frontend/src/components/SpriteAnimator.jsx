import { useEffect, useState } from "react";

export default function SpriteAnimator({
  src,
  sheetCols = 3,
  sheetRows = 1,
  row = 0,
  animate = false,
  fps = 8
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!animate) {
      setCurrentFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % sheetCols);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [animate, sheetCols, fps]);

  const frameX = sheetCols > 1 ? currentFrame * (100 / sheetCols) : 0;
  const frameY = sheetRows > 1 ? row * (100 / sheetRows) : 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        backgroundColor: hasError ? "red" : "transparent"
      }}
    >
      <img
        src={src}
        alt=""
        onLoad={() => setHasError(false)}
        onError={() => setHasError(true)}
        style={{
          display: hasError ? "none" : "block",
          width: `${sheetCols * 100}%`,
          height: `${sheetRows * 100}%`,
          objectFit: "contain",
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate(-${frameX}%, -${frameY}%)`,
          mixBlendMode: "multiply", // Hides the white background
          filter: "contrast(1.1)" // Pop the colors slightly
        }}
      />
    </div>
  );
}
