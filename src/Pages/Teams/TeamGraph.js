import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./TeamGraph.css";

/* Simple inline person icon so we don't depend on external assets */
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
  </svg>
);

const TeamGraphNode = ({ data }) => {
  const {
    member,
    colorSide,
    isRoot,
    hasHiddenChildren,
    hiddenCount,
    expanded,
    onToggle,
  } = data;

  const sideClass =
    colorSide === "left"
      ? "team-graph-left"
      : colorSide === "right"
        ? "team-graph-right"
        : "";

  const clickable = hasHiddenChildren || expanded;

  return (
    <div
      className={`team-graph-node ${isRoot ? "team-graph-root" : ""} ${sideClass}`}
    >
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Top}
          className="team-graph-handle"
        />
      )}

      <div
        className={`team-graph-card ${clickable ? "clickable" : ""}`}
        onClick={() => clickable && onToggle && onToggle()}
      >
        <div className="team-graph-avatar">
          
          <PersonIcon />
        </div>
        <strong className="team-graph-name">{member?.name || "Unknown"}</strong>
        <span className="team-graph-designation">
          {isRoot ? "Leader" : member?.designation || "Member"}
        </span>
        <span className="team-graph-refid">{member?.referralId || "-"}</span>

        {hasHiddenChildren && (
          <div className="team-graph-badge">+{hiddenCount}</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="team-graph-handle"
      />
    </div>
  );
};

const nodeTypes = {
  teamMember: TeamGraphNode,
};

const LEVEL_HEIGHT = 190; // vertical distance between levels
const NODE_SPACING = 170; // horizontal distance between sibling leaves
const DEFAULT_EXPANDED_LEVEL = 1; // root(0) + level1 expanded => level2 visible => 3 levels shown

/* Collect the ids that should be expanded by default so that
   exactly 3 levels (0, 1, 2) are visible on first render. */
const getDefaultExpandedIds = (node, level = 0, acc = new Set()) => {
  if (!node) return acc;
  if (level <= DEFAULT_EXPANDED_LEVEL && node._id) {
    acc.add(node._id);
  }
  if (level < DEFAULT_EXPANDED_LEVEL) {
    const kids = [...(node.leftChildren || []), ...(node.rightChildren || [])];
    kids.forEach((k) => getDefaultExpandedIds(k, level + 1, acc));
  }
  return acc;
};

const TeamGraph = ({ member }) => {
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Reset/seed default-expanded state whenever the root member changes
  useEffect(() => {
    if (member?._id) {
      setExpandedIds(getDefaultExpandedIds(member));
    }
  }, [member?._id]);

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    if (!member) return { nodes, edges };

    let leafCursor = 0;

    const layoutNode = (node, level, colorSide) => {
      const id = node._id;
      const isExpanded = expandedIds.has(id);
      const realLeftKids = node.leftChildren || [];
      const realRightKids = node.rightChildren || [];
      const totalRealChildren = realLeftKids.length + realRightKids.length;

      const leftKids = isExpanded ? realLeftKids : [];
      const rightKids = isExpanded ? realRightKids : [];
      const hasVisibleChildren = leftKids.length + rightKids.length > 0;

      let x;

      if (!hasVisibleChildren) {
        x = leafCursor * NODE_SPACING;
        leafCursor += 1;
      } else {
        const childXs = [];

        leftKids.forEach((child) => {
          if (!child?._id) return;
          // color is based on THIS child's own left/right slot, not inherited from an ancestor
          const childColorSide = "left";
          const cx = layoutNode(child, level + 1, childColorSide);
          childXs.push(cx);
          edges.push({
            id: `${id}-${child._id}`,
            source: id,
            target: child._id,
            type: "smoothstep",
            animated: false,
            style: {
              stroke: "#8e5cf6", // purple
              strokeWidth: 2.5,
            },
          });
        });

        rightKids.forEach((child) => {
          if (!child?._id) return;
          // color is based on THIS child's own left/right slot, not inherited from an ancestor
          const childColorSide = "right";
          const cx = layoutNode(child, level + 1, childColorSide);
          childXs.push(cx);
          edges.push({
            id: `${id}-${child._id}`,
            source: id,
            target: child._id,
            type: "smoothstep",
            animated: false,
            style: {
              stroke: "#1abc9c", // green
              strokeWidth: 2.5,
            },
          });
        });

        x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
      }

      const y = level * LEVEL_HEIGHT;
      const hasHiddenChildren = totalRealChildren > 0 && !isExpanded;

      nodes.push({
        id,
        type: "teamMember",
        position: { x, y },
        data: {
          member: node,
          colorSide,
          isRoot: level === 0,
          expanded: isExpanded,
          hasHiddenChildren,
          hiddenCount: totalRealChildren,
          onToggle: () => toggleExpand(id),
        },
      });

      return x;
    };

    layoutNode(member, 0, null);

    return { nodes, edges };
  }, [member, expandedIds, toggleExpand]);

  return (
    <div className="team-graph-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.15}
        maxZoom={1.5}
      >
        <Background gap={25} />
        <Controls />
        {/* <MiniMap /> */}
      </ReactFlow>
    </div>
  );
};

export default TeamGraph;
