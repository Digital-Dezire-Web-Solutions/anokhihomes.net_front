import React from "react";
import "./Tabs.css";

import DashboardCard from "../Cards/DashboardCard";

import NiBooking from "../../icons/ni-booking";
import NiTool from "../../icons/ni-tool";
import NiPayments from "../../icons/ni-payments";
import NiManagement from "../../icons/ni-management";
import { formatCurrency } from "../Utils/FormatCurrency";

const Report = ({ userData }) => {
  if (!userData) {
    return (
      <div className="card">
        <h4>No Data Available</h4>
      </div>
    );
  }

  return (
    <div className="agent-report">
      {/* =======================
          MLM PERFORMANCE CARDS
      ======================== */}

      <div className="report-grid">

        <DashboardCard
          title="Self Business"
          value={`₹${formatCurrency(
            userData.selfBusiness || 0
          )}`}
          icons={<NiManagement />}
        />

        <DashboardCard
          title="Left Business"
          value={`₹${formatCurrency(
            userData.leftBusiness || 0
          )}`}
          icons={<NiBooking />}
        />

        <DashboardCard
          title="Right Business"
          value={`₹${formatCurrency(
            userData.rightBusiness || 0
          )}`}
          icons={<NiTool />}
        />

        <DashboardCard
          title="Total Business"
          value={`₹${formatCurrency(
            userData.totalBusiness || 0
          )}`}
          icons={<NiPayments />}
        />

        <DashboardCard
          title="Wallet Balance"
          value={`₹${formatCurrency(
            userData.wallet || 0
          )}`}
          icons={<NiManagement />}
        />

        <DashboardCard
          title="Total Income"
          value={`₹${formatCurrency(
            userData.totalIncome || 0
          )}`}
          icons={<NiPayments />}
        />
    
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h4>Business Summary</h4>

        <div className="overview-grid">
          <div>
            <label>Self Business</label>
            <p>
              ₹{formatCurrency(
                userData.selfBusiness || 0
              )}
            </p>
          </div>

          <div>
            <label>Left Business</label>
            <p>
              ₹{formatCurrency(
                userData.leftBusiness || 0
              )}
            </p>
          </div>

          <div>
            <label>Right Business</label>
            <p>
              ₹{formatCurrency(
                userData.rightBusiness || 0
              )}
            </p>
          </div>

          <div>
            <label>Total Business</label>
            <p>
              ₹{formatCurrency(
                userData.totalBusiness || 0
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;