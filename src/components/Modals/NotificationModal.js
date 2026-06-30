import React, { useEffect } from "react";
import "./Modals.css";
import { useDispatch, useSelector } from "react-redux";
import {
    getNotifications,
    readNotification,
} from "../../Redux/Slices/AppSlices";
import formatDate from "../DateFormate/DateFormate";
import NiDashboard from "../../icons/ni-dashboard";
import NiDashboardOutline from "../../icons/ni-dashboard-outline";
import NiTool from "../../icons/ni-tool";
import NiBooking from "../../icons/ni-booking";
import NiTeams from "../../icons/ni-teams";
import NiManagement from "../../icons/ni-management";
import NiUser from "../../icons/ni-user";
import NiSetting from "../../icons/ni-setting";
import NiSitevisit from "../../icons/ni-sitevisit";
import NiPayments from "../../icons/ni-payments";
import NiDiscount from "../../icons/ni-discount";
import NiCommission from "../../icons/ni-commission";
import NiStar from "../../icons/ni-star";
import { useNavigate } from "react-router-dom";

const NotificationModal = ({ notifications, handleRead }) => {
    const navigate = useNavigate();

    const handleNotificationClick = async (item) => {
        await handleRead(item._id);

        switch (item.referenceModel) {
            case "Lead":
                navigate(`/management`);
                break;

            case "SiteVisit":
                navigate(`/site-visits`);
                break;

            case "Booking":
                navigate(`/bookings`);
                break;

            case "Payment":
                navigate(`/payments`);
                break;

            case "User":
                navigate(`/user`);
                break;

            case "Payout":
                navigate("/commission");
                break;

            case "Reward":
                navigate("/rewards");
                break;

            case "PlotHold":
                navigate("/holdplot");
                break;

            case "WalletTransaction":
                navigate("/");
                break;

            default:
                navigate("/dashboard");
        }
    };


    return (
        <div className="notif-modal">
            <h3>Notifications</h3>

            {/* <div className="notif-tabs">
                <button className="active">All</button>
                <button>System</button>
                <button>User</button>
            </div> */}

            <div className="notif-modal-box">
                {notifications?.length === 0 ? (
                    <div className="notif-empty">No notifications found.</div>
                ) : (
                    notifications.map((item) => (
                        <div
                            key={item._id}
                            className={`notif-item ${item.isRead ? "" : "unread"}`}
                            onClick={() => handleNotificationClick(item)}
                        >
                            <div className="notif-icon">
                                {item.type === "lead" && <NiManagement />}
                                {item.type === "sitevisit" && <NiSitevisit />}
                                {item.type === "booking" && <NiBooking />}
                                {item.type === "payment" && <NiPayments />}
                                {item.type === "rating" && <NiStar />}
                                {item.type === "payout" && <NiPayments />}
                                {item.type === "matching_income" && <NiTeams />}
                                {item.type === "royalty_income" && <NiUser />}
                            </div>

                            <div className="notif-content">
                                <h5><b>{item.title}</b> {item.message}</h5>
                                <p>{formatDate(item.createdAt)}</p>
                                {/* <small>{formatDate(item.createdAt)}</small> */}
                            </div>
                            {!item.isRead && <div className="notif-dot"></div>}
                        </div>
                    ))
                )}
            </div>
            {/* <button className="notif-view">View All</button> */}
        </div>
    );
};

export default NotificationModal;
