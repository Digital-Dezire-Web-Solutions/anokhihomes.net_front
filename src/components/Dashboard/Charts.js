import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const Charts = ({
  title,
  data,
  dataKey,
  xKey = "month",
  color = "var(--mood-color)",
  height = 300,
  showGrid = true,
}) => {
  return (
    <div className="chart-card">

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          {showGrid && <CartesianGrid stroke="#eee" strokeDasharray="3 3" />}

          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#999" }}
          />

          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#999" }} />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            }}
          />

          <Line
            type="natural"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
