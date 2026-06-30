import React from "react";
import Abouts from "../../components/LandingPage/About";
import LBreadcrumb from "../../components/LandingPage/LBreadcrumb";
import "./About.css"
import Mission from "../../Assets/icons/mission.png"
import Vision from "../../Assets/icons/vision.png"

const About = ({data}) => {
    // console.log(data,"data")
    return (
        <>
            <div className="landing-head-box">
                <div className="landing-head">
                    <div className="landing-top">
                        <h1>About Us</h1>
                    </div>
                    <LBreadcrumb />
                </div>
            </div>
            <Abouts data={data?.about}/>
            <div className="landing-pages">
                <div className="testimonial-box">
                    <div className="testimonial-box-left">
                        <img src={Mission} alt="" />
                    </div>
                    <div className="testimonial-box-right">
                        <h2>Our Mission</h2>
                        <p>{data?.about?.mission?.description}</p>
                        {/* <p>The mission of Anokhi Homes Private Limited is to make land ownership accessible, affordable, and secure for everyone. We strive to create real estate opportunities that combine strategic locations with modern infrastructure while maintaining ethical business practices and customer-centric service. Through our flagship and future projects, we aim to foster well-connected communities that contribute to the sustainable growth of Bihar's real estate landscape.</p> */}
                    </div>
                </div>
            </div>
            <div className="landing-pages">
                <div className="testimonial-box">
                    <div className="testimonial-box-left">
                        <img src={Vision} alt="" />
                    </div>
                    <div className="testimonial-box-right">
                        <h2>Our Vision</h2>
                         <p>{data?.about?.vision?.description}</p>
                        {/* <p>Our vision is to be recognized as a trusted name in land development and real estate solutions by consistently delivering quality plotting projects that enhance lifestyles and investment potential. We aspire to build a legacy of excellence where every plot we offer becomes the foundation of a better tomorrow for our clients, partners, and communities.</p> */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default About;
