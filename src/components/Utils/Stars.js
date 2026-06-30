import React from "react";
import NiStar from "../../icons/ni-star";

const Stars = ({ rating = 0 }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "3px",
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <NiStar
          key={star}
          color={
            star <= Math.round(rating)
              ? "#FFC107"
              : "#D9D9D9"
          }
        />
      ))}
    </div>
  );
};

export default Stars;