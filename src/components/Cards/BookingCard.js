import React, { useEffect, useState } from "react";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import DeleteModal from "../Modals/DeleteModal";
import ViewModal from "../Modals/ViewModal";
import NiReport from "../../icons/ni-report";
import NiCross from "../../icons/ni-cross";
import NiTick from "../../icons/ni-tick";
import formatDate from "../DateFormate/DateFormate";
import axios from "axios";
import Host from "../../Host/Host";
import { useDispatch, useSelector } from "react-redux";
import { getBooking, getRating } from "../../Redux/Slices/AppSlices";
import NiSitevisit from "../../icons/ni-sitevisit";
import { formatCurrency } from "../Utils/FormatCurrency";
import NiStar from "../../icons/ni-star";

const BookingCard = ({
  item,
  setSelectedBooking,
  setIsEditMode,
  setOpen,
  mood,
  dashboard,
  setAlert,
}) => {
  const dispatch = useDispatch();
  const { ratingData } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getRating());
  }, []);
  const [activeRow, setActiveRow] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [disapproveOpen, setDisapproveOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [panelMode, setPanelMode] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [saving, setSaving] = useState([]);

  useEffect(() => {
    if (!viewOpen) {
      setShowReport(false);
      setShowTimeline(false);
    }
  }, [viewOpen]);

  const ratingdone = ratingData.find((i) => i.booking._id === item._id);
  const total = Number(item.finalAmount || 0);
  const paid = Number(item.amountPaid || 0);
  const remaining = total - paid;

  const bookingAmount = item?.paymentSchedule?.booking?.amount;
  const agreementAmount = item?.paymentSchedule?.agreement?.amount;
  const fullAmount = item?.paymentSchedule?.full?.amount;

  const bookingPaid = paid >= bookingAmount;
  const agreementPaid = paid >= bookingAmount + agreementAmount;
  const fullPaid = paid >= total;

  const progress = total ? (paid / total) * 100 : 0;

  const getRemainingDays = (startDate, dueDays) => {
    if (!startDate || !dueDays) return dueDays;
    const start = new Date(startDate);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const remaining = dueDays - diff;
    return remaining > 0 ? remaining : 0;
  };

  const isApproval = item.status === "approval";
  const [cratingData, setCratingData] = useState({
    stars: 5,
    review: "",
  });

  // Example: requested amount = next pending installment
  const requestedAmount = (() => {
    if (!bookingPaid) return bookingAmount;
    if (bookingPaid && !agreementPaid) return agreementAmount;
    if (agreementPaid && !fullPaid) return fullAmount;
    return 0;
  })();
  const pricePerSqft = item.plotArea ? Math.round(total / item.plotArea) : 0;

  useEffect(() => {
    if (!viewOpen) {
      setPanelMode(null);
      setShowReport(false);
    }
  }, [viewOpen]);

  useEffect(() => {
    if (panelMode === "payment") {
      let autoAmount = "";

      if (currentStage === "booking") autoAmount = bookingAmount;
      if (currentStage === "agreement") autoAmount = agreementAmount;
      if (currentStage === "full") autoAmount = fullAmount;

      setFormData((prev) => ({
        ...prev,
        paymentType: currentStage,
        restAmount: autoAmount,
        totalAmount: total,
      }));
    }
  }, [panelMode]);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${Host}/api/booking/timeline/${item._id}`,
          {
            headers: {
              "auth-token": token,
            },
          },
        );

        setTimeline(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (viewOpen && panelMode === "timeline") {
      fetchTimeline();
    }
  }, [viewOpen, panelMode, item._id]);

  const getProgressPercent = (daysLeft, totalDays) => {
    if (daysLeft <= 0) return 100;
    const percent = ((totalDays - daysLeft) / totalDays) * 100;
    return Math.min(Math.max(percent, 0), 100);
  };

  const bookingDaysLeft = getRemainingDays(
    item.paymentSchedule?.booking?.date,
    item.paymentSchedule?.booking?.dueDays || 10,
  );

  const agreementDaysLeft = getRemainingDays(
    item.paymentSchedule?.agreement?.date,
    item.paymentSchedule?.agreement?.dueDays || 30,
  );

  const registryDaysLeft = getRemainingDays(
    item.paymentSchedule?.full?.date,
    item.paymentSchedule?.full?.dueDays || 90,
  );

  const currentStage = (() => {
    if (!bookingPaid) return "booking";
    if (bookingPaid && !agreementPaid) return "agreement";
    if (agreementPaid && !fullPaid) return "full";
    return "completed";
  })();

  // console.log(item, "item")

  const bookingProgress =
    currentStage === "booking"
      ? getProgressPercent(
          bookingDaysLeft,
          item.paymentSchedule?.booking?.dueDays,
        )
      : bookingPaid
        ? 100
        : 0;

  const agreementProgress =
    currentStage === "agreement"
      ? getProgressPercent(
          agreementDaysLeft,
          item.paymentSchedule?.agreement?.dueDays,
        )
      : agreementPaid
        ? 100
        : 0;

  const registryProgress =
    currentStage === "full"
      ? getProgressPercent(
          registryDaysLeft,
          item.paymentSchedule?.full?.dueDays,
        )
      : fullPaid
        ? 100
        : 0;

  // console.log(bookingProgress, "bookingProgress")
  const handleBookingAction = async (bookingId, action, note = "") => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${Host}/api/booking/action/${bookingId}`,
        { action, note },
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        },
      );

      setAlert({
        message: action === "approve" ? "Booking approved" : "Booking rejected",
        status: "Success",
      });

      // 🔥 refresh list (IMPORTANT)
      dispatch(getBooking());

      setDisapproveOpen(false);
      setFormData({});

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Action failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${Host}/api/booking/delete/${bookingId}`, {
        headers: {
          "auth-token": token,
        },
      });

      dispatch(getBooking());

      setAlert({
        message: "Booking deleted successfully!",
        status: "Success",
      });
      setTimeout(() => setAlert(null), 3000);

      setSaving(false);
      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: "Delete failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  // Add Payment
  const handleAddPayment = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // 🔥 validations
      if (!formData.paymentType) {
        return setAlert({ message: "Select payment type", status: "Error" });
      }

      if (!formData.mode) {
        return setAlert({ message: "Select payment mode", status: "Error" });
      }

      if (!formData.amount) {
        return setAlert({ message: "Enter amount", status: "Error" });
      }

      if (
        (formData.mode === "UPI" || formData.mode === "Bank Transfer") &&
        !formData.transactionId
      ) {
        return setAlert({
          message: "Transaction ID required",
          status: "Error",
        });
      }

      const payload = {
        booking: item._id,
        amount: Number(formData.amount),
        paymentMode: formData.mode,
        paymentType: formData.paymentType,
        transactionId: formData.transactionId || "",
      };

      await axios.post(`${Host}/api/payment/add`, payload, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      // console.log(payload, "payload")

      setAlert({
        message: "Payment submitted successfully",
        status: "Success",
      });

      dispatch(getBooking());

      setFormData({});
      setPanelMode(null);
      setViewOpen(false);

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Payment failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  const [paymentSummary, setPaymentSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${Host}/api/payment/summary/${item._id}`, {
          headers: { "auth-token": token },
        });

        setPaymentSummary(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSummary();
  }, [item._id]);

  const handleSubmitRating = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${Host}/api/rating/submit`,
        {
          bookingId: item._id,
          stars: cratingData.stars,
          review: cratingData.review,
        },
        {
          headers: {
            "auth-token": token,
          },
        },
      );
      setAlert({
        message: "Rating submitted successfully",
        status: "Success",
      });
      setPanelMode(null);
      dispatch(getBooking());
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    } catch (err) {
      console.log(err);

      setAlert({
        message: err.response?.data?.msg || "Unable to submit rating",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    }
  };

  // console.log(paymentSummary, "paymentSummary");
  // console.log(bookingPaid, "bookingPaid")

  return (
    <>
      {/* ================= CARD ================= */}

      <div className="user-card card" onClick={dashboard || undefined}>
        <div className="user-card-top">
          <div className="user-card-title">
            <div className="user-card-name">
              <h4 style={{ textTransform: "capitalize" }}>
                {item?.customer?.name}
                {/* <span>({item?.agent?.name})</span> */}

                <span
                  className={`status ${
                    item.status === "confirmed"
                      ? "active"
                      : item.status === "pending"
                        ? "pending"
                        : item.status === "approval"
                          ? "pending2"
                          : item.status === "rejected"
                            ? "failed"
                            : ""
                  }`}
                >
                  {item.status}
                </span>
              </h4>
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

            {mood !== "user" && !dashboard && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveRow(activeRow === item.id ? null : item.id);
                }}
              >
                <NiDots />
              </span>
            )}

            {activeRow === item.id && mood === "admin" && (
              <ActionModal
                item={item}
                onClose={() => setActiveRow(null)}
                onEdit={(booking) => {
                  setSelectedBooking(booking);
                  setIsEditMode(true);
                  setOpen(true);
                }}
                onDelete={() => setDeleteOpen(true)}
              />
            )}
          </div>
        </div>

        {/* ================= BOOKING SUMMARY ================= */}

        <div className="user-card-bottom">
          <div className="user-card-bottom-left">
            <p>Date</p>
            <p>Plot</p>
            {mood !== "agent" && <p>Associate</p>}
            <p>Plot Area</p>
            {!isApproval ? (
              <>
                <p> Final Rate</p>
                <p> Total Amount</p>
                <p> Paid</p>
                <p> Remaining</p>
              </>
            ) : (
              <>
                <p>Price/Sqft</p>
                <p>Req. Rate</p>
                <p>Total Amount</p>
              </>
            )}
          </div>

          <div className="user-card-bottom-right">
            <p>{formatDate(item?.createdAt)}</p>
            <p>
              {item?.plot?.plotNumber}, {item?.colony?.name},{" "}
              {item?.location?.name}
            </p>
            {mood !== "agent" && <p>{item?.agent?.name}</p>}
            <p>{formatCurrency(item?.plotArea)} sqft</p>
            {!isApproval ? (
              <>
                <p>₹{formatCurrency(item?.requestAmount)}/sqft</p>
                <p>₹{formatCurrency(item?.finalAmount)}</p>
                <p>₹{formatCurrency(paid)}</p>
                <p>₹{formatCurrency(remaining)}</p>
              </>
            ) : (
              <>
                <p>₹{item?.pricePerSqft}/sqft</p>
                <p>₹{formatCurrency(item?.requestAmount)}/sqft</p>
                <p>₹{formatCurrency(item?.finalAmount)}</p>
              </>
            )}
          </div>
        </div>
        <div className="modal-actions progress-wrapper">
          {/* BOOKING */}
          <div className="booking-progress">
            <span>Booking</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${item.status === "pending" || item.status === "confirmed" ? bookingProgress : 0}%`,
                }}
              >
                <span>
                  {item.status === "approval"
                    ? formatDate(item?.paymentSchedule?.booking?.date)
                    : bookingPaid
                      ? "completed"
                      : `${bookingDaysLeft} Days Left`}
                </span>
              </div>
            </div>
          </div>

          {/* AGREEMENT */}
          <div className="booking-progress">
            <span>Agreement</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${item.status === "pending" || item.status === "confirmed" ? agreementProgress : 0}%`,
                }}
              >
                <span>
                  {!bookingPaid
                    ? formatDate(item?.paymentSchedule?.agreement?.date)
                    : agreementPaid
                      ? "Completed"
                      : `${agreementDaysLeft} Days Left`}
                </span>
              </div>
            </div>
          </div>

          {/* REGISTRY */}
          <div className="booking-progress">
            <span>Registry</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${item.status === "pending" || item.status === "confirmed" ? registryProgress : 0}%`,
                }}
              >
                <span>
                  {!agreementPaid
                    ? formatDate(item?.paymentSchedule?.full?.date)
                    : fullPaid
                      ? "Completed"
                      : `${registryDaysLeft} Days Left`}
                </span>
              </div>
            </div>
          </div>
        </div>
        {(mood === "admin" || mood === "staff") &&
          (item.status === "scheduled" || item.status === "approval") && (
            <div className="modal-actions">
              <button
                disabled={saving}
                className="site-visit-approval status active"
                onClick={() => {
                  handleBookingAction(item._id, "approve");
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
            </div>
          )}
        <div>
          {!ratingdone && item.status === "completed" && mood === "user" && (
            <div className="modal-actions">
              <button
                className=" view-report-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setPanelMode("rating");
                  setShowReport(false);
                  setViewOpen(true);
                }}
              >
                Please Give Rating
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        open={disapproveOpen}
        onClose={() => setDisapproveOpen(false)}
      >
        <h4>Disapprove Booking</h4>
        <div className="field">
          <label>Notes</label>
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
              handleBookingAction(item._id, "reject", formData.notes);
            }}
          >
            Disapprove
          </button>
        </div>
      </DeleteModal>

      {/* ================= DELETE MODAL ================= */}

      <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <p>Are you sure you want to delete?</p>

        <div className="modal-actions">
          <button
            disabled={saving}
            onClick={(e) => {
              e.stopPropagation();

              setDeleteOpen(false);

              handleDeleteBooking(item._id);
            }}
            disabled={saving}
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

      {/* ================= VIEW MODAL ================= */}

      <ViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={item?.customer?.name}
      >
        {/* SUMMARY */}

        <div className="user-card-bottom view-box">
          <div className="user-card-bottom-left">
            <p>Date</p>
            <p>Plot</p>
            <p>Total</p>
            <p>Paid</p>
            <p>Remaining</p>

            {/* {item.status === "confirmed" ||
              (item.status === "pending" && (
                <>
                  <div className="table-filters">
                    <button
                      className={`view-report-btn ${showReport ? "active" : ""}`}
                      onClick={() => {
                        setPanelMode("report");
                        setShowReport(true);
                        setShowTimeline(false);

                      }}
                    >
                      <NiReport /> Report
                    </button>
                  </div>
                </>
              ))} */}
          </div>

          <div className="user-card-bottom-right">
            <p>{formatDate(item?.createdAt)}</p>
            <p>
              {item?.plot?.plotNumber}, {item?.colony?.name},{" "}
              {item?.location?.name}
            </p>
            <p>₹{formatCurrency(item?.finalAmount)}</p>
            <p>₹{formatCurrency(paid)}</p>
            <p>₹{formatCurrency(remaining)}</p>

            {/* {item.status === "confirmed" ||
              (item.status === "pending" && (
                <>

                  <div className="table-filters">
                    <button
                      className={`view-report-btn ${showTimeline ? "active" : ""}`}
                      onClick={() => {
                        setPanelMode("timeline");
                        setShowReport(false);
                        setShowTimeline(true);
                      }}
                    >
                      <NiSitevisit /> Timeline
                    </button>
                  </div>
                </>
              ))} */}
          </div>
        </div>
        {item.status === "confirmed" ||
          (item.status === "pending" && (
            <>
              <div class="modal-actions">
                <button
                  className={`view-report-btn ${showReport ? "active" : ""}`}
                  onClick={() => {
                    setPanelMode("report");
                    setShowReport(true);
                    setShowTimeline(false);
                  }}
                >
                  <NiReport />
                  Report
                </button>
                <button
                  className={`view-report-btn ${showTimeline ? "active" : ""}`}
                  onClick={() => {
                    setPanelMode("timeline");
                    setShowReport(false);
                    setShowTimeline(true);
                  }}
                >
                  <NiSitevisit /> Timeline
                </button>
              </div>
            </>
          ))}
        {item.status === "pending" &&
          mood !== "user" &&
          panelMode !== "payment" && (
            <div class="modal-actions">
              <button
                className="view-report-btn"
                onClick={() => {
                  setPanelMode("payment");
                  setShowReport(false);
                }}
              >
                Book Now
              </button>
            </div>
          )}
        {/* {item.status === "confirmed" ||
          (item.status === "pending" && (
            <>
              <div className="table-filters">
                <button
                  className={`view-report-btn ${showReport ? "active" : ""}`}
                  onClick={() => {
                    setPanelMode("report");
                    setShowReport(true);
                    setShowTimeline(false);

                  }}
                >
                  <NiReport /> {showReport ? "Hide" : "View"}
                </button>
              </div>
              <div className="table-filters">
                <button
                  className={`view-report-btn ${showTimeline ? "active" : ""}`}
                  onClick={() => {
                    setPanelMode("timeline");
                    setShowReport(false);
                    setShowTimeline(true);
                  }}
                >
                  <NiSitevisit /> Timeline
                </button>
              </div>
            </>
          ))} */}

        {/* ================= REPORT ================= */}
        <div className={`report-view-box-right ${panelMode ? "active" : ""}`}>
          {panelMode === "payment" && (
            <>
              <h4>Payment</h4>

              <div className="field">
                <label>Payment Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData({ ...formData, mode: e.target.value })
                  }
                >
                  <option value="">Select Mode</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div className="field">
                <label>Payment Type</label>

                <select
                  value={formData.paymentType}
                  disabled={currentStage !== "booking"} // 🔥 lock for agreement & full
                  onChange={(e) => {
                    const type = e.target.value;
                    const total = Number(formData.totalAmount);

                    let autoAmount = "";

                    if (type === "booking") autoAmount = total * 0.1;
                    if (type === "agreement") autoAmount = total * 0.25;
                    if (type === "full") autoAmount = total;

                    setFormData({
                      ...formData,
                      paymentType: type,
                      restAmount: autoAmount,
                    });
                  }}
                >
                  <option value="">Select Payment Type</option>
                  <option value="booking">Booking</option>
                  <option value="agreement">Agreement</option>
                  <option value="full">Registry</option>
                </select>
              </div>
              <div className="field">
                <label>
                  Amount
                  <small style={{ fontSize: "12px", color: "green" }}>
                    ₹{formatCurrency(formData.restAmount || 0)}{" "}
                  </small>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              {(formData.mode === "upi" || formData.mode === "bank") && (
                <div className="field">
                  <label>Transaction ID *</label>
                  <input
                    placeholder="Enter Transaction ID"
                    value={formData.transactionId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transactionId: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              {(formData.mode === "upi" ||
                formData.mode === "cash" ||
                formData.mode === "cheque" ||
                formData.mode === "bank") && (
                <div className="field">
                  <label>Attachment *</label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        attachment: e.target.files[0],
                      })
                    }
                  />
                </div>
              )}
              <p>Notes : 35% cancellation charges</p>
              <div className="modal-actions">
                <button disabled={saving} onClick={handleAddPayment}>
                  Add Payment
                </button>
              </div>
            </>
          )}

          {panelMode === "timeline" && (
            <>
              <h4>Timeline</h4>
              {timeline.map((log, index) => (
                <div key={log.id} className="log-item">
                  {/* LEFT TIMELINE */}
                  <div className="log-left">
                    <div
                      className="log-dot"
                      style={{ borderColor: "var(--mood-color)" }}
                    ></div>
                    <div className="log-line"></div>
                  </div>

                  {/* RIGHT CONTENT */}
                  <div className="log-content">
                    <span>
                      {log.title} {log.by ? ` (${log.by})` : ""}
                    </span>
                    <p>{log.description} </p>
                    <span className="log-time">{formatDate(log.date)}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {panelMode === "report" && (
            <>
              <h4>Payment</h4>
              <div className="installment-box">
                {/* {paymentSummary} */}
                <div className="installment">
                  <span>Due Amount</span>
                  <span>₹{formatCurrency(paymentSummary.dueAmount)}</span>
                </div>
                <div className="installment">
                  <span>Paid Amount</span>
                  <span>₹{formatCurrency(paymentSummary.paidAmount)}</span>
                </div>
                <div className="installment">
                  <span>Total Amount</span>
                  <span>₹{formatCurrency(paymentSummary.totalAmount)}</span>
                </div>
              </div>
              <h4>Payment History</h4>
              <div className="installment-box">
                <div className="installment">
                  <span>
                    <strong>Type</strong>
                  </span>
                  <span>
                    <strong>Mode</strong>
                  </span>
                  <span>
                    <strong>Amount</strong>
                  </span>
                  <span>
                    <strong>Date</strong>
                  </span>
                </div>
                {paymentSummary?.payments?.map((i) => (
                  <div className="installment">
                    <span>{i.paymentType}</span>
                    <span>{i.paymentMode}</span>
                    <span>₹{formatCurrency(i.amount)}</span>
                    <span>{formatDate(i.createdAt)}</span>
                  </div>
                ))}
              </div>
              <h4>Payment Timeline</h4>

              <div className="installment-box">
                {/* BOOKING */}

                <div
                  className={`installment ${bookingPaid ? "paid" : "pending"}`}
                >
                  <span>Booking Amount (10%)</span>
                  <span>
                    ₹{formatCurrency(bookingAmount)}(
                    {bookingPaid ? "Paid" : "Pending"})
                  </span>
                </div>

                {/* AGREEMENT */}

                {bookingPaid && (
                  <div
                    className={`installment ${agreementPaid ? "paid" : "pending"}`}
                  >
                    <span>Agreement Amount (25%)</span>
                    <span>
                      ₹{formatCurrency(agreementAmount)} (
                      {agreementPaid ? "paid" : "pending"})
                    </span>
                  </div>
                )}
                {bookingPaid && (
                  <div
                    className={`installment ${agreementPaid ? "paid" : "pending"}`}
                  >
                    <span></span>
                    <span>
                      {agreementPaid
                        ? ""
                        : `${getRemainingDays(
                            item.paymentSchedule?.booking?.date,
                            item.paymentSchedule?.agreement?.dueDays || 30,
                          )} days remaining`}
                    </span>
                  </div>
                )}

                {/* FULL */}

                {bookingPaid && (
                  <div
                    className={`installment ${fullPaid ? "paid" : "pending"}`}
                  >
                    <span>Full Payment</span>
                    <span>
                      ₹{fullAmount.toLocaleString()}(
                      {fullPaid ? "paid" : "pending"})
                    </span>
                  </div>
                )}
                {bookingPaid && (
                  <div
                    className={`installment ${fullPaid ? "paid" : "pending"}`}
                  >
                    <span></span>
                    <span>
                      {fullPaid
                        ? ""
                        : `${getRemainingDays(
                            item.paymentSchedule?.agreement?.date ||
                              item.paymentSchedule?.booking?.date,
                            item.paymentSchedule?.full?.dueDays || 90,
                          )} days remaining`}
                    </span>
                  </div>
                )}
              </div>

              {/* NOTE */}

              <div className="payment-note">
                <strong>Note:</strong> 35% cancellation charges applicable
              </div>

              {/* PROGRESS */}

              <div className="payment-progress">
                <h5>Payment Progress</h5>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p>{Math.floor(progress)}% Paid</p>
              </div>
            </>
          )}
          {panelMode === "rating" && (
            <>
              <h4>Rate Associate</h4>

              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      cursor: "pointer",
                      fontSize: "30px",
                      color: star <= cratingData.stars ? "#FFC107" : "#d9d9d9",
                    }}
                    onClick={() =>
                      setCratingData({
                        ...cratingData,
                        stars: star,
                      })
                    }
                  >
                    <NiStar
                      key={star}
                      color={
                        star <= Math.round(cratingData.stars)
                          ? "#FFC107"
                          : "#D9D9D9"
                      }
                    />
                  </span>
                ))}
              </div>
              <p style={{ marginBottom: "1rem", justifyContent: "center" }}>
                Rate your experience with our Associate.
              </p>

              {/* <div className="field">
                <label>Review</label>

                <textarea
                  placeholder="Write your experience..."
                  value={ratingData.review}
                  onChange={(e) =>
                    setRatingData({
                      ...ratingData,
                      review: e.target.value,
                    })
                  }
                />
              </div> */}

              <div className="modal-actions">
                <button disabled={saving} onClick={handleSubmitRating}>
                  Submit Rating
                </button>
              </div>
            </>
          )}
        </div>
      </ViewModal>
    </>
  );
};

export default BookingCard;
