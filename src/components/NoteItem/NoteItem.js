import React, { useEffect, useRef, useState } from "react";
import NiEdit from "../../icons/ni-edit";
import NiDelete from "../../icons/ni-delete";
import { useDispatch, useSelector } from "react-redux";
import { getAccountDetails } from "../../Redux/Slices/AppSlices";
import { useLocation } from "react-router-dom";
import NiGallery from "../../icons/ni-gallery";
import AddLocationModal from "../Modals/AddLocationModal";
import NiExport from "../../icons/ni-export";
import NiAttachment from "../../icons/ni-attachment";
import "./NoteItem.css"
import { LuX } from "react-icons/lu";

const NoteItem = ({
  item,
  notes,
  editingNoteId,
  editText,
  noteText,
  noteImage,
  setNoteImage,
  setNoteText,
  handleAddNote,
  handleEditNote,
  handleDeleteNote,
  editingNote,
  setEditingNote,
  saving,
  setSaving
}) => {
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const [imageModal, setImageModal] = useState({
    open: false,
    src: "",
  });
  const isSiteVisit = location.pathname.includes("/site-visits");
  const isSystemNote = (text) => {
    return text?.toLowerCase().includes("accepted by");
  };
  const dispatch = useDispatch();
  const { plots, userDetail } = useSelector((state) => state.app);
  const [selectedColony, setSelectedColony] = useState(null);
  const fileInputRef = useRef(null);


  useEffect(() => {
    dispatch(getAccountDetails());
  }, [item]);

  const pendingColonies =
    item.colonies?.filter((c) => c.status === "pending") || [];

  const canEditNote = (note) => {
    // if (userDetail?.role !== "agent") return false;

    const isOwner = String(note?.by?._id) === String(userDetail?._id);
    if (!isOwner) return false;

    if (isSystemNote(note?.text)) return false;

    const createdAt = new Date(note?.date).getTime();
    const now = Date.now();
    const hours24 = 24 * 60 * 60 * 1000;

    return now - createdAt <= hours24;
  };

  // ====== AUTO-SCROLL ======
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  let lastDateLabel = "";

  const formatChatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (sameDay(d, today)) return "Today";
    if (sameDay(d, yesterday)) return "Yesterday";

    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // console.log(editingNote, "editingNote")
  // console.log(noteImage, "noteImage")
  // console.log(item, "item")
  return (
    <>
      <h4>Notes</h4>
      <div className="note-history">
        {[...notes]?.map((n, index) => {
          const itemDate = formatChatDate(n.date);
          const showDateSeparator = itemDate !== lastDateLabel;
          lastDateLabel = itemDate;
          const msg = n;
          const isMe =
            msg.by?._id === userDetail?._id
          return (
            <React.Fragment key={index}>
              {showDateSeparator && (
                <div className="date-separator">
                  <span>{itemDate}</span>
                </div>
              )}
              <div key={n?._id} className={` chat-bubble ${isMe ? "me" : "other"} ${n?.by?.role === "admin"
                ? "admin"
                : n?.by?.role === "agent"
                  ? "agent"
                  : n?.by?.role === "staff"
                    ? "staff"
                    : "user"
                }`}>
                <small>
                  {!isMe &&
                    <span
                      className={`comment ${n?.by?.role === "admin"
                        ? "admin"
                        : n?.by?.role === "agent"
                          ? "agent"
                          : n?.by?.role === "staff"
                            ? "staff"
                            : "user"
                        }`}
                    >
                      {n?.by?.name || "User"}
                    </span>
                  }
                  {/* {new Date(n?.date).toLocaleString()} */}
                </small>

                <div style={{ position: "relative" }}>
                  <p>
                    {n.text}

                    {canEditNote(n) && !n.colony && (
                      <span
                        className="chat-item-edit-btn"
                        onClick={() => {
                          setEditingNote(n);

                          setNoteText(n.text);

                          if (n.image) {
                            setNoteImage(n.image);
                          } else {
                            setNoteImage(null);
                          }

                          setSelectedColony(null);
                        }}
                      >
                        <NiEdit />
                      </span>
                    )}
                  </p>

                  {n.image && (
                    <img
                      src={n.image}
                      className="note-preview"
                      alt=""
                      onClick={() =>
                        setImageModal({
                          open: true,
                          src: n.image,
                        })
                      }
                    />
                  )}

                  <div className="chat-time">
                    {new Date(n.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </React.Fragment>
          )
        })}
        <div ref={messagesEndRef} />
        {pendingColonies?.length > 0 && (
          <div className="visit-note-suggestions">
            {pendingColonies?.map((c) => {
              const text = `Site visit for ${c.colony.name}, ${item.location?.name}`;

              return (
                <>
                  <div
                    key={c.colony._id}
                    className={`visit-chip ${selectedColony?.colony._id === c.colony._id ? "active" : ""
                      }`}
                    onClick={() => {
                      setSelectedColony(c);
                      setNoteText(text);
                      setNoteImage(null);
                    }}
                  >

                    <label
                      htmlFor="site-note-image"
                      style={{
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {text}
                    </label>

                    <input
                      id="site-note-image"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => setNoteImage(e.target.files[0])}
                    />
                  </div>
                  {selectedColony?.colony._id === c.colony._id && <span onClick={() => {
                    setSelectedColony(null);
                    setNoteText("");
                    setNoteImage(null)
                  }}>
                    <LuX /></span>
                  }
                </>
              );
            })}
          </div>
        )}
      </div>
      {item?.status !== "converted" && item?.status !== "completed" && item?.status !== "rejected" && item?.status !== "lost" &&
        <div className="chat-input-mainbox">
          {editingNote && <div className="note-upper-box">
            {editingNote?.text ? <p>{editingNote?.text}</p> : <img className="note-preview" src={editingNote?.image} alt="" />} <span onClick={() => {
              setEditingNote(null);
              setNoteText("")
              setNoteImage(null)
            }}>
              <LuX /></span>
          </div>
          }
          <div className="field">
            {noteImage instanceof File && (
              <>
                <span onClick={() => {
                  setNoteImage(null)
                }}>
                  <LuX /></span>
                <img
                  src={
                    noteImage instanceof File
                      ? URL.createObjectURL(noteImage)
                      : noteImage
                  }
                  className="note-preview"
                  alt="preview"
                />
              </>
            )}
          </div>
          <div className="chat-input-box">
            {isSiteVisit && (
              <div>
                <label
                  htmlFor="note-image"
                  style={{
                    cursor: selectedColony ? "not-allowed" : "pointer",
                    opacity: selectedColony ? 0.5 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <NiAttachment />
                </label>

                <input
                  ref={fileInputRef}
                  id="note-image"
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={selectedColony}
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setNoteImage(e.target.files[0]);
                    }
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            <div className="field">
              <textarea
                className="chat-text"
                placeholder="Add reason or note..."
                value={noteText}
                rows={1}
                readOnly={!!selectedColony}
                onChange={(e) => {
                  setNoteText(e.target.value);

                  e.target.style.height = "40px"; // reset
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 40 * 2) + "px";
                }}
                style={{ margin: "0" }}
              />
            </div>
            <div className="modal-actions chat-send-btn">
              <button
                disabled={saving}
                onClick={() => {
                  if (!noteText.trim() && !noteImage) return;
                  // console.log("working")
                  if (editingNote) {
                    handleEditNote(item._id, editingNote._id);
                  } else {
                    handleAddNote(
                      item._id,
                      selectedColony?.colony._id
                    );

                  }
                }}
              >
                <NiExport />
              </button>
            </div>
          </div>
        </div >
      }


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
    </>
  );
};

export default NoteItem;
