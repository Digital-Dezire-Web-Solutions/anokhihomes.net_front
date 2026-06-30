import React, { useEffect, useState } from "react";
import axios from "axios";
import Host from "../../Host/Host";
import {
    getAccountDetails,
    getPaymentTerms,
    getPlotHold,
    getPlots,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import formatDate from "../DateFormate/DateFormate";
import NiCross from "../../icons/ni-cross";
import NiTick from "../../icons/ni-tick";
import ViewModal from "../Modals/ViewModal";
import SearchSelect from "../SearchItems/SearchSelect";
import { formatCurrency } from "../Utils/FormatCurrency";

const PlotHoldCard = ({ item, mood, setAlert }) => {
    const dispatch = useDispatch();
    const { plots, userDetail, paymentTerms } = useSelector((state) => state.app);

    useEffect(() => {
        dispatch(getAccountDetails());
        dispatch(getPaymentTerms());
        dispatch(getPlots(item?.colony?._id));
    }, []);
    const token = localStorage.getItem("token");
    const [viewOpen, setViewOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [panelMode, setPanelMode] = useState(null);
    const [formData, setFormData] = useState({});
    const [policyOpen, setPolicyOpen] = useState(false);
    const plot = plots?.plots?.find((p) => p._id === item.plotId);

    useEffect(() => {
        if (plot) {
            setFormData((prev) => ({
                ...prev,
                plot: plot._id,
                plotId: plot.plotId,
                pricePerSqft: plot.price,
                plotArea: plot.area,
                priceRange: plot.priceRange,
            }));
        }
    }, [plot]);

    const handleAction = async (action) => {
        setSaving(true)
        try {
            await axios.put(
                `${Host}/api/plothold/action/${item._id}`,
                {
                    action,
                },
                {
                    headers: {
                        "auth-token": token,
                    },
                },
            );

            setAlert({
                status: "Success",
                message: `Hold ${action}d successfully`,
            });
            setTimeout(() => setAlert(null), 3000);
            dispatch(getPlotHold());
            setSaving(false)
        } catch (err) {
            setAlert({
                status: "Error",
                message: err.response?.data?.message || "Something went wrong",
            });
            setTimeout(() => setAlert(null), 3000);
            setSaving(false)
        }
    };

    const getRemainingDays = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const diff = end - today;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days <= 0) return "Expired";
        return `${days} days remaining`;
    };

    const handleAddBooking = async () => {
        setSaving(true)
        try {
            const token = localStorage.getItem("token");

            if (!plot) {
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

            console.log(formData, "formData");
            const res = await axios.post(
                `${Host}/api/booking/add`,
                {
                    holdId: item._id,
                    customer: item.customer._id,
                    location: item.location?._id,
                    colony: item.colony?._id,
                    plot: plot._id,

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
                },
            );

            setAlert({
                message: "Booking created successfully",
                status: "Success",
            });

            dispatch(getPlotHold());

            setViewOpen(false);
            setFormData({});
            setPanelMode(null);

            setTimeout(() => setAlert(null), 3000);
            setSaving(false)
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

    return (
        <div className="user-card card">
            <div className="user-card-top">
                <div className="user-card-title">
                    <div className="user-card-name">
                        <h4 style={{ textTransform: "capitalize" }}>
                            {item?.customer?.name}
                            {/* <span>({item?.agent?.name})</span> */}

                            <span
                                className={`status ${item.status === "APPROVED" || item.status === "RELEASED"
                                    ? "active"
                                    : item.status === "ACTIVE"
                                        ? "pending"
                                        : item.status === "APPROVAL"
                                            ? "pending2"
                                            : item.status === "EXPIRED" &&
                                                item.status === "REJECTED"
                                                ? "failed"
                                                : ""
                                    }`}
                            >
                                {item.status}
                            </span>
                        </h4>
                    </div>
                </div>
            </div>

            {/* <div className="user-card-top">
        <h3>{item.customer?.name}</h3>

        <span className={`status ${item.status.toLowerCase()}`}>
          {item.status}
        </span>
      </div> */}

            <div className="user-card-bottom">
                <div className="user-card-bottom-left">
                    <p>Plot</p>
                    <p>Colony</p>
                    {mood !== "agent" && <p>Associate</p>}
                    <p>Hold Type</p>
                    <p>Amount</p>
                    <p>Expires</p>
                </div>

                <div className="user-card-bottom-right">
                    <p>{plot?.plotNumber}</p>
                    <p>{item.colony?.name}</p>
                    {mood !== "agent" && <p>{item.agent?.name}</p>}
                    <p>{item.holdType}</p>
                    <p>₹{formatCurrency(item.amount)}</p>
                    {item.expiresAt && <p className="countdown">{getRemainingDays(item.expiresAt)}</p>}
                </div>
            </div>

            {(mood === "admin" || mood === "staff") && item.status === "APPROVAL" && (
                <div className="modal-actions">
                    <button
                        disabled={saving}
                        className="site-visit-approval status active"
                        onClick={() => handleAction("approve")}
                    >
                        <NiTick /> Accept
                    </button>

                    <button
                        disabled={saving}
                        className="site-visit-approval status failed"
                        onClick={() => handleAction("reject")}
                    >
                        <NiCross /> Reject
                    </button>
                </div>
            )}
            {mood !== "user" && item.status === "ACTIVE" && (
                <div className="modal-actions">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setViewOpen(true);
                            setPanelMode("booking");
                        }}
                    >
                        Request Booking
                    </button>
                </div>
            )}
            <ViewModal
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                title={"Request Booking"}
            >
                <div className={`report-view-box-right ${panelMode ? "active" : ""}`}>
                    {panelMode === "booking" && (
                        <>
                            {/* <h4>Request Booking</h4> */}
                            <div className="field">
                                <label>Colony</label>
                                <input
                                    type="text"
                                    value={item.colony?.name || ""}
                                    readOnly
                                />
                            </div>

                            <div className="field">
                                <label>Plot</label>
                                <input
                                    type="text"
                                    value={plot?.plotNumber || ""}
                                    readOnly
                                />
                            </div>

                            <div className="field">
                                <label>
                                    Rate
                                    <small
                                        style={{
                                            fontSize: "12px",
                                            color: "green",
                                        }}
                                    >
                                        ₹{plot?.price || 0} / sq.ft
                                    </small>
                                </label>

                                <input
                                    readOnly
                                    value={
                                        plot
                                            ? `₹${plot.price} × ${plot.area} sq.ft`
                                            : ""
                                    }
                                />
                            </div>

                            <div className="field">
                                <label>
                                    Price Request in sq.ft

                                    <small
                                        style={{
                                            fontSize: "12px",
                                            color: "green",
                                        }}
                                    >
                                        ₹
                                        {(Number(formData.requestAmount || 0) *
                                            Number(plot?.area || 0)).toLocaleString()}
                                    </small>
                                </label>

                                <input
                                    type="number"
                                    placeholder="Price request in sq.ft"
                                    value={formData.requestAmount || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            requestAmount: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {plot &&
                                formData.requestAmount &&
                                (
                                    Number(formData.requestAmount) < plot.priceRange.min ||
                                    Number(formData.requestAmount) > plot.priceRange.max
                                ) && (
                                    <div className="field">
                                        <label>
                                            Notes

                                            <small
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#ff6969",
                                                }}
                                            >
                                                (Price Doesn't Match Allowed Range)
                                            </small>

                                            <span style={{ color: "red" }}>*</span>
                                        </label>

                                        <textarea
                                            placeholder="Enter reason"
                                            value={formData.notes || ""}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    notes: e.target.value,
                                                })
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
                            <p
                                style={{
                                    color: "#ff6969",
                                    fontSize: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    gap: "5px",
                                    padding: "10px 0",
                                }}
                            >
                                <input
                                    style={{ width: "5%" }}
                                    type="checkbox"
                                    checked={formData.termsAccepted || false}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            termsAccepted: e.target.checked,
                                        })
                                    }
                                />
                                Notes : 35% cancellation charges
                                <span
                                    style={{
                                        borderBottom: "1px solid #ff6969",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setPolicyOpen(true)}
                                >
                                    Read Cancellation Policy
                                </span>
                            </p>

                            <div className="modal-actions">
                                <button
                                    disabled={saving}
                                    onClick={() => {
                                        if (!plot) {
                                            setAlert({
                                                message: "Please select a plot",
                                                status: "Error",
                                            });
                                            setTimeout(() => setAlert(null), 3000);
                                            return;
                                        }

                                        const requestedAmount = Number(formData.requestAmount);
                                        const min = plot.priceRange.min;
                                        const max = plot.priceRange.max;

                                        const isInRange =
                                            requestedAmount >= min && requestedAmount <= max;

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
                                                message:
                                                    "Notes are required when amount is outside the allowed range",
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
                </div>
            </ViewModal>
        </div>
    );
};

export default PlotHoldCard;
