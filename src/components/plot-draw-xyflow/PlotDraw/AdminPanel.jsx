import React, { useRef } from "react";
import { TOOLS, PLOT_TYPES } from "./Tools";
import {
  MousePointer2,
  Hexagon,
  Square,
  RectangleHorizontal,
  Circle,
  Grid3x3,
  Waypoints,
  Undo2,
  Trash2,
  X,
  Save,
  ImagePlus,
  Sliders,
} from "lucide-react";

const TOOL_BUTTONS = [
  { tool: TOOLS.SELECT, icon: MousePointer2, label: "Select / Move" },
  { tool: TOOLS.POLYGON, icon: Hexagon, label: "Polygon Plot" },
  { tool: TOOLS.RECTANGLE, icon: RectangleHorizontal, label: "Rectangle Plot" },
  { tool: TOOLS.SQUARE, icon: Square, label: "Square Plot" },
  { tool: TOOLS.CIRCLE, icon: Circle, label: "Circle Plot" },
  { tool: TOOLS.GRID, icon: Grid3x3, label: "Grid (multi-plot)" },
  { tool: TOOLS.TRACE, icon: Waypoints, label: "Trace Main Outline" },
];

function AdminPanel({
  mood,
  tool,
  setTool,
  selectedType,
  setSelectedType,
  undoShape,
  clearAll,
  deleteSelected,
  hasSelection,
  saveLayout,
  onBackgroundImage,
  bg,
  setBg,
  snapSize,
  setSnapSize,
}) {
  const fileInputRef = useRef(null);

  return (
    <div className={`plot-admin-panel ${mood || ""}`}>
      <div className="plot-toolbar-group">
        {TOOL_BUTTONS.map(({ tool: t, icon: Icon, label }) => (
          <button
            key={t}
            title={label}
            className={`tool-btn ${tool === t ? "active" : ""}`}
            onClick={() => setTool(t)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="plot-toolbar-group">
        <label className="plot-type-select">
          New plot type
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {Object.values(PLOT_TYPES).map((t) => (
              <option key={t} value={t}>
                {t.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        {/* <label className="plot-type-select">
          Snap (px)
          <input
            type="number"
            min={0}
            value={snapSize}
            onChange={(e) => setSnapSize(Number(e.target.value) || 0)}
            style={{ width: 60 }}
          />
        </label> */}
      </div>

      <div className="plot-toolbar-group">
        <button
          className="tool-btn"
          title="Upload background layout image to trace"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus size={18} />
          <span>Background</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onBackgroundImage(file);
            e.target.value = "";
          }}
        />
        {bg?.src && (
          <details className="bg-adjust">
            <summary>
              <Sliders size={16} /> Adjust
            </summary>
            <div className="bg-adjust-body">
              <label>
                Opacity
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={bg.opacity}
                  onChange={(e) => setBg({ ...bg, opacity: Number(e.target.value) })}
                />
              </label>
              <label>
                X
                <input
                  type="number"
                  value={bg.x}
                  onChange={(e) => setBg({ ...bg, x: Number(e.target.value) })}
                />
              </label>
              <label>
                Y
                <input
                  type="number"
                  value={bg.y}
                  onChange={(e) => setBg({ ...bg, y: Number(e.target.value) })}
                />
              </label>
              <label>
                Width
                <input
                  type="number"
                  value={bg.width}
                  onChange={(e) => setBg({ ...bg, width: Number(e.target.value) })}
                />
              </label>
              <label>
                Height
                <input
                  type="number"
                  value={bg.height}
                  onChange={(e) => setBg({ ...bg, height: Number(e.target.value) })}
                />
              </label>
            </div>
          </details>
        )}
      </div>

      <div className="plot-toolbar-group">
        <button className="tool-btn" title="Undo last shape" onClick={undoShape}>
          <Undo2 size={18} />
          <span>Undo</span>
        </button>
        <button
          className="tool-btn danger"
          title={hasSelection ? "Delete only the selected plot" : "Select a plot first"}
          disabled={!hasSelection}
          onClick={() => {
            if (window.confirm("Delete this plot? This can't be undone until you re-add it.")) {
              deleteSelected && deleteSelected();
            }
          }}
        >
          <X size={18} />
          <span>Delete Selected</span>
        </button>
        <button className="tool-btn danger" title="Clear everything" onClick={clearAll}>
          <Trash2 size={18} />
          <span>Clear</span>
        </button>
        <button className="tool-btn primary" title="Save layout" onClick={saveLayout}>
          <Save size={18} />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
