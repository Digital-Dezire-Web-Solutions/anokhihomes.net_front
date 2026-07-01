import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  BrowserRouter,
  Outlet,
  useLocation,
} from "react-router-dom";
import Home from "./Pages/Home/Home";
import Sidebar from "./components/Sidebar/Sidebar";
import Topbar from "./components/Topbar/Topbar";
import RoleSelect from "./Pages/Signup/RoleSelect";
import Login from "./Pages/Signup/Login";
import Signup from "./Pages/Signup/Signup";
import Other from "./Pages/Other/Other";
import Plot from "./Pages/Plot/Plot";
import Projects from "./Pages/Plot/Projects";
import ProjectDetail from "./Pages/Plot/ProjectDetail";
import Profile from "./Pages/Profile/Profile";
import Navbar from "./components/LandingPage/Navbar";
import Footer from "./components/LandingPage/Footer";
import "./App.css";
import About from "./Pages/About/About";
import LandingProjects from "./Pages/LandingProjects/LandingProjects";
import Gallery from "./Pages/Gallery/Gallery";
import Contact from "./Pages/Contact/Contact";
import LandingProjectDetail from "./Pages/LandingProjects/LandingProjectDetail";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Booking from "./Pages/Booking/Booking";
import Team from "./Pages/Teams/Team";
import Management from "./Pages/Management/Management";
import SiteVisit from "./Pages/SiteVisit/SiteVisit";
import Payments from "./Pages/Payments/Payments";
import TeamDetail from "./Pages/Teams/TeamDetail";
import Alert from "./components/Alert/Alert";
import Setting from "./Pages/Setting/Setting";
import Logs from "./Pages/Logs/Logs";
import OffersDiscounts from "./Pages/OffersDiscounts/OffersDiscounts";
import Commission from "./Pages/Commission/Commission";
import Documents from "./Pages/Documents/Documents";
import LandingSetting from "./Pages/LandingSetting/LandingSettings";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy";
import TermCondition from "./Pages/TermCondition/TermCondition";
import CancellationRefund from "./Pages/CancellationRefund/CancellationRefund";
import HelpCenter from "./Pages/HelpCenter/HelpCenter";
import Income from "./Pages/Income/Income";
import { useDispatch, useSelector } from "react-redux";
import { getAllColonies, getLandingPage } from "./Redux/Slices/AppSlices";
import HoldPlot from "./Pages/HoldPlot/HoldPlot";
import Rating from "./Pages/Rating/Rating";

const LandingLayout = ({ dark, mood, data, setMood }) => {
  return (
    <div className="landing-page">
      <Navbar dark={dark} mood={mood} setMood={setMood} />
      <Outlet />
      <Footer dark={dark} data={data} mood={mood} />
    </div>
  );
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      const page = document.querySelector(".page-wrap");

      if (page) {
        page.scrollTop = 0;
      }

      window.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
}

function App() {
  const dispatch = useDispatch();
  const { landingPage, allColonies } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getLandingPage());
    dispatch(getAllColonies());
  }, []);

  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mood, setMood] = useState("staff");
  const [alert, setAlert] = useState(null);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className={`app ${dark ? "dark" : ""} mood-${mood}`}>
        <Alert item={alert} />
        <Routes>
          <Route
            element={
              <LandingLayout
                dark={dark}
                mood={mood}
                data={landingPage}
                setMood={setMood}
              />
            }
          >
            <Route
              path="/"
              element={<Home data={landingPage} allColonies={allColonies} />}
            />
            <Route path="/about" element={<About data={landingPage} />} />
            <Route
              path="/projects"
              element={
                <LandingProjects setAlert={setAlert} data={allColonies} />
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <LandingProjectDetail
                  data={allColonies}
                  mood={mood}
                  setAlert={setAlert}
                />
              }
            />
            <Route path="/gallery" element={<Gallery data={landingPage} />} />
            <Route
              path="/documents"
              element={<Documents data={landingPage} />}
            />
            <Route path="/contact" element={<Contact data={landingPage} />} />
            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy data={landingPage} />}
            />
            <Route
              path="/term-condition"
              element={<TermCondition data={landingPage} />}
            />
            <Route
              path="/cancellation-refund"
              element={<CancellationRefund data={landingPage} />}
            />
          </Route>
          <Route path="/role" element={<RoleSelect setMood={setMood} />} />
          <Route path="/login" element={<Login mood={mood} />} />
          <Route
            path="/signup"
            element={
              <Signup
                mood={mood}
                setAlert={setAlert}
                setMood={setMood}
                data={landingPage}
              />
            }
          />
          <Route
            path="/*"
            element={
              <>
                <Topbar
                  dark={dark}
                  setDark={setDark}
                  setMobileOpen={setMobileOpen}
                  mood={mood}
                  setMood={setMood}
                />

                <div className="main">
                  <div
                    className={
                      mobileOpen ? "sidebar-wrap show" : "sidebar-wrap"
                    }
                  >
                    <Sidebar
                      closeMobile={() => setMobileOpen(false)}
                      mood={mood}
                    />
                  </div>

                  <div className="page-wrap">
                    {/* <Alert item={alert} /> */}
                    <Routes>
                      <Route
                        path="/dashboard"
                        element={<Dashboard mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/user"
                        element={<Other mood={mood} setAlert={setAlert} data={landingPage}/>}
                      />
                      <Route
                        path="/bookings"
                        element={
                          <Booking
                            mood={mood}
                            setAlert={setAlert}
                            landingPage={landingPage}
                          />
                        }
                      />
                      <Route
                        path="/offers-discounts"
                        element={
                          <OffersDiscounts mood={mood} setAlert={setAlert} />
                        }
                      />
                      <Route
                        path="/teams"
                        element={<Team mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/teams/:id"
                        element={
                          <TeamDetail
                            mood="agent"
                            currentUser={{ id: "amit", name: "Amit" }}
                            setAlert={setAlert}
                          />
                        }
                      />
                      <Route
                        path="/management"
                        element={<Management mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/site-visits"
                        element={
                          <SiteVisit
                            mood={mood}
                            setAlert={setAlert}
                            landingPage={landingPage}
                          />
                        }
                      />
                      <Route
                        path="/payments"
                        element={<Payments mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/income"
                        element={<Income mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/settings"
                        element={<Setting mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/commission"
                        element={<Commission mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/logs"
                        element={<Logs mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/landing"
                        element={
                          <LandingSetting mood={mood} setAlert={setAlert} />
                        }
                      />
                      <Route
                        path="/help-support"
                        element={<HelpCenter mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/user/:id"
                        element={<Profile mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/plot"
                        element={<Plot mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/plot/:plotId"
                        element={<Projects mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/plot/:plotId/:projectId"
                        element={
                          <ProjectDetail mood={mood} setAlert={setAlert} />
                        }
                      />
                      <Route
                        path="/holdplot"
                        element={<HoldPlot mood={mood} setAlert={setAlert} />}
                      />
                      <Route
                        path="/rating"
                        element={<Rating mood={mood} setAlert={setAlert} />}
                      />
                    </Routes>
                  </div>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
