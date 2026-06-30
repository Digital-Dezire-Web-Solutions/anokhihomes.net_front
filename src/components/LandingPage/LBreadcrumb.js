import React from "react";
import { Link, useLocation } from "react-router-dom";

const LABEL_MAP = {
  "": "Home",
  dashboards: "Dashboards",
  default: "Default",
  plots: "Plots",
  other: "Other",
};

const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

const LBreadcrumb = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  const truncate = (text, max = 12) =>
    text?.length > max ? `${text.slice(0, max)}...` : text;

  return (
    <div className="breadcrumb">
      <Link to="/">Home</Link>

      {paths.map((path, i) => {
        const to = "/" + paths.slice(0, i + 1).join("/");
        const rawLabel = LABEL_MAP[path] || path;
        const label = truncate(capitalize(rawLabel), 12);

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

export default LBreadcrumb;
