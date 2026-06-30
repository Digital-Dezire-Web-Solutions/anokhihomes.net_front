import React, { useState } from "react";
import Stars from "../Utils/Stars";
import ViewModal from "../Modals/ViewModal";
import RatingCard from "./RatingCard";
import formatDate from "../DateFormate/DateFormate";

const AgentRatingCard = ({ item }) => {
  const [open, setOpen] = useState(false);

  console.log(item,"item")
//   const agentRatings = ratingData.filter((r) => r.agent?._id === item._id);

  return (
    <>
      <div className="user-card card">
        <div className="user-card-top">
            <h4>{item?.customer?.name}</h4>
            <Stars rating={item.stars || 0} />

        </div>

        <div className="user-card-bottom">
          <p>
            <strong>Date :</strong> {formatDate(item.createdAt) || 0}
          </p>
        </div>
        <div className="user-card-bottom">
          <p>
            <strong>Phone :</strong> {item?.customer?.phone || 0}
          </p>
        </div>

      </div>
    </>
  );
};

export default AgentRatingCard;
