import React, { useState } from "react";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import DeleteModal from "../Modals/DeleteModal";
import ViewModal from "../Modals/ViewModal";
import formatDate from "../DateFormate/DateFormate";
import { formatCurrency } from "../Utils/FormatCurrency";
import AddLocationModal from "../Modals/AddLocationModal";
import Host from "../../Host/Host";
import NiLock from "../../icons/ni-lock";

const OffersCard = ({
  item,
  setSelectedOffers,
  setIsEditMode,
  handleDelete,
  handleToggleStatus,
  setOpen,
  mood,
  setAlert,
  saving,
}) => {
  const [activeRow, setActiveRow] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("milestones");
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [imageModal, setImageModal] = useState({
    open: false,
    src: "",
  });
  const [claimModal, setClaimModal] = useState({
    open: false,
    milestone: null,
    selectedReward: 0,
  });
  // const [saving, setSaving] = useState(false);

  const isOffer = item.priceValue;
  const isDiscount = item.amount;
  const getRemainingDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);

    const diff = end - today;

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Expired";

    return `${days} days remaining`;
  };

  const handleClaimReward = async () => {
    try {
      const res = await fetch(`${Host}/api/offer/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authToken: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          offerId: item._id,
          milestoneOrder: claimModal.milestone.sortOrder,
          rewardIndex: claimModal.selectedReward,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setAlert(data.message);
        return;
      }

      setAlert(data.message);

      setClaimModal({
        open: false,
        milestone: null,
        selectedReward: 0,
      });

      // Reload offer progress here
    } catch (err) {
      console.log(err);
    }
  };

  const eligibleAget = []
  console.log(item, "item")
  return (
    <div className="user-card card">
      {/* ---------- CARD HEADER ---------- */}

      <div className="user-card-top">
        <div className="user-card-title">
          <div className="user-card-name">
            <h4>
              {item.title}
              <span
                style={{ textTransform: "capitalize" }}
                className={`status ${item.status === "active"
                  ? "active"
                  : item.status === "inactive"
                    ? ""
                    : item.status === "draft"
                      ? "pending2"
                      : "failed"
                  }`}
              >
                {item.status === "active"
                  ? "active"
                  : item.status === "inactive"
                    ? "Inactive"
                    : item.status === "draft"
                      ? "Draft"
                      : "Expired"}
              </span>
            </h4>
          </div>
        </div>

        <div className="dots">
          {(mood === "admin" || mood === "staff") && (
            <label className="switch">
              <input
                type="checkbox"
                checked={item.status === "active"}
                onChange={() => handleToggleStatus(item)}
              />
              <span className="slider"></span>
            </label>
          )}
          <span
            onClick={(e) => {
              e.stopPropagation();
              setViewOpen(true);
            }}
          >
            <NiOpenEye />
          </span>

          {(mood === "admin" || mood === "staff") && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setActiveRow(activeRow === item._id ? null : item._id);
              }}
            >
              <NiDots />
            </span>
          )}

          {activeRow === item._id && (
            <ActionModal
              item={item}
              onClose={() => setActiveRow(null)}
              onEdit={(data) => {
                setSelectedOffers(data);
                setIsEditMode(true);
                setOpen(true);
                setActiveRow(null);
              }}
              onDelete={() => setDeleteOpen(true)}
            />
          )}
        </div>
      </div>

      {/* ---------- CARD BODY ---------- */}

      <div className="user-card-bottom">
        <div className="user-card-bottom-left">
          <p>
            <strong>Description :</strong> {item.description}
          </p>

          <p>
            <strong>Offer Category :</strong> {item.offerCategory}
          </p>

          <p>
            <strong>Total Milestones :</strong> {item.milestones?.length}
          </p>

          <p>
            <strong>Terms :</strong> {item.terms?.join(", ")}
          </p>

          <p>
            <strong>Start :</strong> {formatDate(item.startDate)}
          </p>

          <p>
            <strong>End :</strong> {formatDate(item.endDate)}
          </p>

          <p className="countdown">{getRemainingDays(item.endDate)}</p>
        </div>
      </div>

      {/* ---------- DELETE MODAL ---------- */}

      <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <p>Are you sure you want to delete?</p>

        <div className="modal-actions">
          <button
            disabled={saving}
            onClick={async () => {
              await handleDelete(item._id);

              setDeleteOpen(false);

              setAlert({
                message: "Deleted Successfully",
                status: "Success",
              });
              setTimeout(() => {
                setAlert(null);
              }, 5000);
            }}
          >
            Yes
          </button>

          <button className="btn-outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </button>
        </div>
      </DeleteModal>

      {/* ---------- VIEW MODAL ---------- */}

      <ViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={item.title}
      >
        {item.poster && (
          <div >
            <img
              className="note-preview"
              src={item.poster}
              alt={item.title}
              onClick={() =>
                setImageModal({
                  open: true,
                  src: item.poster,
                })
              }
            />
          </div>
        )}

        <p>
          <strong>Description:</strong>
          <br />
          {item.description}
        </p>

        <p>
          <strong>Offer Category:</strong> {item.offerCategory}
        </p>

        <p>
          <strong>Terms:</strong> {item.terms?.join(", ")}
        </p>

        <p>
          <strong>Start:</strong> {formatDate(item.startDate)}
        </p>

        <p>
          <strong>End:</strong> {formatDate(item.endDate)}
        </p>
        <h3>Milestones</h3>

        <div className="card reward-table">
          <div className="table">
            <div className="table-head">
              <span>
                Target
              </span>
              <span>Reward / Amount (₹)</span>
            </div>

            {item.milestones?.map((m, index) => (
              <div key={m._id || index} className="table-row">
                {/* Target */}
                <span style={{ textTransform: "capitalize" }}>
                  {m.conditionType === "booking"
                    ? `${m.bookingCount} Plot(s) • ${m.paymentPercent}% ${m.paymentType === "percentage" ? "Any" : m.paymentType}`
                    : `₹${formatCurrency(m.businessAmount)}`}
                </span>
                <span style={{ display: "flex", gap: "10px" }}>
                  {m.rewardOptions?.map((reward, i) => (
                    <div>
                      {reward.type === "reward" ? (
                        <>{reward.title}  </>
                      ) : (
                        <>/ ₹{formatCurrency(reward.value)}</>
                      )}
                    </div>
                  ))}
                </span>
                {mood === "agent" && (
                  <span className="modal-actions">
                    {m.status === "eligible" && (
                      <button
                        onClick={() =>
                          setClaimModal({
                            open: true,
                            milestone: m,
                            selectedReward: 0,
                          })
                        }
                      >
                        Claim
                      </button>
                    )}

                    {m.status === "claimed" && (
                      <button
                        disabled
                        style={{
                          backgroundColor: "var(--success-color)",
                          border: "1px solid var(--success-color)",
                        }}
                      >
                        Claimed
                      </button>
                    )}

                    {m.status === "undelivered" && (
                      <button
                        disabled
                        style={{
                          backgroundColor: "var(--warning-color)",
                          border: "1px solid var(--warning-color)",
                          color: "#fff",
                        }}
                      >
                        Undelivered
                      </button>
                    )}

                    {m.status === "delivered" && (
                      <button
                        disabled
                        style={{
                          backgroundColor: "var(--success-color)",
                          border: "1px solid var(--success-color)",
                          color: "#fff",
                        }}
                      >
                        Delivered
                      </button>
                    )}

                    {m.status === "locked" && (
                      <button
                        disabled
                        style={{ backgroundColor: "transparent", color: "black" }}
                      >
                        <NiLock />
                      </button>
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </ViewModal>
      <AddLocationModal
        open={imageModal.open}
        onClose={() =>
          setImageModal({
            open: false,
            src: "",
          })
        }
        title="Image Preview"
      >
        <div className="image-preview-modal">
          <img
            src={imageModal.src}
            alt="Preview"
            className="image-preview-full"
          />
        </div>
      </AddLocationModal>
      <AddLocationModal
        open={claimModal.open}
        title="Claim Reward"
        onClose={() =>
          setClaimModal({
            open: false,
            milestone: null,
            selectedReward: 0,
          })
        }
      >
        {claimModal.milestone && (
          <>
            {/* <h3>Reward</h3> */}

            {claimModal.milestone.rewardMode === "choice" ? (
              <>
                {claimModal.milestone.rewardOptions.map((reward, i) => (
                  <div className="field">
                    <div class="checkbox-wrapper-4">
                      <input class="inp-cbx" id={i} type="radio" checked={claimModal.selectedReward === i}
                        onChange={() =>
                          setClaimModal((prev) => ({
                            ...prev,
                            selectedReward: i,
                          }))
                        } />
                      <label class="cbx" for={i} key={i}><span>
                        <svg width="12px" height="10px">

                        </svg></span><span>{reward.type === "reward"
                          ? reward.title
                          : `₹${formatCurrency(reward.value)}`}</span></label>
                      <svg class="inline-svg">
                        <symbol id="check-4" viewBox="0 0 12 10">
                          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                        </symbol>
                      </svg>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p>
                {claimModal.milestone.rewardOptions[0]?.type === "reward"
                  ? claimModal.milestone.rewardOptions[0].title
                  : `₹${formatCurrency(
                    claimModal.milestone.rewardOptions[0].value
                  )}`}
              </p>
            )}

            <div
              style={{
                marginTop: 20,
                padding: 15,
                background: "#fff8e5",
                border: "1px solid #f4d03f",
                borderRadius: 8,
              }}
            >
              <strong>⚠ Disclaimer</strong>

              <ul
                style={{
                  marginTop: 10,
                }}
              >
                <li>A reward can be claimed only once.</li>

                <li>
                  After claiming, your selected reward cannot be
                  changed.
                </li>

                <li>
                  If multiple rewards are available, you can choose
                  only one.
                </li>

                <li>
                  The remaining reward options will no longer be
                  available.
                </li>

                <li>This action cannot be undone.</li>
              </ul>
            </div>

            <div
              className="modal-actions"
              style={{
                marginTop: 20,
              }}
            >
              <button
                onClick={handleClaimReward}
              >
                Claim Reward
              </button>

              <button
                className="btn-outline"
                onClick={() =>
                  setClaimModal({
                    open: false,
                  })
                }
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </AddLocationModal>
    </div>
  );
};

export default OffersCard;
