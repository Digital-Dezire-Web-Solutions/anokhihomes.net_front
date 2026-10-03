import React, { useEffect, useRef, useState } from "react";
import AddLocationModal from "./AddLocationModal";
import { formatCurrency } from "../Utils/FormatCurrency";
import "./Paymentamountmodal.css";

const MODES = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
  { value: "bank", label: "Bank Transfer" },
];

const TYPES = [
  { value: "booking", label: "Booking" },
  { value: "agreement", label: "Agreement" },
  { value: "full", label: "Registry" },
];

const TYPE_LABEL = { booking: "Booking", agreement: "Agreement", full: "Registry" };

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// "1234567.5" -> "12,34,567.5" (Indian grouping)
const formatAmount = (raw) => {
  if (!raw) return "";
  const [int, dec] = raw.split(".");
  const head = int ? Number(int).toLocaleString("en-IN") : "0";
  return dec !== undefined ? `${head}.${dec}` : head;
};

// keep digits + one dot, max 2 decimals, no leading zeros
const sanitize = (value) => {
  let s = value.replace(/[^\d.]/g, "");
  const i = s.indexOf(".");
  if (i !== -1) {
    s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "").slice(0, 2);
  }
  return s.replace(/^0+(?=\d)/, "");
};

/*
  Props
  - open, onClose
  - customerName, plotLabel   : header text
  - total, remaining          : booking totals (numbers)
  - stage                     : "booking" | "agreement" | "full"  (current installment)
  - schedule                  : { booking, agreement, full } installment amounts
  - saving                    : disables the button while the request runs
  - onSubmit({ amount, mode, paymentType, transactionId, attachment })
*/
const PaymentAmountModal = ({
  open,
  onClose,
  customerName,
  plotLabel,
  total = 0,
  remaining = 0,
  stage = "booking",
  schedule = {},
  saving = false,
  onSubmit,
}) => {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("");
  const [type, setType] = useState(stage);
  const [txn, setTxn] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Suggested amount for a payment type. The current installment uses the
  // booking's schedule; other types (only selectable at booking stage) use
  // the same percentages as before.
  const suggest = (t) => {
    if (t === stage && schedule[t]) return round2(schedule[t]);
    if (t === "booking") return round2(total * 0.1);
    if (t === "agreement") return round2(total * 0.25);
    return round2(total);
  };

  useEffect(() => {
    if (!open) return;
    setType(stage);
    setAmount(String(suggest(stage) || ""));
    setMode("");
    setTxn("");
    setFile(null);
    setError("");
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const display = formatAmount(amount);
  const hint = suggest(type);
  const fontSize =
    display.length > 13 ? "2rem" : display.length > 9 ? "2.6rem" : "3.4rem";

  const changeType = (t) => {
    setType(t);
    setAmount(String(suggest(t) || ""));
    setError("");
  };

  const submit = () => {
    const n = Number(amount);
    if (!n || n <= 0) return setError("Enter an amount");
    if (remaining > 0 && n > remaining + 0.005)
      return setError(
        `Amount can't be more than the remaining ₹${formatCurrency(remaining)}`,
      );
    if (!mode) return setError("Select a payment mode");
    if ((mode === "upi" || mode === "bank") && !txn.trim())
      return setError("Transaction ID is required");

    setError("");
    onSubmit({
      amount: n,
      mode,
      paymentType: type,
      transactionId: txn.trim(),
      attachment: file,
    });
  };

  return (
    <AddLocationModal open={open} onClose={onClose} title="Add Payment">
      <div className="pay-modal">
        <div className="pay-hero">
          <p className="pay-for">{customerName}</p>
          {plotLabel && <p className="pay-sub">{plotLabel}</p>}
        </div>

        <div className="pay-amount">
          <span className="pay-rupee" aria-hidden="true">
            ₹
          </span>
          <input
            ref={inputRef}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            aria-label="Amount in rupees"
            value={display}
            style={{ fontSize, width: `${Math.max(display.length, 1)}ch` }}
            onChange={(e) => {
              setAmount(sanitize(e.target.value));
              setError("");
            }}
          />
        </div>

        <div className="pay-hints">
          {hint > 0 && Number(amount) !== hint && (
            <button
              type="button"
              className="pay-pill"
              onClick={() => setAmount(String(hint))}
            >
              Use {TYPE_LABEL[type]} amount ₹{formatCurrency(hint)}
            </button>
          )}
          <span className="pay-remaining">
            Remaining ₹{formatCurrency(remaining)}
          </span>
        </div>

        {stage === "booking" ? (
          <div className="pay-field">
            <span className="pay-label">Payment type</span>
            <div className="pay-chips" role="group" aria-label="Payment type">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={type === t.value}
                  className={type === t.value ? "active" : ""}
                  onClick={() => changeType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="pay-stage">{TYPE_LABEL[type]} payment</p>
        )}

        <div className="pay-field">
          <span className="pay-label">Payment mode</span>
          <div className="pay-chips" role="group" aria-label="Payment mode">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                aria-pressed={mode === m.value}
                className={mode === m.value ? "active" : ""}
                onClick={() => {
                  setMode(m.value);
                  setError("");
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {(mode === "upi" || mode === "bank") && (
          <div className="field">
            <label htmlFor="pay-txn">Transaction ID *</label>
            <input
              id="pay-txn"
              placeholder="Enter Transaction ID"
              value={txn}
              onChange={(e) => setTxn(e.target.value)}
            />
          </div>
        )}

        {mode && (
          <div className="field">
            <label htmlFor="pay-file">Attachment (receipt / screenshot)</label>
            <input
              id="pay-file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </div>
        )}

        <p className="pay-note">35% cancellation charges applicable</p>

        {error && (
          <p className="pay-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" disabled={saving} onClick={submit}>
            {saving ? "Processing..." : `Pay ₹${display || "0"}`}
          </button>
        </div>
      </div>
    </AddLocationModal>
  );
};

export default PaymentAmountModal;