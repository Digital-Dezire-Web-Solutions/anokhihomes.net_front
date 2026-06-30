import React, { useState } from "react";
import "./Floating.css";
import float from "../../Assets/Ranjeet Ji.png";
import { LuX, LuChevronLeft } from "react-icons/lu";

const Floating = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
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

            <h5 className="floating-name">Mr. Ranjeet Kumar <br /><span>CMD - Anokhi Homes Pvt. Ltd</span></h5>
        </div>
    );
};

export default Floating;