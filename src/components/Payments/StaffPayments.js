import NiPayments from "../../icons/ni-payments";
import DashboardCard from "../Cards/DashboardCard";
import { formatCurrency } from "../Utils/FormatCurrency";
import PaymentTable from "./PaymentTable";

const StaffPayments = ({ payment, mood, staffType, setAlert }) => {
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
      {staffType === "accounts" && (
        <>
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
          <PaymentTable
            data={payment}
            actions={["Add Payment", "Verify", "Generate Receipt"]}
          />
        </>
      )}

      {(staffType === "marketing" || staffType === "operations") && (
        <>
          <PaymentTable data={payment} mood={mood} setAlert={setAlert} />
        </>
      )}
    </div>
  );
};

export default StaffPayments;
