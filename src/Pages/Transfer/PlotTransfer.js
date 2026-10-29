import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import "./Transfer.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import { getBooking } from "../../Redux/Slices/AppSlices";
import BookingSelect, { BookingSummary } from "./BookingSelect";
import TransferHistory from "./TransferHistory";
import { api, errMsg, flash } from "./transferApi";
import ConfirmModal from "./ConfirmModal";

const PLC_OPTIONS = [5, 6, 7, 8, 9, 10];
const pending = (b) => ["approval", "pending"].includes(b.status);
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

const PlotTransfer = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const allowed = mood === "admin" || mood === "staff";

  const [booking, setBooking] = useState(null);
  const [plots, setPlots] = useState([]);
  const [newPlotId, setNewPlotId] = useState("");
  const [plcPercent, setPlcPercent] = useState("");
  const [rate, setRate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadPlots = async (id) => {
    try {
      setPlots(await api.get(`/options/plots/${id}`));
    } catch (err) {
      setPlots([]);
      flash(setAlert, "Error", errMsg(err, "Unable to load plots"));
    }
  };

  useEffect(() => {
    setNewPlotId("");
    setPlcPercent("");
    setNote("");
    setRate(
      booking
        ? String(booking.requestAmount || booking.pricePerSqft || "")
        : "",
    );
    if (booking?._id) loadPlots(booking._id);
    else setPlots([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?._id]);

  const newPlot = plots.find((p) => p._id === newPlotId);

  const preview = useMemo(() => {
    if (!booking || !newPlot) return null;
    const base = round2((Number(rate) || 0) * (newPlot.area || 0));
    const pct = newPlot.plc ? Number(plcPercent) || 0 : 0;
    const plc = round2((base * pct) / 100);
    const total = round2(base + plc);
    return { base, plc, total, tooLow: total < (booking.amountPaid || 0) };
  }, [booking, newPlot, rate, plcPercent]);

  const plcMissing = newPlot?.plc && !PLC_OPTIONS.includes(Number(plcPercent));

  const canSubmit =
    booking &&
    newPlot &&
    Number(rate) > 0 &&
    note.trim().length >= 3 &&
    !plcMissing &&
    !preview?.tooLow &&
    !saving;

  const submit = async () => {
    setSaving(true);
    try {
      const res = await api.post("/plot", {
        bookingId: booking._id,
        newPlotId,
        note: note.trim(),
        requestAmount: Number(rate),
        ...(newPlot.plc ? { plcPercent: Number(plcPercent) } : {}),
      });

      flash(setAlert, "Success", res.message);

      setBooking((prev) => ({
        ...prev,
        ...res.booking,
        customer: prev.customer,
        agent: prev.agent,
        colony: prev.colony,
        location: prev.location,
        notes: prev.notes,
        plot: { ...prev.plot, ...newPlot },
      }));

      setNewPlotId("");
      setPlcPercent("");
      setNote("");
      setRate(String(res.booking.requestAmount || ""));
      loadPlots(booking._id);
      setRefreshKey((k) => k + 1);
      dispatch(getBooking());
    } catch (err) {
      flash(setAlert, "Error", errMsg(err, "Plot transfer failed"));
    }
    setSaving(false);
    setConfirmOpen(false);
  };

  if (!allowed) {
    return (
      <div className="plot-container">
        <h3>Only admin or staff can transfer plots.</h3>
      </div>
    );
  }

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Plot Transfer</h2>
          <Breadcrumb />
        </div>
      </div>

      <div className="transfer-layout">
        <div className="card transfer-card plot-modal">
          <h4>1. Select booking</h4>
          <BookingSelect
            label="Pending booking"
            filter={pending}
            value={booking}
            onChange={setBooking}
          />
          <BookingSummary b={booking} />
        </div>

        <div className="card transfer-card plot-modal">
          <h4>2. Move to another plot</h4>

          {!booking ? (
            <p className="transfer-note">Select a booking first.</p>
          ) : (
            <>
              <p className="transfer-note">
                Only plots of {booking.colony?.name} that are for sale can be
                chosen. The current plot goes back on sale.
              </p>

              <div className="field">
                <label>New plot *</label>
                <CustomSelect
                  value={newPlotId}
                  onChange={setNewPlotId}
                  placeholder="Select plot"
                  options={[
                    { value: "", label: "Select plot" },
                    ...plots.map((p) => ({
                      value: p._id,
                      label: `${p.plotNumber} · ${formatCurrency(p.area)} sqft · ₹${formatCurrency(p.price)}/sqft${p.plc ? " · PLC" : ""}`,
                    })),
                  ]}
                />
                {plots.length === 0 && (
                  <p className="transfer-note">
                    No plots are for sale in this colony.
                  </p>
                )}
              </div>

              {newPlot?.plc && (
                <div className="field">
                  <label>PLC percentage *</label>
                  <CustomSelect
                    value={plcPercent}
                    onChange={setPlcPercent}
                    placeholder="Select PLC %"
                    options={[
                      { value: "", label: "Select PLC %" },
                      ...PLC_OPTIONS.map((p) => ({
                        value: String(p),
                        label: `${p}%`,
                      })),
                    ]}
                  />
                </div>
              )}

              <div className="field">
                <label>Rate (₹ / sqft) *</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>

              {preview && (
                <div className="installment-box">
                  <div className="installment">
                    <span>Base amount</span>
                    <span>₹{formatCurrency(preview.base)}</span>
                  </div>
                  {newPlot.plc && (
                    <div className="installment">
                      <span>PLC ({plcPercent || 0}%)</span>
                      <span>₹{formatCurrency(preview.plc)}</span>
                    </div>
                  )}
                  <div className="installment">
                    <span>
                      <strong>New total</strong>
                    </span>
                    <span>
                      <strong>₹{formatCurrency(preview.total)}</strong>
                    </span>
                  </div>
                  <div className="installment">
                    <span>Already paid</span>
                    <span>₹{formatCurrency(booking.amountPaid)}</span>
                  </div>
                </div>
              )}

              {preview?.tooLow && (
                <div className="transfer-error">
                  The amount already paid is more than the new total. Pick a
                  bigger plot or change the rate.
                </div>
              )}

              <div className="field">
                <label>Reason / note *</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Why is the plot being changed?"
                />
              </div>

              <div className="modal-actions">
                <button
                  disabled={!canSubmit}
                  onClick={() => setConfirmOpen(true)}
                >
                  {saving ? "Transferring..." : "Transfer plot"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <TransferHistory
        bookingId={booking?._id}
        type="plot"
        refreshKey={refreshKey}
      />
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Plot Transfer"
        message={`The old plot ${booking?.plot?.plotNumber || ""} will go back on sale.`}
        details={
          booking && newPlot && preview
            ? [
                ["Customer", booking.customer?.name],
                ["From plot", booking.plot?.plotNumber],
                ["To plot", newPlot.plotNumber],
                ["Current total", `₹${formatCurrency(booking.finalAmount)}`],
                ["New total", `₹${formatCurrency(preview.total)}`],
              ]
            : []
        }
        confirmText="Yes, transfer"
        loading={saving}
        onConfirm={submit}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default PlotTransfer;
