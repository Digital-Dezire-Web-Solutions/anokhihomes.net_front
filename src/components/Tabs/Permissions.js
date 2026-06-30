import React, { useState } from "react";
import "./Tabs.css";

const defaultPermissions = [
  "Manage Leads",
  "Manage Bookings",
  "Approve Payments",
  "Create Teams",
  "Access Reports",
  "Access Reports",
];

const Permissions = ({ userData, mood }) => {
  const [permissions, setPermissions] = useState(userData?.permissions || []);

  const togglePermission = (perm) => {
    if (mood !== "admin") return;

    if (permissions.includes(perm)) {
      setPermissions(permissions.filter((p) => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  return (
    <div className="card permissions-card">
      <div className="permission-list">
        {defaultPermissions.map((perm) => (
          <div
            key={perm}
            className={`permission-item ${
              permissions.includes(perm) ? "active" : ""
            }`}
            onClick={() => togglePermission(perm)}
          >
            <span>{perm}</span>

            <span className="badge">
              {permissions.includes(perm) ? "Allowed" : "Denied"}
            </span>
          </div>
        ))}
      </div>

      {mood === "admin" && (
        <button className="btn primary" style={{ marginTop: "20px" }}>
          Save Changes
        </button>
      )}
    </div>
  );
};

export default Permissions;
