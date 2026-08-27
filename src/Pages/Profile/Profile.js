import React, { useMemo, useState, useEffect, useRef } from "react";
import "./Profile.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Permissions from "../../components/Tabs/Permissions";
import Overview from "../../components/Tabs/Overview";
import Report from "../../components/Tabs/Report";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import NiShare from "../../icons/ni-share";
import NiCode from "../../icons/ni-code";
import NiLink from "../../icons/ni-link";
import NiUser from "../../icons/ni-user";
import { useDispatch, useSelector } from "react-redux";
import {
  getAccountDetails,
  getUserById,
  updateUser,
} from "../../Redux/Slices/AppSlices";
import { uploadImage } from "../LandingSetting/LandingApi";
import NiEdit from "../../icons/ni-edit";
import NiDelete from "../../icons/ni-delete";
import NiTick from "../../icons/ni-tick";
import NiCross from "../../icons/ni-cross";

const Profile = ({ mood, currentUser, setAlert }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state;
  const dispatch = useDispatch();
  const { userDetail, userById } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(getAccountDetails());
    if (userId) {
      dispatch(getUserById(userId));
    }
  }, []);

  let userData = userById;
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [formData, setFormData] = useState();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  // console.log(userId, "userId")

  /* ================= SAFETY ================= */

  useEffect(() => {
    if (!userData) navigate("/dashboard");
  }, [userData, navigate]);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
    }
  }, [userData]);

  //   if (!userData) return null;

  const isOwnProfile = userDetail?._id === userData?._id;
  // console.log(isOwnProfile, "isOwnProfile");

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleAvatarChange = async (file) => {
    if (!file) return;
    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      setAlert({
        message: "Image size should not exceed 10 MB",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    try {
      setAvatarUploading(true);
      const upload = await uploadImage(file);
      const result = await dispatch(
        updateUser({
          id: userDetail._id,
          data: {
            avatar: upload.url,
          },
        }),
      ).unwrap();
      dispatch(getAccountDetails());
      dispatch(getUserById(userDetail._id));
      // userData.avatar = result.avatar;
      setAlert({
        message: "Profile photo updated",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.log(err);

      setAlert({
        message: "Failed to update profile photo",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const result = await dispatch(
        updateUser({
          id: userDetail._id,
          data: {
            avatar: "",
          },
        }),
      ).unwrap();
      dispatch(getAccountDetails());
      dispatch(getUserById(userDetail._id));

      setAlert({
        message: "Profile photo removed",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.log(err);

      setAlert({
        message: "Failed to remove profile photo",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) {
      return setAlert({
        message: "Name cannot be empty",
        status: "Error",
      });
    }

    try {
      setAvatarUploading(true);

      const result = await dispatch(
        updateUser({
          id: userData._id,
          data: {
            name: name.trim(),
          },
        }),
      ).unwrap();

      if (userId) {
        dispatch(getUserById(userId));
      } else {
        dispatch(getAccountDetails());
      }

      setEditingName(false);

      setAlert({
        message: "Name updated successfully",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.log(err);

      setAlert({
        message: "Failed to update name",
        status: "Error",
      });

      setTimeout(() => setAlert(null), 3000);
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ================= TAB VISIBILITY LOGIC ================= */

  const TABS = useMemo(() => {
    const tabs = [];

    // USER PROFILE
    if (userData.role === "customer") {
      if (mood === "admin" || mood === "staff" || isOwnProfile) {
        tabs.push("Overview");
      }
    }

    // AGENT PROFILE
    if (userData.role === "agent") {
      if (
        mood === "admin" ||
        mood === "staff" ||
        (mood === "agent" && isOwnProfile)
      ) {
        tabs.push("Overview", "Report");
      }
    }

    // STAFF PROFILE
    if (userData.role === "staff") {
      if (mood === "admin") {
        tabs.push("Overview");
      }
      if (mood === "staff" && isOwnProfile) {
        tabs.push("Overview");
      }
    }

    return tabs.length ? tabs : ["Overview"];
  }, [mood, userData, isOwnProfile]);

  const [activeTab, setActiveTab] = useState("Overview");
  const [showReferralMenu, setShowReferralMenu] = useState(false);
  const referralRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (referralRef.current && !referralRef.current.contains(e.target)) {
        setShowReferralMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!userData || !userData._id) {
    return (
      <div className="plot-container">
        <h3>Loading...</h3>
      </div>
    );
  }

  /* ================= TAB CONTENT ================= */

  const renderContent = () => {
    switch (activeTab) {
      case "Permissions":
        return mood === "admin" ? (
          <>
            <h4>Permissions</h4>
            <Permissions userData={userData} />
          </>
        ) : null;

      case "Report":
        return (
          <>
            <h4>Performance Report</h4>
            <Report userData={userData} />
          </>
        );

      default:
        return (
          <>
            <div className="dashboard-title-box">
              <h4>Overview</h4>
              {userData.status !== "approval" && (
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={userData.status === "active"}
                    onChange={() => {
                      userData.status =
                        userData.status === "active" ? "inactive" : "active";
                    }}
                  />
                  <span className="slider"></span>
                </label>
              )}
            </div>
            <Overview userData={userData} mood={mood} setAlert={setAlert} />
          </>
        );
    }
  };

  const referralCode = userData?.referralId;
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);

    setAlert({
      message: "Copied to clipboard!",
      status: "Success",
    });

    setTimeout(() => setAlert(null), 2000);
  };

  const handleShare = () => {
    const message = `Join using my referral code: ${referralCode}\n${referralLink}`;

    if (navigator.share) {
      navigator.share({
        title: "Join Now",
        text: message,
        url: referralLink,
      });
    } else {
    }
  };

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <div className="page-tools">
            <ChevronLeft className="back-button" onClick={() => navigate(-1)} />
            <h2>Profile Detail</h2>
          </div>
          <Breadcrumb />
        </div>
      </div>

      <div className="profile-grid">
        {/* LEFT PANEL */}
        <div className="profile-sidebar">
          <div className="profile-card card">
            <div className="profile-top">
              <div className="profile-top-avatar">
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <NiUser />
                  </div>
                )}
                {isOwnProfile && (
                  <div className="avatar-actions">
                    <label className="avatar-upload-btn">
                      {avatarUploading ? "Uploading..." : <NiEdit />}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleAvatarChange(e.target.files[0])}
                      />
                    </label>
                    {userData.avatar && (
                      <span
                        className="avatar-remove-btn"
                        onClick={handleRemoveAvatar}
                      >
                        <NiDelete />
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div
                className="plot-modal"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {editingName ? (
                  <div className="field">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <div className="profilename-btn">
                      <span
                        style={{ cursor: "pointer", color: "#16a34a" }}
                        onClick={handleUpdateName}
                      >
                        <NiTick />
                      </span>

                      <span
                        style={{ cursor: "pointer", color: "#ef4444" }}
                        onClick={() => {
                          setEditingName(false);
                          setName(userData.name);
                        }}
                      >
                        <NiCross />
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={{ margin: 0 }}>{userData.name}</h3>

                    {mood === "admin" && (
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => setEditingName(true)}
                      >
                        <NiEdit />
                      </span>
                    )}
                  </>
                )}
              </div>
              <p className="role">
                {userData.role === "staff"
                  ? "Staff"
                  : userData.role === "agent"
                    ? "Associate"
                    : userData.role === "admin"
                      ? "Admin"
                      : "Customer"}
                , {userData.status}
              </p>
              {userData.role === "agent" && (
                <div className="referral-box">
                  <div className="referral-header dots">
                    {/* <h4>Referral</h4> */}

                    {/* DOT BUTTON */}
                    <span
                      className="dots"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReferralMenu((prev) => !prev);
                      }}
                    >
                      <NiShare />
                    </span>

                    {/* ACTION MODAL */}
                    {showReferralMenu && (
                      <div ref={referralRef} className="action-modal">
                        <span
                          onClick={() => {
                            handleCopy(referralCode);
                            setShowReferralMenu(false);
                          }}
                        >
                          <NiCode /> Copy Code
                        </span>

                        <span
                          onClick={() => {
                            handleShare();
                            setShowReferralMenu(false);
                          }}
                        >
                          <NiShare /> Share
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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

        {/* RIGHT PANEL */}
        <div className="profile-main">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Profile;
