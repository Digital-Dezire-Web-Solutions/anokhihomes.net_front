import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TOOLS } from "./Tools";
import {
  polygonArea,
  polygonBBox,
  toRelative,
  toAbsolute,
  tempId,
  buildGridPlots,
} from "./geometry";
import PlotShapeNode from "./PlotShapeNode";
import BackgroundImageLayer from "./BackgroundImageLayer";
import VertexEditorLayer from "./VertexEditorLayer";
import DrawingOverlay from "./DrawingOverlay";
import GridModal from "./GridModal";
import PlotModal from "./PlotModal";

const nodeTypes = { plotShape: PlotShapeNode };

function buildNode(plotOrMain, { selectedId, onEdit, isMain, isAdmin }) {
  const bbox = polygonBBox(plotOrMain.points);
  const rel = toRelative(plotOrMain.points, { x: bbox.minX, y: bbox.minY });
  return {
    id: isMain ? "MAIN" : plotOrMain._id,
    type: "plotShape",
    position: { x: bbox.minX, y: bbox.minY },
    selected: selectedId === (isMain ? "MAIN" : plotOrMain._id),
    draggable: !!isAdmin,
    selectable: !!isAdmin,
    zIndex: isMain ? 1 : 5,
    data: {
      points: rel,
      width: bbox.width,
      height: bbox.height,
      plotType: plotOrMain.plotType,
      plotNumber: plotOrMain.plotNumber,
      // Prefer a manually-edited area (typed in the modal) over the
      // geometric one; a real reshape (drag/vertex-edit) recomputes and
      // overwrites plot.area itself, so this stays correct either way.
      area:
        plotOrMain.area != null
          ? plotOrMain.area
          : Math.round(polygonArea(plotOrMain.points)),
      price: plotOrMain.price,
      priceRange: plotOrMain.priceRange,
      isMain: !!isMain,
      onEdit,
    },
    style: { width: bbox.width, height: bbox.height },
  };
}

function PlotCanvasInner({
  mood,
  isAdmin,
  tool,
  setTool,
  mainPlot,
  setMainPlot,
  plots,
  setPlots,
  selectedType,
  onSelectPlot,
  bg,
  setBg,
  snapSize,
  fullscreen,
}) {
  const { fitView } = useReactFlow();
  const [flowNodes, setFlowNodes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [gridBBox, setGridBBox] = useState(null); // pending grid draft awaiting modal

  // Non-admins can only pan/zoom/view - drawing tools, dragging, vertex
  // editing and the edit modal are all disabled regardless of `tool` state.
  const effectiveTool = isAdmin ? tool : TOOLS.SELECT;

  const handleEdit = useCallback(
    (id) => {
      if (isAdmin) setEditingId(id);
    },
    [isAdmin],
  );

  // Rebuild xyflow nodes whenever underlying plot data (source of truth) changes.
  useEffect(() => {
    const nodes = [];
    if (mainPlot?.points?.length) {
      nodes.push(buildNode(mainPlot, { selectedId, onEdit: handleEdit, isMain: true, isAdmin }));
    }
    plots.forEach((p) => {
      if (p.points?.length) {
        nodes.push(buildNode(p, { selectedId, onEdit: handleEdit, isMain: false, isAdmin }));
      }
    });
    setFlowNodes(nodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainPlot, plots, selectedId, isAdmin]);

  const onNodesChange = useCallback((changes) => {
    setFlowNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const commitNodeMove = useCallback(
    (node) => {
      const abs = toAbsolute(node.data.points, node.position);
      const area = Math.round(polygonArea(abs));
      if (node.data.isMain) {
        setMainPlot((mp) => ({ ...mp, points: abs, area }));
      } else {
        setPlots((prev) =>
          prev.map((p) => (p._id === node.id ? { ...p, points: abs, area } : p)),
        );
      }
    },
    [setMainPlot, setPlots],
  );

  const handleNodeClick = useCallback(
    (e, node) => {
      // if (!isAdmin || effectiveTool !== TOOLS.SELECT) return;
      setSelectedId(node.id);
      onSelectPlot && onSelectPlot(node.data.isMain ? mainPlot : plots.find((p) => p._id === node.id));
    },
    [isAdmin, effectiveTool, onSelectPlot, mainPlot, plots],
  );

  const handlePaneClick = useCallback(() => {
    if (isAdmin && effectiveTool === TOOLS.SELECT) {
      setSelectedId(null);
      onSelectPlot && onSelectPlot(null);
    }
  }, [isAdmin, effectiveTool, onSelectPlot]);

  const nextPlotNumber = useCallback(() => `PLOT-${plots.length + 1}`, [plots]);

  const handleShapeComplete = useCallback(
    (completedTool, payload) => {
      if (completedTool === TOOLS.TRACE) {
        const area = Math.round(polygonArea(payload));
        setMainPlot({
          id: "MAIN",
          points: payload,
          plotType: "NOT_FOR_SALE",
          area,
        });
        setTool(TOOLS.SELECT);
        return;
      }

      if (completedTool === TOOLS.GRID) {
        setGridBBox(payload); // opens GridModal; tool stays GRID until resolved
        return;
      }

      // POLYGON / RECTANGLE / SQUARE / CIRCLE all produce a single new plot
      const newPlot = {
        _id: tempId("plot"),
        plotNumber: nextPlotNumber(),
        plotType: selectedType,
        points: payload,
        area: Math.round(polygonArea(payload)),
        priceRange: { min: 0, max: 0 },
        price: 0,
      };
      setPlots((prev) => [...prev, newPlot]);
      setTool(TOOLS.SELECT);
      setSelectedId(newPlot._id);
      setEditingId(newPlot._id);
    },
    [selectedType, nextPlotNumber, setMainPlot, setPlots, setTool],
  );

  const handleGridConfirm = useCallback(
    (config) => {
      const newPlots = buildGridPlots(config);
      setPlots((prev) => [...prev, ...newPlots]);
      setGridBBox(null);
      setTool(TOOLS.SELECT);
    },
    [setPlots, setTool],
  );

  useEffect(() => {
    if (bg?.src) setTimeout(() => fitView({ padding: 0.2 }), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg?.src]);

  // Re-fit the view once the container has actually resized to/from
  // fullscreen (the transition takes a moment in most browsers).
  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.2 }), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen]);

  const selectedShape = useMemo(() => {
    if (!selectedId) return null;
    if (selectedId === "MAIN") return { isMain: true, points: mainPlot?.points };
    const p = plots.find((pl) => pl._id === selectedId);
    return p ? { isMain: false, points: p.points } : null;
  }, [selectedId, mainPlot, plots]);

  const editingPlot = useMemo(() => {
    if (!editingId) return null;
    if (editingId === "MAIN") return mainPlot;
    return plots.find((p) => p._id === editingId) || null;
  }, [editingId, mainPlot, plots]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: fullscreen ? "100%" : "78vh",
        flex: fullscreen ? 1 : undefined,
      }}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={[]}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onNodeDragStop={(e, node) => isAdmin && commitNodeMove(node)}
        onPaneClick={handlePaneClick}
        nodesDraggable={isAdmin && effectiveTool === TOOLS.SELECT}
        nodesConnectable={false}
        elementsSelectable={isAdmin && effectiveTool === TOOLS.SELECT}
        panOnDrag
        selectionOnDrag={false}
        zoomOnScroll
        minZoom={0.1}
        maxZoom={4}
        proOptions={{ hideAttribution: true }}
      >
        <BackgroundImageLayer bg={bg} />
      </ReactFlow>

      {isAdmin && (
        <VertexEditorLayer
          active={effectiveTool === TOOLS.SELECT && !!selectedShape}
          points={selectedShape?.points || []}
          onChange={(pts) => {
            if (selectedShape?.isMain) {
              setMainPlot((mp) => ({ ...mp, points: pts, area: Math.round(polygonArea(pts)) }));
            } else {
              setPlots((prev) =>
                prev.map((p) =>
                  p._id === selectedId ? { ...p, points: pts, area: Math.round(polygonArea(pts)) } : p,
                ),
              );
            }
          }}
          onCommit={() => {}}
        />
      )}

      {isAdmin && (
        <DrawingOverlay tool={effectiveTool} snapSize={snapSize} onComplete={handleShapeComplete} />
      )}

      {isAdmin && gridBBox && (
        <GridModal
          bbox={gridBBox}
          defaultType={selectedType}
          onCancel={() => {
            setGridBBox(null);
            setTool(TOOLS.SELECT);
          }}
          onConfirm={handleGridConfirm}
        />
      )}

      {isAdmin && editingPlot && editingId !== "MAIN" && (
        <PlotModal
          plot={editingPlot}
          mood={mood}
          updatePlot={(id, changes) =>
            setPlots((prev) => prev.map((p) => (p._id === id ? { ...p, ...changes } : p)))
          }
          onClose={() => setEditingId(null)}
          onDelete={(id) => {
            setPlots((prev) => prev.filter((p) => p._id !== id));
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

function PlotCanvas(props) {
  return (
    <ReactFlowProvider>
      <PlotCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

export default PlotCanvas;
