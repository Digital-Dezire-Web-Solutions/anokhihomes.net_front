import React from "react";
import { useViewport } from "@xyflow/react";

/**
 * Renders the uploaded colony-map image behind the plot nodes, keeping it in
 * sync with canvas pan/zoom so it can be traced over accurately.
 * `bg` = { src, x, y, width, height, opacity, locked }
 */
function BackgroundImageLayer({ bg }) {
  const { x, y, zoom } = useViewport();

  if (!bg || !bg.src) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        <img
          src={bg.src}
          alt="layout background"
          draggable={false}
          style={{
            position: "absolute",
            left: bg.x,
            top: bg.y,
            width: bg.width,
            height: bg.height,
            opacity: bg.opacity ?? 0.6,
            userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}

export default BackgroundImageLayer;
