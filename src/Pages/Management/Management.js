import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import "./Management.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import AdminLeadManagement from "../../components/Management/AdminLeadManagement";
import AgentLeadManagement from "../../components/Management/AgentLeadManagement";
import StaffLeadManagement from "../../components/Management/StaffLeadManagement";
import {
  getAccountDetails,
  getLeads,
  getUserRole,
} from "../../Redux/Slices/AppSlices";
import UserLeads from "../../components/Management/UserLeads";

const Management = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { userDetail, leads } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getLeads());
  }, []);

  // console.log(userDetail, "userDetail");
  // console.log(leads, "leads");
  // console.log(usersRole,"usersRole")

  const renderPage = () => {
    switch (mood) {
      case "admin":
        return (
          <AdminLeadManagement leads={leads} mood={mood} setAlert={setAlert} />
        );
      case "agent":
        return (
          <AgentLeadManagement leads={leads} mood={mood} setAlert={setAlert} />
        );
      case "staff":
        return (
          <StaffLeadManagement
            leads={leads}
            staffType={"marketing"}
            mood={mood}
            setAlert={setAlert}
          />
        );
      case "user":
        return (
          <UserLeads leads={leads} mood={mood} setAlert={setAlert} />
        );
      default:
        return <div>Access Denied</div>;
    }
  };

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Lead Management</h2>
          <Breadcrumb />
        </div>
      </div>
      <div className="dashboard-container">{renderPage()}</div>
    </div>
  );
};

export default Management;
