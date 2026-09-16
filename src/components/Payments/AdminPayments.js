import { useMemo } from "react";
import NiPayments from "../../icons/ni-payments";
import DashboardCard from "../Cards/DashboardCard";
import Charts from "../Dashboard/Charts";
import { formatCurrency } from "../Utils/FormatCurrency";
import PaymentTable from "./PaymentTable";

const AdminPayments = ({ payment, mood, setAlert }) => {
  const totalCollection = payment?.reduce((sum, p) => sum + (p.amount || 0), 0);

  const now = new Date();

  // Today's Collection
  const todaysCollection = payment
    ?.filter((p) => {
      const date = new Date(p.paymentDate || p.createdAt);

      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        p.status === "approved"
      );
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // This Month Collection
  const thisMonthCollection = payment
    ?.filter((p) => {
      const date = new Date(p.paymentDate || p.createdAt);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        p.status === "approved"
      );
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Pending Approval
  const pendingApproval =
    payment?.filter((p) => p.status === "pending").length || 0;

  // Rejected / Overdue
  const overdue = payment
    ?.filter((p) => p.status === "rejected")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const formatRangeLabel = (start, end) => {
    const opts = { day: "numeric", month: "short" };
    return `${start.toLocaleDateString("en-IN", opts)} - ${end.toLocaleDateString("en-IN", opts)}`;
  };

  const getFortnightRanges = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const day = now.getDate();

    const lastDayOfThisMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const lastDayOfPrevMonth = new Date(
      prevMonthYear,
      prevMonth + 1,
      0,
    ).getDate();

    let currentStart, currentEnd, previousStart, previousEnd;

    if (day <= 15) {
      // Current period: 1st - 15th of this month
      currentStart = new Date(year, month, 1, 0, 0, 0);
      currentEnd = new Date(year, month, 15, 23, 59, 59, 999);

      // Previous period: 16th - end of PREVIOUS month
      previousStart = new Date(prevMonthYear, prevMonth, 16, 0, 0, 0);
      previousEnd = new Date(
        prevMonthYear,
        prevMonth,
        lastDayOfPrevMonth,
        23,
        59,
        59,
        999,
      );
    } else {
      // Current period: 16th - end of THIS month
      currentStart = new Date(year, month, 16, 0, 0, 0);
      currentEnd = new Date(year, month, lastDayOfThisMonth, 23, 59, 59, 999);

      // Previous period: 1st - 15th of this month
      previousStart = new Date(year, month, 1, 0, 0, 0);
      previousEnd = new Date(year, month, 15, 23, 59, 59, 999);
    }

    return { currentStart, currentEnd, previousStart, previousEnd };
  };

  const { currentStart, currentEnd, previousStart, previousEnd } = useMemo(
    () => getFortnightRanges(),
    [], // period only changes day-to-day; fine to compute once per mount
  );
  const currentColIncome = useMemo(() => {
    return (payment || [])
      .filter((i) => {
        const d = new Date(i.createdAt);
        return d >= currentStart && d <= currentEnd;
      })
      .reduce((acc, item) => acc + (item.amount || 0), 0);
  }, [payment, currentStart, currentEnd]);

  const previousColIncome = useMemo(() => {
    return (payment || [])
      .filter((i) => {
        const d = new Date(i.createdAt);
        return d >= previousStart && d <= previousEnd;
      })
      .reduce((acc, item) => acc + (item.amount || 0), 0);
  }, [payment, previousStart, previousEnd]);

  return (
    <div className="dashboard-wrapper">
      {/* ================= STATS ================= */}
      <div className="dashboard-grid">
        <DashboardCard
          title="Total Collection"
          value={`₹${formatCurrency(totalCollection)}`}
          icons={<NiPayments />}
        />

        <DashboardCard
          title="This Month"
          value={`₹${formatCurrency(thisMonthCollection)}`}
          icons={<NiPayments />}
        />

        {/* <DashboardCard
          title="Pending Dues"
          value={`₹${pendingDues.toLocaleString()}`}
          icons={<NiPayments />}
        /> */}

        <DashboardCard
          title="Overdue"
          value={`₹${formatCurrency(overdue)}`}
          icons={<NiPayments />}
        />

        <DashboardCard
          title="Today's Collection"
          value={`₹${formatCurrency(todaysCollection)}`}
          icons={<NiPayments />}
        />

        <DashboardCard
          title="Pending Approval"
          value={pendingApproval}
          icons={<NiPayments />}
        />
        <DashboardCard
          title={`Previous Col. (${formatRangeLabel(previousStart, previousEnd)})`}
          value={`₹${formatCurrency(previousColIncome)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title={`Current Col. (${formatRangeLabel(currentStart, currentEnd)})`}
          value={`₹${formatCurrency(currentColIncome)}`}
          icons={<NiPayments />}
        />
      </div>
      <h4>Payments</h4>
      <PaymentTable data={payment} mood={mood} setAlert={setAlert} />
      <h4>Collection Trend</h4>
      <div className="card">
        <Charts
          title="Collection Trend"
          data={[
            { month: "Monday", revenue: 200000 },
            { month: "Tuesday", revenue: 350000 },
            { month: "Wednesday", revenue: 300000 },
            { month: "Thursday", revenue: 250000 },
            { month: "Friday", revenue: 300000 },
            { month: "Saturday", revenue: 350000 },
            { month: "Sunday", revenue: 400000 },
          ]}
          dataKey="revenue"
          setAlert={setAlert}
        />
        {/* Filters */}
      </div>
    </div>
  );
};

export default AdminPayments;
