import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import TeamGraph from "../../components/Team/TeamGraph";
import "./Team.css";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../../components/Modals/ActionModal";

const teamsData = [
    {
        id: 1,
        name: "Sales Alpha",
        leader: {
            id: "amit",
            name: "Amit",
            avatar: "https://i.pravatar.cc/100?img=1",
            role: "leader",
            members: [
                {
                    id: "rahul",
                    name: "Rahul",
                    avatar: "https://i.pravatar.cc/40?img=1",
                    role: "agent",
                    members: [
                        {
                            id: "rahul2",
                            name: "Rahul2",
                            avatar: "https://i.pravatar.cc/40?img=1",
                            role: "executive",
                            members: [],
                        },
                    ],
                },
                {
                    id: "imran",
                    name: "Imran",
                    avatar: "https://i.pravatar.cc/40?img=1",
                    role: "agent",
                    members: [],
                },
                {
                    id: "arjun",
                    name: "Arjun",
                    avatar: "https://i.pravatar.cc/40?img=1",
                    role: "agent",
                    members: [],
                },
            ],
        },
    },
];

const ITEMS_PER_PAGE = 10;

const TeamDetail = ({ mood, currentUser }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [view, setView] = useState("graph");

    const team = teamsData.find((t) => t.id === Number(id));
    const [activeRow, setActiveRow] = useState(null);

    /* ===== SAFE FIND FUNCTION ===== */

    const findUserNode = (node, userId) => {
        if (!node) return null;
        if (node.id === userId) return node;

        for (let child of node.members || []) {
            const found = findUserNode(child, userId);
            if (found) return found;
        }
        return null;
    };

    /* ===== INITIAL CENTER LOGIC ===== */

    const initialCenter = useMemo(() => {
        if (!team) return null;

        if (mood === "admin" || mood === "staff") {
            return team.leader;
        }

        if (mood === "agent") {
            const userNode = findUserNode(team.leader, currentUser?.id);
            return userNode || team.leader;
        }

        return team.leader;
    }, [mood, team, currentUser]);

    const [centerNode, setCenterNode] = useState(initialCenter);

    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredData =
        filter === "all"
            ? centerNode?.members || []
            : centerNode?.members?.filter((d) => d.role === filter) || [];

    // reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = filteredData.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE,
    );


    return (
        <div className="plot-container product-detail">
            <div className="table-filters">
                <div className="page-tools">
                    <ChevronLeft className="back-button" onClick={() => navigate(-1)} />
                    <h2>{team?.name || "Team Details"}</h2>
                </div>

                <div className="page-tools">
                    <button
                        className={view === "table" ? "active" : ""}
                        onClick={() => setView("table")}
                    >
                        Table View
                    </button>

                    <button
                        className={view === "graph" ? "active" : ""}
                        onClick={() => setView("graph")}
                    >
                        Graph View
                    </button>
                </div>
            </div>

            <Breadcrumb />
            {!team ? (
                <p style={{ textAlign: "center", marginTop: "50px" }}>
                    No members in this team.
                </p>
            ) : (
                <>
                    <div className="dashboard-charts">
                        <div className="team-leader-box card">
                            <div className="team-leader-box-left">
                                <img src={team.leader.avatar} alt={team.leader.name} />
                            </div>
                            <div className="team-leader-box-right">
                                <h4>{team.leader.name}</h4>
                                <p>Team Leader</p>
                            </div>
                        </div>
                    </div>

                    {view === "graph" ? (
                        <TeamGraph
                            centerNode={centerNode}
                            setCenterNode={setCenterNode}
                            mood={mood}
                        />
                    ) : (
                        <>
                            {/* Table */}
                            <div className="card">
                                <div className="team-table table-head">
                                    <span>Image</span>
                                    <span>ID</span>
                                    <span>Name</span>
                                    <span>Role</span>
                                    <span>Actions</span>
                                </div>

                                {currentData.map((item) => (
                                    <div
                                        key={item.id}
                                        className="team-table table-row"
                                    >
                                        <img src={item.avatar} alt="" />
                                        <span>{item.id}</span>

                                        <span className="title">{item.name}</span>
                                        <span>{item.role}</span>
                                        <div className="dots">
                                            <span
                                                onClick={() => navigate(`/user/${item.id}`, { state: item })}
                                            >
                                                <NiOpenEye />
                                            </span>

                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveRow(activeRow === item.id ? null : item.id);
                                                }}
                                            >
                                                <NiDots />
                                            </span>

                                            {activeRow === item.id && (
                                                <ActionModal onClose={() => setActiveRow(null)} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Prev
                                    </button>

                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            className={currentPage === i + 1 ? "active" : ""}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

        </div>
    );
};

export default TeamDetail;
