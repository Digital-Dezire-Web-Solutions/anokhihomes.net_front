import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import "./Team.css";
import DashboardCard from "../../components/Cards/DashboardCard";
import NiTeams from "../../icons/ni-teams";
import NiSearch from "../../icons/ni-search";
import { useDispatch, useSelector } from "react-redux";
import { getAccountDetails, getTeamTree } from "../../Redux/Slices/AppSlices";
import NiPayments from "../../icons/ni-payments";
import TeamNode from "./TeamTree";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import TeamGraph from "./TeamGraph";
import NiList from "../../icons/ni-list";
import NiCard from "../../icons/ni-card";

const Teams = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userDetail, teamTree } = useSelector((state) => state.app);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getAccountDetails());
  }, []);

  useEffect(() => {
    if (!userDetail?.referralId) return;
    dispatch(getTeamTree(userDetail.referralId));
  }, [userDetail]);
  const currentData = teamTree;
  const leftTeam = currentData?.leftChildren || [];
  const rightTeam = currentData?.rightChildren || [];
  const allTeam = [...leftTeam, ...rightTeam];
  const [activeTab, setActiveTab] = useState("all");
  const [teamView, setTeamView] = useState("node");

  const getVisibleTeam = () => {
    if (activeTab === "left") return leftTeam;
    if (activeTab === "right") return rightTeam;
    return allTeam;
  };

  const visibleTeam = getVisibleTeam();
  const handleSearch = () => {
    if (!search) return;
    dispatch(getTeamTree(search));
  };

  // console.log(currentData, "currentData");
  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Team Management</h2>

          <Breadcrumb />
        </div>

        {userDetail?.role === "admin" && (
          <div className="page-tools">
            <div className="searchItem team-search">
              <NiSearch />
              <input
                type="text"
                placeholder="Search Referral ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn primary" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="dashboard-box">
        <div className="dashboard-box-left">
          {currentData && (
            <div className="user-card card">
              <div className="user-card-top">
                <div className="user-card-title">
                  <div className="user-card-name">
                    <h4 style={{ textTransform: "capitalize" }}>
                      {currentData.name}
                      <span className="status ">{currentData.referralId}</span>
                    </h4>
                  </div>
                </div>
                <div className="dots">
                  <span>
                    {currentData.designation} ({currentData.directIncomePercent}
                    %)
                  </span>
                </div>
              </div>
              <div className="user-card-bottom">
                <div className="user-card-bottom-left">
                  <p>
                    <strong>Phone:</strong> {currentData.phone}
                  </p>
                  <p style={{ textTransform: "capitalize" }}>
                    <strong>Referred By:</strong>{" "}
                    {currentData?.referredBy?.referralId || "N/A"} (
                    {currentData?.position || "N/A"})
                  </p>
                  <p>
                    <strong>Left Team:</strong> {leftTeam.length || 0}
                  </p>
                  <p>
                    <strong>Team Members:</strong> {currentData.totalTeam || 0}
                  </p>
                  <p>
                    <strong>Status:</strong> {currentData.status}
                  </p>
                </div>
                <div className="user-card-bottom-right">
                  <p>
                    <strong>Wallet:</strong> ₹
                    {formatCurrency(currentData.wallet || 0)}
                  </p>
                  <p>
                    <strong>Total Income:</strong> ₹
                    {formatCurrency(currentData.totalIncome || 0)}
                  </p>
                  <p>
                    <strong>Right Team:</strong> {rightTeam.length || 0}
                  </p>
                  <p>
                    <strong>Self Business:</strong> ₹
                    {formatCurrency(currentData.selfBusiness || 0)}
                  </p>
                  <p>
                    <strong>Total Withdraw:</strong> ₹
                    {formatCurrency(currentData.totalWithdraw || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="dashboard-box-right">
          {/* <h6>Stats</h6> */}
          <div className="dashboard-box-item card">
            <div className="dashboard-box-item-left">
              <NiTeams />
            </div>
            <div className="dashboard-box-item-right">
              <h6>Left Team Business</h6>
              <p>₹{formatCurrency(currentData?.leftBusiness || 0)}</p>
            </div>
          </div>
          <div className="dashboard-box-item card">
            <div className="dashboard-box-item-left">
              <NiTeams />
            </div>
            <div className="dashboard-box-item-right">
              <h6>Right Team Business</h6>
              <p>₹{formatCurrency(currentData?.rightBusiness || 0)}</p>
            </div>
          </div>
          <div className="dashboard-box-item card">
            <div className="dashboard-box-item-left">
              <NiPayments />
            </div>
            <div className="dashboard-box-item-right">
              <h6>Total Business</h6>
              <p>₹{formatCurrency(currentData?.totalBusiness || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-wrapper">
        <div className="team-hierarchy-header">
          <h4>Team Hierarchy</h4>
<div className="page-toggle">
            <span
              className={`${teamView === "node" ? "active" : ""}`}
              onClick={() => setTeamView("node")}
            >
              <NiList />
            </span>
            <span
              className={`${teamView === "graph" ? "active" : ""}`}
              onClick={() => setTeamView("graph")}
            >
              <NiCard />
            </span>
          </div>
          {/* <div className="team-view-buttons">
            <button
              type="button"
              className={`team-view-btn ${teamView === "node" ? "active" : ""}`}
              onClick={() => setTeamView("node")}
            >
              Node
            </button>

            <button
              type="button"
              className={`team-view-btn ${
                teamView === "graph" ? "active" : ""
              }`}
              onClick={() => setTeamView("graph")}
            >
              Graph
            </button>
          </div> */}
        </div>

        <div
          className={
            teamView === "graph"
              ? "team-tree-container graph-view-container"
              : "team-tree-container"
          }
        >
          {currentData ? (
            teamView === "node" ? (
              <TeamNode member={currentData} />
            ) : (
              <TeamGraph member={currentData} />
            )
          ) : (
            <p>No Team Found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Teams;
