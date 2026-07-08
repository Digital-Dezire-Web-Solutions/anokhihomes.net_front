import React, { useState, useMemo, useEffect } from "react";
import AddLocationModal from "../Modals/AddLocationModal";
import NiSearch from "../../icons/ni-search";
import { LucidePlus } from "lucide-react";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import PaymentCard from "../Cards/PaymentCard";
import { useDispatch, useSelector } from "react-redux";
import { getBooking, getPayments } from "../../Redux/Slices/AppSlices";
import axios from "axios";
import Host from "../../Host/Host";
import { formatCurrency } from "../Utils/FormatCurrency";
import AddPaymentForm from "../UserForm/AddPaymentForm";

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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (selectedPayment) {
      setFormData(selectedPayment);
    } else {
      setFormData({});
    }
  }, [selectedPayment]);

  // console.log(booking, "booking");

  const filtered = useMemo(() => {
    return (data || []).filter((payment) => {
      const matchSearch =
        payment?.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        payment?.customer?.phone?.includes(search);

      const matchStatus =
        statusFilter === "" || payment.status === statusFilter;

      // Use paymentDate if available, otherwise createdAt
      const paymentDate = new Date(payment.paymentDate || payment.createdAt);

      const matchFrom = !fromDate || paymentDate >= new Date(fromDate);

      const matchTo = !toDate || paymentDate <= new Date(`${toDate}T23:59:59`);

      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [data, search, statusFilter, fromDate, toDate]);

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
          <label>From</label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="searchItem">
          <label>To</label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      <div className="user-card-box">
        {paginated.length === 0 ? (
          <p>No Payment Found</p>
        ) : (
          paginated
            ?.reverse()
            .map((item) => (
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
        <AddPaymentForm
          setAlert={setAlert}
          setOpen={setOpen}
          isEditMode={isEditMode}
          handleEditPayments={handleEditPayments}
        />
      </AddLocationModal>
    </div>
  );
};

export default PaymentTable;
