import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./TeamGraph.css"

const TeamGraphNode = ({ data }) => {
  const { member, side, isRoot } = data;

  return (
    <div
      className={`team-graph-node ${
        isRoot ? "team-graph-root" : ""
      } ${side === "left" ? "team-graph-left" : ""} ${
        side === "right" ? "team-graph-right" : ""
      }`}
    >
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Top}
          className="team-graph-handle"
        />
      )}

      {isRoot && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="team-graph-handle"
        />
      )}

      <div className="team-graph-circle">
        <strong>{member?.name || "Unknown"}</strong>
        <span>{member?.referralId || "-"}</span>
      </div>

      <div className="team-graph-info">
        <span>{member?.designation || "Sales Executive"}</span>
        {member?.directIncomePercent !== undefined && (
          <small>{member.directIncomePercent}%</small>
        )}
      </div>

      {!isRoot && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="team-graph-handle"
        />
      )}
    </div>
  );
};

const nodeTypes = {
  teamMember: TeamGraphNode,
};

/* How many "slots" a subtree needs — used to size its angular wedge
   so branches with more people get proportionally more space. */
const countLeaves = (node) => {
  const children = [
    ...(node?.leftChildren || []),
    ...(node?.rightChildren || []),
  ];
  if (!children.length) return 1;
  return children.reduce((sum, c) => sum + countLeaves(c), 0);
};

const RADIUS_STEP = 260; // distance between each ring / level

const TeamGraph = ({ member }) => {
  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];

    if (!member) {
      return { nodes, edges };
    }

    /* =====================================================
       RADIAL LAYOUT

       - level 0 (root) is always at (0,0)
       - every other node sits at:
           radius = level * RADIUS_STEP
           angle  = midpoint of the wedge it was assigned
       - a node's wedge is split between its left/right
         children proportionally to their subtree size,
         so nothing overlaps as the tree grows
    ===================================================== */

    const layoutNode = (node, level, angleStart, angleEnd, side) => {
      const nodeId = node._id;

      let x = 0;
      let y = 0;

      if (level > 0) {
        const angle = (angleStart + angleEnd) / 2;
        const radius = level * RADIUS_STEP;
        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
      }

      nodes.push({
        id: nodeId,
        type: "teamMember",
        position: { x, y },
        data: {
          member: node,
          side: side || "",
          isRoot: level === 0,
        },
      });

      const leftChildren = node?.leftChildren || [];
      const rightChildren = node?.rightChildren || [];

      const leftLeaves = leftChildren.reduce(
        (sum, c) => sum + countLeaves(c),
        0,
      );
      const rightLeaves = rightChildren.reduce(
        (sum, c) => sum + countLeaves(c),
        0,
      );
      const totalLeaves = leftLeaves + rightLeaves;

      if (!totalLeaves) return;

      const fullSpan = angleEnd - angleStart;
      const leftSpan = fullSpan * (leftLeaves / totalLeaves);

      const leftRange = [angleStart, angleStart + leftSpan];
      const rightRange = [angleStart + leftSpan, angleEnd];

      const placeChildren = (children, [rangeStart, rangeEnd], childSide) => {
        if (!children.length) return;

        const totalChildLeaves = children.reduce(
          (sum, c) => sum + countLeaves(c),
          0,
        );

        let cursor = rangeStart;

        children.forEach((child) => {
          const childId = child?._id;
          if (!childId) return;

          const leaves = countLeaves(child);
          const span = ((rangeEnd - rangeStart) * leaves) / totalChildLeaves;

          edges.push({
            id: `${nodeId}-${childId}`,
            source: nodeId,
            target: childId,
            type: "smoothstep",
            animated: false,
            style: {
              stroke: childSide === "left" ? "#1abc9c" : "#8e5cf6",
              strokeWidth: 2,
            },
          });

          layoutNode(child, level + 1, cursor, cursor + span, childSide);

          cursor += span;
        });
      };

      placeChildren(leftChildren, leftRange, "left");
      placeChildren(rightChildren, rightRange, "right");
    };

    layoutNode(member, 0, 0, Math.PI * 2, "");

    return { nodes, edges };
  }, [member]);

  return (
    <div className="team-graph-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.15}
        maxZoom={1.5}
      >
        <Background gap={25} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default TeamGraph;