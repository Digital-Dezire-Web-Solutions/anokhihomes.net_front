import React from "react";
import { PLOT_TYPE_COLORS } from "./Tools";

/**
 * Renders a single plot (or the main boundary) as an SVG polygon inside an
 * xyflow node. `data.points` are LOCAL coordinates (0,0-based, relative to
 * the node's position) - the node's position IS the shape's absolute origin.
 * Whole-shape dragging is handled natively by xyflow (node position);
 * per-vertex editing is handled by <VertexEditorLayer /> in PlotCanvas.
 */
function PlotShapeNode({ id, data, selected }) {
  const w = data.width || 100;
  const h = data.height || 100;
  const colors = PLOT_TYPE_COLORS[data.plotType] || PLOT_TYPE_COLORS.FOR_SALE;
  const pointsStr = (data.points || []).map(([x, y]) => `${x},${y}`).join(" ");
  const fontSize = Math.max(8, Math.min(13, w / 6, h / 4));

  return (
    <div
      style={{ width: w, height: h, position: "relative" }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        data.onEdit && data.onEdit(id);
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ overflow: "visible", display: "block" }}
      >
        <polygon
          points={pointsStr}
          fill={colors.fill}
          fillOpacity={data.isMain ? 0.08 : 0.85}
          stroke={selected ? "#1d4ed8" : colors.stroke}
          strokeWidth={selected ? 2.5 : 1.2}
        />
        {!data.isMain && (
          <>
            <text
              x={w / 2}
              y={h / 2 - fontSize * 0.2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fontWeight={700}
              fill="#12222b"
              style={{ pointerEvents: "none" }}
            >
              {data.plotNumber}
            </text>
            <text
              x={w / 2}
              y={h / 2 + fontSize * 1.1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize * 0.8}
              fill="#33454d"
              style={{ pointerEvents: "none" }}
            >
              {data.area} sqft
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

export default PlotShapeNode;
