import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import DashboardCard from "../../components/Cards/DashboardCard";
import NiPayments from "../../icons/ni-payments";
import PaymentCard from "../../components/Cards/PaymentCard";
import {
  getAccountDetails,
  getAllColonies,
  getExpense,
  getIncome,
  getLedger,
  getPayout,
  getPlots,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import NiSearch from "../../icons/ni-search";
import InvoiceCard from "../../components/Cards/InvoiceCard";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import formatDate from "../../components/DateFormate/DateFormate";
import "./Payout.css";
import NiOpenEye from "../../icons/ni-openEye";
import ViewModal from "../../components/Modals/ViewModal";
import NiEdit from "../../icons/ni-edit";
import NiDelete from "../../icons/ni-delete";
import Host from "../../Host/Host";
import axios from "axios";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../../components/Modals/ActionModal";
import { LucidePlus } from "lucide-react";
import { uploadImage } from "../LandingSetting/LandingApi";
import SearchSelect from "../../components/SearchItems/SearchSelect";
import NiCredit from "../../icons/ni-credit";
import NiDebit from "../../icons/ni-debit";

const Payout = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { userDetail, payout } = useSelector((state) => state.app);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const ITEMS_PER_PAGE = 25;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [cycleFilter, setCycleFilter] = useState("");

  const [formData, setFormData] = useState({
    amount: "",
    paymentMode: "",
    transactionId: "",
    chequeNumber: "",
    bankName: "",
    attachment: "",
    remarks: "",
  });

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getPayout());
  }, []);
  // console.log(forSalePlots, "forSalePlots");
  const summary = useMemo(() => {
    const data = payout || [];

    return {
      payable: data
        .filter((i) => i.status === "payable")
        .reduce((s, i) => s + i.balance, 0),

      partial: data
        .filter((i) => i.status === "partial")
        .reduce((s, i) => s + i.balance, 0),

      processing: data
        .filter((i) => i.status === "processing")
        .reduce((s, i) => s + i.balance, 0),

      hold: data
        .filter((i) => i.status === "hold")
        .reduce((s, i) => s + i.balance, 0),
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
        item.user?.phone?.includes(search) ||
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

  const handleFileUpload = (field, file) => {
    if (!file) return;

    const MAX_SIZE = 20 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      setAlert({
        message: "Image size should not exceed 20 MB",
        status: "Error",
      });

      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handlePay = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      let attachment = "";
      if (formData.attachment) {
              const upload = await uploadImage(formData.attachment);
              attachment = upload.url;
            }

      await axios.post(
        `${Host}/api/payout/pay/${selectedExpense._id}`,
        {
          amount: Number(formData.amount),
          paymentMode: formData.paymentMode,
          transactionId: formData.transactionId,
          chequeNumber: formData.chequeNumber,
          bankName: formData.bankName,
          attachment,
          remarks: formData.remarks,
        },
        {
          headers: {
            "auth-token": token,
          },
        },
      );

      dispatch(getPayout());

      setAlert({
        status: "Success",
        message: "Payout completed successfully.",
      });

      setTimeout(() => setAlert(null), 3000);

      setOpen(false);

      setFormData({
        amount: "",
        paymentMode: "",
        transactionId: "",
        chequeNumber: "",
        bankName: "",
        attachment: "",
        remarks: "",
      });
    } catch (err) {
      console.log(err);

      setAlert({
        status: "Error",
        message: err.response?.data?.msg || "Unable to complete payout.",
      });

      setTimeout(() => setAlert(null), 3000);
    }

    setSaving(false);
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
              title="Payable"
              value={`₹${formatCurrency(summary.payable)}`}
              icons={<NiPayments />}
            />

            <DashboardCard
              title="Partial"
              value={`₹${formatCurrency(summary.partial)}`}
              icons={<NiPayments />}
            />

            <DashboardCard
              title="Processing"
              value={`₹${formatCurrency(summary.processing)}`}
              icons={<NiPayments />}
            />

            <DashboardCard
              title="Hold"
              value={`₹${formatCurrency(summary.hold)}`}
              icons={<NiPayments />}
            />
          </div>
          <h4>Ledger History</h4>
          <div className="filter-grid page-tools table-filters">
            <div className="searchItem">
              <NiSearch />

              <input
                placeholder="Search Project.... "
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
                <option value="hold">Hold</option>
                <option value="payable">Payable</option>
                <option value="processing">Processing</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
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
                <option value="">All Cycles</option>

                {cycles.map((cycle) => (
                  <option key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="card table-box">
            <div className="table payout-table">
              <div className="table-head">
                <span>S.No</span>
                <span>Associate</span>
                <span>Referral ID</span>
                <span>Cycle</span>
                <span>Gross</span>
                <span>TDS</span>
                <span>Admin</span>
                <span>Net</span>
                <span>Balance</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {paginated?.length === 0 ? (
                <div >
                  <span>No Expense Found</span>
                </div>
              ) : (
                paginated?.map((item, index) => (
                  <div className="table-row" key={item._id}>
                    <span>{index + 1}</span>

                    <span>{item.user?.name}</span>

                    <span>{item.user?.referralId}</span>

                    <span>
                      {formatDate(item.cycleStart)}
                      <br />
                      {formatDate(item.cycleEnd)}
                    </span>

                    <span>₹{formatCurrency(item.grossAmount)}</span>

                    <span>₹{formatCurrency(item.tdsAmount)}</span>

                    <span>₹{formatCurrency(item.adminChargeAmount)}</span>

                    <span>₹{formatCurrency(item.netAmount)}</span>

                    <span>₹{formatCurrency(item.balance)}</span>

                    <span>
                      <span className={`status ${item.status}`}>
                        {item.status}
                      </span>
                    </span>

                    <div className="dots">
                      <span
                        onClick={() => {
                          setSelectedExpense(item);
                          setViewOpen(true);
                        }}
                      >
                        <NiOpenEye />
                      </span>

                      {(item.status === "payable" ||
                        item.status === "partial") && (
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
          }}
          title="Transaction Details"
        >
          <p>
            <strong>Associate :</strong>
            {selectedExpense?.user?.name}
          </p>

          <p>
            <strong>Phone :</strong>
            {selectedExpense?.user?.phone}
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
            <strong>TDS :</strong>₹{formatCurrency(selectedExpense?.tdsAmount)}
          </p>

          <p>
            <strong>Admin Charge :</strong>₹
            {formatCurrency(selectedExpense?.adminChargeAmount)}
          </p>

          <p>
            <strong>Net :</strong>₹{formatCurrency(selectedExpense?.netAmount)}
          </p>

          <p>
            <strong>Paid :</strong>₹{formatCurrency(selectedExpense?.totalPaid)}
          </p>

          <p>
            <strong>Remaining :</strong>₹
            {formatCurrency(selectedExpense?.balance)}
          </p>

          <p>
            <strong>Status :</strong>

            <span className={`status ${selectedExpense?.status}`}>
              {selectedExpense?.status}
            </span>
          </p>
          <h4>Payment History</h4>

          {selectedExpense?.payments?.length ? (
            selectedExpense?.payments.map((payment, index) => (
              <div className="history-card" key={index}>
                <p>
                  <strong>Amount :</strong>₹{formatCurrency(payment.amount)}
                </p>

                <p>
                  <strong>Mode :</strong>
                  {payment.paymentMode}
                </p>

                <p>
                  <strong>Transaction :</strong>
                  {payment.transactionId || "-"}
                </p>

                <p>
                  <strong>Date :</strong>
                  {formatDate(payment.paidAt)}
                </p>

                {payment.attachment && (
                  <img src={payment.attachment} alt="" width={180} />
                )}
              </div>
            ))
          ) : (
            <p>No payment history</p>
          )}
        </ViewModal>
        <AddLocationModal
          open={open}
          onClose={() => {
            setOpen(false);

            setFormData({
              amount: "",
              paymentMode: "",
              transactionId: "",
              chequeNumber: "",
              bankName: "",
              attachment: "",
              remarks: "",
            });
          }}
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
                  <strong>Net Amount :</strong> ₹
                  {formatCurrency(selectedExpense.netAmount)}
                </p>

                <p>
                  <strong>Already Paid :</strong> ₹
                  {formatCurrency(selectedExpense.totalPaid)}
                </p>

                <p style={{ color: "green", fontWeight: 600 }}>
                  <strong>Remaining :</strong> ₹
                  {formatCurrency(selectedExpense.balance)}
                </p>
              </div>

              <div className="field">
                <label>Amount</label>

                <input
                  type="number"
                  max={selectedExpense.balance}
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: e.target.value,
                    })
                  }
                />

                <small>
                  Maximum Payable : ₹{formatCurrency(selectedExpense.balance)}
                </small>
              </div>

              <div className="field">
                <label>Payment Mode</label>

                <select
                  value={formData.paymentMode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentMode: e.target.value,
                    })
                  }
                >
                  <option value="">Select</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {(formData.paymentMode === "upi" ||
                formData.paymentMode === "bank") && (
                <>
                  <div className="field">
                    <label>Transaction ID</label>

                    <input
                      value={formData.transactionId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transactionId: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Bank Name</label>

                    <input
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankName: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {formData.paymentMode === "cheque" && (
                <>
                  <div className="field">
                    <label>Cheque Number</label>

                    <input
                      value={formData.chequeNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chequeNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="field">
                    <label>Bank Name</label>

                    <input
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankName: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              <div className="field">
                <label>Attachment</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("attachment", e.target.files[0])}
                />

                {formData.attachment && (
                  <img
                    src={
                      formData.attachment instanceof File
                        ? URL.createObjectURL(formData.attachment)
                        : formData.attachment
                    }
                    alt=""
                    style={{
                      width: 120,
                      borderRadius: 8,
                      marginTop: 10,
                    }}
                  />
                )}
              </div>

              <div className="field">
                <label>Remarks</label>

                <textarea
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remarks: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  disabled={saving || !formData.amount || !formData.paymentMode}
                  onClick={handlePay}
                >
                  {saving ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </>
          )}
        </AddLocationModal>
      </div>
    </div>
  );
};

export default Payout;
