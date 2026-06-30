import React, { useState } from "react";
import { formatCurrency } from "../../components/Utils/FormatCurrency";

const TeamNode = ({
  member,
  level = 0,
  side = "",
}) => {
  const [open, setOpen] = useState(true);

  const hasChildren =
    (member?.leftChildren?.length || 0) > 0 ||
    (member?.rightChildren?.length || 0) > 0;

  return (
    <div className="tree-node">
      <div
        className="card tree-card"
        style={{
          marginLeft: `${level * 30}px`,
        }}
      >
        <div className="tree-card-top">
          <div
            className="tree-user"
            onClick={() => hasChildren && setOpen(!open)}
          >
            {hasChildren && (
              <span className="tree-toggle">
                {open ? "▼" : "▶"}
              </span>
            )}

            <strong>{member.name}</strong>

            {side && (
              <span
                className={`status  ${side === "left" ? "active" : "pending2"}`}
              >
                {side.toUpperCase()}
              </span>
            )}
          </div>

          <span>
            {member.designation}({member.directIncomePercent}%)
          </span>
        </div>

        <div className="tree-card-body">
          <span>
            Referral: {member.referralId}
          </span>

          <span>
            Level: {member.level}
          </span>

          {/* <span>
            Wallet: ₹{member.wallet || 0}
          </span> */}

          <span>
            Income: ₹
            {formatCurrency(member.totalIncome || 0)}
          </span>
        </div>
      </div>

      {open && (
        <>
          {member?.leftChildren?.map(
            (child) => (
              <TeamNode
                key={child._id}
                member={child}
                level={level + 1}
                side="left"
              />
            ),
          )}

          {member?.rightChildren?.map(
            (child) => (
              <TeamNode
                key={child._id}
                member={child}
                level={level + 1}
                side="right"
              />
            ),
          )}
        </>
      )}
    </div>
  );
};

export default TeamNode;