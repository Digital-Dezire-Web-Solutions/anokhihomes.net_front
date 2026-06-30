import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NiOpenEye from "../../icons/ni-openEye";
import NiClosseye from "../../icons/ni-closseye";
import Host from "../../Host/Host";
import axios from "axios";

const Login = ({ mood }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(`${Host}/api/auth/login`, {
        email,
        password,
      });
      // console.log(res.data, "data");
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.msg ||
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

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
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
        {error && <p style={{ color: "red" }}>{error}</p>}

        <button
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
