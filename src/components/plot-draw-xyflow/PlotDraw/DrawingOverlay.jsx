import React, { useCallback, useRef, useState } from "react";
import { useReactFlow, useViewport } from "@xyflow/react";
import { TOOLS } from "./Tools";
import {
  rectPoints,
  squarePoints,
  circlePoints,
  distance,
  snap,
} from "./geometry";

const CLOSE_THRESHOLD = 12; // screen px to snap-close a polygon near its first point

/**
 * Sits on top of <ReactFlow> and only intercepts pointer events while a
 * drawing tool (not SELECT) is active. Converts screen coords to flow
 * coords and reports finished shapes back up to PlotCanvas.
 */
function DrawingOverlay({ tool, snapSize, onComplete }) {
  const { screenToFlowPosition, flowToScreenPosition } = useReactFlow();
  const [polyPoints, setPolyPoints] = useState([]);
  const [cursor, setCursor] = useState(null);
  const dragStart = useRef(null);
  const [dragCurrent, setDragCurrent] = useState(null);

  const toFlow = useCallback(
    (e) => {
      const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      return [snap(p.x, snapSize), snap(p.y, snapSize)];
    },
    [screenToFlowPosition, snapSize],
  );

  const isPolyTool = tool === TOOLS.POLYGON || tool === TOOLS.TRACE;
  const isDragTool =
    tool === TOOLS.RECTANGLE ||
    tool === TOOLS.SQUARE ||
    tool === TOOLS.CIRCLE ||
    tool === TOOLS.GRID;

  const finishPolygon = useCallback(
    (pts) => {
      if (pts.length >= 3) onComplete(tool, pts);
      setPolyPoints([]);
      setCursor(null);
    },
    [onComplete, tool],
  );

  const handleClick = useCallback(
    (e) => {
      if (!isPolyTool) return;
      const pt = toFlow(e);
      setPolyPoints((prev) => {
        if (prev.length >= 3) {
          const first = flowToScreenPosition({ x: prev[0][0], y: prev[0][1] });
          const screenDist = Math.hypot(
            first.x - e.clientX,
            first.y - e.clientY,
          );
          if (screenDist <= CLOSE_THRESHOLD) {
            finishPolygon(prev);
            return prev;
          }
        }
        return [...prev, pt];
      });
    },
    [isPolyTool, toFlow, flowToScreenPosition, finishPolygon],
  );

  const handleDoubleClick = useCallback(
    (e) => {
      if (!isPolyTool) return;
      e.preventDefault();
      finishPolygon(polyPoints);
    },
    [isPolyTool, polyPoints, finishPolygon],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isPolyTool && polyPoints.length > 0) {
        setCursor(toFlow(e));
      }
    },
    [isPolyTool, polyPoints, toFlow],
  );

  const handlePointerDown = useCallback(
    (e) => {
      if (!isDragTool) return;
      dragStart.current = toFlow(e);
      setDragCurrent(dragStart.current);
    },
    [isDragTool, toFlow],
  );

  const handlePointerMoveDrag = useCallback(
    (e) => {
      if (!isDragTool || !dragStart.current) return;
      setDragCurrent(toFlow(e));
    },
    [isDragTool, toFlow],
  );

  const handlePointerUp = useCallback(
    (e) => {
      if (!isDragTool || !dragStart.current) return;
      const [x1, y1] = dragStart.current;
      const [x2, y2] = toFlow(e);
      dragStart.current = null;
      setDragCurrent(null);
      if (Math.abs(x2 - x1) < 4 && Math.abs(y2 - y1) < 4) return; // ignore accidental click

      if (tool === TOOLS.RECTANGLE) {
        onComplete(tool, rectPoints(x1, y1, x2, y2));
      } else if (tool === TOOLS.SQUARE) {
        onComplete(tool, squarePoints(x1, y1, x2, y2));
      } else if (tool === TOOLS.CIRCLE) {
        onComplete(tool, circlePoints(x1, y1, x2, y2));
      } else if (tool === TOOLS.GRID) {
        onComplete(tool, {
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.abs(x2 - x1),
          height: Math.abs(y2 - y1),
        });
      }
    },
    [isDragTool, tool, toFlow, onComplete],
  );

  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setPolyPoints([]);
        setCursor(null);
        dragStart.current = null;
        setDragCurrent(null);
      } else if (e.key === "Enter" && isPolyTool) {
        finishPolygon(polyPoints);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPolyTool, polyPoints, finishPolygon]);

  const active = tool !== TOOLS.SELECT;

  // --- preview rendering (screen-space, simplest: draw directly in px since
  // this div is the same size/position as the flow viewport) ---
  const previewPoints = isPolyTool
    ? cursor
      ? [...polyPoints, cursor]
      : polyPoints
    : [];

  const showDragPreview = isDragTool && dragCurrent && dragStart.current;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 30,
        cursor: active ? "crosshair" : "default",
        pointerEvents: active ? "auto" : "none",
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseMove={(e) => {
        handleMouseMove(e);
        handlePointerMoveDrag(e);
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {(previewPoints.length > 0 || showDragPreview) && (
        <PreviewSvg
          tool={tool}
          polyPoints={previewPoints}
          dragStart={dragStart.current}
          dragCurrent={dragCurrent}
        />
      )}
    </div>
  );
}

function PreviewSvg({ tool, polyPoints, dragStart, dragCurrent }) {
  const { x, y, zoom } = useViewport();
  const isPolyTool = tool === TOOLS.POLYGON || tool === TOOLS.TRACE;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
        {isPolyTool && polyPoints.length > 0 && (
          <polyline
            points={polyPoints.map((p) => p.join(",")).join(" ")}
            fill="rgba(29,78,216,0.08)"
            stroke="#1d4ed8"
            strokeWidth={2 / zoom}
            strokeDasharray={`${5 / zoom} ${4 / zoom}`}
          />
        )}
        {isPolyTool &&
          polyPoints.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={4 / zoom} fill="#1d4ed8" />
          ))}
        {!isPolyTool && dragStart && dragCurrent && (
          <rect
            x={Math.min(dragStart[0], dragCurrent[0])}
            y={Math.min(dragStart[1], dragCurrent[1])}
            width={Math.abs(dragCurrent[0] - dragStart[0])}
            height={Math.abs(dragCurrent[1] - dragStart[1])}
            fill={tool === TOOLS.GRID ? "rgba(16,150,168,0.12)" : "rgba(29,78,216,0.1)"}
            stroke="#1d4ed8"
            strokeDasharray={`${5 / zoom} ${4 / zoom}`}
            strokeWidth={2 / zoom}
            rx={tool === TOOLS.CIRCLE ? 9999 : 0}
          />
        )}
      </g>
    </svg>
  );
}

export default DrawingOverlay;
