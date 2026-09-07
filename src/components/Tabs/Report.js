import React from "react";
import "./Tabs.css";

import DashboardCard from "../Cards/DashboardCard";

import NiBooking from "../../icons/ni-booking";
import NiTool from "../../icons/ni-tool";
import NiPayments from "../../icons/ni-payments";
import NiManagement from "../../icons/ni-management";
import { formatCurrency } from "../Utils/FormatCurrency";

const Report = ({ userData, incomeHistory, incomeSummary }) => {
  const totalIncome =
    incomeHistory?.reduce((acc, item) => acc + item.amount, 0) || 0;

  const creditedIncome =
    incomeHistory
      ?.filter((i) => i.status === "credited")
      ?.reduce((acc, item) => acc + item.amount, 0) || 0;

  const pendingIncome =
    incomeHistory
      ?.filter((i) => i.status === "pending")
      ?.reduce((acc, item) => acc + item.amount, 0) || 0;

  const todayIncome =
    incomeHistory
      ?.filter((i) => {
        const today = new Date().toDateString();

        return new Date(i.createdAt).toDateString() === today;
      })
      ?.reduce((acc, item) => acc + item.amount, 0) || 0;

  const referralIncome =
    incomeHistory
      ?.filter((i) => i.type === "referal_income")
      ?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;

  const otherIncome =
    incomeHistory
      ?.filter((i) => i.type !== "referal_income")
      ?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;

  if (!userData) {
    return (
      <div className="card">
        <h4>No Data Available</h4>
      </div>
    );
  }

   const currentUser = incomeSummary?.find((item) => item._id === userData?._id);

  return (
    <div className="agent-report">
      {/* =======================
          MLM PERFORMANCE CARDS
      ======================== */}

      <div className="dashboard-grid">
        <DashboardCard
          title="Total Income"
          value={`₹${formatCurrency(totalIncome)}`}
          icons={<NiPayments />}
        />

        <DashboardCard
          title="Total Self Business"
          value={`₹${formatCurrency(userData?.selfBusiness || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Total Team Business"
          value={`₹${formatCurrency(userData?.totalBusiness || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title={`My Wallet`}
          value={`₹${formatCurrency(currentUser?.incomeSummary?.payableAmount || 0)}`}
          icons={<NiPayments />}
        />
        {/* <DashboardCard
                    title={`My Wallet (${mood === "admin" ? "Admin" : mood === "agent" ? "Associate" : mood === "staff" ? "Staff" : "User"})`}
                    value={`₹${formatCurrency(userDetail?.wallet || 0)}`}
                    icons={<NiPayments />}
                  /> */}
        <DashboardCard
          title="Total Referral Income"
          value={`₹${formatCurrency(referralIncome || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Other Incomes"
          value={`₹${formatCurrency(otherIncome || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Total Transactions"
          value={incomeHistory?.length || 0}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Today's Income"
          value={`₹${formatCurrency(todayIncome)}`}
          icons={<NiPayments />}
        />
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h4>Business Summary</h4>

        <div className="overview-grid">
          <div>
            <label>Self Business</label>
            <p>₹{formatCurrency(userData.selfBusiness || 0)}</p>
          </div>

          <div>
            <label>Left Business</label>
            <p>₹{formatCurrency(userData.leftBusiness || 0)}</p>
          </div>

          <div>
            <label>Right Business</label>
            <p>₹{formatCurrency(userData.rightBusiness || 0)}</p>
          </div>

          <div>
            <label>Total Business</label>
            <p>₹{formatCurrency(userData.totalBusiness || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
