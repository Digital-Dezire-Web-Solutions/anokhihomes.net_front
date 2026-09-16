import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import DashboardCard from "../../components/Cards/DashboardCard";
import NiPayments from "../../icons/ni-payments";
import PaymentCard from "../../components/Cards/PaymentCard";
import { getAccountDetails, getIncome, getIncomeSummary, getPayments } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import NiSearch from "../../icons/ni-search";
import InvoiceCard from "../../components/Cards/InvoiceCard";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import formatDate from "../../components/DateFormate/DateFormate";
import "./Income.css";
import NiOpenEye from "../../icons/ni-openEye";
import ViewModal from "../../components/Modals/ViewModal";
import Pagination from "../../components/Pagination/Pagination";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AddLocationModal from "../../components/Modals/AddLocationModal";


const EXPORT_COLUMNS = [
  "S.No",
  "Date",
  "Name",
  "Phone",
  "Referral ID",
  "Income Type",
  "Amount",
  "From",
  "From Phone",
];

const Income = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { userDetail, incomeHistory, incomeSummary } = useSelector((state) => state.app);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  const [designationFilter, setDesignationFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // Which agent's FULL history to export ("" = use current filtered/table results)
  const [exportAgentId, setExportAgentId] = useState("");

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getIncome());
    dispatch(getIncomeSummary());
    dispatch(getPayments());
  }, []);

  const [tabActive, setTabActive] = useState("other");

  const filtered = useMemo(() => {
    return (incomeHistory || []).filter((income) => {

      // Search
      const searchValue = search.toLowerCase();

      const matchSearch =
        income?.user?.name?.toLowerCase()?.includes(searchValue) ||
        income?.user?.email?.toLowerCase()?.includes(searchValue) ||
        income?.user?.phone?.includes(search) ||
        income?.user?.referralId?.toLowerCase()?.includes(searchValue);

      // Designation
      const matchDesignation =
        designationFilter === "" ||
        income?.user?.designation === designationFilter;

      // Status
      const matchStatus =
        statusFilter === "" ||
        income?.status === statusFilter;

      // Date
      const incomeDate = new Date(income.createdAt);

      const matchFrom =
        !fromDate ||
        incomeDate >= new Date(fromDate);

      const matchTo =
        !toDate ||
        incomeDate <= new Date(`${toDate}T23:59:59`);

      // Tab
      const matchTab =
        tabActive === "referral"
          ? income?.type === "referal_income"
          : income?.type !== "referal_income";

      return (
        matchSearch &&
        matchDesignation &&
        matchStatus &&
        matchFrom &&
        matchTo &&
        matchTab
      );
    });
  }, [
    search,
    designationFilter,
    statusFilter,
    fromDate,
    toDate,
    incomeHistory,
    tabActive,
  ]);

  const totalPages = Math.ceil(filtered?.length / ITEMS_PER_PAGE);
  const paginated = filtered?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const totalIncome =
    incomeHistory?.reduce((acc, item) => acc + item.amount, 0) || 0;

  const todayIncome =
    incomeHistory
      ?.filter((i) => {
        const today = new Date().toDateString();
        return (
          i.type !== "referal_income" &&
          new Date(i.createdAt).toDateString() === today
        );
      })
      ?.reduce((acc, item) => acc + item.amount, 0) || 0;

  const referralIncome =
    incomeHistory
      ?.filter((i) => i.type === "referal_income")
      ?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;

  const otherIncome =
    incomeHistory
      ?.filter((i) => i.type !== "referal_income")
      ?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;

  // console.log(incomeSummary,"incomeSummary")
  const currentUser = incomeSummary?.find((item) => item._id === userDetail?._id);

  // Unique list of agents present in the income history, used to populate
  // the "select agent" dropdown inside the export modal.
  const agentOptions = useMemo(() => {
    const map = new Map();

    (incomeHistory || []).forEach((item) => {
      const u = item?.user;
      const id = u?._id;

      if (id && !map.has(id)) {
        map.set(id, {
          id,
          name: u?.name || "Unnamed",
          referralId: u?.referralId || "-",
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, [incomeHistory]);

  const selectedAgent = useMemo(
    () => agentOptions.find((a) => a.id === exportAgentId) || null,
    [agentOptions, exportAgentId],
  );

  const fmt2 = (n) => (Number(n) || 0).toFixed(2);
  // console.log(paginated, "paginated")
  const getExportRows = (rows) => {
    return (rows || []).map((item, index) => ({
      "S.No": index + 1,
      "Date": formatDate(item.createdAt) || "",
      "Name": item?.user?.name || "-",
      "Phone": item?.user?.phone || "",
      "Referral ID": item?.user?.referralId || "-",
      "Income Type": item.type || "",
      "Amount": fmt2(item.amount) || "",
      "From": item.fromUser ? item.fromUser.name : item?.payment?.customer?.name || "",
      "From Phone": item.fromUser ? item.fromUser.phone : item?.payment?.customer?.phone || "",
    }));
  };

  const getExportSourceRecords = () => {
    if (exportAgentId) {
      return (incomeHistory || [])
        .filter((item) => item?.user?._id === exportAgentId)
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  };

  const buildExportFileBaseName = () => {
    if (selectedAgent) {
      const safeName = (selectedAgent.referralId !== "-" ? selectedAgent.referralId : selectedAgent.name)
        .toString()
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "_");

      return `commission-report-${safeName}`;
    }

    return "commission-report";
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
    doc.text(
      selectedAgent
        ? `Commission Report - ${selectedAgent.name} (${selectedAgent.referralId})`
        : "Commission Report",
      14,
      15,
    );

    doc.setFontSize(9);
    doc.text(`Total Records: ${rows.length}`, 14, 22);

    const columns = Object.keys(rows[0]);
    const body = rows.map((row) => columns.map((column) => row[column] ?? "-"));

    // Relative proportions for each column - wider ones get more real width
    const baseWidths = {
      "S.No": 8,
      "Date": 16,
      "Name": 24,
      "Phone": 18,
      "Referral ID": 18,
      "Income Type": 22,
      "Amount": 16,
      "From": 24,
      "From Phone": 18,
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
      columnStyles[index] = {
        cellWidth: base * scale,
      };
    });

    autoTable(doc, {
      head: [columns],
      body,
      startY: margin.top,
      theme: "grid",
      tableWidth: "auto",
      styles: {
        fontSize: 9,           // bumped up from 6
        cellPadding: 2.2,       // bumped up from 1
        overflow: "linebreak",
        valign: "middle",
        halign: "left",
        lineWidth: 0.1,
      },
      headStyles: {
        fontSize: 9.5,
        fontStyle: "bold",
        valign: "middle",
        fillColor: [30, 30, 30],
      },
      bodyStyles: { valign: "middle" },
      columnStyles,
      margin,
    });

    doc.save(`${buildExportFileBaseName()}.pdf`);

    setAlert({ message: "PDF exported successfully", status: "Success" });
    setTimeout(() => setAlert(null), 3000);
    setExportOpen(false);
  };

  const closeExportModal = () => {
    setExportOpen(false);
    setExportAgentId("");
  };

  const now = new Date();

  // Today's Collection
  const todaysCollection = incomeHistory
    ?.filter((p) => {
      const date = new Date(p.paymentDate || p.createdAt);

      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        p.status === "approved"
      );
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const getIncomeCycle = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if (day <= 15) {
      return {
        cycleStart: new Date(year, month, 1, 0, 0, 0, 0),
        cycleEnd: new Date(year, month, 15, 23, 59, 59, 999),
      };
    }

    const lastDay = new Date(year, month + 1, 0).getDate(); // last day of this month
    return {
      cycleStart: new Date(year, month, 16, 0, 0, 0, 0),
      cycleEnd: new Date(year, month, lastDay, 23, 59, 59, 999),
    };
  };

  // Previous cycle = the 15-day window immediately before the current one
  const getPreviousIncomeCycle = (date = new Date()) => {
    const { cycleStart } = getIncomeCycle(date);
    // Step back 1 day from the current cycle's start to land in the previous cycle
    const prevAnchor = new Date(cycleStart);
    prevAnchor.setDate(prevAnchor.getDate() - 1);
    return getIncomeCycle(prevAnchor);
  };

  const { cycleStart: currentCycleStart, cycleEnd: currentCycleEnd } =
    useMemo(() => getIncomeCycle(now), []); // eslint-disable-line react-hooks/exhaustive-deps

  const { cycleStart: prevCycleStart, cycleEnd: prevCycleEnd } =
    useMemo(() => getPreviousIncomeCycle(now), []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentCycleIncome =
    incomeHistory
      ?.filter((i) => {
        const d = new Date(i.createdAt);
        return (
          i.type !== "referal_income" &&
          d >= currentCycleStart &&
          d <= currentCycleEnd
        );
      })
      ?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;

  const previousCycleIncome =
    incomeHistory
      ?.filter((i) => {
        const d = new Date(i.createdAt);
        return (
          i.type !== "referal_income" &&
          d >= prevCycleStart &&
          d <= prevCycleEnd
        );
      })
      ?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;

  // Human-readable labels for the card titles, e.g. "16 Sep - 30 Sep"
  const formatCycleLabel = (start, end) => {
    const opts = { day: "2-digit", month: "short" };
    return `${start.toLocaleDateString("en-IN", opts)} - ${end.toLocaleDateString("en-IN", opts)}`;
  };

  const currentCycleLabel = formatCycleLabel(currentCycleStart, currentCycleEnd);
  const previousCycleLabel = formatCycleLabel(prevCycleStart, prevCycleEnd);

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Income</h2>
          <Breadcrumb />
        </div>
      </div>
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
          {/* ================= STATS ================= */}
          <div className="dashboard-grid">
            <DashboardCard
              title="Total Income"
              value={`₹${formatCurrency(totalIncome)}`}
              icons={<NiPayments />}
            />
            <DashboardCard
              title={`My Wallet (${mood === "admin" ? "Admin" : mood === "agent" ? "Associate" : mood === "staff" ? "Staff" : "User"})`}
              value={`₹${formatCurrency(currentUser?.incomeSummary?.payableAmount || 0)}`}
              icons={<NiPayments />}
            />
            <DashboardCard
              title="Total Self Business"
              value={`₹${formatCurrency(userDetail?.selfBusiness || 0)}`}
              icons={<NiPayments />}
            />
            <DashboardCard
              title="Total Team Business"
              value={`₹${formatCurrency(userDetail?.totalBusiness || 0)}`}
              icons={<NiPayments />}
            />

            <DashboardCard
              title="Total Referral Income"
              value={`₹${formatCurrency(referralIncome || 0)}`}
              icons={<NiPayments />}
            />
            <DashboardCard
              title="Plot's Income"
              value={`₹${formatCurrency(otherIncome || 0)}`}
              icons={<NiPayments />}
            />
            <DashboardCard
              title="Total Transactions"
              value={incomeHistory?.length || 0}
              icons={<NiPayments />}
            />
            <DashboardCard
              title="Today's Collection"
              value={`₹${formatCurrency(todaysCollection)}`}
              icons={<NiPayments />}
            />
            <DashboardCard
              title={`Previous Cycle Income (${previousCycleLabel})`}
              value={`₹${formatCurrency(previousCycleIncome)}`}
              icons={<NiPayments />}
            />
            <DashboardCard
              title={`Current Cycle Income (${currentCycleLabel})`}
              value={`₹${formatCurrency(currentCycleIncome)}`}
              icons={<NiPayments />}
            />
          </div>
          <h4>Income History</h4>
          <div className="filter-grid page-tools table-filters">
            {/* SEARCH */}
            <div className="searchItem">
              <NiSearch />

              <input
                placeholder="Search name / phone / email / referral ID"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* DESIGNATION FILTER */}
            <div className="searchItem">
              <select
                value={designationFilter}
                onChange={(e) => {
                  setDesignationFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Designations</option>

                <option value="Sales Executive">Sales Executive</option>

                <option value="Senior Sales Executive">
                  Senior Sales Executive
                </option>

                <option value="Team Leader">Team Leader</option>

                <option value="Senior Team Leader">Senior Team Leader</option>

                <option value="Assistant Manager">Assistant Manager</option>

                <option value="Sales Manager">Sales Manager</option>

                <option value="Senior Sales Manager">
                  Senior Sales Manager
                </option>

                <option value="Assistant General Manager (AGM)">
                  Assistant General Manager (AGM)
                </option>

                <option value="General Manager (GM)">
                  General Manager (GM)
                </option>

                <option value="Assistant Vice President (AVP)">
                  Assistant Vice President (AVP)
                </option>

                <option value="Vice President (VP)">Vice President (VP)</option>

                <option value="Senior Vice President (SVP)">
                  Senior Vice President (SVP)
                </option>

                <option value="Associate Director">Associate Director</option>

                <option value="Deputy Director">Deputy Director</option>

                <option value="Director">Director</option>

                <option value="Executive Director">Executive Director</option>
              </select>
            </div>

            {/* STATUS FILTER */}
            <div className="searchItem">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>

                <option value="credited">Credited</option>

                <option value="pending">Pending</option>

                <option value="failed">Failed</option>
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
          <div className="income-tabs">
            <button
              className={tabActive === "referral" ? "active" : ""}
              onClick={() => {
                setTabActive("referral");
                setPage(1);
              }}
            >
              Referral Income
            </button>

            <button
              className={tabActive === "other" ? "active" : ""}
              onClick={() => {
                setTabActive("other");
                setPage(1);
              }}
            >
              Other Income
            </button>
          </div>
          {mood === "admin" ? (
            <div className="card table-box">
              <div className="table income-table">
                <div className="table-head">
                  <span>S.No</span>
                  <span>Date</span>
                  <span>Name</span>
                  <span>Income Type</span>
                  <span>Amount</span>
                  <span>From</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>

                {paginated?.length === 0 ? (
                  <div>
                    <span>No Income Found</span>
                  </div>
                ) : (
                  paginated?.map((item, index) => (
                    <div className="table-row" key={item._id}>
                      <span>{(page - 1) * ITEMS_PER_PAGE + index + 1}</span>
                      <span>{formatDate(item.createdAt)}</span>
                      <span>{item.user?.name} ({item.user?.referralId})</span>
                      <span>
                        {item.type
                          ?.replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span>₹{formatCurrency(item.amount)}</span>
                      <span>{!item?.fromUser ?
                        `${item?.payment?.customer?.name} (Payment)` || "-" :
                        `${item?.fromUser?.name} (${item?.fromUser?.referralId})`}</span>
                      <span
                        className={`status ${item.status === "credited" ? "active" : "pending"
                          }`}
                      >
                        {item.status}
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncome(item);
                          setViewOpen(true);
                        }}
                      >
                        <NiOpenEye />
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="user-card-box">
              {paginated?.length === 0 ? (
                <p>No Income Found</p>
              ) : (
                paginated?.map((item) => (
                  <InvoiceCard
                    key={item._id}
                    item={item}
                    mood={mood}
                    setAlert={setAlert}
                  />
                ))
              )}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
        <ViewModal
          open={viewOpen}
          onClose={() => {
            setViewOpen(false);
            setSelectedIncome(null);
          }}
          title={selectedIncome?.type}
        >
          {selectedIncome &&
            <>
              <div className="user-card-bottom view-box">
                <div className="user-card-bottom-left">
                  <p>Date</p>
                  <p>Income Type</p>
                  <p>Amount</p>
                </div>
                <div className="user-card-bottom-right">
                  <p>{formatDate(selectedIncome?.createdAt)}</p>
                  <p style={{ textTransform: "capitalize" }}>{selectedIncome?.type}</p>
                  <p>₹{formatCurrency(selectedIncome.amount)}</p>
                </div>
              </div>
              <div className={`report-view-box-right active`}>
                <div className="payment-details">

                  {selectedIncome?.type !== "referal_income" && (
                    <>
                      <h5>Payment Details</h5>

                      <p>
                        <strong>Name:</strong> {selectedIncome?.payment?.customer?.name || "-"}
                      </p>

                      <p>
                        <strong>Phone:</strong>{" "}
                        {selectedIncome?.payment?.customer?.phone || "-"}
                      </p>

                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedIncome?.payment?.customer?.email || "-"}
                      </p>
                      <p>
                        <strong>Amount:</strong> ₹{formatCurrency(selectedIncome?.payment?.amount || 0)}
                      </p>
                      <p>
                        <strong>Payment Mode:</strong>{" "}
                        {selectedIncome?.payment?.paymentMode || "N/A"}
                      </p>
                      <p>
                        <strong>Payment Type:</strong>{" "}
                        {selectedIncome?.payment?.paymentType || "N/A"}
                      </p>

                      {/* <hr /> */}

                      <h5>Approved By</h5>

                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedIncome?.payment?.approvedBy?.name || "-"}
                      </p>

                      <p>
                        <strong>Phone:</strong>{" "}
                        {selectedIncome?.payment?.approvedBy?.phone || "-"}
                      </p>

                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedIncome?.payment?.approvedBy?.email || "-"}
                      </p>

                      <hr />

                      <p>
                        <strong>Business Amount:</strong> ₹{formatCurrency(selectedIncome?.businessAmount || 0)}
                      </p>

                      <p>
                        <strong>Income %:</strong> {selectedIncome?.percentage || 0}%
                      </p>

                      <p>
                        <strong>Income Earned:</strong> ₹{formatCurrency(selectedIncome?.amount || 0)}
                      </p>
                    </>
                  )}

                  {selectedIncome?.type === "referal_income" && (
                    <>
                      <h5>From User</h5>

                      <p>
                        <strong>Name:</strong> {selectedIncome?.fromUser?.name}
                      </p>

                      <p>
                        <strong>Designation:</strong> {selectedIncome?.fromUser?.designation}
                      </p>

                      <p>
                        <strong>Email:</strong> {selectedIncome?.fromUser?.email}
                      </p>

                      <p>
                        <strong>Phone:</strong> {selectedIncome?.fromUser?.phone}
                      </p>

                      <p>
                        <strong>Referral ID:</strong> {selectedIncome?.fromUser?.referralId}
                      </p>

                      {/* <hr /> */}

                      <h5>User Details</h5>

                      <p>
                        <strong>Name:</strong> {selectedIncome?.user?.name}
                      </p>

                      <p>
                        <strong>Designation:</strong> {selectedIncome?.user?.designation}
                      </p>

                      <p>
                        <strong>Email:</strong> {selectedIncome?.user?.email}
                      </p>

                      <p>
                        <strong>Phone:</strong> {selectedIncome?.user?.phone}
                      </p>

                      <p>
                        <strong>Referral ID:</strong> {selectedIncome?.user?.referralId}
                      </p>

                      {selectedIncome?.level && (
                        <p>
                          <strong>Level:</strong> {selectedIncome.level}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>}
        </ViewModal>
        <AddLocationModal
          open={exportOpen}
          onClose={closeExportModal}
          title="Export Commission Report"
        >
          <div className="export-modal-body">
            <div className="searchItem" style={{ marginBottom: "1rem" }}>
              <label>Agent</label>
              <select
                value={exportAgentId}
                onChange={(e) => setExportAgentId(e.target.value)}
              >
                <option value="">All (current table filters)</option>
                {agentOptions.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.referralId})
                  </option>
                ))}
              </select>
            </div>

            <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
              {selectedAgent
                ? `This will export the complete income history for ${selectedAgent.name} (${selectedAgent.referralId}), regardless of the search, status, date or tab filters currently applied to the table.`
                : "This will export whatever is currently shown by the table's search, status, date and tab filters."}
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
    </div>
  );
};

export default Income;