import React, { useEffect, useMemo, useState } from "react";

import "./Commission.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import NiSearch from "../../icons/ni-search";
import NiExport from "../../icons/ni-export";
import ViewModal from "../../components/Modals/ViewModal";
import CommissionTable from "../../components/Cards/CommissionTable";

import { useDispatch, useSelector } from "react-redux";
import { getIncomeSummary } from "../../Redux/Slices/AppSlices";
import Pagination from "../../components/Pagination/Pagination";

const ITEMS_PER_PAGE = 15;

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

  // GET /commission/summary returns a flat array of per-agent
  // objects: root User fields spread, plus incomeSummary,
  // businessSummary, rankSummary, rewardSummary, payoutSummary,
  // walletSummary, ratingSummary, histories, payouts, cycleStart,
  // cycleEnd, cycleDate (next pending cycleDate, may be null).
  const commissionData = incomeSummary || [];

  const formatCycleDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };

  const filteredData = useMemo(() => {
    return commissionData.filter((item) => {
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

      return matchSearch && matchCycle && matchStatus;
    });
  }, [commissionData, search, cycleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // Exports exactly what the table shows — one row per agent, the
  // same income/payout columns visible in CommissionTable. The old
  // version exported item.user.*, item.type, item.businessAmount,
  // item.amount — those fields don't exist on this response shape
  // (that shape belongs to a single IncomeHistory row, not the
  // per-agent summary object this page actually receives).
  const exportToExcel = (rowsData = filteredData) => {
    setSaving(true);

    const headers = [
      "Agent",
      "Phone",
      "Referral ID",
      "Designation",
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
      "Hold (payouts)",
      "Next Cycle Date",
    ];

    const rows = rowsData.map((item) => [
      item?.name,
      item?.phone,
      item?.referralId,
      item?.designation,
      item?.incomeSummary?.directIncome,
      item?.incomeSummary?.differenceIncome,
      item?.incomeSummary?.matchingIncome,
      item?.incomeSummary?.royaltyIncome,
      item?.incomeSummary?.cashbackIncome,
      item?.incomeSummary?.bestPerformanceIncome,
      item?.incomeSummary?.totalCommission,
      item?.incomeSummary?.tdsAmount,
      item?.incomeSummary?.adminChargeAmount,
      item?.incomeSummary?.payableAmount,
      item?.payoutSummary?.holdCommission,
      formatCycleDate(item?.cycleDate),
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");

    link.href = encodeURI(csv);

    link.download = "commission-report.csv";

    link.click();
    setSaving(false);
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
            <NiExport />
            Export
          </button>
        </div>
      </div>

      <div className="card table-box">
        <div className="table commission-table-box">
          <div className="table-head commission-table">
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
            <span>Hold</span>
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
              />
            ))
          )}
        </div>
      </div>

     <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />

      <ViewModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export Report"
      >
        <button disabled={saving} onClick={() => exportToExcel()}>
          {saving ? "Exporting" : "Export Now"}
        </button>
      </ViewModal>
    </div>
  );
};

export default Commission;