import React, { useMemo, useState } from "react";
import "./Modals.css";
import formatDate from "../DateFormate/DateFormate";
import NiManagement from "../../icons/ni-management";
import NiSitevisit from "../../icons/ni-sitevisit";
import NiBooking from "../../icons/ni-booking";
import NiPayments from "../../icons/ni-payments";
import NiStar from "../../icons/ni-star";
import NiUser from "../../icons/ni-user";
import NiTeams from "../../icons/ni-teams";
import { useNavigate } from "react-router-dom";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const EMPTY_TEXT = {
  all: "No notifications found.",
  unread: "No unread notifications.",
  read: "No read notifications.",
};

const NotificationModal = ({
  notifications = [],
  handleRead,
  handleReadAll,
  onClose,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // default: all
  const [marking, setMarking] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const counts = {
    all: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
  };

  const visible = useMemo(
    () =>
      notifications.filter((n) =>
        filter === "all" ? true : filter === "unread" ? !n.isRead : n.isRead,
      ),
    [notifications, filter],
  );

  const markAll = async () => {
    if (!handleReadAll || marking) return;
    setMarking(true);
    try {
      await handleReadAll();
    } finally {
      setMarking(false);
    }
  };

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
    onClose?.();
  };

  return (
    <div className="notif-modal" onClick={(e) => e.stopPropagation()}>
      <div className="notif-head">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button
            type="button"
            className="notif-markall"
            disabled={marking}
            onClick={markAll}
          >
            {marking ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      <div className="notif-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={filter === f.value ? "active" : ""}
            onClick={() => setFilter(f.value)}
          >
            {f.label} ({counts[f.value]})
          </button>
        ))}
      </div>

      <div className="notif-modal-box">
        {visible.length === 0 ? (
          <div className="notif-empty">{EMPTY_TEXT[filter]}</div>
        ) : (
          visible.map((item) => (
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
                {item.type === "system" && <NiUser />}
                {item.type === "payout" && <NiPayments />}
                {item.type === "matching_income" && <NiTeams />}
                {item.type === "royalty_income" && <NiUser />}
              </div>

              <div className="notif-content">
                <h5>
                  <b>{item.title}</b> {item.message}
                </h5>
                <p>{formatDate(item.createdAt)}</p>
              </div>
              {!item.isRead && <div className="notif-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
