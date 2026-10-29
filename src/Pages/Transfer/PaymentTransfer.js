import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Transfer.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import SearchSelect from "../../components/SearchItems/SearchSelect";
import formatDate from "../../components/DateFormate/DateFormate";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import { getBooking, getUser } from "../../Redux/Slices/AppSlices";
import BookingSelect, { BookingSummary } from "./BookingSelect";
import TransferHistory from "./TransferHistory";
import { api, errMsg, flash } from "./transferApi";
import ConfirmModal from "./ConfirmModal";

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const hasMoney = (b) =>
  ["approval", "pending"].includes(b.status) && Number(b.amountPaid) > 0;

const PaymentTransfer = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.app);
  const allowed = mood === "admin" || mood === "staff";

  const [source, setSource] = useState(null);
  const [payments, setPayments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [mode, setMode] = useState("other"); // other | same
  const [customer, setCustomer] = useState(null);
  const [targets, setTargets] = useState([]);
  const [targetId, setTargetId] = useState("");
  const [action, setAction] = useState("keep"); // keep | release
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    dispatch(getUser());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPayments = async (id) => {
    try {
      const list = await api.get(`/options/payments/${id}`);
      setPayments(list);
      setSelected(list.map((p) => p._id)); // all selected by default
    } catch (err) {
      setPayments([]);
      setSelected([]);
      flash(setAlert, "Error", errMsg(err, "Unable to load payments"));
    }
  };

  // new source booking: start fresh
  useEffect(() => {
    setMode("other");
    setCustomer(null);
    setTargets([]);
    setTargetId("");
    setAction("keep");
    setNote("");
    if (source?._id) loadPayments(source._id);
    else {
      setPayments([]);
      setSelected([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?._id]);

  // bookings of the customer the money goes to
  const targetCustomerId =
    mode === "same" ? source?.customer?._id : customer?._id;

  useEffect(() => {
    setTargetId("");
    if (!source?._id || !targetCustomerId) {
      setTargets([]);
      return;
    }
    let ignore = false;
    api
      .get(`/options/bookings/${targetCustomerId}?exclude=${source._id}`)
      .then((data) => !ignore && setTargets(data))
      .catch(() => !ignore && setTargets([]));
    return () => {
      ignore = true;
    };
  }, [source?._id, targetCustomerId, refreshKey]);

  const customers = useMemo(
    () =>
      (users || []).filter(
        (u) => u.role === "user" && u._id !== source?.customer?._id,
      ),
    [users, source],
  );

  const moved = round2(
    payments
      .filter((p) => selected.includes(p._id))
      .reduce((s, p) => s + (p.amount || 0), 0),
  );
  const allSelected =
    payments.length > 0 && selected.length === payments.length;
  const effectiveAction = allSelected ? action : "keep";

  const target = targets.find((t) => t._id === targetId);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const targetOption = (t) => {
    const sameAgent = String(t.agent) === String(source?.agent?._id);
    const fits = t.canTake + 0.005 >= moved;
    let suffix = "";
    if (!sameAgent) suffix = " — different associate";
    else if (!fits) suffix = ` — can take only ₹${formatCurrency(t.canTake)}`;

    return {
      value: t._id,
      label: `${t.plotNumber || "-"}, ${t.colonyName || ""} · total ₹${formatCurrency(t.finalAmount)}${suffix}`,
      disabled: !sameAgent || !fits,
    };
  };

  const canSubmit =
    source &&
    selected.length > 0 &&
    target &&
    note.trim().length >= 3 &&
    !saving;

  const submit = async () => {
    setSaving(true);
    try {
      const res = await api.post("/payment", {
        sourceBookingId: source._id,
        targetBookingId: targetId,
        paymentIds: selected,
        note: note.trim(),
        sourceAction: effectiveAction,
      });

      flash(setAlert, "Success", res.message);

      setSource((prev) => ({
        ...prev,
        amountPaid: res.source.amountPaid,
        status: res.source.status,
      }));
      setNote("");
      setAction("keep");
      setTargetId("");
      loadPayments(source._id);
      setRefreshKey((k) => k + 1);
      dispatch(getBooking());
    } catch (err) {
      flash(setAlert, "Error", errMsg(err, "Payment transfer failed"));
    }
    setSaving(false);
    setConfirmOpen(false);
  };

  if (!allowed) {
    return (
      <div className="plot-container">
        <h3>Only admin or staff can transfer payments.</h3>
      </div>
    );
  }

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Payment Transfer</h2>
          <Breadcrumb />
        </div>
      </div>

      <div className="transfer-layout">
        {/* ---------- FROM ---------- */}
        <div className="card transfer-card plot-modal">
          <h4>1. Transfer from</h4>
          <BookingSelect
            label="Booking with payments"
            filter={hasMoney}
            value={source}
            onChange={setSource}
          />
          <BookingSummary b={source} />

          {source && (
            <>
              <h4>Payments to move</h4>
              {payments.length === 0 ? (
                <p className="transfer-note">No approved payments found.</p>
              ) : (
                <div className="transfer-pay-list">
                  <label className="transfer-pay-item">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        setSelected(
                          allSelected ? [] : payments.map((p) => p._id),
                        )
                      }
                    />
                    <span className="grow">Select all</span>
                  </label>

                  {payments.map((p) => (
                    <label
                      key={p._id}
                      className={`transfer-pay-item ${selected.includes(p._id) ? "active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(p._id)}
                        onChange={() => toggle(p._id)}
                      />
                      <span className="grow">
                        <span style={{ textTransform: "capitalize" }}>
                          {p.paymentType}
                        </span>{" "}
                        ·{" "}
                        <span style={{ textTransform: "uppercase" }}>
                          {p.paymentMode}
                        </span>
                        <small>
                          {formatDate(p.paymentDate || p.createdAt)}
                          {p.receiptNo ? ` · ${p.receiptNo}` : ""}
                        </small>
                      </span>
                      <strong>₹{formatCurrency(p.amount)}</strong>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ---------- TO ---------- */}
        <div className="card transfer-card plot-modal">
          <h4>2. Transfer to</h4>

          {!source ? (
            <p className="transfer-note">Select a booking first.</p>
          ) : (
            <>
              <div className="transfer-radio-group">
                <label
                  className={`transfer-radio ${mode === "other" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    checked={mode === "other"}
                    onChange={() => {
                      setMode("other");
                      setCustomer(null);
                    }}
                  />
                  Another customer
                </label>
                <label
                  className={`transfer-radio ${mode === "same" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    checked={mode === "same"}
                    onChange={() => setMode("same")}
                  />
                  Another booking of {source.customer?.name}
                </label>
              </div>

              {mode === "other" && (
                <div className="field">
                  <SearchSelect
                    label="Customer"
                    placeholder="Search customer by name or number"
                    options={customers}
                    value={customer}
                    onChange={setCustomer}
                    displayKey="name"
                    searchKeys={["name", "phone"]}
                    renderOption={(c) => (
                      <div>
                        <b>{c.name}</b> ({c.phone})
                      </div>
                    )}
                  />
                </div>
              )}

              {(mode === "same" || customer) && (
                <div className="field">
                  <label>Booking *</label>
                  <CustomSelect
                    value={targetId}
                    onChange={setTargetId}
                    placeholder="Select booking"
                    options={[
                      { value: "", label: "Select booking" },
                      ...targets.map(targetOption),
                    ]}
                  />
                  {targets.length === 0 && (
                    <p className="transfer-note">
                      No pending bookings found for this customer.
                    </p>
                  )}
                </div>
              )}

              <p className="transfer-note">
                Money can only move between bookings of the same associate.
              </p>

              {payments.length > 0 && (
                <>
                  <h4>What happens to the source booking?</h4>
                  <div className="transfer-radio-group">
                    <label
                      className={`transfer-radio ${effectiveAction === "keep" ? "active" : ""}`}
                    >
                      <input
                        type="radio"
                        checked={effectiveAction === "keep"}
                        onChange={() => setAction("keep")}
                      />
                      Keep the booking (plot stays booked)
                    </label>
                    <label
                      className={`transfer-radio ${effectiveAction === "release" ? "active" : ""} ${allSelected ? "" : "disabled"}`}
                    >
                      <input
                        type="radio"
                        disabled={!allSelected}
                        checked={effectiveAction === "release"}
                        onChange={() => setAction("release")}
                      />
                      Free the plot (cancel this booking, plot back on sale)
                    </label>
                  </div>
                  {!allSelected && (
                    <p className="transfer-note">
                      To free the plot, select all payments of the booking.
                    </p>
                  )}
                </>
              )}

              {selected.length > 0 && (
                <div className="installment-box">
                  <div className="installment">
                    <span>
                      <strong>Amount to transfer</strong>
                    </span>
                    <span>
                      <strong>₹{formatCurrency(moved)}</strong>
                    </span>
                  </div>
                  {target && (
                    <div className="installment">
                      <span>Target can still take</span>
                      <span>₹{formatCurrency(target.canTake)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="field">
                <label>Reason / note *</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Why is the payment being moved?"
                />
              </div>

              <div className="modal-actions">
                <button disabled={!canSubmit} onClick={() => setConfirmOpen(true)}>
                  {saving ? "Transferring..." : "Transfer payment"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <TransferHistory
        bookingId={source?._id}
        type="payment"
        refreshKey={refreshKey}
      />
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Payment Transfer"
        message={
          effectiveAction === "release"
            ? "The source booking will be cancelled and its plot put back on sale."
            : "The source booking will stay as it is."
        }
        details={
          source && target
            ? [
                ["Amount", `₹${formatCurrency(moved)}`],
                [
                  "From",
                  `${source.customer?.name} · plot ${source.plot?.plotNumber}`,
                ],
                [
                  "To",
                  `${mode === "same" ? source.customer?.name : customer?.name} · plot ${target.plotNumber}`,
                ],
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

export default PaymentTransfer;
