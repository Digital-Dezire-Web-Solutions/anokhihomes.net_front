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
  getLeads,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userDetail, leads, booking } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getLeads());
    dispatch(getBooking());
  }, []);

  const revenueData = [
    { month: "Mon", revenue: 0 },
    { month: "Tue", revenue: 0 },
    { month: "Wed", revenue: 0 },
    { month: "Thu", revenue: 0 },
    { month: "Fri", revenue: 0 },
    { month: "Sat", revenue: 0 },
    { month: "Sun", revenue: 0 },
  ];

  const leadData = [
    { month: "Jan", conversion: 0 },
    { month: "Feb", conversion: 0 },
    { month: "Mar", conversion: 0 },
    { month: "Apr", conversion: 0 },
  ];

  const handleNavigate = () => {
    navigate("/bookings");
  };

  return (
    <div className="dashboard-wrapper">
      <h4>Stats</h4>
      {/* ================= STATS ================= */}
      <div className="dashboard-grid">
        <DashboardCard
          title="Total Revenue"
          value="₹0"
          icons={<NiPayments />}
        />
        <DashboardCard title="Pending Dues" value="₹0" icons={<NiPayments />} />
        <DashboardCard title="Agents Income" value="₹0" icons={<NiTeams />} />
        <DashboardCard title="Total Bookings" value="0" icons={<NiBooking />} />
        <DashboardCard title="Available Plots" value="0" icons={<NiTool />} />
        <DashboardCard title="Plots on Hold" value="0" icons={<NiTool />} />
        <DashboardCard title="Total Leads" value="0" icons={<NiManagement />} />
        <DashboardCard title="Active Agents" value="0" icons={<NiTeams />} />
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
              <li className="alert-items danger card">
                {" "}
                <NiCross /> 0 Plots on hold expiring soon
              </li>
              <li className="alert-items warning card">
                {" "}
                <NiInfo /> 0 Overdue payments
              </li>
              <li className="alert-items success card">
                <NiTick /> 0 Unassigned leads
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

export default StaffDashboard;
