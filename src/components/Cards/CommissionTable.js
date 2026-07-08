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
import formatDate from "../DateFormate/DateFormate";
import axios from "axios";
import Host from "../../Host/Host";
import { uploadImage } from "../../Pages/LandingSetting/LandingApi";

const CommissionTable = ({ index, item, exportToExcel, mood, setAlert }) => {
  const dispatch = useDispatch();
  const [viewOpen, setViewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [formData, setFormData] = useState({});
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [fromDate, setFromDate] = useState("");

  console.log(item, "item");
  const handleFileUpload = (field, file) => {
    if (!file) return;

    const MAX_SIZE = 20 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      setAlert({
        message: "Image size should not exceed 20 MB",
        status: "Error",
      });

      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handlePay = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      let attachment = "";
      if (formData.attachment) {
        const upload = await uploadImage(formData.attachment);
        attachment = upload.url;
      }

      await axios.post(
        `${Host}/api/payout/pay/${selectedExpense._id}`,
        {
          amount: Number(formData.amount),
          paymentMode: formData.paymentMode,
          transactionId: formData.transactionId,
          chequeNumber: formData.chequeNumber,
          bankName: formData.bankName,
          attachment,
          remarks: formData.remarks,
        },
        {
          headers: {
            "auth-token": token,
          },
        },
      );
      setAlert({
        status: "Success",
        message: "Payout completed successfully.",
      });

      setTimeout(() => setAlert(null), 3000);

      await dispatch(getIncomeSummary());
      setViewOpen(false);
      setFormData({
        amount: "",
        paymentMode: "",
        transactionId: "",
        chequeNumber: "",
        bankName: "",
        attachment: "",
        remarks: "",
      });
    } catch (err) {
      console.log(err);

      setAlert({
        status: "Error",
        message: err.response?.data?.msg || "Unable to complete payout.",
      });

      setTimeout(() => setAlert(null), 3000);
    }

    setSaving(false);
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
        <span>₹{formatCurrency(item.directIncome || 0)}</span>
        <span>₹{formatCurrency(item.differenceIncome || 0)}</span>
        <span>₹{formatCurrency(item.matchingIncome || 0)}</span>
        <span>₹{formatCurrency(item.royaltyIncome || 0)}</span>
        <span>₹{formatCurrency(item.cashbackIncome || 0)}</span>
        <span>₹{formatCurrency(item.bestPerformanceIncome || 0)}</span>
        <span>₹{formatCurrency(item.rewardIncome || 0)}</span>
        <span>₹{formatCurrency(item.totalIncome || 0)}</span>
        <span>₹{formatCurrency(item.tdsDeducted || 0)}</span>
        <span>₹{formatCurrency(item.adminDeducted || 0)}</span>
        <span>₹{formatCurrency(item.releasedCommission || 0)}</span>
        <span>₹{formatCurrency(item.holdCommission || 0)}</span>
        <span>
          <span
            className={`status ${
              item.nextPayout?.status === "released"
                ? "active"
                : item.nextPayout?.status === "processing"
                  ? "pending"
                  : "inactive"
            }`}
          >
            {item.nextPayout?.status || "N/A"}
          </span>
        </span>
        <div className="dots">
          <span
            onClick={() => {
              setSelectedExpense(item.nextPayout);
              setViewOpen(true);
              setActiveTab("summary");
            }}
          >
            <NiOpenEye />
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
        {mood === "admin" &&
          selectedExpense &&
          (selectedExpense.status === "payable" ||
            selectedExpense.status === "partial") && (
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
        {activeTab === "makepayouts" && selectedExpense && (
          <div className="report-view-box-right active">
            {/* Payout Summary */}
            <div className="summary-card">
              <h4>{selectedExpense.user?.name}</h4>

              <p>
                <strong>Referral :</strong> {selectedExpense.user?.referralId}
              </p>

              <p>
                <strong>Cycle :</strong>{" "}
                {formatDate(selectedExpense.cycleStart)} -{" "}
                {formatDate(selectedExpense.cycleEnd)}
              </p>

              <p>
                <strong>Net Amount :</strong> ₹
                {formatCurrency(selectedExpense.netAmount)}
              </p>

              <p>
                <strong>Already Paid :</strong> ₹
                {formatCurrency(selectedExpense.totalPaid)}
              </p>

              <p style={{ color: "green", fontWeight: 600 }}>
                <strong>Remaining :</strong> ₹
                {formatCurrency(selectedExpense.balance)}
              </p>
            </div>

            <div className="field">
              <label>Amount</label>

              <input
                type="number"
                max={selectedExpense.balance}
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value,
                  })
                }
              />

              <small>
                Maximum Payable : ₹{formatCurrency(selectedExpense.balance)}
              </small>
            </div>

            <div className="field">
              <label>Payment Mode</label>

              <select
                value={formData.paymentMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMode: e.target.value,
                  })
                }
              >
                <option value="">Select</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            {(formData.paymentMode === "upi" ||
              formData.paymentMode === "bank") && (
              <>
                <div className="field">
                  <label>Transaction ID</label>

                  <input
                    value={formData.transactionId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transactionId: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label>Bank Name</label>

                  <input
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankName: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}

            {formData.paymentMode === "cheque" && (
              <>
                <div className="field">
                  <label>Cheque Number</label>

                  <input
                    value={formData.chequeNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chequeNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label>Bank Name</label>

                  <input
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankName: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}

            <div className="field">
              <label>Attachment</label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileUpload("attachment", e.target.files[0])
                }
              />

              {formData.attachment && (
                <img
                  src={
                    formData.attachment instanceof File
                      ? URL.createObjectURL(formData.attachment)
                      : formData.attachment
                  }
                  alt=""
                  style={{
                    width: 120,
                    borderRadius: 8,
                    marginTop: 10,
                  }}
                />
              )}
            </div>

            <div className="field">
              <label>Remarks</label>

              <textarea
                rows={3}
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    remarks: e.target.value,
                  })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                disabled={
                  saving ||
                  !formData.amount ||
                  !formData.paymentMode ||
                  !["payable", "partial"].includes(selectedExpense.status)
                }
                onClick={handlePay}
              >
                {saving ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        )}
      </ViewModal>
    </>
  );
};

export default CommissionTable;
