import { useEffect, useRef, useState } from "react";
import PlotPolygon from "./PlotPolygon";
import { TOOLS } from "./Tools";
import { polygonArea, polygonInside, polygonsOverlap } from "./geometry";
import Compass from "./Compass";
import Ruler from "./Ruler";
import { ImageUp } from "lucide-react";

export default function PlotCanvas({
  mood,
  tool,
  mainPlot,
  setMainPlot,
  plots,
  setPlots,
  selectedType,
  onSelectPlot,
  updatePlot,
  saveLayout,
}) {
  const svgRef = useRef(null);

  const [points, setPoints] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [previewShape, setPreviewShape] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [bgSize, setBgSize] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [spacePan, setSpacePan] = useState(false);
  const isRoad = tool === TOOLS.ROAD || selectedType === "ROAD";

  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const panStart = useRef(null);

  /* ---------- helpers ---------- */

  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth < 576) setScale(0.35);
      else if (window.innerWidth < 768) setScale(0.5);
      else setScale(1);
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const getPoint = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return [
      (e.clientX - rect.left - offset.x) / scale,
      (e.clientY - rect.top - offset.y) / scale,
    ];
  };

  const buildRectangle = ([x1, y1], [x2, y2], square = false) => {
    if (square) {
      const size = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));
      x2 = x1 + size * Math.sign(x2 - x1);
      y2 = y1 + size * Math.sign(y2 - y1);
    }
    return [
      [x1, y1],
      [x2, y1],
      [x2, y2],
      [x1, y2],
    ];
  };

  const buildCircle = ([cx, cy], [px, py]) => {
    const r = Math.hypot(px - cx, py - cy);
    return Array.from({ length: 32 }).map((_, i) => {
      const a = (i / 32) * Math.PI * 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  };

  /* ---------- mouse handlers ---------- */

  const handleMouseDown = (e) => {
    if (mood !== "admin") return;

    // 🔥 SPACE + drag → PAN
    if (spacePan) {
      setPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const p = getPoint(e);

    if (
      tool === TOOLS.RECTANGLE ||
      tool === TOOLS.SQUARE ||
      tool === TOOLS.CIRCLE
    ) {
      setStartPoint(p);
      setIsDragging(true);
    } else {
      setPoints((prev) => [...prev, p]);
    }
  };

  const handleMouseMove = (e) => {
    if (panning) {
      setOffset((o) => ({
        x: o.x + (e.clientX - panStart.current.x),
        y: o.y + (e.clientY - panStart.current.y),
      }));
      panStart.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (!isDragging || !startPoint) return;
    const p = getPoint(e);

    if (tool === TOOLS.RECTANGLE)
      setPreviewShape(buildRectangle(startPoint, p));
    if (tool === TOOLS.SQUARE)
      setPreviewShape(buildRectangle(startPoint, p, true));
    if (tool === TOOLS.CIRCLE) setPreviewShape(buildCircle(startPoint, p));
  };

  const handleMouseUp = () => {
    if (panning) {
      setPanning(false);
      return;
    }

    if (!previewShape) return;
    const shape = previewShape;

    if (!mainPlot?.points?.length) {
      setMainPlot({
        id: "MAIN",
        points: shape,
        plotType: "NOT_FOR_SALE",
        area: polygonArea(shape),
      });
      resetDrag();
      return;
    }

    if (!isRoad && !polygonInside(shape, mainPlot.points)) {
      resetDrag();
      return;
    }
    for (const p of plots) {
      if (!isRoad && polygonsOverlap(shape, p.points)) {
        resetDrag();
        return;
      }
    }

    // if (!polygonInside(shape, mainPlot.points)) {
    //     resetDrag();
    //     return;
    // }
    // for (const p of plots) {
    //     if (polygonsOverlap(shape, p.points)) {
    //         resetDrag();
    //         return;
    //     }
    // }

    setPlots((p) => [
      ...p,
      {
        id: `P-${p.length + 1}`,
        points: shape,
        plotType: selectedType,
        area: polygonArea(shape),
      },
    ]);

    resetDrag();
  };

  const resetDrag = () => {
    setIsDragging(false);
    setStartPoint(null);
    setPreviewShape(null);
  };

  const finishPolygonOrLine = () => {
    let shape = [];

    // ---------- POLYGON ----------
    if (tool === TOOLS.POLYGON && points.length >= 3) {
      shape = points;
    }

    // ---------- LINE ----------
    if (tool === TOOLS.LINE && points.length === 2) {
      shape = points;
    }

    if (!shape.length) return;

    // ---------- MAIN PLOT ----------
    if (!mainPlot?.points?.length) {
      setMainPlot({
        id: "MAIN",
        points: shape,
        plotType: "NOT_FOR_SALE",
        area: polygonArea(shape),
      });
      setPoints([]);
      return;
    }

    // ---------- VALIDATION ----------
    // if (!polygonInside(shape, mainPlot.points)) {
    //     setPoints([]);
    //     return;
    // }
    if (!isRoad && !polygonInside(shape, mainPlot.points)) {
      setPoints([]);
      return;
    }
    for (const p of plots) {
      if (!isRoad && polygonsOverlap(shape, p.points)) {
        setPoints([]);
        return;
      }
    }

    // for (const p of plots) {
    //     if (polygonsOverlap(shape, p.points)) {
    //         setPoints([]);
    //         return;
    //     }
    // }

    // ---------- CHILD PLOT ----------
    setPlots((p) => [
      ...p,
      {
        id: `P-${p.length + 1}`,
        points: shape,
        plotType: selectedType,
        area: polygonArea(shape),
      },
    ]);

    setPoints([]);
  };

  const erasePlot = (id) => {
    setPlots((p) => p.filter((x) => x._id !== id));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.min(Math.max(0.4, s + delta), 3));
  };
  /* ---------------- BACKGROUND IMAGE LOAD ---------------- */

  const handleBgUpload = (file) => {
    const img = new Image();
    img.onload = () => {
      setBgSize({ width: img.width, height: img.height });
    };
    img.src = URL.createObjectURL(file);
    setBgImage(img.src);
  };

  const enterFullscreen = () => {
    if (!containerRef.current) return;

    if (containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  // Sync fullscreen state
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (mood !== "admin") return;

    const down = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setSpacePan(true);
      }
    };

    const up = (e) => {
      if (e.code === "Space") {
        setSpacePan(false);
      }
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [mood]);

  const GRID_SIZE = 40; // pixels
  const MAJOR_GRID = 5; // every 5 lines is darker

  return (
    <div
      ref={containerRef}
      className={`plot-draw card ${isFullscreen ? "fullscreen" : ""}`}
      style={{
        height: mood === "admin" ? "600px" : "90dvh",
      }}
    >
      <Compass />

      <svg
        ref={svgRef}
        width={mood === "admin" ? "100%" : "100%"}
        height={mood === "admin" ? "500" : "100%"}
        onWheel={mood === "admin" ? handleWheel : undefined}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          background: "#f8fafc",
          cursor: spacePan
            ? "grab"
            : panning
              ? "grabbing"
              : mood === "admin"
                ? "crosshair"
                : "default",
        }}
      >
        {mood === "admin" && (
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#grid)"
            pointerEvents="none"
          />
        )}
        <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
          {bgImage && (
            <image
              href={bgImage}
              x={40}
              y={40}
              width={bgSize.width}
              height={bgSize.height}
              preserveAspectRatio="xMinYMin meet"
              opacity={0.35}
              pointerEvents="none"
            />
          )}
          {mainPlot && (
            <polygon
              points={mainPlot.points?.map((p) => p.join(",")).join(" ")}
              fill="#e5e7eb76"
              stroke="black"
              strokeWidth={2}
            />
          )}

          {previewShape && (
            <polygon
              points={previewShape?.map((p) => p.join(",")).join(" ")}
              fill="rgba(59,130,246,0.2)"
              stroke="#2563eb"
              strokeDasharray="5"
            />
          )}

          {plots?.map((p) => (
            <PlotPolygon
              key={p._id}
              plot={p}
              mood={mood}
              scale={scale}
              mainPlot={mainPlot}
              plots={plots}
              updatePlot={updatePlot}
              onSelect={(plot) =>
                tool === TOOLS.ERASE ? erasePlot(plot._id) : onSelectPlot(plot)
              }
            />
          ))}

          {points.length > 0 && (
            <polyline
              points={points.map((p) => p.join(",")).join(" ")}
              fill="none"
              stroke="blue"
              strokeDasharray="5"
            />
          )}

          {mood === "admin" && (
            <defs>
              <pattern
                id="smallGrid"
                width={GRID_SIZE}
                height={GRID_SIZE}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              </pattern>

              <pattern
                id="grid"
                width={GRID_SIZE * MAJOR_GRID}
                height={GRID_SIZE * MAJOR_GRID}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  width={GRID_SIZE * MAJOR_GRID}
                  height={GRID_SIZE * MAJOR_GRID}
                  fill="url(#smallGrid)"
                />
                <path
                  d={`M ${GRID_SIZE * MAJOR_GRID} 0 L 0 0 0 ${GRID_SIZE * MAJOR_GRID}`}
                  fill="none"
                  stroke="#cbd5f5"
                  strokeWidth="1.5"
                />
              </pattern>
            </defs>
          )}
        </g>
      </svg>
      <div className="plot-buttons">
        {mood === "admin" && (
          <div className="fullscreen-tools">
            {!isFullscreen ? (
              <button onClick={enterFullscreen}>⛶ Fullscreen</button>
            ) : (
              <button onClick={exitFullscreen}>✕ Exit</button>
            )}
          </div>
        )}
        {mood === "admin" && (
          <div className="bg-tools">
            {/* <input type="file" accept="image/*" onChange={(e) => handleBgUpload(e.target.files[0])} /> */}
            <input
              type="file"
              id="bgUpload"
              accept="image/*"
              onChange={(e) => handleBgUpload(e.target.files[0])}
              hidden
            />
            <label
              htmlFor="bgUpload"
              className="upload-btn"
              title="Upload background"
            >
              <ImageUp />
              <span>{bgImage ? "Background added" : "Upload Image"}</span>
            </label>
            {bgImage && (
              <button className="btn complete" onClick={() => setBgImage(null)}>
                Complete
              </button>
            )}
          </div>
        )}
        {mood === "admin" && (
          <button className="btn save" onClick={finishPolygonOrLine}>
            Finish
          </button>
        )}
        {mood === "admin" && (
          <button className="finish-btn " onClick={saveLayout}>
            Save Layout
          </button>
        )}
      </div>
    </div>
  );
}
