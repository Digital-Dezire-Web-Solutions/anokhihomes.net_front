import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const CircularProgress = ({
  percentage,
  segments,
  size = 250,
  thickness = 20,
  trackColor = "color-mix(in oklab, var(--mood-color) 10%, transparent)",
  backgroundColor = "var(--mood-color)",
  showCenter = true,
  centerLabel,
  centerValue,
}) => {
  // If percentage is provided → single progress mode
  const singleData = [
    { name: "progress", value: percentage },
    { name: "remaining", value: 100 - percentage },
  ];

  const isMulti = Array.isArray(segments);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
      
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={isMulti ? segments : singleData}
            dataKey="value"
            innerRadius={size / 2 - thickness}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={-270}
            paddingAngle={isMulti ? 4 : 0}
          >
            {isMulti
              ? segments.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))
              : [
                  <Cell key="progress" fill={backgroundColor} />,
                  <Cell key="remaining" fill={trackColor} />,
                ]}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {showCenter && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {centerValue || (percentage ? `${percentage}%` : "")}
          </h2>
          {centerLabel && (
            <p style={{ margin: 0, fontSize: 14, color: "#777" }}>
              {centerLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CircularProgress;