import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumb.css";

const LABEL_MAP = {
  "": "Home",
  dashboards: "Dashboards",
  default: "Default",
  plots: "Plots",
  other: "Other",
};

const Breadcrumb = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <div className="breadcrumb">
      <Link to="/">Home</Link>

      {paths.map((path, i) => {
        const to = "/" + paths.slice(0, i + 1).join("/");
        const label = LABEL_MAP[path] || path;

        return (
          <span key={to}>
            <span className="sep">/</span>
            <Link to={to}>{label}</Link>
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumb;