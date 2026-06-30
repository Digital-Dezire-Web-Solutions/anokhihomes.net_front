import React, { useEffect, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { getPlotHold } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import PlotHoldCard from "../../components/Cards/PlotHoldCard";
const ITEMS_PER_PAGE = 16;

const HoldPlot = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { plotHold } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getPlotHold());
  }, []);
  // getPlotHold
  // console.log(plotHold,"plotHold")
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedplothold, setSelectedplothold] = useState();
  const [open, setOpen] = useState();
  const [isEditMode, setIsEditMode] = useState();
  const [typeFilter, setTypeFilter] = useState("all");
  let filteredData = plotHold;

  if (filter !== "all") {
    filteredData = filteredData.filter((i) => i.status === filter);
  }

  if (typeFilter !== "all") {
    filteredData = filteredData.filter((i) => i.holdType === typeFilter);
  }

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
    <div className="plot-container">
      {/* Filters */}
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Hold Plots</h2>
          <Breadcrumb />
        </div>
        <div className="page-tools">
          {/* {(mood === "admin" || mood === "staff") && ( */}
          <div className="searchItem">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="ACTIVE">Active</option>
              <option value="APPROVAL">Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
              <option value="RELEASED">Released</option>
            </select>
          </div>
          <div className="searchItem">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="FREE">Shadow Hold</option>
              <option value="PAID">Token Hold</option>
            </select>
          </div>

          {/* )} */}
        </div>
      </div>
      <div className="user-card-box">
        {currentData.length === 0 ? (
          <p>No plots on hold found</p>
        ) : (
          currentData
            .reverse()
            .map((item) => (
              <PlotHoldCard
                item={item}
                setSelectedPlothold={setSelectedplothold}
                setIsEditMode={setIsEditMode}
                setOpen={setOpen}
                mood={mood}
                setAlert={setAlert}
              />
            ))
        )}
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
    </div>
  );
};

export default HoldPlot;
