import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NiOpenEye from "../../icons/ni-openEye";
import NiClosseye from "../../icons/ni-closseye";
import Host from "../../Host/Host";
import axios from "axios";

const Login = ({ mood }) => {
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginId.trim()) {
      setError("Email, phone or referral ID is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (!role) {
      setError("Please select your account type");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${Host}/api/auth/login`, {
        loginId: loginId.trim(),
        password,
        role,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Login failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2>Sign in</h2>

        <p>Access your account quickly and securely.</p>

        {/* LOGIN ID */}
        <input
          type="text"
          placeholder="Email, Phone or Referral ID"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />

        {/* PASSWORD */}
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
          >
            {showPassword ? <NiClosseye /> : <NiOpenEye />}
          </span>
        </div>

        {/* ROLE */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Account Type</option>
          <option value="user">Customer</option>
          <option value="agent">Associate</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          type="button"
          className={`role-${mood}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-footer">
          New user? <Link to="/role">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;