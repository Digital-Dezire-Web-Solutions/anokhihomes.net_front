import React, { useEffect, useRef } from "react";
import NiEdit from "../../icons/ni-edit";
import NiDelete from "../../icons/ni-delete";
import "./Modals.css";

const ActionModal = ({ onClose, onEdit, onDelete, item }) => {
    const ref = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={ref} className="action-modal">
            <span
                onClick={() => {
                    onEdit(item);
                    onClose();
                }}
            >
                <NiEdit /> Edit
            </span>
            <span
                onClick={() => {
                    onDelete(item);
                    onClose();
                }}
            >
                <NiDelete /> Delete
            </span>
        </div>
    );
};

export default ActionModal;