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
    getPlots,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import NiSearch from "../../icons/ni-search";
import InvoiceCard from "../../components/Cards/InvoiceCard";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import formatDate from "../../components/DateFormate/DateFormate";
import "./Accounts.css";
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

const Accounts = ({ mood, setAlert }) => {
    const dispatch = useDispatch();
    const { userDetail, ledger, allColonies, plots } = useSelector((state) => state.app);
    const [search, setSearch] = useState("");
    const [viewOpen, setViewOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [projectFilter, setProjectFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const ITEMS_PER_PAGE = 25;
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeRow, setActiveRow] = useState(false);
    const [selectedDelete, setSelectedDelete] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selectedColonies, setSelectedColonies] = useState();

    useEffect(() => {
        dispatch(getAccountDetails());
        dispatch(getLedger());
        dispatch(getAllColonies());
    }, []);
    useEffect(() => {
        dispatch(getPlots(projectFilter));
    }, [projectFilter]);
    const forSalePlots = useMemo(() => {
        if (!projectFilter || !plots?.plots) return 0;

        return plots.plots.filter(
            (plot) => plot.plotType === "FOR_SALE"
        ).length;
    }, [plots, projectFilter]);

    // console.log(forSalePlots, "forSalePlots");
    const filtered = useMemo(() => {
        return ledger?.ledger?.filter((item) => {
            const keyword = search.toLowerCase();
            const matchSearch =
                item.projectName?.toLowerCase().includes(keyword) ||
                item.customer?.toLowerCase().includes(keyword) ||
                item.particular?.toLowerCase().includes(keyword);
            const matchProject =
                projectFilter === "" || item.project?._id === projectFilter;
            const matchFrom = !fromDate || new Date(item.date) >= new Date(fromDate);
            const matchTo = !toDate || new Date(item.date) <= new Date(toDate);
            return matchSearch && matchProject && matchFrom && matchTo;
        });
    }, [ledger, search, projectFilter, fromDate, toDate]);

    const totalPages = Math.ceil(filtered?.length / ITEMS_PER_PAGE);
    const paginated = filtered?.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
    );

    return (
        <div className="plot-container">
            <div className="table-filters">
                <div className="page-head-title">
                    <h2>Accounts</h2>
                    <Breadcrumb />
                </div>
            </div>
            <div className="dashboard-container">
                <div className="dashboard-wrapper">
                    <div className="dashboard-grid">
                        <DashboardCard
                            title="Credit"
                            value={`₹${formatCurrency(ledger?.summary?.totalCredit || 0)}`}
                            icons={<NiPayments />}
                        />

                        <DashboardCard
                            title="Debit"
                            value={`₹${formatCurrency(ledger?.summary?.totalDebit || 0)}`}
                            icons={<NiPayments />}
                        />

                        <DashboardCard
                            title={ledger?.summary?.status}
                            value={`₹${formatCurrency(ledger?.summary?.profit || 0)}`}
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
                            <select
                                value={projectFilter}
                                onChange={(e) => {
                                    setProjectFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">All Projects</option>

                                {allColonies?.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
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

                    </div>
                    <div className="card table-box">
                        <div className="table account-table">
                            <div className="table-head">
                                <span>S.No</span>
                                <span>Date</span>
                                <span>Project</span>
                                <span>Particular</span>
                                <span>Name</span>
                                <span>Credit</span>
                                <span>Debit</span>
                                <span>Balance</span>
                                <span>Mode</span>
                                <span>Action</span>
                            </div>
                            {paginated?.length === 0 ? (
                                <div>
                                    <span>No Expense Found</span>
                                </div>
                            ) : (
                                paginated?.map((item, index) => (
                                    <div className="table-row" key={index}>
                                        <span>{index + 1}</span>
                                        <span>{formatDate(item.date)}</span>
                                        <span>{item.projectName}</span>
                                        <span>{item.particular}</span>
                                        <span>{item.customer}</span>
                                        <span className="credit">
                                            ₹{formatCurrency(item.credit)}
                                        </span>
                                        <span className="debit">
                                            ₹{formatCurrency(item.debit)}
                                        </span>
                                        <p style={{ margin: "0" }}>
                                            <span className={`account-status-box ${item?.debit !== 0 ? "Loss" : "Profit"}`}>
                                                ₹{formatCurrency(item.balance)}
                                            </span>
                                        </p>
                                        <span>{item.paymentMode}</span>
                                        <span
                                            onClick={() => {
                                                setSelectedExpense(item);
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
                    <div className="account-table-footer">
                        {projectFilter &&
                            <div className="account-status-item">
                                <b>Pending Plots For Sale  : </b>
                                <div className="account-status Profit">
                                    {forSalePlots}
                                </div>
                            </div>
                        }
                        <div className="account-status-item">
                            <b>Total Credit : </b>
                            <div className="account-status Profit">
                                <NiCredit /> ₹{formatCurrency(ledger?.summary?.totalCredit)}
                            </div>
                        </div>

                        <div className="account-status-item">
                            <b>Total Debit : </b>
                            <div className="account-status Loss"><NiDebit /> ₹{formatCurrency(ledger?.summary?.totalDebit)}</div>
                        </div>
                        <div className="account-status-item">
                            <b>{ledger?.summary?.status} : </b>
                            <div className={`account-status ${ledger?.summary?.status}`}>{ledger?.summary?.status === "Loss" ? <NiDebit /> : <NiCredit />} ₹{formatCurrency(ledger?.summary?.profit)}</div>
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
                    {selectedExpense && (
                        <div className="payment-details">

                            <p>
                                <strong>Date :</strong>{" "}
                                {formatDate(selectedExpense.date)}
                            </p>

                            <p>
                                <strong>Project :</strong>{" "}
                                {selectedExpense.projectName}
                            </p>

                            <p>
                                <strong>Transaction Type :</strong>{" "}
                                <span
                                    className={
                                        selectedExpense.type === "payment"
                                            ? "status active"
                                            : "status pending"
                                    }
                                >
                                    {selectedExpense.type === "payment"
                                        ? "Credit"
                                        : "Debit"}
                                </span>
                            </p>

                            <p>
                                <strong>Particular :</strong>{" "}
                                {selectedExpense.particular}
                            </p>

                            <p>
                                <strong>Name :</strong>{" "}
                                {selectedExpense.customer}
                            </p>

                            <p>
                                <strong>Payment Mode :</strong>{" "}
                                {selectedExpense.paymentMode}
                            </p>

                            {selectedExpense.type === "payout" && (
                                <>
                                    <hr />

                                    <p>
                                        <strong>Payout To :</strong>{" "}
                                        {selectedExpense.payout?.user?.name}
                                    </p>

                                    <p>
                                        <strong>Gross Amount :</strong> ₹
                                        {formatCurrency(selectedExpense.payout?.grossAmount)}
                                    </p>

                                    <p>
                                        <strong>TDS :</strong> ₹
                                        {formatCurrency(selectedExpense.payout?.tdsAmount)}
                                    </p>

                                    <p>
                                        <strong>Admin Charge :</strong> ₹
                                        {formatCurrency(selectedExpense.payout?.adminChargeAmount)}
                                    </p>

                                    <p>
                                        <strong>Net Paid :</strong> ₹
                                        {formatCurrency(selectedExpense.payout?.netAmount)}
                                    </p>

                                    <p>
                                        <strong>Payment Type :</strong>{" "}
                                        {selectedExpense.payout?.paymentType}
                                    </p>

                                    <p>
                                        <strong>Transaction ID :</strong>{" "}
                                        {selectedExpense.payout?.transactionId || "-"}
                                    </p>

                                    <p>
                                        <strong>Cheque No :</strong>{" "}
                                        {selectedExpense.payout?.chequeNumber || "-"}
                                    </p>

                                    <p>
                                        <strong>Bank :</strong>{" "}
                                        {selectedExpense.payout?.bankName || "-"}
                                    </p>

                                    <p>
                                        <strong>Status :</strong>{" "}
                                        <span className="status active">
                                            {selectedExpense.payout?.status}
                                        </span>
                                    </p>

                                    <p>
                                        <strong>Paid By :</strong>{" "}
                                        {selectedExpense.payout?.paidBy?.name || "-"}
                                    </p>

                                    <p>
                                        <strong>Paid At :</strong>{" "}
                                        {formatDate(selectedExpense.payout?.paidAt)}
                                    </p>

                                    <p>
                                        <strong>Remarks :</strong>{" "}
                                        {selectedExpense.payout?.remarks || "-"}
                                    </p>

                                    {selectedExpense.payout?.attachment && (
                                        <>
                                            <strong>Attachment</strong>
                                            <br />

                                            <img
                                                src={selectedExpense.payout.attachment}
                                                alt=""
                                                style={{
                                                    width: 220,
                                                    marginTop: 10,
                                                    borderRadius: 8,
                                                }}
                                            />
                                        </>
                                    )}
                                </>
                            )}
                            <hr />

                            <p>
                                <strong>Credit :</strong>{" "}
                                <span style={{ color: "var(--success-color)" }}>
                                    ₹{formatCurrency(selectedExpense.credit)}
                                </span>
                            </p>

                            <p>
                                <strong>Debit :</strong>{" "}
                                <span style={{ color: "var(--error-color)" }}>
                                    ₹{formatCurrency(selectedExpense.debit)}
                                </span>
                            </p>

                            <p>
                                <strong>Running Balance :</strong>{" "}
                                ₹{formatCurrency(selectedExpense.balance)}
                            </p>

                        </div>
                    )}
                </ViewModal>
            </div>
        </div>
    );
};

export default Accounts;
