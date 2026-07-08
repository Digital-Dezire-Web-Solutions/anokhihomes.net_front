import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import DashboardCard from "../../components/Cards/DashboardCard";
import NiPayments from "../../icons/ni-payments";
import PaymentCard from "../../components/Cards/PaymentCard";
import { getAccountDetails, getIncome } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import NiSearch from "../../icons/ni-search";
import InvoiceCard from "../../components/Cards/InvoiceCard";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import formatDate from "../../components/DateFormate/DateFormate";
import "./Income.css";
import NiOpenEye from "../../icons/ni-openEye";
import ViewModal from "../../components/Modals/ViewModal";

const Income = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { userDetail, incomeHistory } = useSelector((state) => state.app);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 15;
  const [designationFilter, setDesignationFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getIncome());
  }, []);

  const filtered = useMemo(() => {
    return incomeHistory?.filter((income) => {
      const searchValue = search.toLowerCase();

      const matchSearch =
        income?.user?.name?.toLowerCase()?.includes(searchValue) ||
        income?.user?.email?.toLowerCase()?.includes(searchValue) ||
        income?.user?.phone?.includes(search) ||
        income?.user?.referralId?.toLowerCase()?.includes(searchValue);

      const matchDesignation =
        designationFilter === "" ||
        income?.user?.designation === designationFilter;

      const matchStatus =
        statusFilter === "" || income?.status === statusFilter;

      const incomeDate = new Date(income.createdAt);

      const matchFrom =
        !fromDate || incomeDate >= new Date(fromDate);

      const matchTo =
        !toDate ||
        incomeDate <= new Date(`${toDate}T23:59:59`);

      return (
        matchSearch &&
        matchDesignation &&
        matchStatus &&
        matchFrom &&
        matchTo
      );
    });
  }, [
    search,
    designationFilter,
    statusFilter,
    fromDate,
    toDate,
    incomeHistory,
  ]);

  const totalPages = Math.ceil(filtered?.length / ITEMS_PER_PAGE);
  const paginated = filtered?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const totalIncome =
    incomeHistory?.reduce((acc, item) => acc + item.amount, 0) || 0;

  const creditedIncome =
    incomeHistory
      ?.filter((i) => i.status === "credited")
      ?.reduce((acc, item) => acc + item.amount, 0) || 0;

  const pendingIncome =
    incomeHistory
      ?.filter((i) => i.status === "pending")
      ?.reduce((acc, item) => acc + item.amount, 0) || 0;

  const todayIncome =
    incomeHistory
      ?.filter((i) => {
        const today = new Date().toDateString();

        return new Date(i.createdAt).toDateString() === today;
      })
      ?.reduce((acc, item) => acc + item.amount, 0) || 0;

  // console.log(incomeHistory, "incomeHistory");
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
              title="Credited Income"
              value={`₹${formatCurrency(creditedIncome)}`}
              icons={<NiPayments />}
            />

            <DashboardCard
              title="Pending Income"
              value={`₹${formatCurrency(pendingIncome)}`}
              icons={<NiPayments />}
            />

            <DashboardCard
              title="Today's Income"
              value={`₹${formatCurrency(todayIncome)}`}
              icons={<NiPayments />}
            />

            <DashboardCard
              title="Total Transactions"
              value={incomeHistory?.length || 0}
              icons={<NiPayments />}
            />

            <DashboardCard
              title="My Wallet"
              value={`₹${formatCurrency(userDetail?.wallet || 0)}`}
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
                      <span>{index + 1}</span>
                      <span>{formatDate(item.createdAt)}</span>
                      <span>{item.user?.name} ({item.user?.referralId})</span>
                      <span>
                        {item.type
                          ?.replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span>₹{formatCurrency(item.amount)}</span>
                      <span>{item?.type !== "referal_income" ?
                        `${item?.payment?.customer?.name} (${item?.payment?.customer?.referralId})` || "-" :
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
      </div>
    </div>
  );
};

export default Income;
