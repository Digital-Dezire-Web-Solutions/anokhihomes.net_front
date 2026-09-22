import React, { useEffect, useMemo, useState } from "react";
import "./Booking.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { LucidePlus } from "lucide-react";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import NiSearch from "../../icons/ni-search";
import BookingCard from "../../components/Cards/BookingCard";
import BookingData from "../../components/Data/BookingData";
// import SearchSelect from "../../components/SearchItems/SearchSelect";
import CancellationPolicy from "../../components/Policies/CancellationPolicy";
import { useDispatch, useSelector } from "react-redux";
import {
  getAccountDetails,
  getBooking,
  getPaymentTerms,
  getPlots,
  getSiteVisit,
  getUser,
} from "../../Redux/Slices/AppSlices";
import axios from "axios";
import Host from "../../Host/Host";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import AddBookingForm from "../../components/UserForm/AddBookingForm";
import Pagination from "../../components/Pagination/Pagination";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatDate from "../../components/DateFormate/DateFormate";
const ITEMS_PER_PAGE = 12;

const Booking = ({ mood, setAlert, landingPage }) => {
  const dispatch = useDispatch();
  const { userDetail, booking, users, siteVisit, plots, paymentTerms } =
    useSelector((state) => state.app);
  const [customersList, setCustomersList] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getBooking());
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

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState();
  const [policyOpen, setPolicyOpen] = useState(false);

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
    if (selectedBooking) {
      setFormData(selectedBooking);
    } else {
      setFormData({
        id: "",
        customer: "",
        plot: "",
        amount: "",
        // amountPaid: "",
        status: "",
        amountRequested: "",
      });
    }
  }, [selectedBooking]);

  useEffect(() => {
    if (formData?.colony) {
      dispatch(getPlots(formData?.colony?._id));
    }
  }, [formData?.colony?._id]);

  // console.log(booking, "booking")
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  // console.log(filter, "filter");

  const PRIORITY_STATUS = "pending"; // status that pins to the top

  const filteredData = useMemo(() => {
    const base = (booking || []).filter((d) => {
      const matchStatus = filter === "all" || d?.status === filter;
      const matchSearch =
        !search ||
        d?.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        d?.customer?.phone?.includes(search);
      return matchStatus && matchSearch;
    });

    return base.sort((a, b) => {
      const aTop = a?.status?.toLowerCase() === PRIORITY_STATUS ? 0 : 1;
      const bTop = b?.status?.toLowerCase() === PRIORITY_STATUS ? 0 : 1;
      if (aTop !== bTop) return aTop - bTop;
      return new Date(b?.createdAt) - new Date(a?.createdAt);
    });
  }, [booking, filter, search]);

  // reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // const handleAddBooking = () => {
  //   const newBooking = {
  //     ...formData,
  //     status: mood === "admin" ? "Confirmed" : "Pending",
  //   };
  //   console.log("Adding booking:", newBooking);
  //   setOpen(false);
  //   setAlert({
  //     message: `Plot ${newBooking.plot} has been booked successfully!`,
  //     status: "Success",
  //   });
  //   setTimeout(() => {
  //     setAlert(null);
  //   }, 5000);
  // };
  // const handleAddBooking = async () => {
  //   setSaving(true);
  //   try {
  //     const token = localStorage.getItem("token");

  //     if (!selectedPlot) {
  //       setAlert({ message: "Please select plot", status: "Error" });
  //       setTimeout(() => setAlert(null), 3000);
  //       return;
  //     }

  //     if (!formData.requestAmount) {
  //       setAlert({ message: "Enter request amount", status: "Error" });
  //       setTimeout(() => setAlert(null), 3000);
  //       return;
  //     }

  //     if (!formData.termsAccepted) {
  //       setAlert({
  //         message: "Please accept terms & conditions",
  //         status: "Error",
  //       });
  //       setTimeout(() => setAlert(null), 3000);
  //       return;
  //     }

  //     console.log(formData, "formData");
  //     const res = await axios.post(
  //       `${Host}/api/booking/add`,
  //       {
  //         sitevisitId: formData.sitevisitId, // 🔥 IMPORTANT
  //         customer: formData.customer._id,
  //         location: formData.location?._id,
  //         colony: formData.colony?._id,
  //         plot: selectedPlot._id, // 🔥 IMPORTANT

  //         requestAmount: formData.requestAmount,

  //         bookingDays: formData.bookingDays,
  //         agreementDays: formData.agreementDays,
  //         fullPaymentDays: formData.fullPaymentDays,

  //         termsAccepted: formData.termsAccepted,
  //       },
  //       {
  //         headers: {
  //           "auth-token": token,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );

  //     setAlert({
  //       message: "Booking created successfully",
  //       status: "Success",
  //     });

  //     dispatch(getBooking());
  //     setOpen(false);
  //     setTimeout(() => setAlert(null), 3000);
  //     setSaving(false);
  //   } catch (err) {
  //     console.error(err);
  //     setAlert({
  //       message: err.response?.data?.message || "Booking failed",
  //       status: "Error",
  //     });
  //     setTimeout(() => setAlert(null), 3000);
  //     setSaving(false);
  //   }
  // };

  const handleEditBooking = () => {
    setSaving(true);
    console.log("Editing booking:", formData);
    setOpen(false);
    setAlert({ message: "Booking updated successfully!", status: "Success" });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
    setSaving(false);
  };

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const totalAmount = Number(selectedPlot?.price || 0);
  const paidAmount = Number(formData.amountPaid || 0);
  const siteVisitOptions = siteVisit.map((item) => ({
    ...item,
    name: item.customer?.name,
  }));

  const [exportOpen, setExportOpen] = useState(false);

  const EXPORT_COLUMNS = [
    "S.No",
    "Date",
    "Customer",
    "Phone",
    "Associate",
    "Location",
    "Colony",
    "Plot",
    "Total Amount",
    "Amount Paid",
    "Status",
  ];

  const fmt2 = (n) => (Number(n) || 0).toFixed(2);

  const capitalize = (str) => {
    if (!str) return "-";
    return str
      .toString()
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getExportRows = () => {
    return (filteredData || []).map((item, index) => ({
      "S.No": index + 1,
      Date: formatDate(item?.createdAt) || "-",
      Customer: item?.customer?.name || "-",
      Phone: item?.customer?.phone || "-",
      Associate: item?.agent?.name || "-",
      Location: item?.location?.name || "-",
      Colony: item?.colony?.name || "-",
      Plot: item?.plot?.plotNumber || "-",
      "Total Amount": fmt2(item?.finalAmount),
      "Amount Paid": fmt2(item?.amountPaid),
      Status: capitalize(item?.status),
    }));
  };

  /* =====================================================
   EXPORT EXCEL
===================================================== */
  const exportToExcel = () => {
    const rows = getExportRows();

    if (!rows.length) {
      setAlert({ message: "No booking data to export", status: "Error" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const columnWidths = Object.keys(rows[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...rows.map((row) => String(row[key] ?? "").length),
      );
      return { wch: Math.min(maxLength + 3, 40) };
    });

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    XLSX.writeFile(workbook, "bookings-report.xlsx");

    setAlert({ message: "Excel exported successfully", status: "Success" });
    setTimeout(() => setAlert(null), 3000);
    setExportOpen(false);
  };

  /* =====================================================
   EXPORT PDF
===================================================== */
  const exportToPDF = () => {
    const rows = getExportRows();

    if (!rows.length) {
      setAlert({ message: "No booking data to export", status: "Error" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.text("Bookings Report", 14, 15);

    doc.setFontSize(9);
    doc.text(`Total Records: ${rows.length}`, 14, 22);

    const columns = Object.keys(rows[0]);
    const body = rows.map((row) => columns.map((column) => row[column] ?? "-"));

    const baseWidths = {
      "S.No": 8,
      Date: 18,
      Customer: 24,
      Phone: 18,
      Associate: 22,
      Location: 20,
      Colony: 22,
      Plot: 14,
      "Total Amount": 20,
      "Amount Paid": 20,
      Status: 16,
    };

    const margin = { top: 27, left: 8, right: 8, bottom: 10 };
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - margin.left - margin.right;

    const totalBase = columns.reduce(
      (sum, col) => sum + (baseWidths[col] || 18),
      0,
    );
    const scale = availableWidth / totalBase;

    const columnStyles = {};
    columns.forEach((column, index) => {
      const base = baseWidths[column] || 18;
      columnStyles[index] = { cellWidth: base * scale };
    });

    autoTable(doc, {
      head: [columns],
      body,
      startY: margin.top,
      theme: "grid",
      tableWidth: "auto",
      styles: {
        fontSize: 7.5,
        cellPadding: 1.4,
        overflow: "linebreak",
        valign: "middle",
        halign: "left",
        lineWidth: 0.1,
      },
      headStyles: { fontSize: 8, fontStyle: "bold", valign: "middle" },
      bodyStyles: { valign: "middle" },
      columnStyles,
      margin,
    });

    doc.save("bookings-report.pdf");

    setAlert({ message: "PDF exported successfully", status: "Success" });
    setTimeout(() => setAlert(null), 3000);
    setExportOpen(false);
  };

  // console.log(siteVisit, "siteVisit")
  // console.log(selectedCustomer, "selectedCustomer")
  // console.log(selectedPlot, "selectedPlot")
  return (
    <div className="plot-container">
      {/* Filters */}
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Bookings</h2>
          <Breadcrumb />
        </div>
        <div className="page-tools">
          {(mood === "admin" || mood === "staff") && (
            <button
              className="add-button"
              onClick={() => {
                setSelectedBooking(null);
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
              placeholder="Search Name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>

          {["all", "confirmed", "pending", "approval", "rejected"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
          <button className="add-button" onClick={() => setExportOpen(true)}>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="user-card-box">
        {currentData.length === 0 ? (
          <p>No Bookings Found</p>
        ) : (
          currentData.map((item) => (
            <BookingCard
              item={item}
              setSelectedBooking={setSelectedBooking}
              setIsEditMode={setIsEditMode}
              setOpen={setOpen}
              mood={mood}
              setAlert={setAlert}
            />
          ))
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          setPage={setCurrentPage}
        />
      )}
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? "Edit Booking" : "Add Booking"}
      >
        <AddBookingForm
          setAlert={setAlert}
          isEditMode={isEditMode}
          handleEditBooking={handleEditBooking}
          setOpen={setOpen}
          setPolicyOpen={setPolicyOpen}
        />
      </AddLocationModal>
      <AddLocationModal
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
        title="Cancellation Policy"
      >
        <CancellationPolicy landingPage={landingPage} />
      </AddLocationModal>
      <AddLocationModal
  open={exportOpen}
  onClose={() => setExportOpen(false)}
  title="Export Bookings Report"
>
  <div className="export-modal-body">
    <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
      This will export whatever is currently shown by the search and
      status filters ({filteredData?.length || 0} record
      {filteredData?.length === 1 ? "" : "s"}).
    </p>

    <div className="export-fields">
      <p>Export includes:</p>
      {EXPORT_COLUMNS.map((col) => (
        <span key={col}>{col}</span>
      ))}
    </div>
  </div>

  <div className="modal-actions" style={{ marginTop: "1rem" }}>
    <button
      type="button"
      className="export-excel-btn"
      onClick={exportToExcel}
    >
      <FileSpreadsheet size={18} />
      Excel
    </button>

    <button type="button" className="export-pdf-btn" onClick={exportToPDF}>
      <FileText size={18} />
      PDF
    </button>
  </div>
</AddLocationModal>
    </div>
  );
};

export default Booking;
