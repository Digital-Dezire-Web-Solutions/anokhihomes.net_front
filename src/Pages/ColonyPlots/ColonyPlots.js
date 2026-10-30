import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import "./ColonyPlots.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import DashboardCard from "../../components/Cards/DashboardCard";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import ViewModal from "../../components/Modals/ViewModal";
import Pagination from "../../components/Pagination/Pagination";
import NiSearch from "../../icons/ni-search";
import NiOpenEye from "../../icons/ni-openEye";
import NiPayments from "../../icons/ni-payments";
import Host from "../../Host/Host";
import formatDate from "../../components/DateFormate/DateFormate";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import { getAllColonies } from "../../Redux/Slices/AppSlices";
import NiEdit from "../../icons/ni-edit";
import PlotModal from "../../components/PlotDraw/PlotModal";
import Loader from "../../components/Loader/Loader";

const ITEMS_PER_PAGE = 25;

const PLOT_STATUS = {
    FOR_SALE: { label: "For Sale", className: "active" },
    HOLD: { label: "Hold", className: "pending2" },
    PENDING: { label: "Pending", className: "pending" },
    SOLD: { label: "Sold", className: "failed" },
    NOT_FOR_SALE: { label: "Not For Sale", className: "" },
    ROAD: { label: "Road", className: "" },
};

const BOOKING_STATUS_CLASS = {
    confirmed: "active",
    pending: "pending",
    approval: "pending2",
};

const FILTER_OPTIONS = [
    { value: "", label: "All Plots" },
    // { value: "booked", label: "Booked" },
    { value: "FOR_SALE", label: "For Sale" },
    { value: "HOLD", label: "Hold" },
    { value: "PENDING", label: "Pending" },
    { value: "SOLD", label: "Sold" },
];

const ColonyPlots = ({ mood, setAlert }) => {
    const dispatch = useDispatch();
    const { allColonies } = useSelector((state) => state.app);

    const [colonyId, setColonyId] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [plotss, setPlotss] = useState([]);

    useEffect(() => {
        dispatch(getAllColonies());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // pick the first colony once the list is loaded
    useEffect(() => {
        if (!colonyId && allColonies?.length) setColonyId(allColonies[0]._id);
    }, [allColonies, colonyId]);

    useEffect(() => {
        if (!colonyId) return;
        let ignore = false;

        const load = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${Host}/api/colony/${colonyId}/plots`, {
                    headers: { "auth-token": token },
                });
                if (!ignore) setData(res.data);
            } catch (err) {
                if (ignore) return;
                setData(null);
                setAlert({
                    message: err.response?.data?.message || "Unable to load plots",
                    status: "Error",
                });
                setTimeout(() => setAlert(null), 3000);
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        load();
        return () => {
            ignore = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colonyId]);

    const colonyOptions = useMemo(
        () =>
            (allColonies || []).map((c) => ({
                value: c._id,
                label: `${c.name}${c.locationId?.name ? `, ${c.locationId.name}` : ""}`,
            })),
        [allColonies],
    );

    // natural order: A-2, A-3, A-10 ... (roads are not shown)
    const plots = useMemo(
        () =>
            (data?.plots || [])
                .filter((p) => p.plotType !== "ROAD")
                .sort((a, b) =>
                    String(a.plotNumber || "").localeCompare(
                        String(b.plotNumber || ""),
                        undefined,
                        { numeric: true },
                    ),
                ),
        [data],
    );

    const stats = useMemo(() => {
        const s = {
            total: 0,
            booked: 0,
            forSale: 0,
            hold: 0,
            sold: 0,
            amount: 0,
            paid: 0,
            remaining: 0,
            hasDetails: false,
        };

        plots.forEach((p) => {
            // every plot is counted once: sold > booked > hold > for sale
            if (p.plotType === "SOLD") s.sold += 1;
            else if (p.isBooked) s.booked += 1;
            else if (p.plotType === "HOLD") s.hold += 1;
            else if (p.plotType === "FOR_SALE") s.forSale += 1;

            if (p.booking) {
                s.hasDetails = true;
                s.amount += p.booking.totalAmount || 0;
                s.paid += p.booking.amountPaid || 0;
                s.remaining += p.booking.remaining || 0;
            }
        });

        s.total = s.forSale + s.booked + s.hold + s.sold;
        return s;
    }, [plots]);

    const filtered = useMemo(() => {
        const k = search.trim().toLowerCase();
        return plots.filter((p) => {
            const matchFilter =
                !filter || (filter === "booked" ? p.isBooked : p.plotType === filter);

            const matchSearch =
                !k ||
                String(p.plotNumber || "").toLowerCase().includes(k) ||
                p.booking?.customer?.name?.toLowerCase().includes(k) ||
                p.booking?.customer?.phone?.includes(k) ||
                p.booking?.agent?.name?.toLowerCase().includes(k) ||
                p.booking?.agent?.referralId?.toLowerCase().includes(k);

            return matchFilter && matchSearch;
        });
    }, [plots, search, filter]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE,
    );

    const sb = selected?.booking;
    const sStatus = PLOT_STATUS[selected?.plotType];
    const sProgress = sb?.totalAmount
        ? Math.min((sb.amountPaid / sb.totalAmount) * 100, 100)
        : 0;

    const updatePlot = (id, changes) => {
        setPlotss((prevPlots) =>
            prevPlots.map((p) => {
                if (p._id !== id) return p;

                let updatedPlot;

                // Drag / resize
                if (typeof changes === "function") {
                    updatedPlot = {
                        ...p,
                        points: changes(p.points),
                    };
                } else {
                    // Modal form update
                    updatedPlot = {
                        ...p,
                        ...changes,
                    };
                }

                // 🔥 sync selected plot
                if (selectedPlot?._id === id) {
                    setSelectedPlot(updatedPlot);
                }

                return updatedPlot;
            }),
        );
    };

    const handleEditPlot = (plot) => {
        setSelectedPlot(plot)
    }
    // console.log(selected,"selected")
    return (
        // <div className="plot-container">
        //     <div className="table-filters">
        //         <div className="page-head-title">
        //             <h2>Colony Plots</h2>
        //             <Breadcrumb />
        //         </div>
        //     </div>

        <div className="dashboard-container">
            <div className="dashboard-wrapper">
                <div className="filter-grid page-tools table-filters">
                    <CustomSelect
                        className="cs-filter"
                        value={colonyId}
                        onChange={(v) => {
                            setColonyId(v);
                            setFilter("");
                            setSearch("");
                            setPage(1);
                        }}
                        placeholder="Select Colony"
                        options={colonyOptions}
                    />

                    <div className="searchItem">
                        <NiSearch />
                        <input
                            placeholder="Search plot / customer / associate"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <CustomSelect
                        className="cs-filter"
                        value={filter}
                        onChange={(v) => {
                            setFilter(v);
                            setPage(1);
                        }}
                        placeholder="All Plots"
                        options={FILTER_OPTIONS}
                    />
                </div>

                <div className="dashboard-grid">
                    <DashboardCard title="Total Plots" value={stats.total} icons={<NiPayments />} />
                    <DashboardCard title="Booked" value={stats.booked} icons={<NiPayments />} />
                    <DashboardCard title="For Sale" value={stats.forSale} icons={<NiPayments />} />
                    <DashboardCard title="Hold" value={stats.hold} icons={<NiPayments />} />
                    <DashboardCard title="Sold" value={stats.sold} icons={<NiPayments />} />
                    {stats.hasDetails && (
                        <>
                            <DashboardCard
                                title="Booking Amount"
                                value={`₹${formatCurrency(stats.amount)}`}
                                icons={<NiPayments />}
                            />
                            <DashboardCard
                                title="Received"
                                value={`₹${formatCurrency(stats.paid)}`}
                                icons={<NiPayments />}
                            />
                            <DashboardCard
                                title="Remaining"
                                value={`₹${formatCurrency(stats.remaining)}`}
                                icons={<NiPayments />}
                            />
                        </>
                    )}
                </div>

                <h4 style={{ margin: "20px 0 10px 0" }}>{data?.colony?.name || "Plots"}</h4>

                <div className="card table-box">
                    <div className="plots-scroll">
                        <div className="table plots-table">
                            <div className="table-head">
                                <span>S.No</span>
                                <span>Plot</span>
                                <span>Area</span>
                                <span>Rate</span>
                                <span>Status</span>
                                <span>Customer</span>
                                <span>Associate</span>
                                <span>Total</span>
                                <span>Paid</span>
                                <span>Remaining</span>
                                <span>Action</span>
                            </div>

                            {loading ? (
                                <Loader />
                            ) : !colonyId ? (
                                <div>
                                    <span>Select a colony</span>
                                </div>
                            ) : paginated.length === 0 ? (
                                <div>
                                    <span>No Plots Found</span>
                                </div>
                            ) : (
                                paginated.map((p, index) => {
                                    const b = p.booking;
                                    const st = PLOT_STATUS[p.plotType] || {
                                        label: p.plotType,
                                        className: "",
                                    };

                                    return (
                                        <div className="table-row" key={p._id}>
                                            <span>{(page - 1) * ITEMS_PER_PAGE + index + 1}</span>
                                            <span>{p.plotNumber}</span>
                                            <span>{formatCurrency(p.area)} sqft</span>
                                            <span>₹{formatCurrency(b?.ratePerSqft ?? p.price)}/sqft</span>
                                            <span>
                                                <span className={`status ${st.className}`}>{st.label}</span>
                                            </span>
                                            <span>
                                                {b?.customer ? (
                                                    <>
                                                        {b.customer.name}
                                                        <small>{b.customer.phone}</small>
                                                    </>
                                                ) : (
                                                    "-"
                                                )}
                                            </span>
                                            <span>
                                                {b?.agent ? (
                                                    <>
                                                        {b.agent.name}
                                                        <small>{b.agent.referralId}</small>
                                                    </>
                                                ) : (
                                                    "-"
                                                )}
                                            </span>
                                            <span>{b ? `₹${formatCurrency(b.totalAmount)}` : "-"}</span>
                                            <span>{b ? `₹${formatCurrency(b.amountPaid)}` : "-"}</span>
                                            <span>{b ? `₹${formatCurrency(b.remaining)}` : "-"}</span>
                                            <div className="dots">
                                                {st.label !== "Sold" &&
                                                    <span onClick={() => handleEditPlot(p)}>
                                                        <NiEdit />
                                                    </span>
                                                }
                                                {b && (
                                                    <span onClick={() => setSelected(p)}>
                                                        <NiOpenEye />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {totalPages > 1 && (
                    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                )}
            </div>

            <ViewModal
                open={!!selected}
                onClose={() => setSelected(null)}
                title={`Plot ${selected?.plotNumber || ""}`}
            >
                {sb && (
                    <div className="report-view-box-right active">
                        {/* <h4>Plot</h4> */}
                        <p>
                            <strong>Colony :</strong>
                            {data?.colony?.name}
                        </p>
                        <p>
                            <strong>Plot No :</strong>
                            {selected.plotNumber}
                        </p>
                        <p>
                            <strong>Area :</strong>
                            {formatCurrency(sb.plotArea || selected.area)} sqft
                        </p>
                        <p>
                            <strong>Status :</strong>
                            <span className={`status ${sStatus?.className || ""}`}>
                                {sStatus?.label || selected.plotType}
                            </span>
                        </p>

                        <h4>Customer</h4>
                        <p>
                            <strong>Name :</strong>
                            {sb.customer?.name || "-"}
                        </p>
                        <p>
                            <strong>Phone :</strong>
                            {sb.customer?.phone || "-"}
                        </p>

                        <h4>Associate</h4>
                        <p>
                            <strong>Name :</strong>
                            {sb.agent?.name || "-"}
                        </p>
                        <p>
                            <strong>Referral ID :</strong>
                            {sb.agent?.referralId || "-"}
                        </p>
                        <p>
                            <strong>Phone :</strong>
                            {sb.agent?.phone || "-"}
                        </p>

                        <h4>Booking</h4>
                        <p>
                            <strong>Status :</strong>
                            <span
                                style={{ textTransform: "capitalize" }}
                                className={`status ${BOOKING_STATUS_CLASS[sb.status] || ""}`}
                            >
                                {sb.status}
                            </span>
                        </p>
                        <p>
                            <strong>Booked On :</strong>
                            {formatDate(sb.bookedOn)}
                        </p>
                        <p>
                            <strong>Rate :</strong>₹{formatCurrency(sb.ratePerSqft)}/sqft
                        </p>
                        {sb.plcPercent > 0 && (
                            <p>
                                <strong>PLC ({sb.plcPercent}%) :</strong>₹
                                {formatCurrency(sb.plcAmount)}
                            </p>
                        )}
                        <p>
                            <strong>Total Amount :</strong>₹{formatCurrency(sb.totalAmount)}
                        </p>
                        <p>
                            <strong>Paid :</strong>₹{formatCurrency(sb.amountPaid)}
                        </p>
                        <p>
                            <strong>Remaining :</strong>₹{formatCurrency(sb.remaining)}
                        </p>

                        <div className="payment-progress">
                            <h5>Payment Progress</h5>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${sProgress}%` }}
                                />
                            </div>
                            <p>{Math.floor(sProgress)}% Paid</p>
                        </div>
                    </div>
                )}
            </ViewModal>
            {selectedPlot && (
                <PlotModal
                    plot={selectedPlot}
                    mood={mood}
                    updatePlot={updatePlot}
                    onClose={() => setSelectedPlot(null)}
                    setAlert={setAlert}
                    projectId={selectedPlot._id}
                />
            )}
        </div>
        // </div>
    );
};

export default ColonyPlots;