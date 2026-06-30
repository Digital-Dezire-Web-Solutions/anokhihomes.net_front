import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStaffRoles, updateStaffRole } from "../../Redux/Slices/AppSlices";

const ALL_PERMISSIONS = [
  // Lead
  { key: "lead.view", label: "View Leads" },
  { key: "lead.add", label: "Add Lead" },
  { key: "lead.edit", label: "Edit Lead" },
  { key: "lead.assign", label: "Assign Lead" },
  // Site Visit
  { key: "sitevisit.view", label: "View Site Visit" },
  { key: "sitevisit.add", label: "Create Site Visit" },
  { key: "sitevisit.complete", label: "Complete Site Visit" },

  // Booking
  { key: "booking.view", label: "View Booking" },
  { key: "booking.add", label: "Create Booking" },
  { key: "booking.approve", label: "Approve Booking" },
  { key: "booking.reject", label: "Reject Booking" },

  // Plot
  { key: "plot.view", label: "View Plot" },
  { key: "plot.add", label: "Add Plot" },
  { key: "plot.edit", label: "Edit Plot" },
  { key: "plot.delete", label: "Delete Plot" },
  { key: "plot.change_status", label: "Change Status" },

  // Payment
  { key: "payment.view", label: "View Payments" },
  { key: "payment.add", label: "Add Payment" },
  { key: "payment.approve", label: "Approve Payment" },

  // Reports
  { key: "report.view", label: "View Reports" },
  { key: "report.export", label: "Export Reports" },
];

const StaffPermission = ({ setAlert }) => {
  const dispatch = useDispatch();

  const { staffRoles } = useSelector((state) => state.app);

  const [activeRole, setActiveRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getStaffRoles());
  }, [dispatch]);

  useEffect(() => {
    if (staffRoles?.length > 0 && !activeRole) {
      setActiveRole(staffRoles[0]);
      setPermissions(staffRoles[0].permissions || []);
    }
  }, [staffRoles]);

  const togglePermission = (permission) => {
    if (permissions.includes(permission)) {
      setPermissions(permissions.filter((item) => item !== permission));
    } else {
      setPermissions([...permissions, permission]);
    }
  };

  const handleSave = () => {
    setSaving(true);
    dispatch(
      updateStaffRole({
        id: activeRole._id,
        permissions,
      }),
    );
    setAlert({
      message: "Permissions updated",
      status: "Success",
    });

    setTimeout(() => setAlert(null), 3000);
    setSaving(false);
  };

  return (
    <div>
      {/* ROLE TABS */}

      <div className="table-filters role-tabs">
        {staffRoles?.map((role) => (
          <button
            key={role._id}
            className={activeRole?._id === role._id ? "active" : ""}
            onClick={() => {
              setActiveRole(role);
              setPermissions(role.permissions || []);
            }}
          >
            {role.name}
          </button>
        ))}
      </div>

      {/* PERMISSIONS */}

      <div className="permission-section">
        <h4>{activeRole?.name} Permissions</h4>

        {ALL_PERMISSIONS.map((permission) => (
          <div key={permission.key} className="permission-row card">
            <span>{permission.label}</span>

            <label className="switch">
              <input
                type="checkbox"
                checked={permissions.includes(permission.key)}
                onChange={() => togglePermission(permission.key)}
              />
              <span className="slider"></span>
            </label>
          </div>
        ))}
      </div>

      <div className="modal-actions">
        <button className="btn primary" disabled={saving} onClick={handleSave}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default StaffPermission;
