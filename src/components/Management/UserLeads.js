import React from "react";
import DataTable from "./DataTable";

const UserLeads = ({ leads, mood, setAlert }) => {
  return (
    <div className="dashboard-wrapper">
      <h4>Leads</h4>
      <DataTable data={leads} mood={mood} setAlert={setAlert} />
    </div>
  );
};

export default UserLeads;
