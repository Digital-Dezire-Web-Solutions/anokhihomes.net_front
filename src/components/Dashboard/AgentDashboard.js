import DashboardCard from "../Cards/DashboardCard";
import NiBooking from "../../icons/ni-booking";
import NiManagement from "../../icons/ni-management";
import NiPayments from "../../icons/ni-payments";
import NiSitevisit from "../../icons/ni-sitevisit";
import Charts from "./Charts";
import BookingCard from "../Cards/BookingCard";
import { FaAngleRight } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import {
  getAccountDetails,
  getBooking,
  getLeads,
  getIncome,
  getIncomeSummary,
  getSiteVisit,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { formatCurrency } from "../Utils/FormatCurrency";

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

const AgentDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    userDetail,
    leads,
    booking,
    incomeHistory,
    incomeSummary,
    siteVisit,
  } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getBooking());
    dispatch(getLeads());
    dispatch(getIncome());
    dispatch(getIncomeSummary());
    dispatch(getSiteVisit());
  }, []);

  const handleNavigate = () => {
    navigate("/bookings");
  };

  // leads/booking/incomeHistory are assumed pre-scoped to this agent by the backend
  const myLeads = leads?.length || 0;
  const myBookings = booking?.length || 0;

  const totalSales = useMemo(
    () => (booking || []).reduce((acc, b) => acc + Number(b.finalAmount || 0), 0),
    [booking],
  );

  const commissionEarned = useMemo(
    () =>
      (incomeHistory || []).reduce(
        (acc, i) => acc + Number(i.amount || 0),
        0,
      ),
    [incomeHistory],
  );

  const currentUserSummary = useMemo(
    () => incomeSummary?.find((item) => item._id === userDetail?._id),
    [incomeSummary, userDetail],
  );

  const pendingCommission =
    currentUserSummary?.incomeSummary?.payableAmount || 0;

  // ADJUST: assumes siteVisit items have a scheduledDate field
  const todaysFollowUps = useMemo(() => {
    const today = new Date().toDateString();
    return (siteVisit || []).filter(
      (v) => new Date(v.scheduledDate || v.date).toDateString() === today,
    ).length;
  }, [siteVisit]);

  const salesData = useMemo(() => {
    return getLastNMonths(4).map(({ label, year, month }) => {
      const monthSales = (booking || [])
        .filter((b) => {
          const d = new Date(b.createdAt);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((acc, b) => acc + Number(b.finalAmount || 0), 0);
      return { month: label, sales: monthSales };
    });
  }, [booking]);

  return (
    <div className="dashboard-wrapper">
      <h4>Stats</h4>
      <div className="dashboard-grid">
        <DashboardCard title="My Leads" value={myLeads} icons={<NiManagement />} />
        <DashboardCard title="My Bookings" value={myBookings} icons={<NiBooking />} />
        <DashboardCard
          title="Total Sales"
          value={`₹${formatCurrency(totalSales)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Commission Earned"
          value={`₹${formatCurrency(commissionEarned)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Pending Commission"
          value={`₹${formatCurrency(pendingCommission)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Today's Follow-ups"
          value={todaysFollowUps}
          icons={<NiSitevisit />}
        />
      </div>
      <div className="dashboard-box">
        <div className=" dashboard-box-left">
          <div className="dashboard-title-box">
            <h4>Recent Bookings</h4>
            <Link to="/bookings" className="view-all">
              {" "}
              <FaAngleRight /> View All
            </Link>
          </div>
          <div className="user-card-box">
            {booking?.length === 0 ? (
              <p>No Bookings Found</p>
            ) : (
              booking
                ?.slice(0, 2)
                .map((item) => (
                  <BookingCard
                    key={item._id}
                    item={item}
                    dashboard={() => navigate("/bookings")}
                    mood={"user"}
                  />
                ))
            )}
          </div>
        </div>
        <div className=" dashboard-box-right">
          <h6 style={{ margin: "1.5rem 0 .5rem 0" }}>Upcoming Site Visits</h6>
          <div className="dashboard-alerts ">
            <ul>
              {siteVisit?.length === 0 ? (
                <li className="alert-items card">
                  <NiSitevisit /> No upcoming visits
                </li>
              ) : (
                siteVisit
                  ?.slice(0, 3)
                  .map((v) => (
                    <li className="alert-items card" key={v._id}>
                      <NiSitevisit /> {v?.customer?.name || "Visit"} —{" "}
                      {new Date(v.scheduledDate || v.date).toLocaleDateString(
                        "en-IN",
                      )}
                    </li>
                  ))
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="dashboard-charts">
        <div>
          <h4>Weekly Revenue</h4>
          <div className="card">
            <Charts title="My Monthly Sales" data={salesData} dataKey="sales" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;