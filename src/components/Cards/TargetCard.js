import React, { useEffect, useState } from "react";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import DeleteModal from "../Modals/DeleteModal";
import ViewModal from "../Modals/ViewModal";
import NiEdit from "../../icons/ni-edit";
import NiTick from "../../icons/ni-tick";
import NiCross from "../../icons/ni-cross";
import { formatCurrency } from "../Utils/FormatCurrency";

const TargetCard = ({
  item,
  agentSales,
  mood,
  handleToggleStatus,
  setSelectedOffers,
  setIsEditMode,
  setOpen,
  setAlert,
  myRewards,
  ClaimCash,
  ClaimGift,
}) => {
  const [activeRow, setActiveRow] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const progress = Math.min((agentSales / item.targetBusiness) * 100, 100);
  const userReward = myRewards?.find((r) => r.reward?._id === item._id);
  const canClaim = userReward?.status === "unclaimed";
  const [saving, setsaving] = useState(false);

  return (
    <div className="user-card card">
      {/* HEADER */}

      <div className="user-card-top">
        <div className="user-card-title">
          <div className="user-card-name">
            <h4>
              ₹{formatCurrency(item.rewardCash)} / {item.rewardName}
              {userReward?.status === "claimed" && (
                <span
                  className={`status ${userReward?.status === "claimed" && "active"}`}
                >
                  Claimed ({userReward?.selectedOption})
                </span>
              )}
              {/* <span
                className={`status ${item.status === "active" ? "active" : "inactive"}`}
              >
                {item.status === "active" ? "Active" : "Disabled"}
              </span> */}
            </h4>
          </div>
        </div>

        <div className="dots">
          {/* <span
            onClick={(e) => {
              e.stopPropagation();
              setViewOpen(true);
            }}
          >
            <NiOpenEye />
          </span> */}

          {mood === "admin" && (
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
            <>
              <div className="action-modal">
                <span
                  onClick={(e) => {
                    e.stopPropagation();

                    setSelectedOffers(item);
                    setIsEditMode(true);
                    setOpen(true);
                    setActiveRow(null);
                  }}
                >
                  <NiEdit /> Edit
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BODY */}

      <div className="user-card-bottom">
        <div className="user-card-bottom-left">
          <p>Target</p>
          <p>Reward</p>
          {item.royaltyPercent !== 0 && <p>Royalty</p>}
        </div>

        <div className="user-card-bottom-right">
          <p>{item.targetBusiness}</p>
          <p>
            ₹{formatCurrency(item.rewardCash)} / {item.rewardName}
          </p>
          {item.royaltyPercent !== 0 && <p>{item.royaltyPercent} %</p>}
        </div>
      </div>

      {/* TARGET PROGRESS */}

      {mood !== "admin" && (
        <div className="target-progress">
          <div className="target-road">
            <div className="target-icon" style={{ left: `${progress}%` }}>
              {item.icon}
            </div>

            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <p>{Math.floor(progress)}% Completed</p>
        </div>
      )}
      {canClaim && mood === "agent" && (
        <div className="modal-actions">
          <button
            className="site-visit-approval status active"
            onClick={() => {
              ClaimCash(userReward._id);
              setsaving(true);
              setTimeout(() => {
                setsaving(false);
              }, 3000);
            }}
            disabled={saving}
          >
            <NiTick /> Get Cash
          </button>

          <button
            className="site-visit-approval status active"
            onClick={() => {
              ClaimGift(userReward._id);
              setsaving(true);
              setTimeout(() => {
                setsaving(false);
              }, 3000);
            }}
            disabled={saving}
          >
            <NiTick /> Get Gift
          </button>
        </div>
      )}
    </div>
  );
};

export default TargetCard;
