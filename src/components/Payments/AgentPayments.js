import NiPayments from "../../icons/ni-payments";
import DashboardCard from "../Cards/DashboardCard";
import { formatCurrency } from "../Utils/FormatCurrency";
import PaymentTable from "./PaymentTable";

const AgentPayments = ({ payment, mood, setAlert }) => {
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

  return (
    <div className="dashboard-wrapper">
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

        <DashboardCard
          title="Today's Collection"
          value={`₹${formatCurrency(todaysCollection)}`}
          icons={<NiPayments />}
        />
      </div>
      <h4>Payments</h4>
      <PaymentTable data={payment} mood={mood} setAlert={setAlert} />
    </div>
  );
};

export default AgentPayments;
