import DashboardCard from "../Cards/DashboardCard";
import NiPayments from "../../icons/ni-payments";
import NiTool from "../../icons/ni-tool";
import CircularProgress from "./CircularProgress";
import PaymentCard from "../Cards/PaymentCard";
import { Link, useNavigate } from "react-router-dom";
import BookingCard from "../Cards/BookingCard";
import { FaAngleRight } from "react-icons/fa6";
import {
  getAccountDetails,
  getPayments,
  getBooking,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { formatCurrency } from "../Utils/FormatCurrency";

const UserDashboard = ({ mood }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userDetail, payment, booking } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getPayments());
    dispatch(getBooking());
  }, []);

  const handleNavigate = () => {
    navigate("/bookings");
  };

  const totalPaid =
    payment

      ?.filter((p) => p.status === "approved")

      ?.reduce(
        (acc, curr) => acc + Number(curr.amount || 0),

        0,
      ) || 0;

  // TOTAL BOOKING AMOUNT

  const totalBookingAmount =
    booking?.reduce(
      (acc, curr) => acc + Number(curr.finalAmount || 0),

      0,
    ) || 0;

  // OUTSTANDING

  const outstandingAmount = totalBookingAmount - totalPaid;

  // NEXT DUE DATE

  const unpaidSchedules = [];

  booking?.forEach((b) => {
    if (b?.paymentSchedule?.booking && !b.paymentSchedule.booking.paid) {
      unpaidSchedules.push(b.paymentSchedule.booking);
    }

    if (b?.paymentSchedule?.agreement && !b.paymentSchedule.agreement.paid) {
      unpaidSchedules.push(b.paymentSchedule.agreement);
    }

    if (b?.paymentSchedule?.full && !b.paymentSchedule.full.paid) {
      unpaidSchedules.push(b.paymentSchedule.full);
    }
  });

  unpaidSchedules.sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextDueDate =
    unpaidSchedules.length > 0
      ? new Date(unpaidSchedules[0].date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "No Due";

  // PAYMENT PROGRESS %

  const paymentPercentage =
    totalBookingAmount > 0
      ? Math.round((totalPaid / totalBookingAmount) * 100)
      : 0;

  return (
    <div className="dashboard-wrapper">
      <h4>Stats</h4>
      {/* ================= STATS ================= */}
      <div className="dashboard-grid">
        <DashboardCard
          title="Total Paid"
          value={`₹${formatCurrency(totalPaid)}`}
          icons={<NiPayments />}
        />

        <DashboardCard
          title="Outstanding Amount"
          value={`₹${formatCurrency(outstandingAmount)}`}
          icons={<NiPayments />}
        />

        <DashboardCard
          title="Next Due Date"
          value={nextDueDate}
          icons={<NiPayments />}
        />
      </div>
      <div className="dashboard-box">
        {/* ================= RECENT ACTIVITY ================= */}
        <div className=" dashboard-box-left">
          <div className="dashboard-title-box">
            <h4>Payment History</h4>
            <Link to="/payments" className="view-all">
              {" "}
              <FaAngleRight /> View All
            </Link>
          </div>
          <div className="user-card-box">
            {payment.length === 0 ? (
              <p>No Payments Found</p>
            ) : (
              payment.slice(0, 2).map((item) => (
                <PaymentCard
                  item={item}
                  // setSelectedPayment={setSelectedPayment}
                  // setIsEditMode={setIsEditMode}
                  // setOpen={setOpen}
                  mood={mood}
                  dashboard={() => navigate("/payments")}
                />
              ))
            )}
          </div>
          <div className="dashboard-title-box">
            <h4>Booking Details</h4>
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
        <div className="dashboard-box-right">
          <h6 style={{ margin: "1.5rem 0 .5rem 0" }}>Payment Progress</h6>

          <div className="circular-chart-card card">
            <CircularProgress percentage={paymentPercentage} centerLabel="Payment Completed" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
