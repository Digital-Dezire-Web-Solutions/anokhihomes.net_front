import React, { useState, useMemo, useEffect } from "react";
import AddLocationModal from "../Modals/AddLocationModal";
import NiSearch from "../../icons/ni-search";
import { LucidePlus } from "lucide-react";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import PaymentCard from "../Cards/PaymentCard";
import SearchSelect from "../SearchItems/SearchSelect";
import { useDispatch, useSelector } from "react-redux";
import { getBooking, getPayments } from "../../Redux/Slices/AppSlices";
import axios from "axios";
import Host from "../../Host/Host";
import { formatCurrency } from "../Utils/FormatCurrency";

const ITEMS_PER_PAGE = 15;

const PaymentTable = ({ data, mood, setAlert }) => {
  const dispatch = useDispatch();
  const { booking } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getBooking());
  }, []);


  // console.log(data,"data")

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedPayment) {
      setFormData(selectedPayment);
    } else {
      setFormData({});
    }
  }, [selectedPayment]);

  // console.log(booking, "booking");

  const filtered = useMemo(() => {
    return data?.filter((payment) => {
      const matchSearch =
        payment?.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        payment?.customer?.phone.includes(search);

      const matchStatus =
        statusFilter === "" || payment.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, data]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // const handleAddPayments = () => {
  //   console.log("Adding Payment:", formData);
  //   setOpen(false);
  //   setAlert({ message: "Payment added successfully!", status: "Success" });
  //   setTimeout(() => {
  //     setAlert(null);
  //   }, 5000);
  // };
  const handleEditPayments = () => {
    console.log("Editing Payment:", formData);
    setOpen(false);
    setAlert({ message: "Payment updated successfully!", status: "Success" });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  // console.log(selectedBooking, "selectedBooking");
  const handleAddPayments = async () => {
    setSaving(true)
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
        booking: formData.booking,
        amount: Number(formData.amount),
        paymentMode: formData.mode,
        paymentType: formData.paymentType,
        transactionId: formData.transactionId || "",
      };

      console.log(payload, "payload")

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
      setSaving(false)
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Payment failed",
        status: "Error",
      });
      setOpen(false);
      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    }
  };

  return (
    <div>
      <div className="filter-grid page-tools table-filters">
        {mood === "admin" && (
          <button
            className="add-button"
            onClick={() => {
              setSelectedPayment(null);
              setIsEditMode(false);
              setOpen(true);
            }}
          >
            <LucidePlus /> Add
          </button>
        )}
        <div className="searchItem">
          <NiSearch />
          <input
            placeholder="Search name / phone"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="searchItem">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="searchItem">
          <input
            type="date"
            // value={dateFilter}
            onChange={(e) => {
              // setDateFilter(e.target.value);
              // setPage(1);
            }}
          />
        </div>
      </div>
      <div className="user-card-box">
        {paginated.length === 0 ? (
          <p>No Payment Found</p>
        ) : (
          paginated?.reverse().map((item) => (
            <PaymentCard
              item={item}
              setSelectedPayment={setSelectedPayment}
              setIsEditMode={setIsEditMode}
              setOpen={setOpen}
              mood={mood}
              setAlert={setAlert}
            />
          ))
        )}
      </div>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? "Edit Payment" : "Add Payment"}
      >
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
                amountPaid: selected.amountPaid
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
            <div className="payment-details" style={{ border: "1px solid #d4d4d4", borderRadius: "1.75rem", padding: "1rem 1rem 0 1rem", marginBottom: "1rem" }}>
              <span>Booking Details</span>
              <p>Customer :- <small>{formData?.customer?.name} ({formData?.customer?.phone})</small></p>
              <p>Plot Price / sqft :- <small>{formatCurrency(formData?.pricePerSqft)}/sqft</small></p>
              <p>Request Price / sqft :- <small>{formatCurrency(formData?.requestAmount)}/sqft</small></p>
              <p>Plot Area :- <small>{formatCurrency(formData?.plotArea)}</small></p>
              <p>Total Amount :- <small>{formatCurrency(formData?.totalAmount)}</small></p>
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
      </AddLocationModal>
    </div>
  );
};

export default PaymentTable;
