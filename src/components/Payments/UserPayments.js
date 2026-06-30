import NiPayments from "../../icons/ni-payments";
import DashboardCard from "../Cards/DashboardCard";
import PaymentTable from "./PaymentTable";

const UserPayments = ({payment, mood, staffType, setAlert }) => {
  return (
    <div className="dashboard-wrapper">
      {/* <h4>Payments</h4> */}
      <PaymentTable data={payment} mood={mood} setAlert={setAlert} />
    </div>
  );
};

export default UserPayments;
