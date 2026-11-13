import React, { useMemo, useState } from "react";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import Pagination from "../../components/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import NiOpenEye from "../../icons/ni-openEye";
import formatDate from "../../components/DateFormate/DateFormate";

// walks the nested tree and returns one flat row per member
const flattenTree = (root) => {
  const rows = [];
  const seen = new Set(); // guards against a member appearing twice

  const walk = (node, level, side, parentName) => {
    ["leftChildren", "rightChildren"].forEach((key) => {
      const childSide =
        level === 1 ? (key === "leftChildren" ? "left" : "right") : side;
      (node?.[key] || []).forEach((child) => {
        if (!child || typeof child !== "object") return;
        const id = String(child._id || child.referralId);
        if (seen.has(id)) return;
        seen.add(id);

        rows.push({
          ...child,
          depth: level, // was: level,  (this was overwriting the rank level)
          side: childSide,
          position: key === "leftChildren" ? "left" : "right",
          parentName: node.name,
        });
        walk(child, level + 1, childSide, child.name);
      });
    });
  };

  walk(root, 1, null, root?.name);
  return rows;
};

const PAGE_SIZE = 20;

const TeamTable = ({ member, onView }) => {
  const [side, setSide] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState("desc"); // "desc" = newest first
  console.log(member, "member");
  const rows = useMemo(() => {
    const list = flattenTree(member);

    return list.sort((a, b) => {
      const diff = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return order === "asc" ? diff : -diff;
    });
  }, [member, order]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (side !== "all" && r.side !== side) return false;
      if (!q) return true;
      return (
        r.name?.toLowerCase().includes(q) ||
        r.referralId?.toLowerCase().includes(q) ||
        r.phone?.includes(q)
      );
    });
  }, [rows, side, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE,
  );

  const counts = {
    all: rows.length,
    left: rows.filter((r) => r.side === "left").length,
    right: rows.filter((r) => r.side === "right").length,
  };

  const navigate = useNavigate();

  const createSlug = (name = "") =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const openProfile = (e, r) => {
    e.stopPropagation(); // don't trigger the row click
    navigate(`/user/${createSlug(r.name)}`, { state: r._id });
  };

  return (
    <div className="team-table-wrap">
      <div className="team-table-tools">
        <div className="team-table-tabs">
          {["all", "left", "right"].map((s) => (
            <button
              key={s}
              type="button"
              className={side === s ? "active" : ""}
              onClick={() => {
                setSide(s);
                setPage(1);
              }}
            >
              {s === "all" ? "All" : s === "left" ? "Left Team" : "Right Team"}{" "}
              ({counts[s]})
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search name, referral ID or phone"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className=" card team-table-scroll">
        <table className="team-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Referral ID</th>
              <th>Level</th>
              <th>Side</th>
              <th>Referred By</th>
              <th>Designation</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Self Business</th>
              <th>Total Business</th>
              <th>Team</th>
              <th
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => {
                  setOrder(order === "desc" ? "asc" : "desc");
                  setPage(1);
                }}
                title="Sort by joining date"
              >
                Joined On {order === "desc" ? "↓" : "↑"}
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={12} className="team-table-empty">
                  No team members found
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr
                  key={r._id || r.referralId}
                  onClick={() => onView?.(r.referralId)}
                  className={onView ? "clickable" : ""}
                >
                  <td>{(current - 1) * PAGE_SIZE + i + 1}</td>
                  <td style={{ textTransform: "capitalize" }}>{r.name}</td>
                  <td>{r.referralId}</td>
                  <td>{r.level}</td>
                  <td style={{ textTransform: "capitalize" }}>{r.side}</td>
                  <td>
                    {r.parentName}{" "}
                    <small style={{ textTransform: "capitalize" }}>
                      ({r.position})
                    </small>
                  </td>
                  <td>{r.designation || "-"}</td>
                  <td>{r.phone || "-"}</td>
                  <td>
                    <span
                      style={{ textTransform: "capitalize" }}
                      className={`status ${r.status === "active" ? "success" : "warning"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>₹{formatCurrency(r.selfBusiness || 0)}</td>
                  <td>₹{formatCurrency(r.totalBusiness || 0)}</td>
                  <td>{r.totalTeam || 0}</td>
                  <td>{r.createdAt ? formatDate(r.createdAt) : "-"}</td>
                  <td>
                    <div className="dots">
                      <span
                        type="button"
                        className="team-eye-btn"
                        title="View profile"
                        onClick={(e) => openProfile(e, r)}
                      >
                        <NiOpenEye />
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination page={current} totalPages={totalPages} setPage={setPage} />
      )}
    </div>
  );
};

export default TeamTable;
