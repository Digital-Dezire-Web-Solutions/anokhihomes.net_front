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

const STATUS_OPTIONS = ["hold", "released", "paid", "cancelled"];
const PAYABLE_STATUSES = ["hold", "released"];
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

const Payout = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { payout } = useSelector((state) => state.app);
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
  const [imageModal, setImageModal] = useState({
    open: false,
    src: "",
  });
  const [exportOpen, setExportOpen] = useState(false);
  const [exportCycle, setExportCycle] = useState("");

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getPayout());
  }, []);

  const summary = useMemo(() => {
    const data = payout || [];

    return {
      released: data
        ?.filter((i) => i.status === "released")
        ?.reduce((s, i) => s + (i.netAmount || 0), 0),

      paid: data
        ?.filter((i) => i.status === "paid")
        ?.reduce((s, i) => s + (i.netAmount || 0), 0),

      cancelled: data
        ?.filter((i) => i.status === "cancelled")
        ?.reduce((s, i) => s + (i.netAmount || 0), 0),
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
    return (payout || []).filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.user?.name?.toLowerCase().includes(keyword) ||
        item.user?.referralId?.toLowerCase().includes(keyword);

      const matchFrom =
        !fromDate || new Date(item.cycleStart) >= new Date(fromDate);
      const matchTo = !toDate || new Date(item.cycleEnd) <= new Date(toDate);
      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchCycle =
        !cycleFilter || `${item.cycleStart}_${item.cycleEnd}` === cycleFilter;
      return matchSearch && matchFrom && matchTo && matchStatus && matchCycle;
    });
  }, [payout, search, fromDate, toDate, statusFilter, cycleFilter]);

  const totalPages = Math.ceil(filtered?.length / ITEMS_PER_PAGE);
  const paginated = filtered?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

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

  const handlePay = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");
      let attachment = "";
      if (noteImage) {
        const upload = await uploadImage(noteImage);
        attachment = upload.url;
      }
      const payload = {
        paymentMode: formData.mode,
        transactionId: formData.transactionId || "",
        attachment: attachment || "",
      };
      await axios.put(
        `${Host}/api/payout/pay/${selectedExpense._id}`,
        payload,
        {
          headers: {
            "auth-token": token,
          },
        },
      );
      console.log(payload, "payload");
      dispatch(getPayout());

      setAlert({
        status: "Success",
        message: "Payout marked as paid.",
      });

      setTimeout(() => setAlert(null), 3000);

      setOpen(false);
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

    if (!exportCycle) {
      return payout;
    }

    return payout.filter(
      (item) => `${item.cycleStart}_${item.cycleEnd}` === exportCycle,
    );
  };

  /* =====================================================
     FORMAT USER DATA FOR EXPORT
  ===================================================== */

  const getExportRows = () => {
    const selectedUsers = getExportUsers();

    return selectedUsers.map((item) => {
      return {
        Name: item?.user?.name || "-",
        Phone: item?.user?.phone || "-",
        Email: item?.user?.email || "-",
        UserID: item?.user?.referralId || "-",
        Cycle: `${formatDate(item.cycleStart)} - ${formatDate(item.cycleEnd)}`,
        Gross: item?.grossAmount,
        TDS: item?.tdsAmount,
        AdminCharge: item?.adminChargeAmount,
        Net: item?.netAmount,
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
        ...rows.map((row) =>
          String(row[key] ?? "").length
        )
      );

      return {
        wch: Math.min(maxLength + 3, 40),
      };
    });

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Users"
    );

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

  const exportToPDF = () => {
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

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const cycleLabel = cycles.find((c) => c.value === exportCycle)?.label;

    const title = exportCycle ? `Payouts — ${cycleLabel}` : "All Payouts";

    doc.setFontSize(18);
    doc.text(title, 14, 15);

    doc.setFontSize(9);
    doc.text(
      `Total Records: ${rows.length}`,
      14,
      22
    );

    const columns = Object.keys(rows[0]);

    const body = rows.map((row) =>
      columns.map((column) => row[column] ?? "-")
    );

    const columnStyles = {};

    columns.forEach((column, index) => {
      let width = 18;

      switch (column) {
        case "Name":
          width = 20;
          break;

        case "Phone":
          width = 17;
          break;

        case "Email":
          width = 28;
          break;

        case "UserID":
          width = 20;
          break;

        case "Cycle":
          width = 20;
          break;

        case "Gross":
          width = 28;
          break;

        case "TDS":
          width = 17;
          break;

        case "Admin Charge":
          width = 20;
          break;

        case "Net":
          width = 25;
          break;

        case "Status":
          width = 17;
          break;

        case "Payment Mode":
          width = 20;
          break;

        case "Transaction Id":
          width = 45;
          break;

        default:
          width = 18;
      }

      columnStyles[index] = {
        cellWidth: width,
      };
    });

    autoTable(doc, {
      head: [columns],
      body,

      startY: 27,

      theme: "grid",

      tableWidth: "wrap",

      styles: {
        fontSize: 5.5,
        cellPadding: 1.2,
        overflow: "linebreak",
        valign: "middle",
        halign: "left",
        lineWidth: 0.1,
      },

      headStyles: {
        fontSize: 5.5,
        fontStyle: "bold",
        valign: "middle",
      },

      bodyStyles: {
        valign: "middle",
      },

      columnStyles,

      margin: {
        top: 27,
        left: 5,
        right: 5,
        bottom: 8,
      },
    });


    const fileName = exportCycle
      ? `payouts-${exportCycle.split("_")[0]?.slice(0, 10)}-to-${exportCycle.split("_")[1]?.slice(0, 10)}.pdf`
      : "all-payouts.pdf";

    doc.save(fileName);

    setAlert({
      message: "PDF exported successfully",
      status: "Success",
    });

    setTimeout(() => {
      setAlert(null);
    }, 3000);

    setExportOpen(false);
  };

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
              title="Cancelled"
              value={`₹${formatCurrency(summary.cancelled)}`}
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
            <div className="searchItem">
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
            </div>
            <div className="searchItem">
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
            </div>
            <button
              className="add-button"
              onClick={() => {
                setExportCycle("");
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
                        className={`status ${item.status === "paid"
                          ? "active"
                          : item.status === "released"
                            ? "pending"
                            : "failed"
                          }`}
                      >
                        {item.status}
                      </span>
                    </span>

                    <div className="dots">
                      <span onClick={() => openView(item)}>
                        <NiOpenEye />
                      </span>
                      {mood === "admin" && (
                        <div className="modal-actions">
                          {PAYABLE_STATUSES.includes(item.status) && (
                            <button
                              className="table-btn"
                              onClick={() => {
                                setSelectedExpense(item);
                                setOpen(true);
                              }}
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
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
              className={activeTab === "history" ? "active" : ""}
              onClick={() => setActiveTab("history")}
            >
              Income History
            </button>
          </div>
          {activeTab === "summary" ? (
            <>
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
                  className={`status ${selectedExpense?.status === "paid"
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
            </>
          ) : (
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
                          className={`status ${h.status === "credited" ? "active" : "pending"
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
          onClose={() => setOpen(false)}
          title="Pay Associate"
        >
          {selectedExpense && (
            <>
              <div className="summary-card">
                <h4>{selectedExpense.user?.name}</h4>

                <p>
                  <strong>Referral :</strong> {selectedExpense.user?.referralId}
                </p>

                <p>
                  <strong>Cycle :</strong>{" "}
                  {formatDate(selectedExpense.cycleStart)} -{" "}
                  {formatDate(selectedExpense.cycleEnd)}
                </p>

                <p>
                  <strong>Gross Amount :</strong> ₹
                  {formatCurrency(selectedExpense.grossAmount)}
                </p>

                <p>
                  <strong>TDS :</strong> ₹
                  {formatCurrency(selectedExpense.tdsAmount)}
                </p>

                <p>
                  <strong>Admin Charge :</strong> ₹
                  {formatCurrency(selectedExpense.adminChargeAmount)}
                </p>

                <p style={{ color: "green", fontWeight: 600 }}>
                  <strong>Net Amount to pay :</strong> ₹
                  {formatCurrency(selectedExpense.netAmount)}
                </p>
              </div>

              <p>
                This will mark the full net amount as paid and cannot be undone.
              </p>
              <>
                <h4>Payment</h4>

                <div className="field">
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
                </div>
                <div className="field">
                  <label>
                    Amount
                    <small style={{ fontSize: "12px", color: "green" }}>
                      ₹{formatCurrency(selectedExpense.netAmount)}
                    </small>
                  </label>
                  <input
                    type="number"
                    value={selectedExpense.netAmount}
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
                      <label>
                        Attachment *
                      </label>
                      <input
                        id="site-note-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNoteImage(e.target.files[0])}
                      />
                    </div>
                  )}
                <div className="modal-actions">
                  <button disabled={saving} onClick={handlePay}>
                    {saving ? "Processing..." : "Confirm Payout"}
                  </button>
                </div>
              </>
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

            <select
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
