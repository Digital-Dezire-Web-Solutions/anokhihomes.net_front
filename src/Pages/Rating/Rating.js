import React, { useEffect, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import {
    getAccountDetails,
    getPlotHold,
    getRating,
    getUser,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import PlotHoldCard from "../../components/Cards/PlotHoldCard";
import RatingCard from "../../components/Cards/RatingCard";
import AgentRatingCard from "../../components/Cards/AgentRatingCard";
const ITEMS_PER_PAGE = 16;

const Rating = ({ mood, setAlert }) => {
    const dispatch = useDispatch();
    const { ratingData, users, userDetail } = useSelector((state) => state.app);

    useEffect(() => {
        dispatch(getRating());
        if (mood === "admin" || mood === "staff") {
            dispatch(getUser());
        } else {
            dispatch(getAccountDetails());
        }
    }, []);

    //   console.log(ratingData, "ratingData");

    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedplothold, setSelectedplothold] = useState();
    const [open, setOpen] = useState();
    const [isEditMode, setIsEditMode] = useState();
    let filteredData = [];

    if (mood === "admin" || mood === "staff") {
        filteredData = users?.filter((user) => user.role === "agent");
    } else if (mood === "agent") {
        filteredData = [userDetail];
    } else {
        filteredData = [userDetail];
    }

    // reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const totalPages = Math.ceil(filteredData?.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = filteredData?.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE,
    );

    // console.log(currentData, "currentData");

    return (
        <div className="plot-container">
            {/* Filters */}
            <div className="table-filters">
                <div className="page-head-title">
                    <h2>Agent Ratings</h2>
                    <Breadcrumb />
                </div>
                {/* <div className="page-tools">
                    <div className="searchItem">
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All Ratings</option>
                            <option value="1">1 Star</option>
                            <option value="2">2 Star</option>
                            <option value="3">3 Star</option>
                            <option value="4">4 Star</option>
                            <option value="5">5 Star</option>
                        </select>
                    </div>
                </div> */}
            </div>
            {/* ADMIN / STAFF */}

            {(mood === "admin" || mood === "staff") && (
                <div className="user-card-box">
                    {currentData?.map((item) => (
                        <RatingCard
                            key={item._id}
                            item={item}
                            mood={mood}
                            ratingData={ratingData}
                        />
                    ))}
                </div>
            )}
            {mood === "agent" && (
                <>
                    {/* Agent Summary */}

                    <div className="user-card-box">
                        <RatingCard
                            item={userDetail}
                            mood={mood}
                            ratingData={ratingData}
                        />
                    </div>

                    <h4 style={{ marginTop: "20px" }}>
                        Customer Ratings
                    </h4>

                    <div className="user-card-box">
                        {ratingData?.map((item) => (
                            <AgentRatingCard
                                key={item._id}
                                item={item}
                            />
                        ))}
                    </div>
                </>
            )}
            {mood === "user" && (
                <>
                    <h4>Ratings Given By You</h4>

                    <div className="user-card-box">
                        {ratingData?.map((item) => (
                            <AgentRatingCard
                                key={item._id}
                                item={item}
                            />
                        ))}
                    </div>
                </>
            )}
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
        </div>
    );
};

export default Rating;
