import React, { useEffect, useState } from "react";
import formatDate from "../../components/DateFormate/DateFormate";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import { api } from "./transferApi";

const TITLE = {
  plot: "Plot transfer",
  payment: "Payment transfer",
  agent: "Associate transfer",
};

const describe = (h) => {
  const f = h.from || {};
  const t = h.to || {};

  if (h.type === "plot") {
    return {
      from: `Plot ${f.plotNumber || "-"} (${f.colonyName || "-"})`,
      to: `Plot ${t.plotNumber || "-"}`,
      extra: `Total ₹${formatCurrency(h.amountBefore)} → ₹${formatCurrency(h.amountAfter)}`,
    };
  }

  if (h.type === "payment") {
    return {
      from: `${f.customerName || "-"} · Plot ${f.plotNumber || "-"}`,
      to: `${t.customerName || "-"} · Plot ${t.plotNumber || "-"}`,
      extra: `₹${formatCurrency(h.amount)} (${h.payments?.length || 0} payment${h.payments?.length === 1 ? "" : "s"})${h.sourceAction === "release" ? " · plot released" : ""}`,
    };
  }

  return {
    from: `${f.agentName || "-"} (${f.agentReferralId || "-"})`,
    to: `${t.agentName || "-"} (${t.agentReferralId || "-"})`,
    extra: h.incomeNeedsReview
      ? "Commission already credited needs review"
      : "",
  };
};

const TransferHistory = ({ bookingId, type, refreshKey = 0 }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setRows([]);
      return;
    }
    let ignore = false;
    setLoading(true);

    api
      .get(`/history/booking/${bookingId}`)
      .then((data) => !ignore && setRows(data))
      .catch(() => !ignore && setRows([]))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [bookingId, refreshKey]);

  if (!bookingId) return null;

  const list = type ? rows.filter((r) => r.type === type) : rows;

  return (
    <div className="transfer-history">
      <h4>Transfer History</h4>

      {loading ? (
        <p>Loading...</p>
      ) : list.length === 0 ? (
        <p className="transfer-note">No transfers yet for this booking.</p>
      ) : (
        list.map((h) => {
          const d = describe(h);
          return (
            <div className="card history-card" key={h._id}>
              <h5>
                <strong>{TITLE[h.type]}</strong>
              </h5>
              <p>
                <strong>From :</strong> {d.from}
              </p>
              <p>
                <strong>To :</strong> {d.to}
              </p>
              {d.extra && <p>{d.extra}</p>}
              <p>
                <strong>Reason :</strong> {h.note}
              </p>
              <p>
                <strong>By :</strong> {h.transferredBy?.name || "-"} ·{" "}
                {formatDate(h.createdAt)}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TransferHistory;