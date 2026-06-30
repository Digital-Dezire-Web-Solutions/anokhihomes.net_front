import React from "react";

const TargetLadder = ({ targets, agentSales }) => {
  console.log(targets, agentSales, "sdchabk");
  // const maxTarget = targets[targets?.length - 1]?.targetBusiness;
  console.log(targets, "maxTarget");

  // const progress = Math?.min((agentSales / maxTarget) * 100, 100);

  return (
    <div className="target-ladder card">
      {/* <div className="ladder-road">
        <div className="ladder-progress" style={{ width: `${progress}%` }} />

        <div className="ladder-agent" style={{ left: `${progress}%` }}></div>

        {targets?.map((t, index) => {
          const position = (t.targetAmount / maxTarget) * 100;
          const unlocked = agentSales >= t.targetAmount;

          return (
            <div
              key={t.id}
              className={`ladder-target ${unlocked ? "unlocked" : "locked"}`}
              style={{ left: `${position}%` }}
            >
              <span className="ladder-icon">{t.icon}</span>
              <p>₹{t.targetAmount}</p>
            </div>
          );
        })}
      </div> */}

      <div className="ladder-sales">
        <strong>Team Matching Business:</strong> ₹{agentSales}
      </div>
    </div>
  );
};

export default TargetLadder;
