import React, { useEffect, useState } from "react";
import SearchSelect from "../SearchItems/SearchSelect";
import { useDispatch, useSelector } from "react-redux";
import {
  getBooking,
  getPaymentTerms,
  getSiteVisit,
  getUser,
} from "../../Redux/Slices/AppSlices";
import axios from "axios";
import Host from "../../Host/Host";
import { formatCurrency } from "../Utils/FormatCurrency";

const AddBookingForm = ({
  setAlert,
  isEditMode,
  handleEditBooking,
  setOpen,
  setPolicyOpen,
}) => {
  const dispatch = useDispatch();
  const { users, siteVisit, paymentTerms, plots } = useSelector(
    (state) => state.app,
  );
  const [customersList, setCustomersList] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    customer: "",
    plot: "",
    amount: "",
    // amountPaid: "",
    status: "",
    amountRequested: "",
  });

  useEffect(() => {
    dispatch(getUser());
    dispatch(getSiteVisit());
    dispatch(getPaymentTerms());
  }, []);

  useEffect(() => {
    if (users?.length) {
      const customers = users.filter((user) => user.role === "user");
      const agents = users.filter((user) => user.role === "agent");
      setCustomersList(customers);
      setAgentsList(agents);
    }
  }, [users]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const totalAmount = Number(selectedPlot?.price || 0);
  const paidAmount = Number(formData.amountPaid || 0);
  const siteVisitOptions = siteVisit.map((item) => ({
    ...item,
    name: item.customer?.name,
  }));

  const handleAddBooking = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      if (!selectedPlot) {
        setAlert({ message: "Please select plot", status: "Error" });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      if (!formData.requestAmount) {
        setAlert({ message: "Enter request amount", status: "Error" });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      if (!formData.termsAccepted) {
        setAlert({
          message: "Please accept terms & conditions",
          status: "Error",
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      console.log(formData, "formData");
      const res = await axios.post(
        `${Host}/api/booking/add`,
        {
          sitevisitId: formData.sitevisitId, // 🔥 IMPORTANT
          customer: formData.customer._id,
          location: formData.location?._id,
          colony: formData.colony?._id,
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
        },
      );

      setAlert({
        message: "Booking created successfully",
        status: "Success",
      });

      dispatch(getBooking());
      setOpen(false);
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Booking failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  return (
    <>
      <div className="field">
        <SearchSelect
          label="Site Visit Customer"
          placeholder="Search Customer by Name or Number"
          options={siteVisitOptions}
          value={selectedCustomer}
          onChange={(selected) => {
            setSelectedCustomer(selected);
            setFormData({
              ...formData,
              sitevisitId: selected._id,
              customer: selected.customer,
              agent: selected?.agent?._id || null,
              location: selected?.location,
              colony: selected?.colony,
            });
          }}
          displayKey="name"
          searchKeys={["name", "customer.phone"]}
          renderOption={(c) => (
            <div>
              <b>{c?.customer?.name}</b> ({c?.customer?.phone})
              <small style={{ display: "block", color: "#666" }}>
                {c?.colony?.name}, {c?.location?.name}
              </small>
            </div>
          )}
        />
      </div>
      <div className="field">
        <label>Customer Name</label>
        <input
          value={selectedCustomer?.customer?.name}
          readOnly
          placeholder="Name"
        />
      </div>
      <div className="field">
        <label>Customer Phone</label>
        <input
          value={selectedCustomer?.customer?.phone}
          readOnly
          placeholder="Phone Number"
        />
      </div>
      <div className="field">
        <SearchSelect
          label="Plots"
          placeholder="Search Plot..."
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
          searchKeys={["plotNumber", "plotType"]}
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
        <label>
          Rate{" "}
          <small style={{ fontSize: "12px", color: "green" }}>
            ₹{formatCurrency(selectedPlot?.price || 0)} / sq.ft{" "}
          </small>
        </label>
        <input
          placeholder="Rate with sqft"
          value={
            formData.pricePerSqft
              ? `₹${formData.pricePerSqft} * ${formData.plotArea} sq.ft`
              : ""
          }
          // {"₹550 * 1200 sq.ft"}
          readOnly
        />
      </div>

      <div className="field">
        <label>
          Price Request in sqft
          <small style={{ fontSize: "12px", color: "green" }}>
            ₹
            {formatCurrency(
              formData.requestAmount * formData.plotArea || 0,
            )}{" "}
          </small>
        </label>
        <input
          type="number"
          placeholder="Price Request in sqft"
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
              Notes{" "}
              <small style={{ fontSize: "12px", color: "#ff6969" }}>
                (Price Doesn't Match Allowed Range)
              </small>
              <span style={{ color: "red" }}>*</span>
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
      <p
        style={{
          color: "#ff6969",
          fontSize: "12px",
        }}
      >
        {/* <input
          style={{ width: "auto" }}
          type="checkbox"
          checked={formData.termsAccepted || false}
          onChange={(e) =>
            setFormData({ ...formData, termsAccepted: e.target.checked })
          }
        />
        Notes : 35% cancellation charges
        <span
          style={{ borderBottom: "1px solid #ff6969", cursor: "pointer" }}
          onClick={() => setPolicyOpen(true)}
        >
          Read Cancellation Policy
        </span> */}
        <div class="checkbox-wrapper-4">
          <input
            class="inp-cbx"
            id={"policy"}
            type="checkbox"
            checked={formData.termsAccepted || false}
            onChange={(e) =>
              setFormData({ ...formData, termsAccepted: e.target.checked })
            }
          />
          <label class="cbx" for={"policy"}>
            <span>
              <svg width="12px" height="10px"></svg>
            </span>
            <span
              style={{ borderBottom: "1px solid #ff6969", cursor: "pointer" }}
              onClick={() => setPolicyOpen(true)}
            >
              Notes : 35% cancellation charges Read Cancellation Policy
            </span>
          </label>
          <svg class="inline-svg">
            <symbol id="check-4" viewBox="0 0 12 10">
              <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
            </symbol>
          </svg>
        </div>
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
                message:
                  "Notes are required when amount is outside the allowed range",
                status: "Error",
              });
              setTimeout(() => setAlert(null), 3000);
              return;
            }

            if (isEditMode) {
              handleEditBooking();
            } else {
              handleAddBooking();
            }
            setOpen(false);
          }}
        >
          {saving ? "Saving..." : isEditMode ? "Update Booking" : "Book Now"}
        </button>
      </div>
    </>
  );
};

export default AddBookingForm;
