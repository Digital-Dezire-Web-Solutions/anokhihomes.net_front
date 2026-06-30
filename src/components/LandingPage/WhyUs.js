import React from "react";
import {
    FaMapMarkerAlt,
    FaHeadset,
    FaLeaf,
    FaRoad,
    FaBuilding,
    FaTint,
} from "react-icons/fa";
import "./WhyUs.css"
import icon1 from "../../Assets/icons/location.png"
import icon2 from "../../Assets/icons/support.png"
import icon3 from "../../Assets/icons/environment.png"
import icon4 from "../../Assets/icons//road access.png"
import icon5 from "../../Assets/icons/modern-infra.png"
import icon6 from "../../Assets/icons/water supply.png"

const WhyUs = () => {
    const whyUsData = [
        {
            id: 1,
            icon: `${icon1}`,
            title: "Prime Location",
            description:
                "Strategic location in peaceful Rajgir with excellent connectivity.",
        },
        {
            id: 2,
            icon: icon2,
            title: "Full Legal Support",
            description:
                "Complete documentation and legal clearance for peace of mind.",
        },
        {
            id: 3,
            icon: icon3,
            title: "Green Environment",
            description:
                "Lush green surroundings with planned landscaping and gardens.",
        },
        {
            id: 4,
            icon: icon4,
            title: "Easy Access",
            description:
                "Well-connected roads with easy access to main city areas.",
        },
        {
            id: 5,
            icon: icon5,
            title: "Modern Infrastructure",
            description:
                "Complete electrical and telecommunication infrastructure ready.",
        },
        {
            id: 6,
            icon: icon6,
            title: "Water Supply",
            description:
                "Assured water supply with proper drainage systems.",
        },
    ];

    return (
        <section className="why-us">
            <div className="landing-pages">
                <div className="why-us-head">
                    <h2>Why Anokhi Homes is the Perfect Choice</h2>
                    <p>
                        We specialize in providing affordable plots in the peaceful city of Rajgir through our premium project, Rajgir Green Valley. Our expertise spans residential property sales, land development, and comprehensive plot booking services.

                        With strong presence in both Patna and Rajgir, we aim to provide reliable and transparent real estate solutions that help you build your dreams on solid foundations.
                    </p>
                </div>

                <div className="feature-grid">
                    {whyUsData.map((item) => (
                        <div className="counter-bx why-us-card" key={item.id}>
                            <div className="why-us-image">
                                <img src={item.icon} alt="" />
                            </div>
                            <div className="counter-numm">
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyUs;