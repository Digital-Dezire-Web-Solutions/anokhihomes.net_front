import React from "react";
import DashboardCard from "../Cards/DashboardCard";
import NiManagement from "../../icons/ni-management";
import DataTable from "./DataTable";

const StaffLeadManagement = ({ leads, mood, setAlert, staffType }) => {
  return (
    <div className="dashboard-wrapper">
      {staffType === "marketing" && (
        <>
          <div className="dashboard-grid">
            <DashboardCard
              title="Total Leads"
              value={leads?.length}
              icons=<NiManagement />
            />
            <DashboardCard
              title="New Leads"
              value={leads?.filter((lead) => lead.status === "new").length}
              icons=<NiManagement />
            />
            <DashboardCard
              title="Without Follow-up"
              value={
                leads?.filter((lead) => lead.status === "without_follow_up")
                  .length
              }
              icons=<NiManagement />
            />
          </div>

          {/* <div className="card">
            <h4>Marketing Actions</h4>
            <ul>
              <li>Add Lead</li>
              <li>Edit Lead</li>
              <li>Add Follow-up</li>
              <li>Assign Agent</li>
            </ul>
          </div> */}
        </>
      )}

      <h4>Leads</h4>
      <DataTable data={leads} mood={mood} setAlert={setAlert} dashboard={""} />

      {staffType === "operations" && (
        <>
          <div className="dashboard-grid">
            <DashboardCard
              title="Site Visits Scheduled"
              value={
                leads?.filter((lead) => lead.status === "site_visit_scheduled")
                  .length
              }
            />
            <DashboardCard
              title="Awaiting Visit"
              value={
                leads?.filter((lead) => lead.status === "awaiting_visit").length
              }
            />
          </div>
        </>
      )}

      {staffType === "accounts" && (
        <>
          <div className="dashboard-grid">
            <DashboardCard title="View Leads" value={leads?.length} />
            <DashboardCard
              title="Booking Status"
              value={
                leads?.filter((lead) => lead.status === "booking_confirmed")
                  .length
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default StaffLeadManagement;
