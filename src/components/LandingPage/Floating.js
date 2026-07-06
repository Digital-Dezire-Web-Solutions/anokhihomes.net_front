import React, { useState } from "react";
import "./Floating.css";
import float from "../../Assets/Ranjeet Ji.png";
import float2 from "../../Assets/dilshad-karim.png";
import { LuX, LuChevronLeft, LuChevronRight } from "react-icons/lu";

const Floating = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedLeft, setCollapsedLeft] = useState(false);

  return (
    <>
      <div className={`floating-box ${collapsed ? "collapsed" : ""}`}>
        <button
          className="floating-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <LuChevronLeft /> : <LuX />}
        </button>

        <div className="floating-avatar">
          <img src={float} alt="Ranjeet Ji" />
          <span className="online-dot"></span>
        </div>

        <h5 className="floating-name">
          Mr. Ranjeet Kumar <br />
          <span>CMD - Anokhi Homes Pvt. Ltd</span>
        </h5>
      </div>
      <div className={`floating-box-left ${collapsedLeft ? "collapsed" : ""}`}>
        <button
          className="floating-toggle-left"
          onClick={() => setCollapsedLeft(!collapsedLeft)}
        >
          {collapsedLeft ? <LuChevronRight /> : <LuX />}
        </button>

        <div className="floating-avatar">
          <img src={float2} alt="Ranjeet Ji" />
          <span className="online-dot"></span>
        </div>

        <h5 className="floating-name">
          Md Dilshad Karim  <br />
          <span>CMD - Patliputra Homes</span>
        </h5>
      </div>
    </>
  );
};

export default Floating;
