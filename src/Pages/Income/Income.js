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

const Income = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { userDetail, incomeHistory } = useSelector((state) => state.app);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 15;
  const [designationFilter, setDesignationFilter] = useState("");

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

      return matchSearch && matchDesignation && matchStatus;
    });
  }, [search, designationFilter, statusFilter, incomeHistory]);

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
          </div>
          <div className="user-card-box">
            {paginated?.length === 0 ? (
              <p>No Income Found</p>
            ) : (
              paginated?.reverse()?.map((item) => (
                <InvoiceCard
                  item={item}
                  // setSelectedPayment={setSelectedPayment}
                  // setIsEditMode={setIsEditMode}
                  // setOpen={setOpen}
                  mood={mood}
                  setAlert={setAlert}
                />
              ))
            )}
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
      </div>
    </div>
  );
};

export default Income;
