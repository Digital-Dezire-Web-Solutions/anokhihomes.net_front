import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import "./Commission.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import NiSearch from "../../icons/ni-search";
import NiExport from "../../icons/ni-export";
import ViewModal from "../../components/Modals/ViewModal";
import CommissionTable from "../../components/Cards/CommissionTable";

import { useDispatch, useSelector } from "react-redux";
import { getIncome, getIncomeSummary } from "../../Redux/Slices/AppSlices";

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

    const commissionData = incomeSummary || [];
    console.log(commissionData, "commissionData")

    const formatCycleDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "2-digit",
            }
        );
    };

    const filteredData = useMemo(() => {
        return commissionData.filter((item) => {
            const searchText =
                search.toLowerCase();

            const matchSearch =
                item?.name
                    ?.toLowerCase()
                    .includes(searchText) ||
                item?.phone?.includes(search) ||
                item?.email?.includes(search) ||
                item?.referralId
                    ?.toLowerCase()
                    .includes(searchText);

            const matchCycle =
                !cycleFilter ||
                item?.cycleDate === cycleFilter;

            const matchStatus =
                !statusFilter ||
                (statusFilter === "pending" &&
                    item.pendingCommission > 0) ||
                (statusFilter === "credited" &&
                    item.creditedCommission > 0);

            return (
                matchSearch &&
                matchCycle &&
                matchStatus
            );
        });
    }, [
        commissionData,
        search,
        cycleFilter,
        statusFilter,
    ]);

    const totalPages =
        Math.ceil(
            filteredData.length /
            ITEMS_PER_PAGE
        ) || 1;

    const sortedData = useMemo(() => {
        return [...filteredData].sort(
            (a, b) => (b.selfBusiness || 0) - (a.selfBusiness || 0)
        );
    }, [filteredData]);

    const paginatedData = sortedData.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    // const paginatedData =
    //     filteredData.slice(
    //         (page - 1) *
    //         ITEMS_PER_PAGE,
    //         page * ITEMS_PER_PAGE
    //     );

    const exportToExcel = (
        rowsData = filteredData
    ) => {
        setSaving(true)
        const headers = [
            "Agent",
            "Phone",
            "Referral ID",
            "Income Type",
            "Business",
            "Percentage",
            "Amount",
            "Cycle Date",
            "Status",
        ];

        const rows =
            rowsData.map((item) => [
                item?.user?.name,
                item?.user?.phone,
                item?.user?.referralId,
                item?.type,
                item?.businessAmount,
                item?.percentage,
                item?.amount,
                formatCycleDate(
                    item?.cycleDate
                ),
                item?.status,
            ]);

        const csv =
            "data:text/csv;charset=utf-8," +
            [headers, ...rows]
                .map((e) =>
                    e.join(",")
                )
                .join("\n");

        const link =
            document.createElement("a");

        link.href = encodeURI(csv);

        link.download =
            "commission-report.csv";

        link.click();
        setSaving(false)
    };

    // console.log(paginatedData, "paginatedData")


    return (
        <div className="plot-container">
            <div className="table-filters">
                <div className="page-head-title">
                    <h2>Commission</h2>
                    <Breadcrumb />
                </div>

                <div className="page-tools">
                    <div className="searchItem">
                        <NiSearch />

                        <input
                            placeholder="Search Agent"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />
                    </div>
                    <button
                        className="add-button"
                        onClick={() =>
                            setExportOpen(true)
                        }
                    >
                        <NiExport />
                        Export
                    </button>
                </div>
            </div>

            <div className="card table-box">
                <div className="table ">
                    <div className="table-head commission-table">
                        <span>Name</span>
                        <span>Designation</span>
                        <span>Referral ID</span>
                        <span>Business</span>
                        <span>Wallet</span>
                        <span>Hold</span>
                        <span>Released</span>
                        <span>Total Income</span>
                        <span>Action</span>
                    </div>

                    {paginatedData.length === 0 ? (
                        <p >
                            No Commission Found
                        </p>
                    ) : (
                        paginatedData.map(
                            (item, index) => (
                                <CommissionTable
                                    key={item._id}
                                    index={index}
                                    item={item}
                                    mood={mood}
                                    exportToExcel={
                                        exportToExcel
                                    }
                                    mood={mood}
                                    setAler={setAlert}
                                />
                            )
                        ))}
                </div>
            </div>

            <div className="pagination">
                <button
                    disabled={page === 1}
                    onClick={() =>
                        setPage(page - 1)
                    }
                >
                    Prev
                </button>

                {Array.from({
                    length: totalPages,
                }).map((_, i) => (
                    <button
                        key={i}
                        className={
                            page === i + 1
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage(i + 1)
                        }
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    disabled={
                        page === totalPages
                    }
                    onClick={() =>
                        setPage(page + 1)
                    }
                >
                    Next
                </button>
            </div>

            <ViewModal
                open={exportOpen}
                onClose={() =>
                    setExportOpen(false)
                }
                title="Export Report"
            >
                <button
                disabled={saving}
                    onClick={() =>
                        exportToExcel()
                    }
                >
                    {saving ? "Exporting" : "Export Now"}
                </button>
            </ViewModal>
        </div>
    );
};

export default Commission;