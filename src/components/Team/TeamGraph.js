import React from "react";

const TeamGraph = ({ centerNode, setCenterNode, mood }) => {
  if (!centerNode) return null;

  const radius = 170;

  return (
    <div className="team-graph">

      {/* CENTER NODE */}
      <div className="center-node">
        <h4>{centerNode.name}</h4>
        <small>{centerNode.role}</small>
      </div>

      {/* ORBIT MEMBERS */}
      {centerNode.members?.map((member, index) => {
        const angle =
          (index / centerNode.members.length) * 2 * Math.PI;

        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        return (
          <div
            key={member.id}
            className="member-node"
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            onClick={() => {
              if (mood === "admin") {
                setCenterNode(member);
              }
            }}
          >
            {member.name}
          </div>
        );
      })}
    </div>
  );
};

export default TeamGraph;