import { Link, useNavigate } from "react-router-dom";
import NiBooking from "../../icons/ni-booking";
import NiManagement from "../../icons/ni-management";
import NiPayments from "../../icons/ni-payments";
import NiSitevisit from "../../icons/ni-sitevisit";
import NiTeams from "../../icons/ni-teams";
import NiTool from "../../icons/ni-tool";
import BookingCard from "../Cards/BookingCard";
import DashboardCard from "../Cards/DashboardCard";
import BookingData from "../Data/BookingData";
import Charts from "./Charts";
import { FaAngleRight } from "react-icons/fa6";
import NiCross from "../../icons/ni-cross";
import NiInfo from "../../icons/ni-info";
import NiTick from "../../icons/ni-tick";
import {
  getAccountDetails,
  getBooking,
  getIncome,
  getLeads,
  getPayments,
  getPlotHold,
  getUser,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { formatCurrency } from "../Utils/FormatCurrency";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Returns the Monday..Sunday range containing `date`
const getWeekRange = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
};

const getLastNMonths = (n) => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return {
      label: d.toLocaleString("en-IN", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    userDetail,
    leads,
    booking,
    payment,
    users,
    incomeHistory,
    plotHold,
  } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getLeads());
    dispatch(getBooking());
    dispatch(getPayments());
    dispatch(getUser());
    dispatch(getIncome());
    dispatch(getPlotHold());
  }, []);

  const handleNavigate = () => {
    navigate("/bookings");
  };

  // ---------------- STATS ----------------

  const totalRevenue = useMemo(
    () =>
      (payment || [])
        .filter((p) => p.status === "approved")
        .reduce((acc, p) => acc + Number(p.amount || 0), 0),
    [payment],
  );

  const totalBookingAmount = useMemo(
    () =>
      (booking || []).reduce((acc, b) => acc + Number(b.finalAmount || 0), 0),
    [booking],
  );

  const pendingDues = Math.max(totalBookingAmount - totalRevenue, 0);

  // ADJUST: excludes referral income to match "Plot's Income" style total from Income.js
  const agentsIncome = useMemo(
    () =>
      (incomeHistory || [])
        .filter((i) => i.type !== "referal_income")
        .reduce((acc, i) => acc + Number(i.amount || 0), 0),
    [incomeHistory],
  );

  const totalBookings = booking?.length || 0;

  // ADJUST: plot availability needs a plots-by-location fetch; using plotHold
  // as a stand-in count of currently-held plots. Wire up getPlots per location
  // (or a dedicated "all plots" endpoint) if you want a true available-plots count.
  const plotsOnHold = plotHold?.length || 0;
  const availablePlots = "—"; // no reliable data source yet

  const totalLeads = leads?.length || 0;

  // ADJUST: assumes user.role === "agent" and user.status === "active"
  const activeAgents = useMemo(
    () =>
      (users || []).filter((u) => u.role === "agent" && u.status === "active")
        .length,
    [users],
  );

  // ---------------- ALERTS ----------------

  // ADJUST: assumes plotHold items have an expiresAt date
  const expiringHoldsCount = useMemo(() => {
    const now = new Date();
    return (plotHold || []).filter((p) => {
      if (!p.expiresAt) return false;
      const diffDays = (new Date(p.expiresAt) - now) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 3;
    }).length;
  }, [plotHold]);

  const overdueSchedules = useMemo(() => {
    const now = new Date();
    const overdue = [];
    (booking || []).forEach((b) => {
      ["booking", "agreement", "full"].forEach((key) => {
        const sched = b?.paymentSchedule?.[key];
        if (sched && !sched.paid && new Date(sched.date) < now) {
          overdue.push(sched);
        }
      });
    });
    return overdue.length;
  }, [booking]);

  // ADJUST: assumes lead.assignedTo holds the assigned agent's id
  const unassignedLeadsCount = useMemo(
    () => (leads || []).filter((l) => !l.assignedTo).length,
    [leads],
  );

  // ---------------- CHARTS ----------------

  const revenueData = useMemo(() => {
    const { monday, sunday } = getWeekRange();
    return DAY_LABELS.map((label, idx) => {
      const jsDay = idx === 6 ? 0 : idx + 1; // Mon=1 ... Sun=0
      const total = (payment || [])
        .filter((p) => {
          const d = new Date(p.paymentDate || p.createdAt);
          return (
            p.status === "approved" &&
            d >= monday &&
            d <= sunday &&
            d.getDay() === jsDay
          );
        })
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      return { month: label, revenue: total };
    });
  }, [payment]);

  // ADJUST: assumes lead.status includes "converted" for a won lead
  const leadData = useMemo(() => {
    return getLastNMonths(4).map(({ label, year, month }) => {
      const monthLeads = (leads || []).filter((l) => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      const converted = monthLeads.filter(
        (l) => l.status === "converted" || l.status === "won",
      ).length;
      const conversion =
        monthLeads.length > 0
          ? Math.round((converted / monthLeads.length) * 100)
          : 0;
      return { month: label, conversion };
    });
  }, [leads]);

  return (
    <div className="dashboard-wrapper">
      <h4>Stats</h4>
      {/* ================= STATS ================= */}
      <div className="dashboard-grid">
        <DashboardCard
          title="Total Revenue"
          value={`₹${formatCurrency(totalRevenue)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Pending Dues"
          value={`₹${formatCurrency(pendingDues)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Agents Income"
          value={`₹${formatCurrency(agentsIncome)}`}
          icons={<NiTeams />}
        />
        <DashboardCard
          title="Total Bookings"
          value={totalBookings}
          icons={<NiBooking />}
        />
        <DashboardCard
          title="Available Plots"
          value={availablePlots}
          icons={<NiTool />}
        />
        <DashboardCard
          title="Plots on Hold"
          value={plotsOnHold}
          icons={<NiTool />}
        />
        <DashboardCard
          title="Total Leads"
          value={totalLeads}
          icons={<NiManagement />}
        />
        <DashboardCard
          title="Active Agents"
          value={activeAgents}
          icons={<NiTeams />}
        />
      </div>

      <div className="dashboard-box">
        {/* ================= RECENT ACTIVITY ================= */}
        <div className=" dashboard-box-left">
          <div className="dashboard-title-box">
            <h4>Recent Bookings</h4>
            <Link to="/bookings" className="view-all">
              {" "}
              <FaAngleRight /> View All
            </Link>
          </div>

          <div className="user-card-box">
            {booking.length === 0 ? (
              <p>No Bookings Found</p>
            ) : (
              booking
                .slice(0, 2)
                .map((item) => (
                  <BookingCard
                    item={item}
                    dashboard={() => navigate("/bookings")}
                    mood={"user"}
                  />
                ))
            )}
          </div>
        </div>

        {/* ================= ALERTS ================= */}
        <div className="dashboard-box-right">
          <h6 style={{ margin: "1.5rem 0 .5rem 0" }}>System Alerts</h6>
          <div className="dashboard-alerts ">
            <ul>
              <li className="dashboard alert-items danger card">
                {" "}
                <NiCross /> {expiringHoldsCount} Plots on hold expiring soon
              </li>
              <li className="dashboard alert-items warning card">
                {" "}
                <NiInfo /> {overdueSchedules} Overdue payments
              </li>
              <li className="dashboard alert-items success card">
                <NiTick /> {unassignedLeadsCount} Unassigned leads
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* ================= CHARTS ================= */}
      <div className="dashboard-charts">
        <div>
          <h4>Weekly Revenue</h4>
          <div className="card">
            <Charts
              title="Weekly Revenue"
              data={revenueData}
              dataKey="revenue"
            />
          </div>
        </div>
        <div>
          <h4>Lead Conversion</h4>
          <div className="card">
            <Charts
              title="Lead Conversion"
              data={leadData}
              dataKey="conversion"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
