import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./LandingSettings.css";
import Home from "../../components/LandingSetting/Home";
import About from "../../components/LandingSetting/About";
import Gallery from "../../components/LandingSetting/Gallery";
import Documents from "../../components/LandingSetting/Documents";
import Contact from "../../components/LandingSetting/Contact";
import Footer from "../../components/LandingSetting/Footer";
import Meta from "../../components/LandingSetting/Meta";
import PolicyPage from "../../components/LandingSetting/PolicyPage";
import { getLandingPage } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";

const LandingSetting = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { landingPage } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getLandingPage());
  }, []);
    // console.log(landingPage, "landingPage");
  const navigate = useNavigate();

  /* ================= ROLE BASED TABS ================= */

  const TABS = [
    "Home",
    "About",
    "Gallery",
    "Documents",
    "Contact",
    "Footer",
    "Meta",
    "Policies",
  ];

  const [activeTab, setActiveTab] = useState(TABS[0]);

  /* ================= TAB CONTENT ================= */

  const renderContent = () => {
    switch (activeTab) {
      case "Home":
        return <Home data={landingPage?.home} setAlert={setAlert} />;

      case "About":
        return <About data={landingPage?.about} setAlert={setAlert} />;

      case "Gallery":
        return <Gallery data={landingPage?.gallery} setAlert={setAlert} />;

      case "Documents":
        return <Documents data={landingPage?.documents} setAlert={setAlert} />;

      case "Contact":
        return <Contact data={landingPage?.contact} setAlert={setAlert} />;

      case "Footer":
        return <Footer data={landingPage?.footer} setAlert={setAlert} />;

      case "Meta":
        return <Meta data={landingPage?.meta} setAlert={setAlert} />;

      case "Policies":
        return <PolicyPage data={landingPage?.policies} setAlert={setAlert} />;

      default:
        return <Home data={landingPage?.home} setAlert={setAlert} />;
    }
  };

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <div className="page-tools">
            <ChevronLeft className="back-button" onClick={() => navigate(-1)} />
            <h2>Front Pages Settings</h2>
          </div>
          <Breadcrumb />
        </div>
      </div>

      <div className="profile-grid">
        {/* LEFT SIDEBAR */}
        <div className="profile-sidebar">
          <div className="profile-card card">
            <div className="profile-nav">
              {TABS.map((tab) => (
                <span
                  key={tab}
                  className={activeTab === tab ? "menu active" : "menu"}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="profile-main">{renderContent()}</div>
      </div>
    </div>
  );
};

export default LandingSetting;
