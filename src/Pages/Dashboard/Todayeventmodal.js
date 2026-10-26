import React, { useEffect, useState } from "react";
import axios from "axios";
import Host from "../../Host/Host";
import "./Eventmodal.css";
import formatDate from "../../components/DateFormate/DateFormate";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import defaultimage from "../../Assets/profile.png";

const todayIST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// Mount once inside the logged-in layout (e.g. the agent dashboard layout):
//   <TodayEventModal userId={user?._id} />
// Shows at most once per user per day. Server already orders the items:
// birthday first, then festival(s), then admin events.
const TodayEventModal = ({ userId }) => {
  console.log(userId, "userId");
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const seenKey = `eventModalSeen_${userId || "me"}_${todayIST()}`;
  console.log(seenKey, "seenkey");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || localStorage.getItem(seenKey)) return;

    axios
      .get(`${Host}/api/events/today`, { headers: { "auth-token": token } })
      .then((res) => {
        if (res.data?.items?.length) {
          setItems(res.data.items);
          setIndex(0);
          setOpen(true);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const close = () => {
    localStorage.setItem(seenKey, "1");
    setOpen(false);
  };

  // if (!open || items.length === 0) return null;

  const current = items[index];
  const isLast = index === items.length - 1;
  console.log(current, "current");

  return (
    <AddLocationModal open={open} onClose={close} title={""}>
      <div>
        <div
          className="event-emoji"
          aria-hidden="true"
          style={{
            display: "flex",
            gap: "0.5rem",
          }}
        >
          {current?.emoji}
          <h3 className="event-title">{current?.title}</h3>
        </div>
        {current?.type === "birthday" &&
          (current?.image ? (
            <img className="event-image" src={current.image} alt="" />
          ) : (
            <img className="event-image" src={defaultimage} alt="" />
          ))}
        {current?.type === "festival" &&
          (current?.image ? (
            <img className="event-image" src={current.image} alt="" />
          ) : (
            <img className="event-image" src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkgPxpgHk6PPTono_BiPAscpaVAUcnZV3YPkyAs_2_1A&s=10"} alt="" />
          ))}
        {current?.type === "event" &&
          (current?.image ? (
            <img className="event-image" src={current.image} alt="" />
          ) : (
            <img className="event-image" src={defaultimage} alt="" />
          ))}
        {current?.type === "best_performer" &&
          (current?.image ? (
            <img className="birthday-image" src={current.image} alt="" />
          ) : (
            <img className="birthday-image" src={defaultimage} alt="" />
          ))}

        {current?.message && <p className="event-message">{current.message}</p>}

        {current?.type === "event" && current?.date && (
          <p className="event-dates">
            {formatDate(current.date)}
            {current.endDate && current.endDate !== current.date
              ? ` - ${formatDate(current.endDate)}`
              : ""}
          </p>
        )}

        {items.length > 1 && (
          <div className="event-dots" aria-label="Wishes and events for today">
            {items.map((it, i) => (
              <button
                key={i}
                type="button"
                className={i === index ? "active" : ""}
                aria-label={it.label}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}

        <div className="modal-actions event-actions">
          {index > 0 && (
            <button type="button" onClick={() => setIndex(index - 1)}>
              Back
            </button>
          )}
          {!isLast ? (
            <button type="button" onClick={() => setIndex(index + 1)}>
              Next: {items[index + 1]?.label}
            </button>
          ) : (
            <button type="button" onClick={close}>
              Close
            </button>
          )}
        </div>
      </div>
    </AddLocationModal>
  );
};

export default TodayEventModal;
