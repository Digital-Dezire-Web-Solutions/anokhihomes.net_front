import NiSitevisit from "../../icons/ni-sitevisit";
import DashboardCard from "../Cards/DashboardCard";
import VisitTable from "./VisitTable";

const UserSiteVisit = ({siteVisits, mood, setAlert, landingPage }) => {
  return (
    <div className="dashboard-wrapper">
      {/* <h4>Site Visits</h4> */}
      <VisitTable
        data={siteVisits}
        setAlert={setAlert}
        mood={mood}
        landingPage={landingPage}
      />
    </div>
  );
};

export default UserSiteVisit;
