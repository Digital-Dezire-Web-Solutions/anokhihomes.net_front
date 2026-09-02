import React, { useState } from "react";

import NiOpenEye from "../../icons/ni-openEye";
import ViewModal from "../Modals/ViewModal";
import { formatCurrency } from "../Utils/FormatCurrency";
import { getIncomeSummary } from "../../Redux/Slices/AppSlices";
import { useDispatch } from "react-redux";
import formatDate from "../DateFormate/DateFormate";
import axios from "axios";
import Host from "../../Host/Host";

// Human labels for IncomeHistory.type — matches the type strings
// actually written by the distribute* controllers.
const INCOME_TYPE_LABELS = {
  direct_income: "Direct Income",
  difference_income: "Difference Income",
  matching_income: "Matching Income",
  referal_income: "Referral Income",
  reward_income: "Reward Income",
  royalty_income: "Royalty Income",
  cashback_income: "Cashback Income",
  best_performance_income: "Best Performance Income",
  festival_bonus_income: "Festival Bonus Income",
};

// Payout.status enum (models/Payout.js) is hold | released | paid | cancelled.
// A payout can only be paid while it's hold or released.
const PAYABLE_STATUSES = ["hold", "released"];

const CommissionTable = ({ index, item, mood, setAlert }) => {
  const dispatch = useDispatch();
  const [viewOpen, setViewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const nextPayout = item.payoutSummary?.nextPayout || null;

  // PUT /payout/pay/:id (not POST) takes no request body — it marks
  // the payout's full netAmount as paid in one action. There is no
  // amount/paymentMode/transactionId/attachment/remarks on the
  // backend Payout model, so nothing is collected here beyond a
  // confirmation of the payout being paid.
  const handlePay = async () => {
    if (!nextPayout) return;

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      await axios.put(
        `${Host}/api/payout/pay/${nextPayout._id}`,
        {},
        {
          headers: {
            "auth-token": token,
          },
        },
      );

      setAlert({
        status: "Success",
        message: "Payout marked as paid.",
      });

      setTimeout(() => setAlert(null), 3000);

      await dispatch(getIncomeSummary());
      setViewOpen(false);
    } catch (err) {
      console.log(err);

      setAlert({
        status: "Error",
        message: err.response?.data?.message || "Unable to complete payout.",
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
        <span>₹{formatCurrency(item.incomeSummary?.referralIncome || 0)}</span>
        <span>₹{formatCurrency(item.incomeSummary?.directIncome || 0)}</span>
        <span>
          ₹{formatCurrency(item.incomeSummary?.differenceIncome || 0)}
        </span>
        <span>₹{formatCurrency(item.incomeSummary?.matchingIncome || 0)}</span>
        <span>₹{formatCurrency(item.incomeSummary?.royaltyIncome || 0)}</span>
        <span>₹{formatCurrency(item.incomeSummary?.cashbackIncome || 0)}</span>
        <span>
          ₹{formatCurrency(item.incomeSummary?.bestPerformanceIncome || 0)}
        </span>
        <span>₹{formatCurrency(item.incomeSummary?.totalCommission || 0)}</span>
        <span>₹{formatCurrency(item.incomeSummary?.tdsAmount || 0)}</span>
        <span>
          ₹{formatCurrency(item.incomeSummary?.adminChargeAmount || 0)}
        </span>
        <span>₹{formatCurrency(item.incomeSummary?.payableAmount || 0)}</span>
        <span>₹{formatCurrency(item.payoutSummary?.holdCommission || 0)}</span>
        <span>
          <span
            style={{ textTransform: "capitalize" }}
            className={`status active`}
          >
            LIVE
          </span>
        </span>
        <div className="dots">
          <span
            onClick={() => {
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

        {mood === "admin" && nextPayout && PAYABLE_STATUSES.includes(nextPayout.status) && (
          <div className="modal-actions">
            <button
              className={activeTab === "makepayout" ? "active" : ""}
              onClick={() => setActiveTab("makepayout")}
            >
              Make Payout
            </button>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="report-view-box-right active">
            <div className="summary-card">
              <h5>Associate Information</h5>
              <p>
                <strong>Name:</strong> {item.name}
              </p>
              <p>
                <strong>Phone:</strong> {item.phone}
              </p>
              <p>
                <strong>Email:</strong> {item.email}
              </p>
              <p>
                <strong>Referral ID:</strong> {item.referralId}
              </p>
              <p>
                <strong>Designation:</strong> {item.designation}
              </p>
            </div>

            <div className="report-view-box-right active">
              <h5>Business</h5>
              <p>
                <strong>Self Business :</strong> ₹
                {formatCurrency(item.businessSummary?.selfBusiness)}
              </p>
              <p>
                <strong>Left Business :</strong> ₹
                {formatCurrency(item.businessSummary?.leftBusiness)}
              </p>
              <p>
                <strong>Right Business :</strong> ₹
                {formatCurrency(item.businessSummary?.rightBusiness)}
              </p>
              <p>
                <strong>Total Business :</strong> ₹
                {formatCurrency(item.businessSummary?.totalBusiness)}
              </p>
            </div>

            <div className="report-view-box-right active">
              <h5>Wallet</h5>
              <p>
                <strong>Wallet :</strong> ₹
                {formatCurrency(item.walletSummary?.wallet)}
              </p>
              <p>
                <strong>Total Income (lifetime) :</strong> ₹
                {formatCurrency(item.walletSummary?.totalIncome)}
              </p>
            </div>

            <div className="report-view-box-right active">
              <h5>Income Breakdown (current cycle)</h5>
              <p>
                <strong>Direct Income :</strong> ₹
                {formatCurrency(item.incomeSummary?.directIncome)}
              </p>
              <p>
                <strong>Difference Income :</strong> ₹
                {formatCurrency(item.incomeSummary?.differenceIncome)}
              </p>
              <p>
                <strong>Matching Income :</strong> ₹
                {formatCurrency(item.incomeSummary?.matchingIncome)}
              </p>
              <p>
                <strong>Referral Income :</strong> ₹
                {formatCurrency(item.incomeSummary?.referralIncome)}
              </p>
              <p>
                <strong>Royalty Income :</strong> ₹
                {formatCurrency(item.incomeSummary?.royaltyIncome)}
              </p>
              <p>
                <strong>Cashback Income :</strong> ₹
                {formatCurrency(item.incomeSummary?.cashbackIncome)}
              </p>
              <p>
                <strong>Best Performance Income :</strong> ₹
                {formatCurrency(item.incomeSummary?.bestPerformanceIncome)}
              </p>
              <p>
                <strong>Total Commission :</strong> ₹
                {formatCurrency(item.incomeSummary?.totalCommission)}
              </p>
              {/* <p>
                <strong>Pending :</strong> ₹
                {formatCurrency(item.incomeSummary?.pendingCommission)}
              </p> */}
              {/* <p>
                <strong>Credited :</strong> ₹
                {formatCurrency(item.incomeSummary?.creditedCommission)}
              </p> */}
              <p>
                <strong>TDS ({item.tdsPercent}%) :</strong> ₹
                {formatCurrency(item.incomeSummary?.tdsAmount)}
              </p>
              <p>
                <strong>Admin Charge ({item.adminChargePercent}%) :</strong> ₹
                {formatCurrency(item.incomeSummary?.adminChargeAmount)}
              </p>
              <p>
                <strong>Payable :</strong> ₹
                {formatCurrency(item.incomeSummary?.payableAmount)}
              </p>
              <p>
                <strong>Cycle Window :</strong>{" "}
                {formatDate(item.cycleStart)} - {formatDate(item.cycleEnd)}
              </p>
            </div>

            <div className="report-view-box-right active">
              <h5>Payout History (all-time)</h5>
              <p>
                <strong>Gross Commission :</strong> ₹
                {formatCurrency(item.payoutSummary?.grossCommission)}
              </p>
              <p>
                <strong>Net Commission :</strong> ₹
                {formatCurrency(item.payoutSummary?.totalNetCommission)}
              </p>
              <p>
                <strong>TDS Deducted :</strong> ₹
                {formatCurrency(item.payoutSummary?.tdsDeducted)}
              </p>
              <p>
                <strong>Admin Deducted :</strong> ₹
                {formatCurrency(item.payoutSummary?.adminDeducted)}
              </p>
              <p>
                <strong>Paid :</strong> ₹
                {formatCurrency(item.payoutSummary?.paidCommission)}
              </p>
              <p>
                <strong>Released :</strong> ₹
                {formatCurrency(item.payoutSummary?.releasedCommission)}
              </p>
              {/* <p>
                <strong>Hold :</strong> ₹
                {formatCurrency(item.payoutSummary?.holdCommission)}
              </p> */}
              <p>
                <strong>Cancelled :</strong> ₹
                {formatCurrency(item.payoutSummary?.cancelledCommission)}
              </p>
              <p>
                <strong>Total Payouts :</strong>{" "}
                {item.payoutSummary?.totalPayouts ?? 0}
                {" ("}
                {item.payoutSummary?.paidPayouts ?? 0} paid,{" "}
                {item.payoutSummary?.releasedPayouts ?? 0} released,{" "}
                {item.payoutSummary?.holdPayouts ?? 0} hold,{" "}
                {item.payoutSummary?.cancelledPayouts ?? 0} cancelled)
              </p>
            </div>

            <div className="report-view-box-right active">
              <h5>Rank</h5>
              <p>
                <strong>Level :</strong> {item.rankSummary?.level}
              </p>
              <p>
                <strong>Designation :</strong>{" "}
                {item.rankSummary?.designation}
              </p>
              <p>
                <strong>Direct Income % :</strong>{" "}
                {item.rankSummary?.directIncomePercent}%
              </p>
              <p>
                <strong>Current Rate :</strong> {item.rankSummary?.currentRate}
                %
              </p>
              <p>
                <strong>Next Designation :</strong>{" "}
                {item.rankSummary?.nextDesignation || "-"}
              </p>
              <p>
                <strong>Next Target :</strong> ₹
                {formatCurrency(item.rankSummary?.nextTarget)}
              </p>
              <p>
                <strong>Remaining for Next Rank :</strong> ₹
                {formatCurrency(item.rankSummary?.remainingForNextRank)}
              </p>
              <p>
                <strong>Progress :</strong> {item.rankSummary?.progress}%
              </p>
            </div>

            {/* <div className="report-view-box-right active">
              <h5>Rating</h5>
              <p>
                <strong>Badge :</strong> {item.ratingSummary?.badge}
              </p>
              <p>
                <strong>Rating Points :</strong>{" "}
                {item.ratingSummary?.ratingPoints}
              </p>
              <p>
                <strong>Average Rating :</strong>{" "}
                {item.ratingSummary?.averageRating}
              </p>
              <p>
                <strong>Total Ratings :</strong>{" "}
                {item.ratingSummary?.totalRatings}
              </p>
            </div> */}

            <div className="report-view-box-right active">
              <h5>Rewards</h5>
              <p>
                <strong>Total :</strong>{" "}
                {item.rewardSummary?.totalRewards ?? 0}
              </p>
              <p>
                <strong>Claimed :</strong>{" "}
                {item.rewardSummary?.claimedRewards ?? 0}
              </p>
              <p>
                <strong>Unclaimed :</strong>{" "}
                {item.rewardSummary?.unclaimedRewards ?? 0}
              </p>
              <p>
                <strong>Royalty Activated :</strong>{" "}
                {item.rewardSummary?.royaltyActivated ? "Yes" : "No"}
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
                    {INCOME_TYPE_LABELS[history.type] || history.type}
                  </h5>
                  <p>
                    <strong>Amount :</strong> ₹{formatCurrency(history.amount)}
                  </p>
                  {history.businessAmount ? (
                    <p>
                      <strong>Business :</strong> ₹
                      {formatCurrency(history.businessAmount)}
                    </p>
                  ) : null}
                  {history.percentage ? (
                    <p>
                      <strong>Percentage :</strong> {history.percentage}%
                    </p>
                  ) : null}
                  {history.fromUser?.name ? (
                    <p>
                      <strong>From :</strong> {history.fromUser.name}
                    </p>
                  ) : null}
                  <p>
                    <strong>Status :</strong>{" "}
                    <span
                      style={{ textTransform: "capitalize" }}
                      className={`status ${
                        history.status === "credited" ? "active" : "pending"
                      }`}
                    >
                      {history.status}
                    </span>
                  </p>
                  <p>
                    <strong>Date :</strong>{" "}
                    {history.cycleDate
                      ? formatDate(history.cycleDate)
                      : formatDate(history.createdAt)}
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
            {item.rewardSummary?.rewards?.length > 0 ? (
              item.rewardSummary.rewards.map((userReward) => (
                <div key={userReward._id} className="reward-card">
                  <h5>{userReward.reward?.rewardName}</h5>
                  <p>
                    <strong>Target :</strong> ₹
                    {formatCurrency(userReward.reward?.targetBusiness)}
                  </p>
                  <p>
                    <strong>Cash Value :</strong> ₹
                    {formatCurrency(userReward.reward?.rewardCash)}
                  </p>
                  <p>
                    <strong>Achieved Business :</strong> ₹
                    {formatCurrency(userReward.achievedBusiness)}
                  </p>
                  {userReward.selectedOption ? (
                    <p>
                      <strong>Selected :</strong>{" "}
                      {userReward.selectedOption === "cash" ? "Cash" : "Gift"}
                    </p>
                  ) : null}
                  {userReward.royaltyActivated ? (
                    <p>
                      <strong>Royalty :</strong> {userReward.royaltyPercent}%
                    </p>
                  ) : null}
                  <span
                    style={{ textTransform: "capitalize" }}
                    className={`status ${
                      userReward.status === "claimed" ? "active" : "pending"
                    }`}
                  >
                    {userReward.status}
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
                    {formatDate(payout.cycleStart)} -{" "}
                    {formatDate(payout.cycleEnd)}
                  </h5>

                  <p>
                    <strong>Gross :</strong> ₹
                    {formatCurrency(payout.grossAmount)}
                  </p>

                  <p>
                    <strong>TDS :</strong> ₹{formatCurrency(payout.tdsAmount)}
                  </p>

                  <p>
                    <strong>Admin :</strong> ₹
                    {formatCurrency(payout.adminChargeAmount)}
                  </p>

                  <p>
                    <strong>Net :</strong> ₹{formatCurrency(payout.netAmount)}
                  </p>

                  {payout.status === "paid" && payout.paidAt ? (
                    <p>
                      <strong>Paid At :</strong> {formatDate(payout.paidAt)}
                    </p>
                  ) : null}

                  <span
                    style={{ textTransform: "capitalize" }}
                    className={`status ${
                      payout.status === "paid"
                        ? "active"
                        : payout.status === "released"
                          ? "pending"
                          : payout.status === "hold"
                            ? "pending"
                            : "inactive"
                    }`}
                  >
                    {payout.status}
                  </span>
                </div>
              ))
            ) : (
              <p>No payouts available.</p>
            )}
          </div>
        )}

        {activeTab === "makepayout" && nextPayout && (
          <div className="report-view-box-right active">
            <div className="summary-card">
              <h4>{item.name}</h4>

              <p>
                <strong>Referral :</strong> {item.referralId}
              </p>

              <p>
                <strong>Cycle :</strong> {formatDate(nextPayout.cycleStart)} -{" "}
                {formatDate(nextPayout.cycleEnd)}
              </p>

              <p>
                <strong>Gross Amount :</strong> ₹
                {formatCurrency(nextPayout.grossAmount)}
              </p>

              <p>
                <strong>TDS :</strong> ₹{formatCurrency(nextPayout.tdsAmount)}
              </p>

              <p>
                <strong>Admin Charge :</strong> ₹
                {formatCurrency(nextPayout.adminChargeAmount)}
              </p>

              <p style={{ color: "green", fontWeight: 600 }}>
                <strong>Net Amount to pay :</strong> ₹
                {formatCurrency(nextPayout.netAmount)}
              </p>
            </div>

            <p>
              This will mark the full net amount as paid and cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                disabled={saving || !PAYABLE_STATUSES.includes(nextPayout.status)}
                onClick={handlePay}
              >
                {saving ? "Processing..." : "Confirm Payout"}
              </button>
            </div>
          </div>
        )}
      </ViewModal>
    </>
  );
};

export default CommissionTable;