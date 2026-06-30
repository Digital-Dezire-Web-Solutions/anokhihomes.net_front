import NiSitevisit from "../../icons/ni-sitevisit";
import DashboardCard from "../Cards/DashboardCard";
import VisitTable from "./VisitTable";

const AgentSiteVisit = ({ siteVisits, mood, setAlert ,landingPage}) => {
  const totalVisits = siteVisits?.length || 0;

  const totalCompleted =
    siteVisits?.filter((visit) => visit.status === "completed").length || 0;

  const totalRescheduled =
    siteVisits?.filter((visit) => visit.status === "rescheduled").length || 0;

  const totalCancelled =
    siteVisits?.filter(
      (visit) =>
        visit.status === "cancelled" ||
        visit.status === "lost"
    ).length || 0;
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-grid">
        <DashboardCard
          title="Total Visits"
          value={totalVisits}
          icons={<NiSitevisit />}
        />

        <DashboardCard
          title="Total Completed"
          value={totalCompleted}
          icons={<NiSitevisit />}
        />

        <DashboardCard
          title="Total Rescheduled"
          value={totalRescheduled}
          icons={<NiSitevisit />}
        />

        <DashboardCard
          title="Total Cancelled/Lost"
          value={totalCancelled}
          icons={<NiSitevisit />}
        />
      </div>
      <h4>Site Visits</h4>
      <VisitTable
        data={siteVisits}
        actions={["Edit", "Update Status", "Add Feedback", "Set Interest"]}
        setAlert={setAlert}
        mood={mood}
        landingPage={landingPage}
      />
    </div>
  );
};

export default AgentSiteVisit;
