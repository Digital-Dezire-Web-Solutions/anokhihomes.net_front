import React, { useState } from "react";

import NiOpenEye from "../../icons/ni-openEye";
import NiExport from "../../icons/ni-export";
import ViewModal from "../Modals/ViewModal";
import { formatCurrency } from "../Utils/FormatCurrency";
import {
  addPayoutPayment,
  getIncomeSummary,
} from "../../Redux/Slices/AppSlices";
import { useDispatch } from "react-redux";

const CommissionTable = ({ index, item, exportToExcel, mood, setAlert }) => {
  const dispatch = useDispatch();
  const [viewOpen, setViewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [formData, setFormData] = useState({});

  const handleAddPayment = async () => {
    setSaving(true);
    try {
      if (!item.nextPayout) {
        setAlert({
          status: "Error",
          message: "No payout available.",
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      if (!formData.mode) {
        setAlert({
          status: "Error",
          message: "Please select payment mode.",
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      if (!formData.amount || Number(formData.amount) <= 0) {
        setAlert({
          status: "Error",
          message: "Enter valid amount.",
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      if (Number(formData.amount) > item.nextPayout.balance) {
        setAlert({
          status: "Error",
          message: "Amount exceeds remaining balance.",
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      if (
        (formData.mode === "upi" || formData.mode === "bank") &&
        !formData.transactionId
      ) {
        setAlert({
          status: "Error",
          message: "Transaction ID is required.",
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      if (!formData.attachment) {
        setAlert({
          status: "Error",
          message: "Please upload payment proof.",
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      const body = new FormData();

      body.append("amount", formData.amount);
      body.append("paymentMode", formData.mode);
      body.append("transactionId", formData.transactionId || "");

      body.append("attachment", formData.attachment);

      await dispatch(
        addPayoutPayment({
          payoutId: item.nextPayout._id,
          formData: body,
        }),
      ).unwrap();

      dispatch(getIncomeSummary());

      setAlert({
        status: "Success",
        message: "Payment added successfully.",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
      setFormData({});
      setViewOpen(false);
    } catch (err) {
      console.log(err);

      setAlert({
        status: "Error",
        message: err?.message || "Unable to add payment.",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className={`table-row commission-table ${
          index === 0 ? "best-performer-row" : ""
        }`}
      >
        <span>
          {index === 0 && "🏆 "}
          {item.name}
        </span>
        <span>{item.designation}</span>
        <span>{item.referralId}</span>
        <span>₹{item.selfBusiness}</span>
        <span>₹{formatCurrency(item.wallet)}</span>
        <span>₹{formatCurrency(item.holdCommission)}</span>
        <span>₹{formatCurrency(item.releasedCommission)}</span>
        <span>₹{formatCurrency(item.totalIncome)}</span>
        <div className="dots">
          <span onClick={() => setViewOpen(true)}>
            <NiOpenEye />
          </span>

          <span onClick={() => exportToExcel([item])}>
            <NiExport />
          </span>
        </div>
      </div>

      <ViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={item.name}
      >
        <div className="table-filters">
          <button
            className={activeTab === "summary" ? "active" : ""}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>

          <button
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            Income History
          </button>

          <button
            className={activeTab === "rewards" ? "active" : ""}
            onClick={() => setActiveTab("rewards")}
          >
            Rewards
          </button>
          <button
            className={activeTab === "payouts" ? "active" : ""}
            onClick={() => setActiveTab("payouts")}
          >
            Payouts
          </button>
        </div>
        {mood === "admin" && (
          <div class="modal-actions">
            <button
              className={activeTab === "makepayouts" ? "active" : ""}
              onClick={() => setActiveTab("makepayouts")}
            >
              Make Payouts
            </button>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="report-view-box-right active">
            <div className="summary-card">
              <h5>Associate Information</h5>
              <p>
                <strong>Name:</strong> {item.name}{" "}
              </p>
              <p>
                <strong>Phone:</strong> {item.phone}{" "}
              </p>
              <p>
                <strong>Email:</strong> {item.email}{" "}
              </p>
              <p>
                <strong>Referral ID:</strong> {item.referralId}{" "}
              </p>
              <p>
                {" "}
                <strong>Designation:</strong> {item.designation}{" "}
              </p>
            </div>
            <div className="report-view-box-right active">
              <h5>Business</h5>
              <p>
                <strong>Total Business :</strong> ₹
                {formatCurrency(item.totalBusiness)}
              </p>
              <p>
                <strong>Wallet :</strong> ₹{formatCurrency(item.wallet)}
              </p>
              <p>
                <strong>Total Income :</strong> ₹
                {formatCurrency(item.totalIncome)}
              </p>
            </div>
            <div className="report-view-box-right active">
              <h5>Income Breakdown</h5>
              <p>
                <strong>Direct Income :</strong> ₹
                {formatCurrency(item.directIncome)}
              </p>
              <p>
                <strong>Difference Income :</strong> ₹
                {formatCurrency(item.differenceIncome)}
              </p>
              <p>
                <strong>Matching Income :</strong> ₹
                {formatCurrency(item.matchingIncome)}
              </p>
              <p>
                <strong>Referral Income :</strong> ₹
                {formatCurrency(item.referralIncome)}
              </p>
              <p>
                <strong>Reward :</strong> ₹{formatCurrency(item.rewardIncome)}
              </p>
            </div>
            <div className="report-view-box-right active">
              <h5>Business Breakdown</h5>
              <p>
                <strong>Self Business :</strong> ₹
                {formatCurrency(item.selfBusiness)}{" "}
              </p>
              <p>
                <strong>Left Business :</strong> ₹
                {formatCurrency(item.leftBusiness)}{" "}
              </p>
              <p>
                <strong>Right Business :</strong> ₹
                {formatCurrency(item.rightBusiness)}{" "}
              </p>
              <p>
                <strong>Total Business :</strong> ₹
                {formatCurrency(item.totalBusiness)}{" "}
              </p>
            </div>

            <div className="report-view-box-right active">
              <h5>Commission Summary</h5>

              <p>
                <strong>Gross Commission :</strong>₹
                {formatCurrency(item.grossCommission)}
              </p>

              <p>
                <strong>TDS :</strong>₹{formatCurrency(item.tdsDeducted)}
              </p>

              <p>
                <strong>Admin Charge :</strong>₹
                {formatCurrency(item.adminDeducted)}
              </p>

              <p>
                <strong>Net Commission :</strong>₹
                {formatCurrency(item.totalNetCommission)}
              </p>

              <p>
                <strong>Released :</strong>₹
                {formatCurrency(item.releasedCommission)}
              </p>

              <p>
                <strong>On Hold :</strong>₹{formatCurrency(item.holdCommission)}
              </p>
            </div>

            <div className="report-view-box-right active">
              <h5>Current Slab</h5>
              <p>
                <strong>Level :</strong>
                {item.currentLevel}{" "}
              </p>
              <p>
                <strong>Designation :</strong>
                {item.currentDesignation}
              </p>
              <p>
                <strong>Rate :</strong>
                {item.currentRate}%{" "}
              </p>
              <p>
                <strong>Next Rank :</strong>
                {item.nextDesignation}
              </p>
              <p>
                <strong>Remaining :</strong>₹
                {formatCurrency(item.remainingForNextRank)}
              </p>
            </div>
          </div>
        )}
        {activeTab === "history" && (
          <div className="report-view-box-right active">
            {item.histories?.length > 0 ? (
              item.histories.map((history) => (
                <div className="history-card" key={history._id}>
                  <h5>
                    {{
                      direct_income: "Direct Income",
                      difference_income: "Difference Income",
                      matching_income: "Matching Income",
                      referal_income: "Referral Income",
                      reward_income: "Reward Income",
                      royalty_income: "Royalty Income",
                      cashback_income: "Cashback Income",
                      best_performance_income: "Best Performance Income",
                    }[history.type] || history.type}
                  </h5>
                  <p>
                    <strong>Amount :</strong> ₹{formatCurrency(history.amount)}
                  </p>
                  <p>
                    <strong>Business :</strong> ₹
                    {formatCurrency(history.businessAmount || 0)}
                  </p>
                  <p>
                    <strong>Percentage :</strong>
                    {history.percentage}%
                  </p>
                  <p>
                    <strong>Status :</strong>
                    {history.status}
                  </p>
                  <p>
                    {" "}
                    <strong>Cycle :</strong>
                    {new Date(history.cycleDate).toLocaleDateString()}{" "}
                  </p>
                </div>
              ))
            ) : (
              <p>No income history found</p>
            )}
          </div>
        )}
        {activeTab === "rewards" && (
          <div className="report-view-box-right active">
            {item.rewards?.length > 0 ? (
              item.rewards.map((reward) => (
                <div key={reward._id} className="reward-card">
                  <h5>{reward.name}</h5>
                  <p>
                    <strong>Target :</strong> ₹
                    {formatCurrency(reward.targetBusiness)}
                  </p>
                  <p>
                    <strong>Reward :</strong> {reward.rewardValue}
                  </p>
                  <span
                    className={`status ${
                      reward.achieved ? "active" : "pending"
                    }`}
                  >
                    {reward.achieved ? "Achieved" : "Pending"}
                  </span>
                </div>
              ))
            ) : (
              <p>No rewards available</p>
            )}
          </div>
        )}
        {activeTab === "payouts" && (
          <div className="report-view-box-right active">
            {item.payouts?.length ? (
              item.payouts.map((payout) => (
                <div className="history-card" key={payout._id}>
                  <h5>
                    {new Date(payout.cycleStart).toLocaleDateString()}
                    {" - "}
                    {new Date(payout.cycleEnd).toLocaleDateString()}
                  </h5>

                  <p>
                    <strong>Gross :</strong>₹
                    {formatCurrency(payout.grossAmount)}
                  </p>

                  <p>
                    <strong>TDS :</strong>₹{formatCurrency(payout.tdsAmount)}
                  </p>

                  <p>
                    <strong>Admin :</strong>₹
                    {formatCurrency(payout.adminChargeAmount)}
                  </p>

                  <p>
                    <strong>Net :</strong>₹{formatCurrency(payout.netAmount)}
                  </p>

                  <p>
                    <strong>Release Date :</strong>

                    {new Date(payout.releaseDate).toLocaleDateString()}
                  </p>

                  <span
                    className={`status ${
                      payout.status === "released" ? "active" : "pending"
                    }`}
                  >
                    {payout.status}
                  </span>
                </div>
              ))
            ) : (
              <p>No payouts available.</p>
            )}
            {item.nextPayout?.payments?.length > 0 && (
              <>
                <h4>Payment History</h4>

                {item.nextPayout.payments.map((payment) => (
                  <div className="history-card" key={payment._id}>
                    <p>
                      <strong>Amount :</strong>₹{formatCurrency(payment.amount)}
                    </p>

                    <p>
                      <strong>Mode :</strong>
                      {payment.paymentMode}
                    </p>

                    <p>
                      <strong>Transaction :</strong>
                      {payment.transactionId || "-"}
                    </p>

                    <p>
                      <strong>Date :</strong>
                      {new Date(payment.paidAt).toLocaleString()}
                    </p>

                    {payment.attachment && (
                      <a
                        href={payment.attachment}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Attachment
                      </a>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
        {activeTab === "makepayouts" && (
          <div className="report-view-box-right active">
            {/* Payout Summary */}
            <div className="summary-card">
              <h5>Payout Summary</h5>

              <p>
                <strong>Gross Commission :</strong>₹
                {formatCurrency(item.nextPayout?.grossAmount || 0)}
              </p>

              <p>
                <strong>TDS :</strong>₹
                {formatCurrency(item.nextPayout?.tdsAmount || 0)}
              </p>

              <p>
                <strong>Admin Charge :</strong>₹
                {formatCurrency(item.nextPayout?.adminChargeAmount || 0)}
              </p>

              <p>
                <strong>Net Payable :</strong>₹
                {formatCurrency(item.nextPayout?.netAmount || 0)}
              </p>

              <p>
                <strong>Already Paid :</strong>₹
                {formatCurrency(item.nextPayout?.totalPaid || 0)}
              </p>

              <p style={{ color: "green", fontWeight: "600" }}>
                <strong>Remaining :</strong>₹
                {formatCurrency(item.nextPayout?.balance || 0)}
              </p>
            </div>

            <h4>Payment Details</h4>

            <div className="field">
              <label>Payment Mode</label>

              <select
                value={formData.mode || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mode: e.target.value,
                  })
                }
              >
                <option value="">Select Mode</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div className="field">
              <label>
                Amount
                <small style={{ fontSize: "12px", color: "green" }}>
                  ₹{formatCurrency(formData.restAmount || 0)}{" "}
                </small>
              </label>
              <input
                type="number"
                max={item.nextPayout?.balance}
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value,
                  })
                }
              />

              <small>
                Remaining : ₹{formatCurrency(item.nextPayout?.balance || 0)}
              </small>
            </div>
            {(formData.mode === "upi" || formData.mode === "bank") && (
              <div className="field">
                <label>Transaction ID *</label>
                <input
                  placeholder="Enter Transaction ID"
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionId: e.target.value,
                    })
                  }
                />
              </div>
            )}
            {(formData.mode === "upi" ||
              formData.mode === "cash" ||
              formData.mode === "cheque" ||
              formData.mode === "bank") && (
              <div className="field">
                <label>Attachment *</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attachment: e.target.files[0],
                    })
                  }
                />
              </div>
            )}
            <div class="modal-actions">
              <button
                disabled={item.nextPayout?.balance <= 0}
                disabled={saving}
                onClick={handleAddPayment}
                style={{ marginTop: "10px" }}
              >
                {item.nextPayout?.balance <= 0 ? "Fully Paid" : "Add Payment"}
              </button>
            </div>
          </div>
        )}
      </ViewModal>
    </>
  );
};

export default CommissionTable;
