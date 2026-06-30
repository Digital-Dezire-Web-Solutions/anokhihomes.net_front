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
