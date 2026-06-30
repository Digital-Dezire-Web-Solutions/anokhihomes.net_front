import React, { useEffect } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import AdminPayments from "../../components/Payments/AdminPayments";
import AgentPayments from "../../components/Payments/AgentPayments";
import StaffPayments from "../../components/Payments/StaffPayments";
import "./Payments.css";
import UserPayments from "../../components/Payments/UserPayments";
import { useDispatch, useSelector } from "react-redux";
import { getAccountDetails, getPayments } from "../../Redux/Slices/AppSlices";


const Payments = ({ mood, staffType, setAlert }) => {
    const dispatch = useDispatch();
  const { userDetail, payment } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getPayments());
  }, []);

  const renderPage = () => {
    switch (mood) {
      case "admin":
        return <AdminPayments payment={payment} mood={mood} setAlert={setAlert}/>;
      case "agent":
        return <AgentPayments payment={payment} mood={mood} setAlert={setAlert}/>;
      case "staff":
        return <StaffPayments payment={payment} mood={mood} staffType={"accounts"} setAlert={setAlert}/>;
      case "user":
        return <UserPayments payment={payment} mood={mood} setAlert={setAlert}/>;
      default:
        return <div>Access Denied</div>;
    }
  };

  return (
    <div className="plot-container">
      <div className="table-filters">
         <div className="page-head-title">
        <h2>Payments</h2>
          <Breadcrumb />
        </div>
      </div>
      <div className="dashboard-container">{renderPage()}</div>
    </div>
  );
};

export default Payments;