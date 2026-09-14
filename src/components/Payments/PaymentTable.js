import React, { useState, useMemo, useEffect } from "react";
import AddLocationModal from "../Modals/AddLocationModal";
import NiSearch from "../../icons/ni-search";
import { Download, FileSpreadsheet, FileText, LucidePlus } from "lucide-react";
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
import Pagination from "../Pagination/Pagination";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatDate from "../DateFormate/DateFormate";

const ITEMS_PER_PAGE = 15;

const EXPORT_COLUMNS = [
  "S.No",
  "Date",
  "Customer",
  "C Phone",
  "Associate",
  "A Phone",
  "Amount",
  "Mode",
  "Plot",
  "Status",
];

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
  const [exportOpen, setExportOpen] = useState(false);

  // Export-only filters (independent of the table's own filters above)
  const [exportCustomerId, setExportCustomerId] = useState("");
  const [exportAgentId, setExportAgentId] = useState("");
  const [exportFromDate, setExportFromDate] = useState("");
  const [exportToDate, setExportToDate] = useState("");

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

  // console.log(paginated, "paginated");

  const fmt2 = (n) => (Number(n) || 0).toFixed(2);

  // Unique customers / agents present in the full payment data set, used to
  // populate the "select customer" / "select agent" dropdowns in the export modal.
  const customerOptions = useMemo(() => {
    const map = new Map();

    (data || []).forEach((item) => {
      const c = item?.customer;
      const id = c?._id;

      if (id && !map.has(id)) {
        map.set(id, {
          id,
          name: c?.name || "Unnamed",
          phone: c?.phone || "-",
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, [data]);

  const agentOptions = useMemo(() => {
    const map = new Map();

    (data || []).forEach((item) => {
      const a = item?.agent;
      const id = a?._id;

      if (id && !map.has(id)) {
        map.set(id, {
          id,
          name: a?.name || "Unnamed",
          phone: a?.phone || "-",
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, [data]);

  const selectedExportCustomer = useMemo(
    () => customerOptions.find((c) => c.id === exportCustomerId) || null,
    [customerOptions, exportCustomerId],
  );

  const selectedExportAgent = useMemo(
    () => agentOptions.find((a) => a.id === exportAgentId) || null,
    [agentOptions, exportAgentId],
  );

  const hasExportFilters =
    !!exportCustomerId || !!exportAgentId || !!exportFromDate || !!exportToDate;

  const getPlotLabel = (item) => {
    const p = item?.booking || item?.hold;
    if (!p) return "";

    const plotNumber = item?.booking
      ? item?.booking?.plot?.plotNumber
      : item?.hold?.plot?.plotNumber;
    const colonyName = item?.booking
      ? item?.booking?.colony?.name
      : item?.hold?.colony?.name;
    const locationName = item?.booking
      ? item?.booking?.location?.name
      : item?.hold?.location?.name;

    return [plotNumber, colonyName, locationName].filter(Boolean).join(", ");
  };

  const getExportRows = (rows) => {
    return (rows || []).map((item, index) => ({
      "S.No": index + 1,
      "Date": formatDate(item?.createdAt) || "-",
      "Customer": item?.customer?.name || "-",
      "C Phone": item?.customer?.phone || "-",
      "Associate": item.agent?.name || "",
      "A Phone": item.agent?.phone || "",
      "Amount": fmt2(item.amount) || "-",
      "Mode": item?.paymentMode || "",
      "Plot": getPlotLabel(item),
      "Status": item.status || "",
    }));
  };

  // Decides which raw payment records to export:
  // - if any export-only filter (customer / agent / date range) is set, pull from
  //   the FULL data set (ignoring the table's own search/status/date filters and
  //   pagination) and apply just the export filters
  // - otherwise fall back to whatever is currently filtered in the table
  const getExportSourceRecords = () => {
    if (!hasExportFilters) {
      return filtered;
    }

    return (data || []).filter((payment) => {
      const matchCustomer =
        !exportCustomerId || payment?.customer?._id === exportCustomerId;

      const matchAgent =
        !exportAgentId || payment?.agent?._id === exportAgentId;

      const paymentDate = new Date(payment.paymentDate || payment.createdAt);

      const matchFrom =
        !exportFromDate || paymentDate >= new Date(exportFromDate);

      const matchTo =
        !exportToDate || paymentDate <= new Date(`${exportToDate}T23:59:59`);

      return matchCustomer && matchAgent && matchFrom && matchTo;
    });
  };

  const buildExportFileBaseName = () => {
    const parts = ["commission-report"];

    if (selectedExportCustomer) {
      parts.push(selectedExportCustomer.name.toString().trim().replace(/[^a-zA-Z0-9]+/g, "_"));
    }

    if (selectedExportAgent) {
      parts.push(selectedExportAgent.name.toString().trim().replace(/[^a-zA-Z0-9]+/g, "_"));
    }

    return parts.join("-");
  };

  const buildExportTitle = () => {
    if (!selectedExportCustomer && !selectedExportAgent) {
      return "Commission Report";
    }

    const bits = [];
    if (selectedExportCustomer) bits.push(`Customer: ${selectedExportCustomer.name}`);
    if (selectedExportAgent) bits.push(`Associate: ${selectedExportAgent.name}`);

    return `Commission Report (${bits.join(", ")})`;
  };

  /* =====================================================
       EXPORT EXCEL
    ===================================================== */
  const exportToExcel = () => {
    const sourceRecords = getExportSourceRecords();
    const rows = getExportRows(sourceRecords);

    if (!rows.length) {
      setAlert({ message: "No commission data to export", status: "Error" });
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commission");

    XLSX.writeFile(workbook, `${buildExportFileBaseName()}.xlsx`);

    setAlert({ message: "Excel exported successfully", status: "Success" });
    setTimeout(() => setAlert(null), 3000);
    setExportOpen(false);
  };

  /* =====================================================
       EXPORT PDF
    ===================================================== */
  const exportToPDF = () => {
    const sourceRecords = getExportSourceRecords();
    const rows = getExportRows(sourceRecords);

    if (!rows.length) {
      setAlert({ message: "No commission data to export", status: "Error" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.text(buildExportTitle(), 14, 15);

    doc.setFontSize(9);
    doc.text(`Total Records: ${rows.length}`, 14, 22);

    const columns = Object.keys(rows[0]);
    const body = rows.map((row) => columns.map((column) => row[column] ?? "-"));

    autoTable(doc, {
      head: [columns],
      body,
      startY: 27,
      theme: "grid",
      tableWidth: "auto", // let it fill the printable width, not exceed it
      styles: {
        fontSize: 6,
        cellPadding: 1,
        overflow: "linebreak",
        valign: "middle",
        halign: "left",
        lineWidth: 0.1,
      },
      headStyles: { fontSize: 6, fontStyle: "bold", valign: "middle" },
      bodyStyles: { valign: "middle" },
      // let autoTable distribute width proportionally to content instead
      // of hardcoded mm values that summed to more than the page
      columnStyles: {
        0: { cellWidth: 8 }, // S.No stays narrow
      },
      margin: { top: 27, left: 5, right: 5, bottom: 8 },
    });

    doc.save(`${buildExportFileBaseName()}.pdf`);

    setAlert({ message: "PDF exported successfully", status: "Success" });
    setTimeout(() => setAlert(null), 3000);
    setExportOpen(false);
  };

  const closeExportModal = () => {
    setExportOpen(false);
    setExportCustomerId("");
    setExportAgentId("");
    setExportFromDate("");
    setExportToDate("");
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
        <button className="add-button" onClick={() => setExportOpen(true)}>
          <Download size={18} />
          Export
        </button>
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
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
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
      <AddLocationModal
        open={exportOpen}
        onClose={closeExportModal}
        title="Export Commission Report"
      >
        <div className="export-modal-body">
          <div className="searchItem" style={{ marginBottom: "0.75rem" }}>
            <label>Customer</label>
            <select
              value={exportCustomerId}
              onChange={(e) => setExportCustomerId(e.target.value)}
            >
              <option value="">All Customers</option>
              {customerOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="searchItem" style={{ marginBottom: "0.75rem" }}>
            <label>Associate</label>
            <select
              value={exportAgentId}
              onChange={(e) => setExportAgentId(e.target.value)}
            >
              <option value="">All Associates</option>
              {agentOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="searchItem" style={{ marginBottom: "0.75rem" }}>
            <label>From</label>
            <input
              type="date"
              value={exportFromDate}
              onChange={(e) => setExportFromDate(e.target.value)}
            />
          </div>

          <div className="searchItem" style={{ marginBottom: "0.75rem" }}>
            <label>To</label>
            <input
              type="date"
              value={exportToDate}
              onChange={(e) => setExportToDate(e.target.value)}
            />
          </div>

          <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            {hasExportFilters
              ? "This will export every matching payment across all pages, regardless of the table's own search/status/date filters."
              : "This will export whatever is currently shown by the table's search, status and date filters."}
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
            disabled={saving}
            onClick={exportToExcel}
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

          <button
            type="button"
            className="export-pdf-btn"
            disabled={saving}
            onClick={exportToPDF}
          >
            <FileText size={18} />
            PDF
          </button>
        </div>
      </AddLocationModal>
    </div>
  );
};

export default PaymentTable;