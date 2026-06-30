import React from "react";

const RoyaltyCard = ({ item }) => {
  return (
    <div className="user-card card">
      <h4>{item.user.name}</h4>
      <p>Referral :{item.user.referralId}</p>
      <p>Phone :{item.user.phone}</p>
      <p>Reward :{item.reward.rewardName}</p>
      <p>Royalty :{item.royaltyPercent}%</p>
      <p>Status : Active</p>
    </div>
  );
};

export default RoyaltyCard;
