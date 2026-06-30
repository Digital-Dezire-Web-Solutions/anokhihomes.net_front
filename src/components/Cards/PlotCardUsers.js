import React from "react";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../Utils/FormatCurrency";

const PlotCardUsers = ({ p }) => {
  const navigate = useNavigate();
  return (
    <div
      key={p._id}
      className="plot-card card"
      onClick={() => navigate(`/projects/${p._id}`)}
    >
      <div className="plot-img">
        <img src={p.image} alt={p.name} />
        {/* <span className="offer">{p.offer}</span> */}
      </div>
      <div className="plot-details">
        <h3>{p.name}</h3>
        <p className="plot-card-price">{formatCurrency(p.priceRange)}/sqft</p>
        <p>Area: {p.area}</p>
      </div>
    </div>
  );
};

export default PlotCardUsers;
