import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import SearchSelect from "../../components/SearchItems/SearchSelect";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import { getBooking } from "../../Redux/Slices/AppSlices";

const BookingSelect = ({ label = "Booking", filter, value, onChange }) => {
  const dispatch = useDispatch();
  const { booking } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getBooking());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const options = useMemo(
    () =>
      (booking || [])
        .filter((b) => (filter ? filter(b) : true))
        .map((b) => ({
          ...b,
          name: b.customer?.name || "-",
          phone: b.customer?.phone || "",
          plotLabel: `${b.plot?.plotNumber || "-"}, ${b.colony?.name || ""}`,
          agentName: b.agent?.name || "",
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [booking],
  );

  return (
    <div className="field">
      <SearchSelect
        label={label}
        placeholder="Search customer / phone / plot / associate"
        options={options}
        value={value}
        onChange={onChange}
        displayKey="name"
        searchKeys={["name", "phone", "plotLabel", "agentName"]}
        renderOption={(b) => (
          <div>
            <b>{b.name}</b> ({b.phone})
            <small style={{ display: "block" }}>
              {b.plotLabel} · {b.agentName} · ₹{formatCurrency(b.finalAmount)}
            </small>
          </div>
        )}
      />
    </div>
  );
};

export const BookingSummary = ({ b }) => {
  if (!b) return null;
  const remaining = Math.max((b.finalAmount || 0) - (b.amountPaid || 0), 0);

  return (
    <div className="summary-card">
      <h4 style={{ textTransform: "capitalize" }}>{b.customer?.name}</h4>
      <p>
        <strong>Plot :</strong> {b.plot?.plotNumber}, {b.colony?.name}
      </p>
      <p>
        <strong>Associate :</strong> {b.agent?.name || "-"}
      </p>
      <p>
        <strong>Area :</strong> {formatCurrency(b.plotArea)} sqft
      </p>
      <p>
        <strong>Total :</strong> ₹{formatCurrency(b.finalAmount)}
      </p>
      <p>
        <strong>Paid :</strong> ₹{formatCurrency(b.amountPaid)}
      </p>
      <p>
        <strong>Remaining :</strong> ₹{formatCurrency(remaining)}
      </p>
      <p>
        <strong>Status :</strong>{" "}
        <span
          style={{ textTransform: "capitalize" }}
          className={`status ${b.status === "confirmed" ? "active" : "pending"}`}
        >
          {b.status}
        </span>
      </p>
    </div>
  );
};

export default BookingSelect;
