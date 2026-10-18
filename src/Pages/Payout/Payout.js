import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import DashboardCard from "../../components/Cards/DashboardCard";
import NiPayments from "../../icons/ni-payments";
import { getAccountDetails, getPayout } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import NiSearch from "../../icons/ni-search";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import formatDate from "../../components/DateFormate/DateFormate";
import "./Payout.css";
import NiOpenEye from "../../icons/ni-openEye";
import ViewModal from "../../components/Modals/ViewModal";
import Host from "../../Host/Host";
import axios from "axios";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import { uploadImage } from "../LandingSetting/LandingApi";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import Pagination from "../../components/Pagination/Pagination";
import logo from "../../Assets/Logo/logo-anokhi-home-green.png";
import NiReceipt from "../../icons/ni-receipt";
import { printPayoutStatement } from "../../components/Utils/printpayoutstatement";
import CustomSelect from "../../components/CustomSelect/CustomSelect";

const STATUS_OPTIONS = ["released", "paid", "cancelled"];
const PAYABLE_STATUSES = ["released"];
const INCOME_TYPE_LABELS = {
  direct_income: "Direct Income",
  difference_income: "Difference Income",
  matching_income: "Matching Income",
  royalty_income: "Royalty Income",
  cashback_income: "Cashback Income",
  best_performance_income: "Best Performance Income",
  festival_bonus_income: "Festival Bonus Income",
  referal_income: "Referral Income",
  reward_income: "Reward Income",
};
const CATEGORY_DISPLAY_LABELS = {
  "Anokhi Homes": "Anokhi Homes + Other",
  Patliputra: "Patliputra",
};

const MIN_PAYABLE = 1000;

const Payout = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { payout, userDetail } = useSelector((state) => state.app);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseDetail, setExpenseDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const ITEMS_PER_PAGE = 25;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [cycleFilter, setCycleFilter] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [formData, setFormData] = useState({});
  const [noteImage, setNoteImage] = useState(null);
  const [payCategory, setPayCategory] = useState(null);
  const [imageModal, setImageModal] = useState({
    open: false,
    src: "",
  });
  const [exportOpen, setExportOpen] = useState(false);
  const [exportCycle, setExportCycle] = useState("");
  const [exportCategory, setExportCategory] = useState("");

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getPayout());
  }, []);

  // Net amount already paid on a payout (counts paid categories, not just fully paid payouts)
  const getPaidAmount = (i) => {
    if (i.status === "paid") return i.netAmount || 0;
    return (i.categoryPayments || [])
      .filter((c) => c.status === "paid")
      .reduce((s, c) => s + (c.netAmount || 0), 0);
  };

  // Net amount still to be paid on a payout
  const getRemaining = (i) =>
    PAYABLE_STATUSES.includes(i.status)
      ? Math.max((i.netAmount || 0) - getPaidAmount(i), 0)
      : 0;

  const summary = useMemo(() => {
    const data = payout || [];

    const remainingByUser = {};
    const paidByUser = {};
    let paid = 0;
    let unpaid = 0;
    let released = 0;
    let fullyPaid = 0;

    data.forEach((item) => {
      const id = item.user?._id;
      const paidAmt = getPaidAmount(item);
      const remaining = getRemaining(item);

      paid += paidAmt;
      unpaid += remaining;
      if (item.status === "released") released += remaining;
      if (item.status === "paid") fullyPaid += 1;
      if (!id) return;
      if (paidAmt > 0) paidByUser[id] = (paidByUser[id] || 0) + paidAmt;
      if (remaining > 0)
        remainingByUser[id] = (remainingByUser[id] || 0) + remaining;
    });

    const userTotals = Object.values(remainingByUser);

    return {
      released,
      paid,
      unpaid,
      fullyPaid,
      cancelled: data
        .filter((i) => i.status === "cancelled")
        .reduce((s, i) => s + (i.netAmount || 0), 0),
      payoutCount: data.length,
      payableCount: userTotals.filter((t) => t >= MIN_PAYABLE).length,
      notPayableCount: userTotals.filter((t) => t < MIN_PAYABLE).length,
      paidCount: Object.keys(paidByUser).length,
    };
  }, [payout]);

  const cycles = useMemo(() => {
    const unique = [];

    (payout || []).forEach((item) => {
      const value = `${item.cycleStart}_${item.cycleEnd}`;

      if (!unique.find((c) => c.value === value)) {
        unique.push({
          value,
          label: `${formatDate(item.cycleStart)} - ${formatDate(item.cycleEnd)}`,
        });
      }
    });

    return unique;
  }, [payout]);

  const filtered = useMemo(() => {
    const base = (payout || []).filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.user?.name?.toLowerCase().includes(keyword) ||
        item.user?.referralId?.toLowerCase().includes(keyword);

      const matchFrom =
        !fromDate || new Date(item.cycleStart) >= new Date(fromDate);
      const matchTo = !toDate || new Date(item.cycleEnd) <= new Date(toDate);
      const matchStatus =
        !statusFilter ||
        item.status === statusFilter ||
        (statusFilter === "paid" && getPaidAmount(item) > 0);
      const matchCycle =
        !cycleFilter || `${item.cycleStart}_${item.cycleEnd}` === cycleFilter;
      return matchSearch && matchFrom && matchTo && matchStatus && matchCycle;
    });

    return base.sort((a, b) => (b.netAmount || 0) - (a.netAmount || 0));
  }, [payout, search, fromDate, toDate, statusFilter, cycleFilter]);

  const totalPages = Math.ceil(filtered?.length / ITEMS_PER_PAGE);
  const paginated = filtered?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const fetchPayoutDetail = async (item) => {
    setExpenseDetail(null);
    setDetailLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${Host}/api/payout/${item._id}`, {
        headers: { "auth-token": token },
      });
      setExpenseDetail(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      setAlert({
        status: "Error",
        message: "Unable to load payout details.",
      });
      setTimeout(() => setAlert(null), 3000);
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const openView = async (item) => {
    setSelectedExpense(item);
    setViewOpen(true);
    setExpenseDetail(null);
    setDetailLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${Host}/api/payout/${item._id}`, {
        headers: { "auth-token": token },
      });
      setExpenseDetail(res.data);
    } catch (err) {
      console.log(err);
      setAlert({
        status: "Error",
        message: "Unable to load payout details.",
      });
      setTimeout(() => setAlert(null), 3000);
    }

    setDetailLoading(false);
  };

  const openDirectPay = async (item) => {
    setSelectedExpense(item);
    setPayCategory(null); // let the admin choose in the modal
    setFormData({});
    setNoteImage(null);

    const detail = await fetchPayoutDetail(item);

    const firstPending = detail?.categoryBreakdown?.find(
      (c) => c.status !== "paid" && c.grossAmount > 0,
    );
    if (firstPending) {
      setPayCategory(firstPending.category);
    }

    setOpen(true);
  };

  const handlePay = async () => {
    if (!payCategory) {
      setAlert({
        status: "Error",
        message: "Please select a category to pay.",
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");
      let attachment = "";
      if (noteImage) {
        const upload = await uploadImage(noteImage);
        attachment = upload.url;
      }

      const payload = {
        category: payCategory,
        paymentMode: formData.mode,
        transactionId: formData.transactionId || "",
        attachment: attachment || "",
        remark: formData.remark || "",
      };

      await axios.put(
        `${Host}/api/payout/pay-category/${selectedExpense._id}`,
        payload,
        { headers: { "auth-token": token } },
      );

      dispatch(getPayout());

      if (viewOpen) {
        await fetchPayoutDetail(selectedExpense);
      }

      setAlert({
        status: "Success",
        message: `${CATEGORY_DISPLAY_LABELS[payCategory] || payCategory} payout marked as paid.`,
      });
      setTimeout(() => setAlert(null), 3000);

      setOpen(false);
      setPayCategory(null);
    } catch (err) {
      console.log(err);
      setAlert({
        status: "Error",
        message: err.response?.data?.message || "Unable to complete payout.",
      });
      setTimeout(() => setAlert(null), 3000);
    }

    setSaving(false);
  };

  const getExportUsers = () => {
    if (!payout || !Array.isArray(payout)) {
      return [];
    }

    let base = exportCycle
      ? payout.filter(
          (item) => `${item.cycleStart}_${item.cycleEnd}` === exportCycle,
        )
      : payout;

    if (exportCategory) {
      base = base.filter((item) =>
        (item.categoryPayments || []).some(
          (c) => c.category === exportCategory,
        ),
      );
    }

    // match the table's own sort order (highest netAmount first)
    return [...base].sort((a, b) => (b.netAmount || 0) - (a.netAmount || 0));
  };

  const canPay = (item) =>
    PAYABLE_STATUSES.includes(item.status) &&
    (payableTotalsByUser[item.user?._id] || 0) >= MIN_PAYABLE;

  /* =====================================================
     FORMAT USER DATA FOR EXPORT
  ===================================================== */
  const fmt2 = (n) => (Number(n) || 0).toFixed(2);
  const getCategoryText = (item) => {
    let entries = item?.categoryPayments || [];
    if (exportCategory) {
      entries = entries.filter((c) => c.category === exportCategory);
    }
    if (!entries.length) return "-";
    return entries
      .map((c) => {
        const name = CATEGORY_DISPLAY_LABELS[c.category] || c.category;
        return `${name} (${c.status === "paid" ? "Paid" : "Unpaid"})`;
      })
      .join(", ");
  };

  const getExportRows = () => {
    const selectedUsers = getExportUsers();

    return selectedUsers.map((item, index) => {
      return {
        "S.No": index + 1,
        Name: item?.user?.name || "-",
        Email: item?.user?.email || "-",
        UserID: item?.user?.referralId || "-",
        Cycle: `${formatDate(item.cycleStart)} - ${formatDate(item.cycleEnd)}`,
        Category: getCategoryText(item), // <-- new
        Gross: fmt2(item?.grossAmount),
        TDS: fmt2(item?.tdsAmount),
        AdminCharge: fmt2(item?.adminChargeAmount),
        Net: fmt2(item?.netAmount),
        Status: item?.status,
        PaymentMode: item?.paymentMode || "-",
        TransactionId: item?.transactionId || "-",
      };
    });
  };

  /* =====================================================
     EXPORT EXCEL
  ===================================================== */

  const exportToExcel = () => {
    const rows = getExportRows();

    if (!rows.length) {
      setAlert({
        message: "No users found for selected filter",
        status: "Error",
      });

      setTimeout(() => {
        setAlert(null);
      }, 3000);

      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);

    /* Auto column width */

    const columnWidths = Object.keys(rows[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...rows.map((row) => String(row[key] ?? "").length),
      );

      return {
        wch: Math.min(maxLength + 3, 40),
      };
    });

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // in exportToExcel:
    const fileName = exportCycle
      ? `payouts-${exportCycle.split("_")[0]?.slice(0, 10)}-to-${exportCycle.split("_")[1]?.slice(0, 10)}.xlsx`
      : "all-payouts.xlsx";

    XLSX.writeFile(workbook, fileName);

    setAlert({
      message: "Excel exported successfully",
      status: "Success",
    });

    setTimeout(() => {
      setAlert(null);
    }, 3000);

    setExportOpen(false);
  };

  /* =====================================================
     EXPORT PDF
  ===================================================== */
  const loadLogo = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve({
          data: canvas.toDataURL("image/png"),
          ratio: img.naturalWidth / img.naturalHeight,
        });
      };
      img.onerror = () => resolve(null); // export still works without the logo
      img.src = src;
    });

  const exportToPDF = async () => {
    const rows = getExportRows();

    if (!rows.length) {
      setAlert({
        message: "No users found for selected filter",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const logoImg = await loadLogo(logo);
    const LOGO_HEIGHT = 14; // mm
    const RIGHT_MARGIN = 5; // matches this table's right margin

    const drawLogo = () => {
      if (!logoImg) return;
      const w = LOGO_HEIGHT * logoImg.ratio; // keeps the aspect ratio
      const x = doc.internal.pageSize.getWidth() - RIGHT_MARGIN - w;
      doc.addImage(logoImg.data, "PNG", x, 6, w, LOGO_HEIGHT);
    };

    const cycleLabel = cycles.find((c) => c.value === exportCycle)?.label;
    const title = exportCycle ? `Payouts — ${cycleLabel}` : "All Payouts";

    doc.setFontSize(25);
    doc.text(title, 14, 15);

    doc.setFontSize(24);
    doc.text(`Total Records: ${rows.length}`, 14, 22);

    const columns = Object.keys(rows[0]);
    const body = rows.map((row) => columns.map((column) => row[column] ?? "-"));

    // relative proportions — scaled below to always fill the printable width
    const baseWidths = {
      "S.No": 8,
      Name: 20,
      Email: 28,
      UserID: 20,
      Cycle: 20,
      Gross: 16,
      TDS: 14,
      AdminCharge: 18,
      Net: 18,
      Status: 15,
      PaymentMode: 18,
      TransactionId: 30,
    };

    const margin = { top: 27, left: 5, right: 5, bottom: 8 };
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
      headStyles: {
        fontSize: 6,
        fontStyle: "bold",
        valign: "middle",
      },
      bodyStyles: { valign: "middle" },
      columnStyles,
      margin,
      didDrawPage: drawLogo,
    });

    const fileName = exportCycle
      ? `payouts-${exportCycle.split("_")[0]?.slice(0, 10)}-to-${exportCycle.split("_")[1]?.slice(0, 10)}.pdf`
      : "all-payouts.pdf";

    doc.save(fileName);

    setAlert({
      message: "PDF exported successfully",
      status: "Success",
    });
    setTimeout(() => setAlert(null), 3000);
    setExportOpen(false);
  };

  // Total payable (hold + released) net amount per associate — used to
  // decide whether to show the Pay button even when a single payout's
  // netAmount is below the ₹1000 threshold.
  const payableTotalsByUser = useMemo(() => {
    const totals = {};

    (payout || []).forEach((item) => {
      if (!PAYABLE_STATUSES.includes(item.status)) return;

      const id = item.user?._id;
      if (!id) return;

      totals[id] = (totals[id] || 0) + (item.netAmount || 0);
    });

    return totals;
  }, [payout]);

  const myPayoutWallet = useMemo(() => {
    const myId = userDetail?._id;
    if (!myId) return 0;
    return payableTotalsByUser[myId] || 0;
  }, [payableTotalsByUser, userDetail]);

  console.log(expenseDetail, "payCategory");
  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Payout</h2>
          <Breadcrumb />
        </div>
      </div>
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
          <div className="dashboard-grid">
            <DashboardCard
              title="Released"
              value={`₹${formatCurrency(summary.released)}`}
              icons={<NiPayments />}
            />

            <DashboardCard
              title="Paid"
              value={`₹${formatCurrency(summary.paid)}`}
              icons={<NiPayments />}
            />

            <DashboardCard
              title="Unpaid"
              value={`₹${formatCurrency(summary.released - summary.paid)}`}
              icons={<NiPayments />}
            />
            <DashboardCard
              title="No. of Payout"
              value={summary.payoutCount}
              icons={<NiPayments />}
            />
            <DashboardCard
              title="No. of Payable (Person)"
              value={summary.payableCount}
              icons={<NiPayments />}
            />
            <DashboardCard
              title="No. of UnPayable (Person)"
              value={summary.notPayableCount}
              icons={<NiPayments />}
            />
            <DashboardCard
              title="No. of Paid (Person)"
              value={summary.fullyPaid}
              icons={<NiPayments />}
            />
            <DashboardCard
              title={`Payout Wallet (${mood == "admin" ? "Admin" : mood === "agent" ? "Associate" : "Staff"})`}
              value={`₹${formatCurrency(myPayoutWallet)}`}
              icons={<NiPayments />}
            />
          </div>
          <h4>Ledger History</h4>
          <div className="filter-grid page-tools table-filters">
            <div className="searchItem">
              <NiSearch />

              <input
                placeholder="Search associate...."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            {/* <div className="searchItem">
              <label>From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="searchItem">
              <label>To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div> */}
            {/* <div className="searchItem">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="searchItem">
              <select
                value={cycleFilter}
                onChange={(e) => {
                  setCycleFilter(e.target.value);
                  setPage(1);
                }}
              >
                {cycles.map((cycle) => (
                  <option key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </option>
                ))}
                <option value="">All Cycles</option>
              </select>
            </div> */}
            <CustomSelect
              className="cs-filter"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              placeholder="All Status"
              options={[
                { value: "", label: "All Status" },
                ...STATUS_OPTIONS.map((s) => ({
                  value: s,
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                })),
              ]}
            />

            <CustomSelect
              className="cs-filter"
              value={cycleFilter}
              onChange={(v) => {
                setCycleFilter(v);
                setPage(1);
              }}
              placeholder="All Cycles"
              options={[
                { value: "", label: "All Cycles" },
                ...cycles.map((c) => ({ value: c.value, label: c.label })),
              ]}
            />
            <button
              className="add-button"
              onClick={() => {
                setExportCycle("");
                setExportCategory("");
                setExportOpen(true);
              }}
            >
              <Download size={18} />
              Export
            </button>
          </div>
          <div className="card table-box">
            <div className="table payout-table">
              <div className="table-head">
                <span>S.No</span>
                <span>Associate</span>
                <span>Cycle</span>
                <span>Referral ID</span>
                <span>Gross</span>
                <span>TDS</span>
                <span>Admin</span>
                <span>Net</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {paginated?.length === 0 ? (
                <div>
                  <span>No Payout Found</span>
                </div>
              ) : (
                paginated?.map((item, index) => (
                  <div className="table-row" key={item._id}>
                    <span>{(page - 1) * ITEMS_PER_PAGE + index + 1}</span>

                    <span>{item.user?.name}</span>

                    <span>
                      {formatDate(item.cycleStart)} -{" "}
                      {formatDate(item.cycleEnd)}
                    </span>
                    <span>{item.user?.referralId}</span>

                    <span>₹{formatCurrency(item.grossAmount)}</span>

                    <span>₹{formatCurrency(item.tdsAmount)}</span>

                    <span>₹{formatCurrency(item.adminChargeAmount)}</span>

                    <span>₹{formatCurrency(item.netAmount)}</span>

                    <span>
                      <span
                        style={{ textTransform: "capitalize" }}
                        className={`status ${
                          item.status === "paid"
                            ? "active"
                            : item.status === "released"
                              ? "pending"
                              : "failed"
                        }`}
                      >
                        {item.status !== "paid" && getPaidAmount(item) > 0
                          ? "Partially"
                          : item.status}
                      </span>
                    </span>

                    <div className="dots">
                      <span
                        onClick={() => openView(item)}
                        style={{ border: "none" }}
                      >
                        <NiOpenEye />
                      </span>
                      {mood === "admin" && (
                        <div className="modal-actions">
                          {canPay(item) && (
                            <button
                              className="table-btn"
                              onClick={() => openDirectPay(item)}
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      )}
                      {/* {item.status === "paid" && ( */}
                      <span
                        role="button"
                        tabIndex={0}
                        title="Print receipt"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const token = localStorage.getItem("token");
                            const res = await axios.get(
                              `${Host}/api/payout/${item._id}`,
                              {
                                headers: { "auth-token": token },
                              },
                            );
                            printPayoutStatement({
                              ...item,
                              categoryBreakdown: res.data.categoryBreakdown,
                            });
                          } catch (err) {
                            console.log(err);
                            printPayoutStatement(item); // still prints, just without category amounts
                          }
                        }}
                      >
                        <NiReceipt />
                      </span>
                      {/* )} */}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>

        <ViewModal
          open={viewOpen}
          onClose={() => {
            setViewOpen(false);
            setSelectedExpense(null);
            setExpenseDetail(null);
          }}
          title="Payout Details"
        >
          <div className="table-filters">
            <button
              className={activeTab === "summary" ? "active" : ""}
              onClick={() => setActiveTab("summary")}
            >
              Summary
            </button>
            <button
              className={activeTab === "classification" ? "active" : ""}
              onClick={() => setActiveTab("classification")}
            >
              Classification
            </button>
            <button
              className={activeTab === "history" ? "active" : ""}
              onClick={() => setActiveTab("history")}
            >
              Income History
            </button>
          </div>
          {activeTab === "classification" && (
            <div className="report-view-box-right active">
              {expenseDetail?.categoryDisplay?.map((i) => (
                <div className="history-card" key={i._id}>
                  <h5>{i.category}</h5>
                  <p>
                    <strong>Gross Amount : </strong>₹
                    {formatCurrency(i.grossAmount)}
                  </p>
                  <p>
                    <strong>Admin Charge : </strong>₹
                    {formatCurrency(i.adminChargeAmount)}
                  </p>
                  <p>
                    <strong>TDS : </strong>₹{formatCurrency(i.tdsAmount)}
                  </p>
                  <p>
                    <strong>Net Amount : </strong>₹{formatCurrency(i.netAmount)}
                  </p>
                  <p>
                    <strong>Status : </strong>
                    <span
                      style={{ textTransform: "capitalize" }}
                      className={`status ${i.status === "paid" ? "active" : "pending"}`}
                    >
                      {i.status}
                    </span>
                  </p>

                  {i.status === "paid" ? (
                    <>
                      {i.paymentMode && (
                        <p>
                          <strong>Payment Mode : </strong>
                          {i.paymentMode}
                        </p>
                      )}
                      {i.transactionId && (
                        <p>
                          <strong>Transaction Id : </strong>
                          {i.transactionId}
                        </p>
                      )}
                      {i.paidAt && (
                        <p>
                          <strong>Paid At : </strong>
                          {formatDate(i.paidAt)}
                        </p>
                      )}
                    </>
                  ) : (
                    i.isPayable &&
                    mood === "admin" &&
                    canPay(selectedExpense) && (
                      <div className="modal-actions">
                        <button
                          className="table-btn"
                          onClick={() => {
                            setPayCategory(i.payBucket);
                            setSelectedExpense(selectedExpense);
                            setFormData({});
                            setNoteImage(null);
                            setOpen(true);
                          }}
                        >
                          Pay{" "}
                          {CATEGORY_DISPLAY_LABELS[i.payBucket] || i.payBucket}
                        </button>
                      </div>
                    )
                  )}

                  {!i.isPayable && i.status !== "paid" && (
                    <p style={{ fontSize: "0.85rem", color: "#777" }}>
                      Included in the{" "}
                      {CATEGORY_DISPLAY_LABELS[i.payBucket] || i.payBucket}{" "}
                      payment above.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {activeTab === "summary" && (
            <div className="report-view-box-right active">
              <p>
                <strong>Associate :</strong>
                {selectedExpense?.user?.name}
              </p>

              <p>
                <strong>Referral :</strong>
                {selectedExpense?.user?.referralId}
              </p>

              <p>
                <strong>Cycle :</strong>
                {formatDate(selectedExpense?.cycleStart)}
                {" - "}
                {formatDate(selectedExpense?.cycleEnd)}
              </p>

              <p>
                <strong>Gross :</strong>₹
                {formatCurrency(selectedExpense?.grossAmount)}
              </p>

              <p>
                <strong>TDS ({selectedExpense?.tdsPercent}%) :</strong>₹
                {formatCurrency(selectedExpense?.tdsAmount)}
              </p>

              <p>
                <strong>
                  Admin Charge ({selectedExpense?.adminChargePercent}%) :
                </strong>
                ₹{formatCurrency(selectedExpense?.adminChargeAmount)}
              </p>

              <p>
                <strong>Net :</strong>₹
                {formatCurrency(selectedExpense?.netAmount)}
              </p>

              <p>
                <strong>Status :</strong>
                <span
                  style={{ textTransform: "capitalize" }}
                  className={`status ${
                    selectedExpense?.status === "paid"
                      ? "active"
                      : selectedExpense?.status === "released"
                        ? "pending"
                        : "failed"
                  }`}
                >
                  {selectedExpense?.status}
                </span>
              </p>
              {selectedExpense?.status === "paid" && (
                <p>
                  <strong>Paid At :</strong>
                  {formatDate(selectedExpense?.paidAt)}
                </p>
              )}

              {selectedExpense?.paymentMode && (
                <p>
                  <strong>Payment Mode :</strong>
                  {selectedExpense?.paymentMode}
                </p>
              )}
              {selectedExpense?.transactionId && (
                <p>
                  <strong>Transaction Id :</strong>
                  {selectedExpense?.transactionId}
                </p>
              )}
              {selectedExpense?.attachment && (
                <p>
                  {/* <strong>Attachment :</strong> */}
                  <img
                    src={selectedExpense?.attachment}
                    className="note-preview"
                    alt=""
                    onClick={() =>
                      setImageModal({
                        open: true,
                        src: selectedExpense?.attachment,
                      })
                    }
                  />
                </p>
              )}
            </div>
          )}
          {activeTab === "history" && (
            <div className="report-view-box-right active">
              {detailLoading ? (
                <p>Loading...</p>
              ) : expenseDetail?.historyCount ? (
                <>
                  {(expenseDetail.histories || []).map((h) => (
                    <div className="history-card" key={h._id}>
                      <h5>
                        <strong>
                          {INCOME_TYPE_LABELS[h.type] || h.type} :
                        </strong>
                        ₹{formatCurrency(h.amount)}
                      </h5>

                      {h.businessAmount ? (
                        <p>
                          <strong>Business :</strong>₹
                          {formatCurrency(h.businessAmount)}
                          {h.percentage ? ` (${h.percentage}%)` : ""}
                        </p>
                      ) : null}

                      {h.fromUser?.name ? (
                        <p>
                          <strong>From :</strong>
                          {h.fromUser.name}
                          {h.fromUser.referralId
                            ? ` (${h.fromUser.referralId})`
                            : ""}
                        </p>
                      ) : null}

                      <p>
                        <strong>Status :</strong>
                        <span
                          style={{ textTransform: "capitalize" }}
                          className={`status ${
                            h.status === "credited" ? "active" : "pending"
                          }`}
                        >
                          {h.status}
                        </span>
                      </p>

                      <p>
                        <strong>Date :</strong>
                        {formatDate(h.createdAt)}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <p>No income entries found for this payout</p>
              )}
            </div>
          )}
        </ViewModal>

        <AddLocationModal
          open={open}
          onClose={() => {
            setOpen(false);
            setPayCategory(null);
          }}
          title="Pay Associate"
        >
          {selectedExpense && (
            <>
              {(() => {
                const categoryEntry = payCategory
                  ? expenseDetail?.categoryBreakdown?.find(
                      (c) => c.category === payCategory,
                    )
                  : null;

                const displayNet = categoryEntry
                  ? categoryEntry.netAmount
                  : selectedExpense.netAmount;
                const displayGross = categoryEntry
                  ? categoryEntry.grossAmount
                  : selectedExpense.grossAmount;
                const displayTds = categoryEntry
                  ? categoryEntry.tdsAmount
                  : selectedExpense.tdsAmount;
                const displayAdmin = categoryEntry
                  ? categoryEntry.adminChargeAmount
                  : selectedExpense.adminChargeAmount;

                return (
                  <div className="summary-card">
                    <h4>{selectedExpense.user?.name}</h4>
                    <p>
                      <strong>Referral :</strong>{" "}
                      {selectedExpense.user?.referralId}
                    </p>
                    <p>
                      <strong>Cycle :</strong>{" "}
                      {formatDate(selectedExpense.cycleStart)} -{" "}
                      {formatDate(selectedExpense.cycleEnd)}
                    </p>
                    <p>
                      <strong>Gross Amount :</strong> ₹
                      {formatCurrency(displayGross)}
                    </p>
                    <p>
                      <strong>TDS :</strong> ₹{formatCurrency(displayTds)}
                    </p>
                    <p>
                      <strong>Admin Charge :</strong> ₹
                      {formatCurrency(displayAdmin)}
                    </p>
                    <p style={{ color: "green", fontWeight: 600 }}>
                      <strong>Net Amount to pay :</strong> ₹
                      {formatCurrency(displayNet)}
                    </p>
                  </div>
                );
              })()}

              <p>
                This will mark the{" "}
                {payCategory
                  ? `${CATEGORY_DISPLAY_LABELS[payCategory] || payCategory} portion`
                  : "selected category"}{" "}
                as paid and cannot be undone.
              </p>

              <h4>Payment</h4>

              {/* <div className="field">
                <label>Category</label>
                <select
                  value={payCategory || ""}
                  onChange={(e) => setPayCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {(expenseDetail?.categoryBreakdown || [])
                    .filter((c) => c.grossAmount > 0)
                    .map((c) => (
                      <option
                        key={c.category}
                        value={c.category}
                        disabled={c.status === "paid"}
                      >
                        {CATEGORY_DISPLAY_LABELS[c.category] || c.category}
                        {c.status === "paid" ? " (Paid)" : ""}
                      </option>
                    ))}
                </select>
              </div> */}
              <div className="field">
                <label>Category</label>
                <CustomSelect
                  value={payCategory || ""}
                  onChange={setPayCategory}
                  placeholder="Select Category"
                  options={[
                    { value: "", label: "Select Category" },
                    ...(expenseDetail?.categoryBreakdown || [])
                      .filter((c) => c.grossAmount > 0)
                      .map((c) => ({
                        value: c.category,
                        label: `${CATEGORY_DISPLAY_LABELS[c.category] || c.category}${c.status === "paid" ? " (Paid)" : ""}`,
                        disabled: c.status === "paid",
                      })),
                  ]}
                />
              </div>

              {/* <div className="field">
                <label>Payment Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData({ ...formData, mode: e.target.value })
                  }
                >
                  <option value="">Select Mode</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div> */}
              <div className="field">
                <label>Payment Mode</label>
                <CustomSelect
                  value={formData.mode || ""}
                  onChange={(v) => setFormData({ ...formData, mode: v })}
                  placeholder="Select Mode"
                  options={[
                    { value: "", label: "Select Mode" },
                    { value: "cash", label: "Cash" },
                    { value: "upi", label: "UPI" },
                    { value: "cheque", label: "Cheque" },
                    { value: "bank", label: "Bank Transfer" },
                  ]}
                />
              </div>

              {(formData.mode === "upi" || formData.mode === "bank") && (
                <div className="field">
                  <label>Transaction ID *</label>
                  <input
                    placeholder="Enter Transaction ID"
                    value={formData.transactionId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transactionId: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              {(formData.mode === "cash" || formData.mode === "cheque") && (
                <div className="field">
                  <label>Remark *</label>
                  <input
                    placeholder="Enter Remark"
                    value={formData.remark || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remark: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {["upi", "cash", "cheque", "bank"].includes(formData.mode) && (
                <div className="field">
                  <label>Attachment *</label>
                  <input
                    id="site-note-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNoteImage(e.target.files[0])}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  disabled={saving || !payCategory || !formData.mode}
                  onClick={handlePay}
                >
                  {saving ? "Processing..." : "Confirm Payout"}
                </button>
              </div>
            </>
          )}
        </AddLocationModal>
        <AddLocationModal
          open={imageModal.open}
          onClose={() =>
            setImageModal({
              open: false,
              src: "",
            })
          }
          title="Image Preview"
        >
          <div className="image-preview-modal">
            <img
              src={imageModal.src}
              alt="Preview"
              className="image-preview-full"
            />
          </div>
        </AddLocationModal>
        <AddLocationModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          title="Export User"
        >
          {/* <div className="export-modal"> */}
          <div className="export-modal-body">
            <p>Select which cycle you want to export</p>

            <label>Payouts in selection: {getExportUsers().length}</label>

            {/* <select
              value={exportCycle}
              onChange={(e) => setExportCycle(e.target.value)}
            >
              <option value="">All Cycles</option>
              {cycles.map((cycle) => (
                <option key={cycle.value} value={cycle.value}>
                  {cycle.label}
                </option>
              ))}
            </select>
            <select
              value={exportCategory}
              onChange={(e) => setExportCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_DISPLAY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select> */}
            <CustomSelect
              value={exportCycle}
              onChange={setExportCycle}
              placeholder="All Cycles"
              options={[
                { value: "", label: "All Cycles" },
                ...cycles.map((c) => ({ value: c.value, label: c.label })),
              ]}
            />

            <CustomSelect
              value={exportCategory}
              onChange={setExportCategory}
              placeholder="All Categories"
              options={[
                { value: "", label: "All Categories" },
                ...Object.entries(CATEGORY_DISPLAY_LABELS).map(
                  ([value, label]) => ({
                    value,
                    label,
                  }),
                ),
              ]}
            />

            <div className="export-fields">
              <p>Export includes:</p>
              <span>Name</span>
              <span>Phone</span>
              <span>Email</span>
              <span>UserID</span>
              <span>Cycle</span>
              <span>Gross</span>
              <span>TDS</span>
              <span>Admin Charge</span>
              <span>Net</span>
              <span>Status</span>
              <span>Payment Mode</span>
              <span>Transaction Id</span>
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

          {/* </div> */}
        </AddLocationModal>
      </div>
    </div>
  );
};

export default Payout;
