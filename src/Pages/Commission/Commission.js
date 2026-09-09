import React, { useEffect, useMemo, useState } from "react";

import "./Commission.css";
import NiSearch from "../../icons/ni-search";
import CommissionTable from "../../components/Cards/CommissionTable";

import { useDispatch, useSelector } from "react-redux";
import { getIncomeSummary } from "../../Redux/Slices/AppSlices";
import Pagination from "../../components/Pagination/Pagination";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import AddLocationModal from "../../components/Modals/AddLocationModal";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ITEMS_PER_PAGE = 30;

const EXPORT_COLUMNS = [
  "S.No",
  "Name",
  "Designation",
  "Referral ID",
  "Referral Income",
  "Direct Income",
  "Diff. Income",
  "Matching Income",
  "Royalty Income",
  "Cashback Income",
  "Best Performer",
  "Total Commission",
  "TDS",
  "Admin Charge",
  "Payout Amount",
];

const Commission = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { incomeSummary } = useSelector((state) => state.app);
  const [search, setSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getIncomeSummary());
  }, []);

  const commissionData = incomeSummary || [];

  const filteredData = useMemo(() => {
    return commissionData.filter((item) => {
      const matchPayable = Number(item?.incomeSummary?.payableAmount || 0) > 0;

      const searchText = search.toLowerCase();

      const matchSearch =
        item?.name?.toLowerCase().includes(searchText) ||
        item?.phone?.includes(search) ||
        item?.email?.toLowerCase().includes(searchText) ||
        item?.referralId?.toLowerCase().includes(searchText);

      const matchCycle = !cycleFilter || item?.cycleDate === cycleFilter;

      const matchStatus =
        !statusFilter ||
        (statusFilter === "pending" &&
          (item.incomeSummary?.pendingCommission || 0) > 0) ||
        (statusFilter === "credited" &&
          (item.incomeSummary?.creditedCommission || 0) > 0);

      return matchPayable && matchSearch && matchCycle && matchStatus;
    });
  }, [commissionData, search, cycleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  /* =====================================================
     BUILD EXPORT ROWS — directly from the filtered
     commission list, no per-user selection step
  ===================================================== */

  const fmt2 = (n) => (Number(n) || 0).toFixed(2);

  const getExportRows = () => {
    return filteredData.map((item, index) => ({
      "S.No": index + 1,
      Name: item?.name || "-",
      Designation: item?.designation || "-",
      "Referral ID": item?.referralId || "-",
      "Referral Income": fmt2(item?.incomeSummary?.referralIncome) || 0,
      "Direct Income": fmt2(item?.incomeSummary?.directIncome) || 0,
      "Diff. Income": fmt2(item?.incomeSummary?.differenceIncome) || 0,
      "Matching Income": fmt2(item?.incomeSummary?.matchingIncome) || 0,
      "Royalty Income": fmt2(item?.incomeSummary?.royaltyIncome) || 0,
      "Cashback Income": fmt2(item?.incomeSummary?.cashbackIncome) || 0,
      "Best Performer": fmt2(item?.incomeSummary?.bestPerformanceIncome) || 0,
      "Total Commission": fmt2(item?.incomeSummary?.totalCommission) || 0,
      TDS: fmt2(item?.incomeSummary?.tdsAmount) || 0,
      "Admin Charge": fmt2(item?.incomeSummary?.adminChargeAmount) || 0,
      "Payout Amount": fmt2(item?.incomeSummary?.payableAmount) || 0,
    }));
  };

  /* =====================================================
     EXPORT EXCEL
  ===================================================== */
  const exportToExcel = () => {
    const rows = getExportRows();

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

    XLSX.writeFile(workbook, "commission-report.xlsx");

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
    doc.text("Commission Report", 14, 15);

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

    doc.save("commission-report.pdf");

    setAlert({ message: "PDF exported successfully", status: "Success" });
    setTimeout(() => setAlert(null), 3000);
    setExportOpen(false);
  };

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-tools">
          <div className="searchItem">
            <NiSearch />
            <input
              placeholder="Search Agent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="add-button" onClick={() => setExportOpen(true)}>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="card table-box">
        <div className="table commission-table-box">
          <div className="table-head commission-table">
            <span>S.No</span>
            <span>Name</span>
            <span>Designation</span>
            <span>Referral ID</span>
            <span>Referral Income</span>
            <span>Direct Income</span>
            <span>Diff. Income</span>
            <span>Matching Income</span>
            <span>Royalty Income</span>
            <span>Cashback Income</span>
            <span>Best Performer</span>
            <span>Total Commission</span>
            <span>TDS</span>
            <span>Admin Charge</span>
            <span>Payout Amount</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {paginatedData.length === 0 ? (
            <p>No Commission Found</p>
          ) : (
            paginatedData.map((item, index) => (
              <CommissionTable
                key={item._id}
                index={index}
                item={item}
                mood={mood}
                setAlert={setAlert}
                page={page}
                ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              />
            ))
          )}
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      <AddLocationModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export Commission Report"
      >
        <div className="export-modal-body">
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

export default Commission;
