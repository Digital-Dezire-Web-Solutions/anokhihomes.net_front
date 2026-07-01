import React, { useEffect, useRef, useState } from "react";
import NiSearch from "../../icons/ni-search";
import NiMoon from "../../icons/ni-moon";
import NiSun from "../../icons/ni-sun";
import NiBell from "../../icons/ni-bell";
import NiTool from "../../icons/ni-tool";
import { useNavigate } from "react-router-dom";
import NotificationModal from "../Modals/NotificationModal";
import SearchModal from "../Modals/SearchModal";
import MainLogo from "../../icons/MainLogo";
import AdminLogo from "../../Assets/Logo/logo-anokhi-homes.png";
import StaffLogo from "../../Assets/Logo/logo-anokhi-home-green.png";
import AgentLogo from "../../Assets/Logo/logo-anokhi-home-blue.png";
import UserLogo from "../../Assets/Logo/logo-anokhi-home-yellow.png";
import NiUser from "../../icons/ni-user";
import { useDispatch, useSelector } from "react-redux";
import {
  getAccountDetails,
  getNotifications,
  getNotificationsCount,
  readNotification,
} from "../../Redux/Slices/AppSlices";
import NiDrawr from "../../icons/ni-drawr";
import Floating from "../LandingPage/Floating";

function Topbar({ dark, setDark, setMobileOpen, mood, setMood }) {
  const dispatch = useDispatch();
  const { userDetail, notificationsCount, notifications } = useSelector(
    (state) => state.app,
  );
  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getNotificationsCount());
    dispatch(getNotifications());
  }, []);

  const currentUser = userDetail;
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  const profileRef = useRef();
  const notifRef = useRef();

  useEffect(() => {
    if (userDetail) {
      setMood(userDetail?.role);
    }
  }, [userDetail]);

  useEffect(() => {
    const handler = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setOpenProfile(false);
        setOpenNotif(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    navigate("/");
    localStorage.removeItem("token");
  };

  const handleRead = (id) => {
    dispatch(readNotification(id));
    dispatch(getNotificationsCount());
  };

  const createSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // console.log(notificationsCount?.unread, "notificationsCount");

  return (
    <div className="topbar">
      <div className="top-left">
        <button className="mobile-btn" onClick={() => setMobileOpen((v) => !v)}>
          <NiDrawr />
        </button>
        <span className="logo">
          {/* <MainLogo /> */}
          {mood === "admin" ? (
            dark === true ? (
              <img className="topbar-nav-logo" src={StaffLogo} alt="" />
            ) : (
              <img className="topbar-nav-logo" src={AdminLogo} alt="" />
            )
          ) : mood === "staff" ? (
            <img className="topbar-nav-logo" src={StaffLogo} alt="" />
          ) : mood === "agent" ? (
            <img className="topbar-nav-logo" src={AgentLogo} alt="" />
          ) : (
            <img className="topbar-nav-logo" src={UserLogo} alt="" />
          )}
          {/* <img className="topbar-nav-logo" src={mainLoag} alt="" /> */}
        </span>
      </div>

      <div className="top-right">
        {/* Role Switch (Demo Only) */}
        {/* <select
          className="top-mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
          <option value="staff">Staff</option>
          <option value="user">User</option>
        </select> */}

        {/* Notifications */}
        <div
          className="notif"
          ref={notifRef}
          onClick={() => {
            setOpenNotif(!openNotif);
            setOpenProfile(false);
          }}
        >
          <NiBell />
          <span>{notificationsCount?.unread}</span>
          {openNotif && (
            <NotificationModal
              notifications={notifications}
              handleRead={handleRead}
            />
          )}
        </div>

        {/* Dark Mode */}
        <button className="top-mood" onClick={() => setDark(!dark)}>
          {dark ? <NiSun /> : <NiMoon />}
        </button>

        {/* PROFILE */}
        <div
          className="profile"
          ref={profileRef}
          onClick={() => {
            setOpenProfile(!openProfile);
            setOpenNotif(false);
          }}
        >
          <span>{currentUser?.user?.toUpperCase()}</span>

          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="profile-avatar"
            />
          ) : (
            <NiUser />
          )}

          {openProfile && (
            <div className="profile-modal">
              <div className="pm-header">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <NiUser />
                  </div>
                )}
                <h4>{currentUser?.name}</h4>
                <p>{currentUser?.email}</p>
              </div>

              <div
                className="pm-item"
                onClick={() =>
                  navigate(`/user/${createSlug(currentUser.name)}`, {
                    state: currentUser._id,
                  })
                }
              >
                My Profile
              </div>

              <div className="pm-item">
                Mode{" "}
                <span onClick={() => setDark(!dark)}>
                  {dark ? <NiSun /> : <NiMoon />}
                </span>
              </div>

              <div
                className="pm-item"
                onClick={() => navigate(`/help-support`)}
              >
                Help and Support
              </div>
              <div className="pm-item" onClick={() => navigate(`/rating`)}>
                Rating
              </div>

              <button className="pm-logout" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          )}
        </div>
        {mood !== "admin" && <Floating />}
      </div>
    </div>
  );
}

export default Topbar;
