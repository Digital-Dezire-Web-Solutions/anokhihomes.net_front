import React, { useState, useMemo, useEffect } from "react";
import NiSearch from "../../icons/ni-search";
import { LucidePlus } from "lucide-react";
import AddLocationModal from "../Modals/AddLocationModal";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import SiteVisitCard from "../Cards/SiteVisitCard";
import SearchSelect from "../SearchItems/SearchSelect";
import {
  getAllColonies,
  getLeads,
  getSiteVisit,
  getUserRole,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Host from "../../Host/Host";
import Pagination from "../Pagination/Pagination";
// import "./SiteVisit.css";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatDate from "../DateFormate/DateFormate";

const ITEMS_PER_PAGE = 6;

const VisitTable = ({ data, mood, setAlert, landingPage }) => {
  const dispatch = useDispatch();
  const { leads, allColonies, usersRole } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getLeads());
    dispatch(getAllColonies());
    dispatch(getUserRole("agent"));
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedColonies, setSelectedColonies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // console.log(data,"data")

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (selectedVisit) {
      setFormData(selectedVisit);
    } else {
      setFormData({});
    }
  }, [selectedVisit]);

  // useEffect(() => {
  //   if (selectedVisit) {
  //     setFormData({
  //       lead: selectedVisit.leadId || "",
  //       customer: selectedVisit.customer || "",
  //       location: selectedVisit?.locationId?._id || "",
  //       colony: selectedVisit?._id || "",
  //       agent: selectedVisit?.agent || "",
  //       visitDate:
  //         selectedVisit.visitHour +
  //         " " +
  //         selectedVisit.visitPeriod +
  //         " " +
  //         selectedVisit.visitDate,
  //     });

  //     // also set selectedCustomer for UI
  //     setSelectedCustomer({
  //        _id: selectedVisit.customer,
  //       name: selectedVisit.name,
  //       phone: selectedVisit.phone,
  //       email: selectedVisit.email,
  //     });
  //   }
  // }, [selectedVisit]);

  // console.log(data, "data");
  const filtered = useMemo(() => {
    return data.filter((visit) => {
      const matchSearch =
        visit.customer?.name?.toLowerCase()?.includes(search.toLowerCase()) ||
        visit.customer?.phone?.includes(search);
      const matchStatus = statusFilter === "" || visit.status === statusFilter;
      // use visitDate if available, otherwise createdAt
      const visitDate = new Date(visit.visitDate || visit.createdAt);
      const matchFrom = !fromDate || visitDate >= new Date(fromDate);
      const matchTo = !toDate || visitDate <= new Date(`${toDate}T23:59:59`);

      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [data, search, statusFilter, fromDate, toDate]);
  const PRIORITY_STATUS = "approval"; // change to whichever status should pin to the top

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aTop = a?.status?.toLowerCase() === PRIORITY_STATUS ? 0 : 1;
      const bTop = b?.status?.toLowerCase() === PRIORITY_STATUS ? 0 : 1;
      if (aTop !== bTop) return aTop - bTop;

      const aDate = new Date(a?.visitDate || a?.createdAt);
      const bDate = new Date(b?.visitDate || b?.createdAt);
      return bDate - aDate;
    });
  }, [filtered]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleAddVisit = async () => {
    setSaving(true);
    console.log("Adding visit:", formData);
    setOpen(false);
    try {
      const token = localStorage.getItem("token");

      const payload = {
        lead: formData.leadId,
        customer: formData.customer,
        location: selectedColonies[0]?.locationId?._id,
        colonies: selectedColonies.map((c) => c._id),
        agent: formData?.agent,
        visitDate:
          formData.visitHour +
          " " +
          formData.visitPeriod +
          " " +
          formData.visitDate,
      };

      console.log(payload, "payload");

      const res = await axios.post(`${Host}/api/sitevisit/add`, payload, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      setAlert({
        message: "Site Visit added successfully!",
        status: "Success",
      });
      dispatch(getSiteVisit());
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Request failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      setSaving(false);
    }
  };
  const handleEditVisit = async () => {
    console.log("Editing visit:", formData);
    setOpen(false);
  };

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);

  // console.log(selectedCustomer, "selected");
  // console.log(selectedProjects, "selectedProjects");

  const [exportOpen, setExportOpen] = useState(false);

  const EXPORT_COLUMNS = [
    "S.No",
    "Date",
    "Customer",
    "Phone",
    "Associate",
    "Colonies",
    "Status",
  ];

  const capitalize = (str) => {
    if (!str) return "-";
    return str
      .toString()
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getExportRows = () => {
    return (sorted || []).map((visit, index) => ({
      "S.No": index + 1,
      Date: formatDate(visit?.createdAt) || "-",
      Customer: visit?.customer?.name || "-",
      Phone: visit?.customer?.phone || "-",
      Associate: visit?.agent?.name || "-",
      Colonies: `${visit.colonies?.length}, ${visit?.location?.name}` || "-",
      Status: capitalize(visit?.status),
    }));
  };

  /* =====================================================
   EXPORT EXCEL
===================================================== */
  const exportToExcel = () => {
    const rows = getExportRows();

    if (!rows.length) {
      setAlert({ message: "No site visit data to export", status: "Error" });
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Site Visits");

    XLSX.writeFile(workbook, "site-visits-report.xlsx");

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
      setAlert({ message: "No site visit data to export", status: "Error" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.text("Site Visits Report", 14, 15);

    doc.setFontSize(9);
    doc.text(`Total Records: ${rows.length}`, 14, 22);

    const columns = Object.keys(rows[0]);
    const body = rows.map((row) => columns.map((column) => row[column] ?? "-"));

    const baseWidths = {
      "S.No": 8,
      Date: 16,
      Customer: 28,
      Phone: 18,
      Associate: 24,
      Colonies: 34,
      Status: 18,
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
        fontSize: 8,
        cellPadding: 1.4,
        overflow: "linebreak",
        valign: "middle",
        halign: "left",
        lineWidth: 0.1,
      },
      headStyles: { fontSize: 8.5, fontStyle: "bold", valign: "middle" },
      bodyStyles: { valign: "middle" },
      columnStyles,
      margin,
    });

    doc.save("site-visits-report.pdf");

    setAlert({ message: "PDF exported successfully", status: "Success" });
    setTimeout(() => setAlert(null), 3000);
    setExportOpen(false);
  };

  return (
    <div>
      <div className="filter-grid page-tools table-filters">
        {mood === "admin" && (
          <button
            className="add-button"
            onClick={() => {
              setSelectedVisit(null);
              setIsEditMode(false);
              setOpen(true);
            }}
          >
            <LucidePlus /> Add
          </button>
        )}
        {mood !== "user" && (
          <div className="searchItem">
            <NiSearch />
            <input
              placeholder="Search customer / phone"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        )}
        <div className="searchItem">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Status</option>
            <option value="Approval">Approval</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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
          <p>No Site Visits Found</p>
        ) : (
          paginated.map((item) => (
            <SiteVisitCard
              item={item}
              setSelectedVisit={setSelectedVisit}
              setIsEditMode={setIsEditMode}
              setOpen={setOpen}
              mood={mood}
              setAlert={setAlert}
              landingPage={landingPage}
            />
          ))
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? "Edit Visit" : "Add Visit"}
      >
        <div className="field">
          <SearchSelect
            label="Leads Customer"
            placeholder="Search Customer by Name or Number"
            options={leads}
            value={selectedCustomer}
            onChange={(selected) => {
              setSelectedCustomer(selected);
              setFormData({
                ...formData,
                leadId: selected._id,
                customer: selected.customer,
                agent: selected?.agent?._id || null,
              });
            }}
            displayKey="name"
            searchKeys={["name", "phone"]}
            renderOption={(c) => (
              <div>
                <b>{c.name}</b> ({c.phone})
              </div>
            )}
          />
        </div>
        <div className="field">
          <label>Customer Name</label>
          <input value={selectedCustomer?.name} readOnly placeholder="Name" />
        </div>
        <div className="field">
          <label>Customer Phone</label>
          <input
            value={selectedCustomer?.phone}
            readOnly
            placeholder="Phone Number"
          />
        </div>
        <div className="field">
          <label>Date of Visit</label>

          {/* Date */}
          <input
            type="date"
            value={formData.visitDate || ""}
            onChange={(e) =>
              setFormData({ ...formData, visitDate: e.target.value })
            }
          />

          {/* Hour Dropdown */}
          <select
            value={formData.visitHour || ""}
            onChange={(e) =>
              setFormData({ ...formData, visitHour: e.target.value })
            }
          >
            <option value="">Select Hour</option>
            {[...Array(12)].map((_, i) => {
              const hour = i + 1;
              return (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              );
            })}
          </select>

          {/* AM / PM */}
          <select
            value={formData.visitPeriod}
            onChange={(e) =>
              setFormData({ ...formData, visitPeriod: e.target.value })
            }
          >
            <option value="">Select Period (AM / PM)</option>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        {selectedCustomer?.agent === null ? (
          <div className="field">
            <SearchSelect
              label="Associate"
              placeholder="Search Associate by Name or Number"
              options={usersRole}
              value={selectedAgent}
              onChange={(selected) => {
                setSelectedAgent(selected);
                setFormData({ ...formData, agent: selected?._id });
              }}
              displayKey="name"
              searchKeys={["name", "phone"]}
              renderOption={(c) => (
                <div>
                  <b>{c.name}</b> ({c.phone})
                </div>
              )}
            />
          </div>
        ) : (
          <div className="field">
            <label>Associate</label>
            <input
              value={selectedCustomer?.agent?.name}
              readOnly
              placeholder="Associate"
            />
          </div>
        )}
        <div className="field">
          <SearchSelect
            label="Colonies"
            multiple
            placeholder="Select Colonies"
            options={allColonies}
            value={selectedColonies}
            onChange={setSelectedColonies}
            displayKey="name"
            searchKeys={["name"]}
            renderOption={(p) => (
              <div>
                <b>{p.name}</b>

                <small style={{ display: "block" }}>{p.locationId?.name}</small>
              </div>
            )}
          />
        </div>

        <div className="modal-actions">
          <button
            onClick={() => {
              if (isEditMode) {
                handleEditVisit();
              } else {
                if (!formData.visitDate || selectedColonies.length === 0) {
                  setAlert({
                    message: "Please select at least one colony",
                    status: "Error",
                  });
                  return;
                  setTimeout(() => setAlert(null), 3000);
                }
                handleAddVisit();
              }
              setOpen(false);
            }}
          >
            {saving ? "Saving..." : isEditMode ? "Update Visit" : "Add Visit"}
          </button>
        </div>
      </AddLocationModal>
      <AddLocationModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export Site Visits Report"
      >
        <div className="export-modal-body">
          <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            This will export whatever is currently shown by the search, status
            and date filters ({sorted?.length || 0} record
            {sorted?.length === 1 ? "" : "s"}).
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

          <button
            type="button"
            className="export-pdf-btn"
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

export default VisitTable;
