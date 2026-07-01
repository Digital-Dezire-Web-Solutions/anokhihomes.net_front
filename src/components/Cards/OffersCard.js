import React, { useState } from "react";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import DeleteModal from "../Modals/DeleteModal";
import ViewModal from "../Modals/ViewModal";
import formatDate from "../DateFormate/DateFormate";
import { formatCurrency } from "../Utils/FormatCurrency";

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

  return (
    <div className="user-card card">
      {/* ---------- CARD HEADER ---------- */}

      <div className="user-card-top">
        <div className="user-card-title">
          <div className="user-card-name">
            <h4>
              {item.title}
              <span
                className={`status ${item.status === "active" ? "active" : "inactive"}`}
              >
                {item.status === "active" ? "Active" : "Disabled"}
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
            <strong>Description : </strong>
            {item.description}
          </p>
          {isOffer && (
            <p>
              <strong>Price Benefit : </strong>₹
              {formatCurrency(item.priceValue)}
            </p>
          )}
          {isDiscount && (
            <p>
              <strong>Discount :</strong> {formatCurrency(item.amount)}{" "}
              {item.type === "percentage" ? "%" : "₹"}
            </p>
          )}
          {!isDiscount && (
            <p>
              <strong>User Type:</strong> {item.userType?.join(", ")}
            </p>
          )}
          <p>
            <strong>Offer Type: </strong>
            {item?.offerType}
          </p>
          <p>
            <strong>Offer Value: </strong>
            {item?.offerValue}
          </p>
          <p>
            <strong>Colony: </strong>
            {item?.colonyId?.name}
          </p>
          <p>
            <strong>Start from: </strong>
            {formatDate(item.startDate)}
          </p>
          <p>
            <strong>Valid Till:</strong> {formatDate(item.endDate)}
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
        <div className="user-card-bottom view-box">
          <div className="user-card-bottom-left">
            <p>Description</p>
            {isDiscount && <p>Discount</p>}
            {isDiscount && <p>Terms</p>}
            {!isDiscount && <p>User Type</p>}
            <p>Offer Type</p>
            <p>Offer Value</p>
            <p>Colony</p>
            <p>Starts</p>
            <p>Ends</p>
            <p>Remaining</p>
          </div>

          <div className="user-card-bottom-right">
            <p>{item.description}</p>

            {isOffer && <p>₹{formatCurrency(item.priceValue)}</p>}

            {isDiscount && (
              <p>
                {formatCurrency(item.amount)}{" "}
                {item.type === "percentage" ? "%" : "₹"}
              </p>
            )}

            {isDiscount && <p>{item.terms}</p>}

            <p>{item.userType?.join(", ")}</p>
            <p>{item?.offerType}</p>
            <p>{item?.offerValue}</p>
            <p>{item?.colonyId?.name}</p>
            <p>{formatDate(item.startDate)}</p>
            <p>{formatDate(item.endDate)}</p>
            <p className="countdown">{getRemainingDays(item.endDate)}</p>
          </div>
        </div>
      </ViewModal>
    </div>
  );
};

export default OffersCard;
