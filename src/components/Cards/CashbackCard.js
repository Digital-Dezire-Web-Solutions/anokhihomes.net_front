import React, { useState } from "react";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import DeleteModal from "../Modals/DeleteModal";
import ViewModal from "../Modals/ViewModal";
import formatDate from "../DateFormate/DateFormate";

const CashbackCard = ({
  item,
  setSelectedOffers,
  setIsEditMode,
  handleDelete,
  handleToggleStatus,
  setOpen,
  mood,
  setAlert,
}) => {
  const [activeRow, setActiveRow] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

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

  return (
    <div className="user-card card">
      {/* ---------- CARD HEADER ---------- */}

      <div className="user-card-top">
        <div className="user-card-title">
          <div className="user-card-name">
            <h4>
              {`Cashback ${item.cashbackPercent}%`}

              <span className={`status ${item.active ? "active" : "inactive"}`}>
                {item.active ? "Active" : "Disabled"}
              </span>
            </h4>
          </div>
        </div>

        <div className="dots">
          {mood === "admin" && (
            <label className="switch">
              <input
                type="checkbox"
                checked={item.active}
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
            <strong>Cashback :</strong> {item.cashbackPercent}%
          </p>
          <p>
            <strong>Complete Within :</strong> {item.completeWithinDays} Days
          </p>
          <p>
            <strong>Colony: </strong>
            {item?.colonyId?.name}
          </p>
          <p>
            <strong>Start Date :</strong> {formatDate(item.startDate)}
          </p>
          <p>
            <strong>End Date :</strong> {formatDate(item.endDate)}
          </p>
          <p className="countdown">{getRemainingDays(item.endDate)}</p>
        </div>
      </div>

      {/* ---------- DELETE MODAL ---------- */}

      <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <p>Are you sure you want to delete?</p>

        <div className="modal-actions">
          <button
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
        title={item?.colonyId?.name || "Cashback Details"}
      >
        <div className="user-card-bottom view-box">
          <div className="user-card-bottom-left">
            <p>Cashback</p>
            <p>Complete Within</p>
            <p>Start Date</p>
            <p>End Date</p>
            <p>Status</p>
            <p>Remaining</p>
          </div>

          <div className="user-card-bottom-right">
            <p>{item.cashbackPercent}%</p>
            <p>{item.completeWithinDays} Days</p>
            <p>{formatDate(item.startDate)}</p>
            <p>{formatDate(item.endDate)}</p>
            <p>{item.active ? "Active" : "Inactive"}</p>
            <p className="countdown">{getRemainingDays(item.endDate)}</p>
          </div>
        </div>
      </ViewModal>
    </div>
  );
};

export default CashbackCard;
