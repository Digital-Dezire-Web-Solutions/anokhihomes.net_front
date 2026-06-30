import React from "react";
import sell from "../../Assets/icons/sell.png"
import "./CTA.css"
import { TextQuote } from "lucide-react";

const CTA = () => {
    return (
        <div className="landing-pages">
            <div className="testimonial-box">
                <div className="testimonial-box-left">
                    <img src={sell} alt="" />
                </div>
                <div className="testimonial-box-right">
                    <h2>Find the Perfect Property for Your Future</h2>
                    <p>Discover verified plots, homes, and investment opportunities designed to match your lifestyle, budget, and long-term goals.</p>
                    <button className="btn primary"> <TextQuote />Know Offers</button>
                </div>
            </div>
        </div>
    );
};

export default CTA;
