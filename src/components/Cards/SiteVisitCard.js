import React, { useEffect, useState } from "react";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import DeleteModal from "../Modals/DeleteModal";
import ViewModal from "../Modals/ViewModal";
import NiReport from "../../icons/ni-report";
import NiTick from "../../icons/ni-tick";
import NiCross from "../../icons/ni-cross";
import NiClock from "../../icons/ni-clock";
import SearchSelect from "../SearchItems/SearchSelect";
import CancellationPolicy from "../Policies/CancellationPolicy";
import AddLocationModal from "../Modals/AddLocationModal";
import formatDate from "../DateFormate/DateFormate";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Host from "../../Host/Host";
import { getAccountDetails, getPaymentTerms, getPlots, getPlotsetting, getSiteVisit } from "../../Redux/Slices/AppSlices";
import NoteItem from "../NoteItem/NoteItem";
import { uploadImage } from "../../Pages/LandingSetting/LandingApi";
import { formatCurrency } from "../Utils/FormatCurrency";

const SiteVisitCard = ({
  item,
  setSelectedVisit,
  setIsEditMode,
  setOpen,
  mood,
  dashboard,
  setAlert,
  landingPage
}) => {
  const dispatch = useDispatch();
  const { plots, userDetail, paymentTerms, plotSetting } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getPaymentTerms());
    dispatch(getPlotsetting());
  }, []);

  const [activeRow, setActiveRow] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [notes, setNotes] = useState(item.notes || []);
  const [noteText, setNoteText] = useState("");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [disapproveOpen, setDisapproveOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [newVisitDate, setNewVisitDate] = useState("");
  const [panelMode, setPanelMode] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedPlot, setSelectedPlot] = useState(null);
  // const [editingNoteId, setEditingNoteId] = useState(null);
  // const [editText, setEditText] = useState("");
  const [noteImage, setNoteImage] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedColony, setSelectedColony] = useState(null);
  const [type, setType] = useState("FREE");

  useEffect(() => {
    if (selectedColony?._id) {
      dispatch(getPlots(selectedColony._id));
    }
  }, [selectedColony]);

  useEffect(() => {
    if (!viewOpen) {
      setPanelMode(null);
      setShowReport(false);
    }
  }, [viewOpen]);

  const handleVisitAction = async (visitId, action, extraData = {}) => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${Host}/api/sitevisit/action/${visitId}`,
        {
          action,
          ...extraData, // visitDate / note
        },
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      setAlert({
        message:
          action === "approve"
            ? "Site visit approved"
            : action === "reject"
              ? "Site visit rejected"
              : "Site visit rescheduled",
        status: "Success",
      });

      dispatch(getSiteVisit());

      setDisapproveOpen(false);
      setRescheduleOpen(false);
      setFormData({});
      setNewVisitDate("");

      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Action failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    }
  };

  const handleAddNote = async (visitId, selectedColony) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      let image = "";
      if (noteImage) {
        const upload = await uploadImage(noteImage);
        image = upload.url;

      }
      console.log(image)
      const res = await axios.post(
        `${Host}/api/sitevisit/add-note/${visitId}`,
        {
          note: noteText,
          image,
          colonyId: selectedColony
        },
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ update UI from backend response
      setNotes(res.data.visit.notes);
      setNoteText("");
      setNoteImage(null);

      setAlert({
        message: "Note added successfully",
        status: "Success",
      });
      setSaving(false);
      dispatch(getSiteVisit()); // optional refresh

      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error(err);
      setSaving(false);
      setAlert({
        message: err.response?.data?.message || "Failed to add note",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleEditNote = async (visitId, noteId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      let image = noteImage;
      if (noteImage instanceof File) {
        const upload = await uploadImage(noteImage);
        image = upload.url;
      }
      const res = await axios.put(
        `${Host}/api/sitevisit/edit-note/${visitId}/${noteId}`,
        {
          note: noteText,
          image
        },
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      setNotes(res.data.visit.notes);
      setEditingNote(null);
      setNoteText("");
      setNoteImage(null);
      setSaving(false);
      setAlert({ message: "Note updated", status: "Success" });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error(err);
      setSaving(false);
      setAlert({ message: "Edit failed", status: "Error" });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDeleteNote = async (visitId, noteId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `${Host}/api/sitevisit/delete-note/${visitId}/${noteId}`,
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      setNotes(res.data.visit.notes);
      dispatch(getSiteVisit());
      setAlert({ message: "Note deleted", status: "Success" });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error(err);
      setAlert({ message: "Delete failed", status: "Error" });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleAddBooking = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token");

      if (!selectedPlot) {
        setAlert({ message: "Please select plot", status: "Error" });
        return;
      }

      if (!formData.requestAmount) {
        setAlert({ message: "Enter request amount", status: "Error" });
        return;
      }

      if (!formData.termsAccepted) {
        setAlert({
          message: "Please accept terms & conditions",
          status: "Error",
        });
        return;
      }

      console.log(formData, "formData")
      const res = await axios.post(
        `${Host}/api/booking/add`,
        {
          sitevisitId: item._id, // 🔥 IMPORTANT
          customer: item.customer._id,
          location: item.location?._id,
          colony: selectedColony._id,
          plot: selectedPlot._id, // 🔥 IMPORTANT

          requestAmount: formData.requestAmount,

          bookingDays: formData.bookingDays,
          agreementDays: formData.agreementDays,
          fullPaymentDays: formData.fullPaymentDays,

          termsAccepted: formData.termsAccepted,
        },
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      setAlert({
        message: "Booking created successfully",
        status: "Success",
      });

      dispatch(getSiteVisit());

      // reset UI
      setViewOpen(false);
      setSelectedPlot(null);
      setFormData({});
      setPanelMode(null);

      setSaving(false)
      setTimeout(() => setAlert(null), 3000);

    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Booking failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    }
  };


  const handleDeleteVisit = async (visitId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${Host}/api/sitevisit/delete/${visitId}`, {
        headers: {
          "auth-token": token,
        },
      });

      dispatch(getSiteVisit());

      setAlert({
        message: "Site visit deleted successfully!",
        status: "Success",
      });
      setTimeout(() => setAlert(null), 3000);

      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: "Delete failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleHoldPlot = async () => {
    setSaving(true)
    const token = localStorage.getItem("token");
    await axios.post(
      `${Host}/api/plothold/${type.toLowerCase()}`,
      {
        colony: selectedColony._id,
        plotId: selectedPlot._id,
        customer: item.customer._id,
      },
      {
        headers: {
          "auth-token": token,
        },
      },
    );
    setAlert({
      message: "Hold Request Submitted",
      status: "Success",
    });
    dispatch(getSiteVisit());
    
    // reset UI
    setViewOpen(false);
    setSelectedPlot(null);
    setFormData({});
    setPanelMode(null);
    
    setTimeout(() => setAlert(null), 3000);
    setSaving(false)
    // setShowHoldModal(false);
    // onClose();
  };
  
  // console.log(item, "item")
  return (
    <div className="user-card card" onClick={dashboard || undefined}>
      <div className="user-card-top">
        <div className="user-card-title">
          <div className="user-card-name">
            <h4 style={{ textTransform: "capitalize" }}>
              {item.customer.name}
              {/* <span>({item.phone})</span> */}
              <span

                className={`status ${item.status === "completed" ? "active" : item.status === "scheduled" ? "pending" : item.status === "rescheduled" ? "pending" : item.status === "approval" ? "pending2" : "failed"}`}
              >
                {item.status}
              </span>
            </h4>
            {/* <p>{item.id}</p> */}
          </div>
        </div>
        <div className="dots">

          <span
            onClick={(e) => {
              e.stopPropagation();
              setViewOpen(true);
            }}
          >
            <NiOpenEye />
          </span>
          {mood !== "user" && mood !== "agent" && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setActiveRow(activeRow === item.id ? null : item.id);
              }}
            >
              <NiDots />
            </span>
          )}

          {activeRow === item.id && (
            <ActionModal
              item={item}
              onClose={() => setActiveRow(null)}
              onEdit={(visit) => {
                setSelectedVisit(visit);
                setIsEditMode(true);
                setOpen(true);
              }}
              onDelete={() => {
                setDeleteOpen(true);
              }}
            />
          )}
        </div>
      </div>
      <div className="user-card-bottom">
        <div className="user-card-bottom-left">
          <p>Date</p>
          <p>Phone No.</p>
          {mood !== "agent" && <p>Associate</p>}
          <p>Site</p>
          <p>Visit Date</p>
        </div>
        <div className="user-card-bottom-right">
          <p>
            {formatDate(item?.createdAt)}
          </p>
          <p>{item.customer.phone}</p>
          {mood !== "agent" && <p>{item.agent?.name || "-"}</p>}
          <p> {item.colonies?.length}, {item?.location?.name}</p>
          <p>{item.visitDate}</p>
        </div>
      </div>
      {(mood === "admin" || mood === "staff") && (item.status === "approval") && (
        <div className="modal-actions">
          <button
            className="site-visit-approval status active"
            disabled={saving}
            onClick={() => {
              handleVisitAction(item._id, "approve");
            }}
          >
            <NiTick /> Approve
          </button>

          <button
            className="site-visit-approval status failed"
            onClick={() => setDisapproveOpen(true)}
          >
            <NiCross /> Disapprove
          </button>

          <button
            className="site-visit-approval status pending"
            onClick={() => setRescheduleOpen(true)}
          >
            <NiClock /> Reschedule
          </button>
        </div>
      )}
      {(mood === "agent" && item.status === "scheduled" || item.status === "rescheduled") && (
        <div className="modal-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewOpen(true);
              setPanelMode("booking");
              setShowReport(false);
            }}
          >
            Request Booking
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewOpen(true);
              setPanelMode("report");
              setShowReport(true);
            }}
          >
            Vist Notes
          </button>
        </div>
      )}
      {/* {mood === "agent" && item.status === "Scheduled" && (
          <div className="modal-actions">
            <button
              onClick={() => {
                setPanelMode("booking");
                setShowReport(false);
              }}
            >
              Request Booking
            </button>
          </div>
        )} */}

      <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <p>Are you sure you want to delete?</p>
        <div className="modal-actions">
          <button
          disabled={saving}
            onClick={(e) => {
              e.stopPropagation();
              console.log("Site Visit deleted");
              setDeleteOpen(false);
              handleDeleteVisit(item._id)
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
      <DeleteModal open={rescheduleOpen} onClose={() => setRescheduleOpen(false)}>
        <h4>Reschedule Site Visit</h4>
        <div className="field">
          <label>Date of Visit</label>

          {/* Date */}
          <input
            type="date"
            value={formData.visitDate || ""}
            onChange={(e) =>
              setFormData({ ...formData, visitDate: e.target.value })
            }
          />

          {/* Hour Dropdown */}
          <select
            value={formData.visitHour || ""}
            onChange={(e) =>
              setFormData({ ...formData, visitHour: e.target.value })
            }
          >
            <option value="">Select Hour</option>
            {[...Array(12)].map((_, i) => {
              const hour = i + 1;
              return (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              );
            })}
          </select>

          {/* AM / PM */}
          <select
            value={formData.visitPeriod}
            onChange={(e) =>
              setFormData({ ...formData, visitPeriod: e.target.value })
            }
          >
            <option value="">Select Period (AM / PM)</option>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        {/* <div className="field">
          <label>New Visit Date</label>
          <input
            type="datetime-local"
            value={newVisitDate}
            onChange={(e) => setNewVisitDate(e.target.value)}
          />
        </div> */}
        <div className="field">
          <label>
            Notes
          </label>
          <textarea
            placeholder="Add Notes..."
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        <div className="modal-actions">
          <button
          disabled={saving}
            onClick={() => {
              if (
                !formData.visitDate ||
                !formData.visitHour ||
                !formData.visitPeriod
              ) {
                setAlert({
                  message: "Please select complete visit date & time",
                  status: "Error",
                });
                return;
              }

              if (!formData.notes?.trim()) {
                setAlert({
                  message: "Note is required",
                  status: "Error",
                });
                return;
              }

              handleVisitAction(item._id, "reschedule", {
                visitDate: formData.visitHour +
                  " " +
                  formData.visitPeriod +
                  " " +
                  formData.visitDate,
                note: formData.notes,
              });
            }}
          >
            Reschedule
          </button>
        </div>
      </DeleteModal>
      <DeleteModal open={disapproveOpen} onClose={() => setDisapproveOpen(false)}>
        <h4>Disapprove Site Visit</h4>
        <div className="field">
          <label>
            Notes
          </label>
          <textarea
            placeholder="Add Notes..."
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        <div className="modal-actions">
          <button
          disabled={saving}
            onClick={() => {
              if (!formData.notes?.trim()) {
                setAlert({
                  message: "Note is required",
                  status: "Error",
                });
                return;
              }

              handleVisitAction(item._id, "reject", {
                note: formData.notes,
              });
            }}
          >
            Disapprove
          </button>
        </div>
      </DeleteModal>
      <ViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={item.customer.name}
      >
        <div className="user-card-bottom view-box">
          <div className="user-card-bottom-left">
            <p>Date</p>
            <p>Phone No.</p>
            {mood !== "agent" && <p>Associate</p>}
            <p>Site</p>
            <p>Visit Date</p>
            {/* <p>Notes</p> */}
          </div>
          <div className="user-card-bottom-right">
            <p>
              {formatDate(item?.createdAt)}
            </p>
            <p>{item.customer.phone}</p>
            {mood !== "agent" && <p>{item.agent?.name || "-"}</p>}
            <p>{item.customer.phone}</p>
            {mood !== "agent" && <p>{item.agent?.name || "-"}</p>}
            <p> {item.colonies?.map((i) => (
              <>
                {i?.colony?.name}
              </>
            ))}, {item?.location?.name}</p>
            <p>{item.visitDate}</p>
            <div className="table-filters">
              <button
                className={`view-report-btn ${showReport ? "active" : ""}`}
                onClick={() => {
                  setPanelMode("report");
                  setShowReport(true);
                }}
              >
                <NiReport /> {showReport ? "Hide" : "View"}
              </button>
            </div>
          </div>
        </div>
        {mood === "agent" && item.status === "scheduled" && (
          <div className="modal-actions">
            <button
              onClick={() => {
                setPanelMode("holdplot");
                setShowReport(false);
              }}
            >
              Hold Plot
            </button>
            <button
              onClick={() => {
                setPanelMode("booking");
                setShowReport(false);
              }}
            >
              Request Booking
            </button>
          </div>
        )}
        <div className={`report-view-box-right ${panelMode ? "active" : ""}`}>
          {panelMode === "booking" && (
            <>
              <h4>Request Booking</h4>
              <div className="field">
                <label>Colony</label>

                <select
                  value={selectedColony?._id || ""}
                  onChange={(e) => {
                    const colony = item.colonies.find(
                      (c) => c.colony._id === e.target.value
                    )?.colony;

                    setSelectedColony(colony);
                    setSelectedPlot(null);

                    setFormData((prev) => ({
                      ...prev,
                      colony: colony?._id || "",
                      plot: "",
                    }));
                  }}
                >
                  <option value="">Select Colony</option>

                  {item.colonies.map((c) => (
                    <option key={c.colony._id} value={c.colony._id}>
                      {c.colony.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <SearchSelect
                  label="Plots"
                  placeholder={
                    selectedColony
                      ? "Search Plot..."
                      : "Select Colony First"
                  }
                  disabled={!selectedColony}
                  options={plots?.plots}
                  value={selectedPlot}
                  onChange={(selected) => {
                    setSelectedPlot(selected);

                    setFormData({
                      ...formData,
                      plot: selected._id,
                      plotId: selected.plotId,
                      pricePerSqft: selected.price,
                      plotArea: selected.area,
                      priceRange: selected.priceRange,
                    });
                  }}
                  displayKey="plotNumber"
                  searchKeys={["plotNumber", "status"]}
                  renderOption={(p) => (
                    <div>
                      <b>{p.plotNumber}</b>
                      <small style={{ display: "block", color: "#666" }}>
                        {p.plotType}
                      </small>
                    </div>
                  )}
                />
              </div>

              <div className="field">
                <label>Rate <small style={{ fontSize: "12px", color: "green" }}>₹{selectedPlot?.price || 0} / sq.ft </small></label>
                <input
                  placeholder="Rate with sqft"
                  value={formData.pricePerSqft ? `₹${formData.pricePerSqft} * ${formData.plotArea} sq.ft` : ""}
                  // {"₹550 * 1200 sq.ft"}
                  readOnly
                />
              </div>

              <div className="field">
                <label>Price Request in sq.ft
                  <small style={{ fontSize: "12px", color: "green" }}>₹{formData.requestAmount * formData.plotArea || 0} </small>
                </label>
                <input
                  type="number"
                  placeholder="Price request in sq.ft"
                  value={formData.requestAmount || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, requestAmount: e.target.value })
                  }
                />
              </div>


              {selectedPlot &&
                formData.requestAmount &&
                (Number(formData.requestAmount) < selectedPlot.priceRange.min ||
                  Number(formData.requestAmount) > selectedPlot.priceRange.max) && (
                  <div className="field">
                    <label>
                      Notes <small style={{ fontSize: "12px", color: "#ff6969" }}>(Price Doesn't Match Allowed Range)</small><span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                      placeholder="Enter reason for requesting amount outside allowed range"
                      value={formData.notes || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>
                )}

              <div className="field">
                <label>Booking Payment Days</label>

                <select
                  value={formData.bookingDays || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bookingDays: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select Days</option>

                  {paymentTerms?.bookingDays?.map((day) => (
                    <option key={day} value={day}>
                      {day} Days
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Agreement Payment Days</label>

                <select
                  value={formData.agreementDays || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agreementDays: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select Days</option>

                  {paymentTerms?.agreementDays?.map((day) => (
                    <option key={day} value={day}>
                      {day} Days
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Full Payment Days</label>

                <select
                  value={formData.fullPaymentDays || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullPaymentDays: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select Days</option>

                  {paymentTerms?.fullPaymentDays?.map((day) => (
                    <option key={day} value={day}>
                      {day} Days
                    </option>
                  ))}
                </select>
              </div>
              <p style={{ color: "#ff6969", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "5px", padding: "10px 0" }}>
                <input style={{ width: "5%" }} type="checkbox"
                  checked={formData.termsAccepted || false}
                  onChange={(e) =>
                    setFormData({ ...formData, termsAccepted: e.target.checked })
                  } />
                Notes : 35% cancellation charges
                <span style={{ borderBottom: "1px solid #ff6969", cursor: "pointer" }} onClick={() => setPolicyOpen(true)}>
                  Read Cancellation Policy
                </span>
              </p>

              <div className="modal-actions">
                <button
                disabled={saving}
                  onClick={() => {
                    if (!selectedPlot) {
                      setAlert({
                        message: "Please select a plot",
                        status: "Error",
                      });
                      setTimeout(() => setAlert(null), 3000);
                      return;
                    }

                    const requestedAmount = Number(formData.requestAmount);
                    const min = selectedPlot.priceRange.min;
                    const max = selectedPlot.priceRange.max;

                    const isInRange = requestedAmount >= min && requestedAmount <= max;

                    if (!requestedAmount) {
                      setAlert({
                        message: "Please enter amount request",
                        status: "Error",
                      });
                      setTimeout(() => setAlert(null), 3000);
                      return;
                    }

                    if (!isInRange && !formData.notes?.trim()) {
                      setAlert({
                        message: "Notes are required when amount is outside the allowed range",
                        status: "Error",
                      });
                      setTimeout(() => setAlert(null), 3000);
                      return;
                    }

                    handleAddBooking();
                  }}
                >
                  Submit Request
                </button>
              </div>
            </>
          )}
          {panelMode === "holdplot" && (
            <>
              <h4>Hold Plot</h4>
              <div className="field">
                <label>Colony</label>

                <select
                  value={selectedColony?._id || ""}
                  onChange={(e) => {
                    const colony = item.colonies.find(
                      (c) => c.colony._id === e.target.value
                    )?.colony;

                    setSelectedColony(colony);
                    setSelectedPlot(null);

                    setFormData((prev) => ({
                      ...prev,
                      colony: colony?._id || "",
                      plot: "",
                    }));
                  }}
                >
                  <option value="">Select Colony</option>

                  {item.colonies.map((c) => (
                    <option key={c.colony._id} value={c.colony._id}>
                      {c.colony.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <SearchSelect
                  label="Plots"
                  placeholder={
                    selectedColony
                      ? "Search Plot..."
                      : "Select Colony First"
                  }
                  disabled={!selectedColony}
                  options={plots?.plots}
                  value={selectedPlot}
                  onChange={(selected) => {
                    setSelectedPlot(selected);

                    setFormData({
                      ...formData,
                      plot: selected._id,
                      plotId: selected.plotId,
                      pricePerSqft: selected.price,
                      plotArea: selected.area,
                      priceRange: selected.priceRange,
                    });
                  }}
                  displayKey="plotNumber"
                  searchKeys={["plotNumber", "status"]}
                  renderOption={(p) => (
                    <div>
                      <b>{p.plotNumber}</b>
                      <small style={{ display: "block", color: "#666" }}>
                        {p.plotType}
                      </small>
                    </div>
                  )}
                />
              </div>
              <div className="field">
                <label>Hold Type</label>

                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="FREE">Shadow Hold (Free)</option>
                  <option value="PAID">Token Hold (Paid)</option>
                </select>
              </div>
              <div className="installment-box">
                {type === "FREE" ? (
                  <>
                    <h4>Free Hold</h4>
                    <div className="installment">
                      <span>Hold Days</span>
                      <span>{plotSetting?.freeHoldDays} Days</span>
                    </div>
                    <div className="installment">
                      <span>Amount</span>
                      <span>₹{formatCurrency(0)}</span>
                    </div>
                    {/* <div className="installment">
                      <span>First Hold </span>
                      <span> No Approval</span>
                    </div>
                    <div className="installment">
                      <span>Second Hold </span>
                      <span>Admin Approval Required</span>
                    </div> */}
                  </>
                ) : (
                  <>
                    <h4>Paid Hold</h4>
                    <div className="installment">
                      <span>Hold Days</span>
                      <span>{plotSetting?.paidHoldDays} Days</span>
                    </div>
                    <div className="installment">
                      <span>Amount</span>
                      <span>₹{formatCurrency(plotSetting?.paidAmount)}</span>
                    </div>
                    {/* <div className="installment">
                      <span>Admin Approval Required</span>
                    </div> */}
                  </>
                )}
              </div>
              <div className="modal-actions">
                <button disabled={saving} onClick={handleHoldPlot}>Submit Hold</button>
              </div>
            </>
          )}
          {panelMode === "report" && (
            <>
              {/* <h4>Site Visit</h4> */}

              {/* SALE SUMMARY */}
              {/* <div className="user-card-bottom view-box">
                <div className="user-card-bottom-left">
                  <p>Date</p>
                  <p>Phone No.</p>
                  <p>Associate</p>
                  <p>Site</p>
                  <p>Visit Date</p>
                </div>

                <div className="user-card-bottom-right">
                  <p>
                    {formatDate(item?.createdAt)}
                  </p>
                  <p>{item.customer.phone}</p>
                  <p>{item.agent?.name || "-"}</p>
                  <p>{item.location?.name || "-"}</p>
                  <p>{item.visitDate}</p>
                </div>
              </div> */}

              {/* VISIT → BOOKING SUMMARY */}
              {/* EXISTING NOTES */}
              {/* <h5>Notes History</h5> */}

              {/* {notes.length === 0 && <p>No notes available.</p>} */}
              {/* {item.status === "rejected" &&
                <>
                  {notes.map((n, i) => (
                    <div key={i} className="note-item">
                      <small>
                        <span>{n?.by}</span> {n?.date}
                      </small>
                      <p>{n?.text}</p>
                    </div>
                  ))}
                </>} */}


              {(item.status === "scheduled" || item.status === "approval" || item.status === "completed" || item.status === "rescheduled") && (
                <>
                  <NoteItem
                    item={item}
                    notes={notes}
                    noteText={noteText}
                    noteImage={noteImage}
                    setNoteImage={setNoteImage}
                    setNoteText={setNoteText}
                    handleAddNote={handleAddNote}
                    handleEditNote={handleEditNote}
                    handleDeleteNote={handleDeleteNote}
                    mood={mood}
                    editingNote={editingNote}
                    setEditingNote={setEditingNote}
                    saving={saving}
                    setSaving={setSaving}
                  />
                </>
              )}
            </>
          )}

        </div>
      </ViewModal>
      <AddLocationModal
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
        title="Cancellation and Refund Policy"
      >
        <CancellationPolicy landingPage={landingPage} />
      </AddLocationModal>
    </div>
  );
};

export default SiteVisitCard;
