import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import AdminDashboard from "../../components/Dashboard/AdminDashboard";
import StaffDashboard from "../../components/Dashboard/StaffDashboard";
import AgentDashboard from "../../components/Dashboard/AgentDashboard";
import UserDashboard from "../../components/Dashboard/UserDashboard";
import NiTool from "../../icons/ni-tool";
import NiDashboardgph from "../../icons/NiDashboardgph";
import { useNavigate } from "react-router-dom";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import RenderFormFields from "./RenderFormFields";
import { useDispatch, useSelector } from "react-redux";
import { getAccountDetails, getOffers } from "../../Redux/Slices/AppSlices";
import formatDate from "../../components/DateFormate/DateFormate";
import { formatCurrency } from "../../components/Utils/FormatCurrency";

const Dashboard = ({ mood, setMood }) => {
  const dispatch = useDispatch();
  const { userDetail, offersData } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getOffers());
  }, []);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({});

  const renderDashboard = () => {
    switch (mood) {
      case "admin":
        return <AdminDashboard />;
      case "staff":
        return <StaffDashboard />;
      case "agent":
        return <AgentDashboard />;
      case "user":
      default:
        return <UserDashboard />;
    }
  };

  const renderFormFields = ({ actionType, formData, setFormData }) => {
    return (
      <RenderFormFields
        actionType={actionType}
        formData={formData}
        setFormData={setFormData}
      />
    );
  };

  const quickActions = {
    admin: [
      { label: "Add Associate / Staff / Customer" },
      { label: "Add Booking" },
      { label: "Add Payment (Received)" },
    ],
    agent: [
      { label: "Add Lead" },
      { label: "Add Booking" },
      { label: "Schedule Site Visit" },
    ],
    staff: [{ label: "Approve Payment" }, { label: "Verify Booking" }],
    user: [{ label: "Download Receipt" }],
  };

  const visibleOffers = offersData?.filter((item) => {
    const today = new Date();
    const end = new Date(item.endDate);

    if (end < today) return false;

    if (mood === "admin" || mood === "staff") return true;

    return item.userType.includes(mood);
  });

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (visibleOffers?.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % visibleOffers?.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [visibleOffers?.length]);

  const getRemainingDays = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);

    const diff = end - today;

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Expired";

    return `${days} days remaining`;
  };

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Welcome {userDetail?.name}</h2>
          <Breadcrumb />
        </div>
      </div>
      <div className="dashboard-container">
        <div className="dashboard-box">
          <div className="dashboard-box-left">
            <h6>Configurations</h6>

            <div className="dashboard-box-item card">
              <div className="dashboard-box-item-left">
                {/* <h4>Configurations of the {mood}</h4> */}

                <div className="offer-carousel">
                  {visibleOffers?.length === 0 ? (
                    <div className="no-offers">
                      <h4>Welcome!</h4>
                      <p>
                        No offers available right now. Stay tuned for exciting
                        deals!
                      </p>
                    </div>
                  ) : (
                    visibleOffers?.map((item, i) => (
                      <div
                        key={item._id}
                        className={`offer-slide ${i === index ? "active" : ""}`}
                      >
                        <h4>{item.title}</h4>

                        <p>{item.description}</p>

                        {/* Offer */}
                        {item.priceValue && (
                          <span className="offer-badge">
                            Offer ₹{formatCurrency(item.priceValue)}
                          </span>
                        )}

                        {/* Discount */}
                        {item.amount && (
                          <span className="discount-badge">
                            Discount {item.amount}
                            {item.type === "percentage" ? "%" : "₹"}
                          </span>
                        )}

                        {/* Dates */}
                        <div className="offer-dates">
                          <p>
                            <strong>From:</strong> {formatDate(item.startDate)} to{" "}
                            {formatDate(item.endDate)} (
                            <span className="countdown">
                              {getRemainingDays(item.endDate)}
                            </span>
                            )
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="dashboard-box-item-right">
                <NiDashboardgph />
              </div>
            </div>
          </div>
          <div className="dashboard-box-right">
            <h6>Quick Actions</h6>
            {quickActions[mood]?.map((action, i) => (
              <div
                className="dashboard-box-item card"
                key={i}
                onClick={() => {
                  setActionType(action.label);
                  setFormData({});
                  setIsEditMode(false);
                  setOpen(true);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="dashboard-box-item-left">
                  <NiTool />
                </div>
                <div className="dashboard-box-item-right">
                  <h6>{action.label}</h6>
                  <p>Quick access to {action.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {renderDashboard()}
      </div>
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={actionType}
      >
        {renderFormFields({ actionType, formData, setFormData })}
        {/* <p style={{ color: "#9f9f9f" }}>
          Simple modal to create or modify item information.
        </p> */}

        {/* <div className="modal-actions">
          <button onClick={() => setOpen(false)}>Submit</button>
        </div> */}
      </AddLocationModal>
    </div>
  );
};

export default Dashboard;
