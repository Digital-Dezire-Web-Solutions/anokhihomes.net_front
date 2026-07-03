import React, { useEffect, useState } from "react";
import SearchSelect from "../SearchItems/SearchSelect";
import { useDispatch, useSelector } from "react-redux";
import { getBooking, getPayments } from "../../Redux/Slices/AppSlices";
import { formatCurrency } from "../Utils/FormatCurrency";
import Host from "../../Host/Host";
import axios from "axios";

const AddPaymentForm = ({
  setAlert,
  setOpen,
  isEditMode,
  handleEditPayments,
}) => {
  const dispatch = useDispatch();
  const { booking } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getBooking());
  }, []);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const handleAddPayments = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // 🔥 validations
      if (!formData.paymentType) {
        return setAlert({ message: "Select payment type", status: "Error" });
        setTimeout(() => setAlert(null), 3000);
      }

      if (!formData.mode) {
        return setAlert({ message: "Select payment mode", status: "Error" });
        setTimeout(() => setAlert(null), 3000);
      }

      if (!formData.amount) {
        return setAlert({ message: "Enter amount", status: "Error" });
        setTimeout(() => setAlert(null), 3000);
      }

      if (
        (formData.mode === "UPI" || formData.mode === "Bank Transfer") &&
        !formData.transactionId
      ) {
        return setAlert({
          message: "Transaction ID required",
          status: "Error",
        });
        setTimeout(() => setAlert(null), 3000);
      }

      const payload = {
        booking: formData.booking,
        amount: Number(formData.amount),
        paymentMode: formData.mode,
        paymentType: formData.paymentType,
        transactionId: formData.transactionId || "",
      };

      console.log(payload, "payload");

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

      dispatch(getPayments());
      setFormData({});
      setOpen(false);

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Payment failed",
        status: "Error",
      });
      setOpen(false);
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  return (
    <>
      <div className="field">
        <SearchSelect
          label="Booking"
          placeholder="Search Booking..."
          options={booking?.filter((b) => b.status === "pending")}
          value={selectedBooking}
          onChange={(selected) => {
            setSelectedBooking(selected);

            setFormData({
              ...formData,
              booking: selected._id,
              customer: selected.customer,
              plot: selected.plot,
              colony: selected.colony,
              location: selected.location,
              pricePerSqft: selected.pricePerSqft,
              plotArea: selected.plotArea,
              requestAmount: selected.requestAmount,
              totalAmount: selected.finalAmount,
              amountPaid: selected.amountPaid,
            });
          }}
          displayKey="sitevisitId"
          searchKeys={["customer", "colony", "location"]}
          renderOption={(p) => (
            <div>
              <b>
                {p?.customer?.name}( {p.customer.phone})
              </b>
              {p.totalAmount ? (
                <small style={{ display: "block", color: "#666" }}>
                  Total Amount :- {p.totalAmount}
                </small>
              ) : (
                ""
              )}
            </div>
          )}
        />
      </div>
      {selectedBooking && (
        <>
          <div
            className="payment-details"
            style={{
              border: "1px solid #d4d4d4",
              borderRadius: "1.75rem",
              padding: "1rem 1rem 0 1rem",
              marginBottom: "1rem",
            }}
          >
            <span>Booking Details</span>
            <p>
              Customer :-{" "}
              <small>
                {formData?.customer?.name} ({formData?.customer?.phone})
              </small>
            </p>
            <p>
              Plot Price / sqft :-{" "}
              <small>{formatCurrency(formData?.pricePerSqft)}/sqft</small>
            </p>
            <p>
              Request Price / sqft :-{" "}
              <small>{formatCurrency(formData?.requestAmount)}/sqft</small>
            </p>
            <p>
              Plot Area :- <small>{formatCurrency(formData?.plotArea)}</small>
            </p>
            <p>
              Total Amount :-{" "}
              <small>{formatCurrency(formData?.totalAmount)}</small>
            </p>
          </div>
        </>
      )}

      <div className="field">
        <label>Payment Mode</label>
        <select
          value={formData.mode}
          onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
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
          <option value="full">Full Payment</option>
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
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
      {/* <div className="modal-actions">
                <button onClick={handleAddPayment}>Add Payment</button>
              </div> */}
      <div className="modal-actions">
        <button
          onClick={() => {
            if (isEditMode) {
              handleEditPayments();
            } else {
              handleAddPayments();
            }
            setOpen(false);
          }}
        >
          {saving ? "Saving..." : isEditMode ? "Update Payment" : "Add Payment"}
        </button>
      </div>
    </>
  );
};

export default AddPaymentForm;
