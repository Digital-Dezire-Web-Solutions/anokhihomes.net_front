import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createHelpTicket, getHelpTickets } from "../../Redux/Slices/AppSlices";
import { uploadImage } from "../LandingSetting/LandingApi";
import LBreadcrumb from "../../components/LandingPage/LBreadcrumb";
import NiClosseye from "../../icons/ni-closseye";
import NiOpenEye from "../../icons/ni-openEye";
import axios from "axios";
import Host from "../../Host/Host";

const Delete = ({ setAlert }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: "Other",
    title: "Account Deletion Request",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const res = await axios.post(`${Host}/api/auth/login`, {
        email,
        password,
      });
      // console.log(res.data, "data");
      const { token, user } = res.data;
      if (!token) {
        setError("Invalid credentials. Please try again.");
        setSaving(false);
        return;
      } else {
        const response = await fetch(`${Host}/api/help/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify({
            type: formData.type,
            title: formData.title,
            message: formData.message,
          }),
        });
      }
      setFormData({
        message: "",
      });
      setEmail("");
      setPassword("");

      setAlert({
        message:
          "Your account deletion request has been submitted successfully.",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.log(err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.msg ||
          "Login failed. Try again.",
      );
      setAlert({
        message: "Unable to submit request.",
        status: "Error",
      });

      setTimeout(() => {
        setAlert(null);
        setError(null);
      }, 3000);
    }

    setSaving(false);
  };

  return (
    <>
      <div className="landing-head-box">
        <div className="landing-head">
          <div className="landing-top">
            <h1>Delete Account</h1>
          </div>

          <LBreadcrumb />
        </div>
      </div>

      <div className="landing-pages">
        <div className="post-card">
          <h2>Request Account Deletion</h2>

          <p style={{ marginBottom: 20 }}>
            If you wish to permanently delete your account and all associated
            information, please submit the form below. Our support team will
            review your request and process it as soon as possible.
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <h4 style={{ color: "black" }}>Login Credentials</h4>
            <div className="form-items">
              <div className="form-group">
                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <span
                    className="password-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: "black" }}
                  >
                    {showPassword ? <NiClosseye /> : <NiOpenEye />}
                  </span>
                </div>
              </div>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="form-items">
              <div className="form-group">
                <label style={{ color: "black" }}>Reason</label>

                <textarea
                  rows={5}
                  placeholder="Please tell us why you want to delete your account..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message: e.target.value,
                    })
                  }
                />
                <p>
                  <span
                    style={{ fontWeight: "700", color: "var(--mood-color)" }}
                  >
                    Attention:
                  </span>{" "}
                  By submitting this request, you acknowledge that your account
                  and all associated data will be permanently deleted and cannot
                  be recovered.
                </p>

                <div className="modal-actions">
                  <button
                    disabled={saving}
                    type="submit"
                    className="contact-btn btn primary"
                  >
                    {saving ? "Submitting..." : "Submit Deletion Request"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Delete;
