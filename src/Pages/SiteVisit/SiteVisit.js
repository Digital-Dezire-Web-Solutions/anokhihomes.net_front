import React, { useEffect } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import AdminSiteVisit from "../../components/SiteVisit/AdminSiteVisit";
import AgentSiteVisit from "../../components/SiteVisit/AgentSiteVisit";
import StaffSiteVisit from "../../components/SiteVisit/StaffSiteVisit";
import "./SiteVisit.css";
import UserSiteVisit from "../../components/SiteVisit/UserSiteVisit";
import { LucidePlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAccountDetails, getSiteVisit } from "../../Redux/Slices/AppSlices";

const SiteVisit = ({ mood, staffType, setAlert, landingPage }) => {
  const [open, setOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const dispatch = useDispatch();
  const { userDetail, siteVisit } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getSiteVisit());
  }, []);

  const renderPage = () => {
    switch (mood) {
      case "admin":
        return (
          <AdminSiteVisit
            siteVisits={siteVisit}
            mood={mood}
            setAlert={setAlert}
            landingPage={landingPage}
          />
        );
      case "agent":
        return (
          <AgentSiteVisit
            siteVisits={siteVisit}
            mood={mood}
            setAlert={setAlert}
            landingPage={landingPage}
          />
        );
      case "staff":
        return (
          <StaffSiteVisit
            siteVisits={siteVisit}
            mood={mood}
            staffType={"operations"}
            setAlert={setAlert}
            landingPage={landingPage}
          />
        );
      case "user":
        return (
          <UserSiteVisit
            siteVisits={siteVisit}
            mood={mood}
            setAlert={setAlert}
            landingPage={landingPage}
          />
        );
      default:
        return <div>Access Denied</div>;
    }
  };

  // console.log(mood, "mood222");

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Site Visit</h2>
          <Breadcrumb />
        </div>
        <div className="page-tools">
          {mood === "user" && (
            <button
              className="add-button"
              onClick={() => {
                setSelectedBooking(null);
                setIsEditMode(false);
                setOpen(true);
              }}
            >
              <LucidePlus /> Support
            </button>
          )}
        </div>
      </div>
      <div className="dashboard-container">{renderPage()}</div>
    </div>
  );
};

export default SiteVisit;
