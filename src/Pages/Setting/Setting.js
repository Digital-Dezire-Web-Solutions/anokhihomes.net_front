import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Setting.css";
import StaffPermission from "../../components/Permissions/StaffPermission";
import NiEdit from "../../icons/ni-edit";
import ActivityLogs from "../../components/Permissions/ActivityLogs";
import CommissionSetting from "../../components/Permissions/CommissionSetting";
import { getAccountDetails } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import PaymentTerms from "../../components/Permissions/PaymentTerms";
import PlotHoldSetting from "../../components/Permissions/PlotHoldSetting";

/* Dummy Components */
const ProfileSettings = ({ setAlert, userDetail, navigate }) => (
  <div>
    <h4>Profile Settings</h4>
    <p>
      Update name, email, avatar and contact information.{" "}
      <span onClick={() =>
        navigate(`/user/${userDetail._id}`, {
          state: userDetail,
        })
      }>
        <NiEdit />
      </span>

    </p>
  </div>
);

const StaffPermissionManagement = ({ setAlert }) => (
  <div>
    <h4>Staff Permissions Management</h4>
    <StaffPermission />
  </div>
);

const Setting = ({ mood, setAlert }) => {
  //  console.log(setAlert,"setAlert")
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userDetail } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(getAccountDetails());
  }, []);

  /* ================= ROLE BASED TABS ================= */

  const TABS = useMemo(() => {
    switch (mood) {
      case "admin":
        return ["Profile", "Staff Permissions", "Logs", "Commission Settings", "Payment Terms","Plot Hold"];

      case "staff":
        return ["Profile"];

      case "agent":
        return ["Profile"];

      case "user":
      default:
        return ["Profile"];
    }
  }, [mood]);

  const [activeTab, setActiveTab] = useState(TABS[0]);

  /* ================= TAB CONTENT ================= */

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return (
          <ProfileSettings
            setAlert={setAlert}
            userDetail={userDetail}
            navigate={navigate}
          />
        );

      case "Staff Permissions":
        return mood === "admin" ? (
          <StaffPermissionManagement setAlert={setAlert} />
        ) : null;

      case "Commission Settings":
        return mood === "admin" ? (
          <CommissionSetting setAlert={setAlert} />
        ) : null;

      case "Logs":
        return mood === "admin" ? <ActivityLogs setAlert={setAlert} /> : null;

      case "Payment Terms":
        return mood === "admin" ? (
          <PaymentTerms
            setAlert={setAlert}
          />
        ) : null;
      case "Plot Hold":
        return mood === "admin" ? (
          <PlotHoldSetting
            setAlert={setAlert}
          />
        ) : null;

      default:
        return <ProfileSettings setAlert={setAlert} />;
    }
  };

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <div className="page-tools">
            <ChevronLeft className="back-button" onClick={() => navigate(-1)} />
            <h2>Settings</h2>
          </div>
          <Breadcrumb />
        </div>
      </div>

      <div className="profile-grid">
        {/* LEFT SIDEBAR */}
        <div className="profile-sidebar">
          <div className="profile-card card">
            <div className="profile-nav">
              {TABS.map((tab) => (
                <span
                  key={tab}
                  className={activeTab === tab ? "menu active" : "menu"}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="profile-main">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Setting;
