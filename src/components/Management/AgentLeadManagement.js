import React from "react";
import DashboardCard from "../Cards/DashboardCard";
import DataTable from "./DataTable";
import NiManagement from "../../icons/ni-management";

const AgentLeadManagement = ({leads, mood, setAlert }) => {
  // const myLeads = [
  //   {
  //     id: 1,
  //     name: "Rahul",
  //     phone: "9876543210",
  //     status: "Assigned",
  //     agent: "Me",
  //     date: "2026-02-18",
  //     notes: [
  //       {
  //         text: "Client scheduled site visit",
  //         date: "3/14/2026, 5:27:34 PM",
  //         by: "Admin",
  //       },
  //       {
  //         text: "Waiting for client confirmation",
  //         date: "3/15/2026, 5:27:34 PM",
  //         by: "Me",
  //       },
  //     ],
  //   },
  // ];

  return (
    <div className="dashboard-wrapper">
      {/* ================= STATS ================= */}
      <div className="dashboard-grid">
        <DashboardCard title="My Leads" value={leads?.length} icons=<NiManagement /> />
        <DashboardCard title="New Leads" value={leads?.filter((lead) => lead.status === "new").length} icons=<NiManagement /> />
        <DashboardCard title="Interested" value={leads?.filter((lead) => lead.status === "interested").length} icons=<NiManagement /> />
        <DashboardCard title="Converted" value={leads?.filter((lead) => lead.status === "converted").length} icons=<NiManagement /> />
        <DashboardCard title="Lost" value={leads?.filter((lead) => lead.status === "lost").length} icons=<NiManagement /> />
        {/* <DashboardCard
          title="Today's Follow-ups"
          value="0"
          icons=<NiManagement />
        /> */}
      </div>

      <h4>Leads</h4>
      <DataTable
        data={leads}
        mood={mood}
        setAlert={setAlert}
      />
    </div>
  );
};

export default AgentLeadManagement;
