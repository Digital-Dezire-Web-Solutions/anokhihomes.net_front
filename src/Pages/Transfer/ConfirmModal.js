import React from "react";
import DeleteModal from "../../components/Modals/DeleteModal";

const ConfirmModal = ({
  open,
  title = "Confirm",
  message,
  details = [], // [[label, value], ...] shown as small rows
  confirmText = "Confirm",
  loading = false,
  onConfirm,
  onClose,
}) => (
  <DeleteModal open={open} onClose={loading ? () => {} : onClose}>
    <h4>{title}</h4>

    {message && <p>{message}</p>}

    {details.length > 0 && (
      <div className="installment-box">
        {details.map(([label, value]) => (
          <div className="installment" key={label}>
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    )}

    <div className="modal-actions">
      <button disabled={loading} onClick={onConfirm}>
        {loading ? "Processing..." : confirmText}
      </button>
      <button className="btn-outline" disabled={loading} onClick={onClose}>
        Cancel
      </button>
    </div>
  </DeleteModal>
);

export default ConfirmModal;