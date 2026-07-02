import React, { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import NiClosseye from "../../icons/ni-closseye";
import NiOpenEye from "../../icons/ni-openEye";
import { ChevronLeft } from "lucide-react";
import NiTick from "../../icons/ni-tick";
import { uploadImage } from "../../Pages/LandingSetting/LandingApi";
import { useDispatch } from "react-redux";
import { getAgentByReferralId } from "../../Redux/Slices/AppSlices";
import Host from "../../Host/Host";
import UserForm from "../../components/UserForm/UserForm";

const Signup = ({ mood, setAlert, setMood, data }) => {
  const navigate = useNavigate();
  const termsRef = useRef(null);

  if (mood === "admin") {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <h2>Access Restricted</h2>
          <p>Admin cannot be created from here.</p>
          <button onClick={() => navigate("/role")}>Select Role</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <UserForm
          mode="signup"
          role={mood}
          data={data}
          setAlert={setAlert}
          onSuccess={async (payload) => {
            const res = await fetch(`${Host}/api/auth/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });

            const result = await res.json();
            setAlert({
              message: "Account created successfully",
              status: "Success",
            });
            setTimeout(() => {
              setAlert(null);
            }, 3000);

            if (!res.ok) {
              throw new Error(result.msg);
            }

            if (mood === "user") {
              localStorage.setItem("token", result.token);
              console.log("this 2");
              navigate("/dashboard");
            }
          }}
        />
      </div>
    </div>
  );
};

export default Signup;
