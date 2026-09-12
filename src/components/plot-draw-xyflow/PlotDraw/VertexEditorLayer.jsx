import React, { useCallback, useRef, useState } from "react";
import { useViewport, useReactFlow } from "@xyflow/react";

/**
 * Shows small draggable handles at every vertex of the currently-selected
 * plot (or main boundary) so irregular polygons traced from the map image
 * can be nudged into exact position. Active only when `active` is true.
 *
 * points: absolute [[x,y], ...] of the shape being edited
 * onChange(newAbsolutePoints): called live while dragging a vertex
 * onAddVertex(index, point): insert a new point on a midpoint click (optional)
 */
function VertexEditorLayer({ active, points, onChange, onCommit }) {
  const { x, y, zoom } = useViewport();
  const { screenToFlowPosition } = useReactFlow();
  const draggingIndex = useRef(null);
  const [localPoints, setLocalPoints] = useState(points);
  const rafRef = useRef(null);
  const latestEvent = useRef(null);

  React.useEffect(() => {
    setLocalPoints(points);
  }, [points]);

  const handlePointerDown = useCallback((e, idx) => {
    e.stopPropagation();
    e.preventDefault();
    draggingIndex.current = idx;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Batch to one state update per animation frame instead of one per raw
  // pointermove (which can fire well above display refresh rate) - this is
  // what was causing rapid resize churn on the shape underneath and
  // triggering the browser's "ResizeObserver loop" warning while dragging.
  const applyPendingMove = useCallback(() => {
    rafRef.current = null;
    const evt = latestEvent.current;
    if (!evt || draggingIndex.current === null) return;
    const flowPos = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
    setLocalPoints((prev) => {
      const next = prev.map((p, i) =>
        i === draggingIndex.current ? [flowPos.x, flowPos.y] : p,
      );
      onChange && onChange(next);
      return next;
    });
  }, [screenToFlowPosition, onChange]);

  const handlePointerMove = useCallback(
    (e) => {
      if (draggingIndex.current === null) return;
      latestEvent.current = e;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(applyPendingMove);
      }
    },
    [applyPendingMove],
  );

  const handlePointerUp = useCallback(() => {
    draggingIndex.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    setLocalPoints((current) => {
      onCommit && onCommit(current);
      return current;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePointerMove, onCommit]);

  if (!active || !localPoints || localPoints.length === 0) return null;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
        <polygon
          points={localPoints.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="#1d4ed8"
          strokeDasharray="6 4"
          strokeWidth={1.5 / zoom}
        />
        {localPoints.map((p, idx) => (
          <circle
            key={idx}
            cx={p[0]}
            cy={p[1]}
            r={6 / zoom}
            fill="#fff"
            stroke="#1d4ed8"
            strokeWidth={2 / zoom}
            style={{ cursor: "grab", pointerEvents: "auto" }}
            onPointerDown={(e) => handlePointerDown(e, idx)}
          />
        ))}
      </g>
    </svg>
  );
}

export default VertexEditorLayer;
