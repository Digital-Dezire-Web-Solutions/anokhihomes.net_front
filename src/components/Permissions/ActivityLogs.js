import React from "react";
import "./ActivityLogs.css";

const LOGS = [
  {
    id: 1,
    type: "permission",
    title: "Permission Updated",
    description: (
      <>
        Olivia updated user permissions for <span className="link">Elijah</span>
      </>
    ),
    time: "4 hours ago",
  },
  {
    id: 2,
    type: "login",
    title: "User Login",
    description: (
      <>
        <span className="link">Olivia</span> logged into the admin dashboard.
      </>
    ),
    time: "4 hours ago",
  },
  {
    id: 3,
    type: "update",
    title: "Plot Update",
    description: (
      <>
        Charlotte edited plot details for <span className="link">Buck</span>
      </>
    ),
    time: "6 hours ago",
  },
  {
    id: 4,
    type: "refund",
    title: "Refund Process",
    description: (
      <>
        James processed refund request for order.
      </>
    ),
    time: "2 days ago",
  },
  {
    id: 5,
    type: "delete",
    title: "Comment Delete",
    description: (
      <>
        James deleted flagged <span className="link">comment</span> on site visit.
      </>
    ),
    time: "2 days ago",
  },
  {
    id: 6,
    type: "publish",
    title: "Page Publish",
    description: (
      <>
        James published a new blog post.
      </>
    ),
    time: "2 days ago",
  },
];

/* Color Mapping */
const TYPE_COLORS = {
  permission: "#3b82f6",
  login: "#22c55e",
  update: "#06b6d4",
  refund: "#f97316",
  delete: "#ef4444",
  publish: "#06b6d4",
};

const ActivityLogs = () => {
  return (
    <div className="logs-container card">
      {LOGS.map((log) => (
        <div key={log.id} className="log-item">
          
          {/* LEFT TIMELINE */}
          <div className="log-left">
            <div
              className="log-dot"
              style={{ borderColor: TYPE_COLORS[log.type] }}
            ></div>
            <div className="log-line"></div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="log-content">
            <h4>{log.title}</h4>
            <p>{log.description}</p>
            <span className="log-time">{log.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLogs;