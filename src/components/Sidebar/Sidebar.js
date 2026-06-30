import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import NiDashboard from "../../icons/ni-dashboard";
import NiDashboardOutline from "../../icons/ni-dashboard-outline";
import NiTool from "../../icons/ni-tool";
import NiBooking from "../../icons/ni-booking";
import NiTeams from "../../icons/ni-teams";
import NiManagement from "../../icons/ni-management";
import NiUser from "../../icons/ni-user";
import NiSetting from "../../icons/ni-setting";
import NiSitevisit from "../../icons/ni-sitevisit";
import NiPayments from "../../icons/ni-payments";
import NiDiscount from "../../icons/ni-discount";
import NiCommission from "../../icons/ni-commission";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { Link } from "react-router-dom";
import { FaXTwitter } from "react-icons/fa6";
import NiIncome from "../../icons/ni-income";

function Sidebar({ closeMobile, mood }) {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState("dash"); // only one open at a time

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? "" : menu);
  };

  const handleClick = () => {
    closeMobile && closeMobile();
  };

  // 🔥 Menu Configuration (Professional Way)
  const menuConfig = {
    user: [
      { path: "/plot", label: "Plots", icon: <NiTool /> },
      { path: "/holdplot", label: "Hold Plots", icon: <NiTool /> },
      { path: "/management", label: "My Enquiry", icon: <NiManagement /> },
      { path: "/site-visits", label: "Site Visits", icon: <NiSitevisit /> },
      { path: "/bookings", label: "Bookings", icon: <NiBooking /> },
      { path: "/payments", label: "Payments", icon: <NiPayments /> },
    ],
    admin: [
      { path: "/management", label: "Lead Mgnt.", icon: <NiManagement /> },
      { path: "/site-visits", label: "Site Visits", icon: <NiSitevisit /> },
      { path: "/plot", label: "Plots", icon: <NiTool /> },
      { path: "/holdplot", label: "Hold Plots", icon: <NiTool /> },
      { path: "/bookings", label: "Bookings", icon: <NiBooking /> },
      { path: "/payments", label: "Payments", icon: <NiPayments /> },
      { path: "/income", label: "Income", icon: <NiIncome /> },
      { path: "/user", label: "Users", icon: <NiUser /> },
      { path: "/teams", label: "Teams", icon: <NiTeams /> },
      { path: "/commission", label: "Commission", icon: <NiCommission /> },
      {
        path: "/offers-discounts",
        label: "Offers & Discounts",
        icon: <NiDiscount />,
      },
      // { path: "/landing", label: "Front Pages", icon: <NiDashboardOutline /> },
    ],
    staff: [
      { path: "/management", label: "Lead Mgnt.", icon: <NiManagement /> },
      { path: "/site-visits", label: "Site Visits", icon: <NiSitevisit /> },
      { path: "/plot", label: "Plots", icon: <NiTool /> },
      { path: "/holdplot", label: "Hold Plots", icon: <NiTool /> },
      { path: "/bookings", label: "Bookings", icon: <NiBooking /> },
      { path: "/user", label: "Users", icon: <NiUser /> },
      { path: "/teams", label: "Teams", icon: <NiTeams /> },
      { path: "/payments", label: "Payments", icon: <NiPayments /> },
      { path: "/income", label: "Income", icon: <NiIncome /> },
      { path: "/commission", label: "Commission", icon: <NiCommission /> },
      {
        path: "/offers-discounts",
        label: "Offers & Discounts",
        icon: <NiDiscount />,
      },
    ],
    agent: [
      { path: "/management", label: "Lead Mgnt.", icon: <NiManagement /> },
      { path: "/site-visits", label: "Site Visits", icon: <NiSitevisit /> },
      { path: "/plot", label: "Plots", icon: <NiTool /> },
      { path: "/holdplot", label: "Hold Plots", icon: <NiTool /> },
      { path: "/bookings", label: "Bookings", icon: <NiBooking /> },
      { path: "/teams", label: "Teams", icon: <NiTeams /> },
      { path: "/payments", label: "Payments", icon: <NiPayments /> },
      { path: "/income", label: "Income", icon: <NiIncome /> },
      { path: "/commission", label: "Commission", icon: <NiCommission /> },
      {
        path: "/offers-discounts",
        label: "Offers & Discounts",
        icon: <NiDiscount />,
      },
    ],
  };

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <NavLink to="/dashboard" className="menu" onClick={handleClick}>
        <NiDashboardOutline />
        {!collapsed && "Dashboard"}
      </NavLink>
      {/* Role Based Menus */}
      {menuConfig[mood]?.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className="menu"
          onClick={handleClick}
        >
          {item.icon}
          {!collapsed && item.label}
        </NavLink>
      ))}
      <div className="side-more-items">
        {mood === "admin" && (
          <NavLink to="/landing" className="menu" onClick={handleClick}>
            <NiDashboardOutline />
            {!collapsed && "Front Pages"}
          </NavLink>
        )}
        {mood === "user" && (
          <div className="footer-col">
            {/* <h4>Follow Us</h4> */}
            <div className="social-icons">
              <Link><FaFacebook /></Link>
              <Link><AiFillInstagram /></Link>
              <Link><FaLinkedin /></Link>
              <Link><FaXTwitter /></Link>
            </div>
          </div>
        )}
      </div>
      <NavLink to="/settings" className="menu single" onClick={handleClick}>
        <NiSetting />
        {!collapsed && "Settings"}
      </NavLink>
      <p className="menu dev-by">Dev. By:- Digital Dezire </p>
    </div>
  );
}

export default Sidebar;
