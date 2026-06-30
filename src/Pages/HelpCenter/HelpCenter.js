import React, { useEffect, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LucidePlus, SquarePlus } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import "./HelpCenter.css";
import NiOpenEye from "../../icons/ni-openEye";
import ViewModal from "../../components/Modals/ViewModal";
import { useDispatch, useSelector } from "react-redux";

import {
  getHelpTickets,
  createHelpTicket,
  replyHelpTicket,
  closeHelpTicket,
} from "../../Redux/Slices/AppSlices";
import { uploadImage } from "../LandingSetting/LandingApi";

const HelpCenter = ({ mood, setAlert }) => {
  const dispatch = useDispatch();

  const { helpTickets } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(getHelpTickets());
  }, []);

  const mergedTickets = helpTickets || [];
  const [saving, setSaving] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const selectedTicket = mergedTickets.find((t) => t._id === selectedPosition);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [imageModal, setImageModal] = useState({
    open: false,
    src: "",
  });

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    message: "",
    attachment: null,
  });

  const [replyData, setReplyData] = useState({
    title: "",
    message: "",
    attachment: null,
  });

  // ===========================
  // CREATE TICKET
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let attachments = [];
    if (formData.attachment) {
      const upload = await uploadImage(formData.attachment);
      attachments.push(upload.url);
    }

    await dispatch(
      createHelpTicket({
        type: formData.type,
        title: formData.title,
        message: formData.message,
        attachments,
      }),
    );
    dispatch(getHelpTickets());
    setOpen(false);
    setFormData({
      type: "",
      title: "",
      message: "",
      attachment: null,
    });

    setAlert({
      message: "Ticket Created",
      status: "Success",
    });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
    setSaving(false);
  };

  // ===========================
  // ADD REPLY
  // ===========================
  const handleReply = async () => {
    setSaving(true);
    if (!replyData.message) return;

    await dispatch(
      replyHelpTicket({
        id: selectedTicket._id,
        data: {
          title: replyData.title,
          message: replyData.message,
        },
      }),
    );

    dispatch(getHelpTickets());

    setReplyData({
      title: "",
      message: "",
    });
    setSelectedPosition(selectedTicket._id);

    setAlert({
      message: "Reply Added",
      status: "Success",
    });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
    setSaving(false);
  };

  // ===========================
  // CLOSE TICKET
  // ===========================
  const handleCloseTicket = async (id) => {
    setSaving(true);
    await dispatch(closeHelpTicket(id));

    await dispatch(getHelpTickets());

    setViewOpen(false);

    setAlert({
      message: "Ticket Closed",
      status: "Success",
    });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
    setSaving(false);
  };

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <div className="page-tools">
            <h2>Help and Support</h2>
          </div>
          <Breadcrumb />
        </div>
        <div className="page-tools">
          {mood !== "admin" && (
            <button
              className="add-button"
              onClick={() => {
                setOpen(true);
              }}
            >
              <LucidePlus /> New Ticket
            </button>
          )}
        </div>
      </div>
      <div className="dashboard-container">
        {/* TICKETS GRID */}
        <div className="plot-grid">
          {mergedTickets.length === 0 ? (
            <div className="card">
              <p>No tickets found.</p>
            </div>
          ) : (
            mergedTickets.map((pos) => (
              <div
                key={pos._id}
                className="user-card card"
                onClick={() => {
                  setSelectedPosition(pos._id);
                  setViewOpen(true);
                }}
              >
                <div className="user-card-top">
                  <h4>
                    {pos.ticketId}({pos.type})
                    <span
                      className={`status ${
                        pos.status === "Closed"
                          ? "active"
                          : pos.status === "Open"
                            ? "pending"
                            : "pending2"
                      }`}
                    >
                      {pos.status}
                    </span>
                  </h4>
                  <NiOpenEye />
                </div>

                <div className="user-card-bottom">
                  <div className="user-card-bottom-left">
                    <p>Title: {pos.title}</p>
                    <p>Updated: {new Date(pos.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={`${selectedTicket?.ticketId || ""}`}
      >
        {/* <div className="user-card-bottom view-box">
          <div className="user-card-bottom-left">
          </div>
        </div> */}
        {selectedTicket && (
          <>
            {/* DETAILS */}
            <div className="help-detail-box">
              <h4>{selectedTicket.title}</h4>
              <p>{selectedTicket.message}</p>
              {selectedTicket.attachments?.length > 0 && (
                <div className="help-images">
                  {selectedTicket.attachments.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="note-preview"
                      onClick={() =>
                        setImageModal({
                          open: true,
                          src: img,
                        })
                      }
                    />
                  ))}
                </div>
              )}
              <small>
                {selectedTicket.createdBy?.name} •{" "}
                {new Date(selectedTicket.createdAt).toLocaleString()}
              </small>
            </div>

            {/* REPLIES */}
            {selectedTicket?.replies?.map((reply) => (
              <div key={reply._id} className="help-detail-box post-card">
                <h5>{reply.title}</h5>
                <p>{reply.message}</p>
                {reply.attachments?.length > 0 && (
                  <div className="help-images">
                    {reply.attachments.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="ticket-image"
                        alt=""
                        onClick={() =>
                          setImageModal({
                            open: true,
                            src: img,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
                <small>
                  {reply.by?.name} •{" "}
                  {new Date(reply.createdAt).toLocaleString()}
                </small>
              </div>
            ))}

            {/* ADD REPLY */}
            {selectedTicket.status !== "Closed" && (
              <div className="post-card">
                <h4>Add Reply</h4>
                <div className="field">
                  <input
                    placeholder="Reply title"
                    value={replyData.title}
                    onChange={(e) =>
                      setReplyData({
                        ...replyData,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="field">
                  <textarea
                    placeholder="Write reply..."
                    value={replyData.message}
                    onChange={(e) =>
                      setReplyData({
                        ...replyData,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="field">
                  <label>Attachment</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setReplyData({
                        ...replyData,
                        attachment: e.target.files[0],
                      })
                    }
                  />
                </div>

                {replyData.attachment && (
                  <img
                    src={URL.createObjectURL(replyData.attachment)}
                    width={120}
                    alt=""
                  />
                )}

                <div className="modal-actions">
                  <button disabled={saving} onClick={handleReply}>
                    {saving ? "Sending..." : "Send Reply"}
                  </button>
                  {/* CLOSE */}
                  {selectedTicket.status !== "Closed" && (
                    <button
                      disabled={saving}
                      className="post-button"
                      onClick={() => handleCloseTicket(selectedTicket._id)}
                    >
                      {saving ? "Closing..." : "Close Ticket"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </ViewModal>
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={"Add New ticket"}
      >
        <form onSubmit={handleSubmit} className="post-card">
          <div className="field">
            <label>Ticket Type</label>

            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                })
              }
            >
              <option value="">Select Type</option>
              <option value="Finance">Finance</option>
              <option value="Profile Update">Profile Update</option>
              {mood === "agent" && (
                <option value="Emergency Payout">Emergency Payout</option>
              )}

              <option value="Other">Other</option>
            </select>
          </div>
          <div className="field">
            <label>Title</label>
            <input
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea
              placeholder="Message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Attachment</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attachment: e.target.files[0],
                })
              }
            />
          </div>
          {formData.attachment && (
            <img
              src={URL.createObjectURL(formData.attachment)}
              alt=""
              style={{
                width: 120,
                marginTop: 10,
                borderRadius: 8,
              }}
            />
          )}

          {/* <div className="field">
            <label>Attachments</label>
            <input
              className="search__input"
              type="file"
              name="attachments"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
            />
          </div> */}

          <div className="modal-actions">
            <button disabled={saving} type="submit">
              {saving ? "Submitting" : "Submit Ticket"}
            </button>
          </div>
        </form>
      </AddLocationModal>
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
            style={{ width: "100%", objectFit: "cover" }}
          />
        </div>
      </AddLocationModal>
    </div>
  );
};

export default HelpCenter;
