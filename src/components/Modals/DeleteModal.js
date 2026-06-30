import React from "react";
import "./Modals.css";
import { X } from "lucide-react";

const DeleteModal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="modal-bg plot-modal" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {/* <h3>{title}</h3> */}
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default DeleteModal;
