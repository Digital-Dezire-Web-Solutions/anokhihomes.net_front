import React from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../Utils/FormatCurrency";

const PlotCardUsers = ({ p }) => {
  const navigate = useNavigate();
  const createSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  return (
    <div
      key={p._id}
      className="plot-card card"
      // onClick={() => navigate(`/projects/${p._id}`)}
      onClick={() =>
          navigate(`/projects/${createSlug(p.name)}`, {
            state: {
              project: p,
            },
          })
        }
    >
      <div className="plot-img">
        <img src={p.image} alt={p.name} />
        {/* <span className="offer">{p.offer}</span> */}
      </div>
      <div className="plot-details">
        <h3>{p.name}</h3>
        <p className="plot-card-price">{p.priceRange}/sqft</p>
        <p>Area: {formatCurrency(p.area)}</p>
      </div>
    </div>
  );
};

export default PlotCardUsers;
