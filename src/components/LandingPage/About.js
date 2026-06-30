import React from "react";
import "./About.css";
import { Cctv, Trees } from "lucide-react";
import { TbRoad } from "react-icons/tb";
import { MdOutlineTempleHindu } from "react-icons/md";
import { GiDoubleStreetLights } from "react-icons/gi";
import { GiWaterfall } from "react-icons/gi";

const About = ({ data }) => {
  // console.log(data,"data")
  const items = [
    { title: "Security", icons: <Cctv /> },
    { title: "Road", icons: <TbRoad /> },
    { title: "Park", icons: <Trees /> },
    { title: "Temple", icons: <MdOutlineTempleHindu /> },
    { title: "Street Light", icons: <GiDoubleStreetLights /> },
    { title: "Drainage", icons: <GiWaterfall /> },
  ];
  return (
    <div className="landing-pages">
      <h2>{data?.about?.title}</h2>
      <p>
        {data?.about?.description}
        {/* Anokhi Homes Private Limited is a dynamic and growing real estate
        company committed to redefining urban and suburban living experiences
        through thoughtfully planned plots and development projects. */}
      </p>
      <div className="about-box">
        <div className="about-right">
          <img
            src={
              data?.about?.image
                ? data?.about?.image
                : "https://images.unsplash.com/photo-1591389703635-e15a07b842d7?q=80&w=2833&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
            alt=""
          />
        </div>
        <div className="about-left">
          <p>
            {/* Based out of Patna, our company is focused on transforming emerging
            locations into thriving communities. With a strong foundation built
            on transparency, trust, and customer satisfaction, Anokhi Homes aims
            to be a leading force in the real estate landscape of Bihar. */}
            {data?.about?.subdescription}
          </p>
          {/* <p>
            Currently, we are proud to unveil our flagship venture – Rajgir
            Green Valley, a premium plotting project situated in the spiritual
            and scenic town of Rajgir.
          </p> */}
          <h3>Our Amenities</h3>
          <div className="feature-grid">
            {items.map((f) => (
              <div key={f.title} className="feature-card card">
                <span>{f.icons}</span>
                <h3>{f.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
