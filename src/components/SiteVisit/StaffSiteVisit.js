import NiSitevisit from "../../icons/ni-sitevisit";
import DashboardCard from "../Cards/DashboardCard";
import Charts from "../Dashboard/Charts";
import VisitTable from "./VisitTable";

const StaffSiteVisit = ({ siteVisits, mood, setAlert ,landingPage}) => {
  const totalVisits = siteVisits?.length || 0;

  const totalCompleted =
    siteVisits?.filter((visit) => visit.status === "completed").length || 0;

  const totalRescheduled =
    siteVisits?.filter((visit) => visit.status === "rescheduled").length || 0;

  const totalCancelled =
    siteVisits?.filter(
      (visit) => visit.status === "cancelled" || visit.status === "lost",
    ).length || 0;
  return (
    <div className="dashboard-wrapper">
      {/* ================= STATS ================= */}
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
      {/* Filters */}
      <h4>Site Visits</h4>
      <VisitTable data={siteVisits} mood={mood} setAlert={setAlert} landingPage={landingPage}/>
      <h4>Monthly Revenue</h4>
      <div className="card">
        <Charts
          title="Monthly Visit Trend"
          data={[
            { month: "Jan", visits: 0 },
            { month: "Feb", visits: 0 },
            { month: "Mar", visits: 0 },
            { month: "April", visits: 0 },
            { month: "May", visits: 0 },
            { month: "June", visits: 0 },
          ]}
          dataKey="visits"
        />
      </div>
    </div>
  );
};

export default StaffSiteVisit;
