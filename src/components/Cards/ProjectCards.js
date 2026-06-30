import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import NiEdit from "../../icons/ni-edit";
import NiDelete from "../../icons/ni-delete";
import DeleteModal from "../Modals/DeleteModal";

const ProjectCards = ({
  p,
  setSelectedLocation,
  setIsEditMode,
  setOpen,
  mood,
  setAlert,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const createSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
      console.log(p,"p")

  return (
    <>
      <div
        key={p._id}
        className="plot-card card"
        onClick={() =>
          navigate(`/plot/${createSlug(p.name)}`, {
            state: p,
          })
        }
      >
        <div className="plot-img">
          <img src={p.image} alt={p.name} />
          {/* <span className="offer">{p.offer}</span> */}
        </div>
        <div className="plot-details">
          <h3>{p.name}</h3>
          <p>{p.description}</p>
        </div>
        {mood !== "user" && (
          <div className="plot-card-actions dots">
            <span
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLocation(p);
                setIsEditMode(true);
                setOpen(true);
              }}
            >
              <NiEdit />
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setDeleteOpen(true);
              }}
            >
              <NiDelete />
            </span>
          </div>
        )}
      </div>
      <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <p>Are you sure you want to delete?</p>
        <div className="modal-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(false);
              onDelete(p._id);
            }}
          >
            Yes
          </button>

          <button
            className="btn-outline"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      </DeleteModal>
    </>
  );
};

export default ProjectCards;
