import React from "react";
import "./Modals.css";
import { X } from "lucide-react";

const ViewModal = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="modal-bg plot-modal" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header user-card-top">
          <h4>{title}</h4>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default ViewModal;
