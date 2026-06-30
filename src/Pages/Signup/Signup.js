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

const Signup = ({ mood, setAlert, setMood, data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [referalMsg, setReferralMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const termsRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    referralId: "",
    password: "",

    address: "",
    panNumber: "",
    panPhoto: null,
    aadharNumber: "",
    aadharPhoto: null,

    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",

    emailOtp: "",
    isEmailVerified: false,

    nomineeName: "",
    nomineeRelation: "",
    nomineeAadharNumber: "",
    nomineeAadharPhoto: null,
  });


  /* ================= REFERRAL ================= */
  const handleReferralCheck =
    async (code) => {
      setFormData((prev) => ({
        ...prev,
        referralId: code,
      }));
      if (code.length < 9) return;
      try {
        const res =
          await dispatch(getAgentByReferralId(code));

        setReferralMsg(res)
      } catch (error) {
        setReferralMsg(null)
      }
    };

  /* ================= OTP ================= */
  const verifyOtp = () => {
    if (formData.emailOtp === "123456") {
      setFormData((prev) => ({
        ...prev,
        isEmailVerified: true,
      }));
      setAlert({
        message:
          "Email verified successfully",
        status: "Success",
      });
    } else {
      setAlert({
        message: "Invalid OTP",
        status: "Error",
      });
    }
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  // EMAIL VALIDATION
  // const emailRegex =
  //   /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // if (!emailRegex.test(formData.email)) {

  //   setAlert({
  //     message: "Please enter valid email",
  //     status: "Error",
  //   });

  //   setTimeout(() => {
  //     setAlert(null);
  //   }, 3000);

  //   return;
  // }

  const handleFileUpload = (field, file) => {
    if (!file) return;

    const MAX_SIZE = 20 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      setAlert({
        message: "Image size should not exceed 20 MB",
        status: "Error",
      });

      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  /* ================= VALIDATIONS ================= */
  const canGoStep2 =
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.password &&
    formData.referralId;

  const canGoStep3 =
    formData.address &&
    formData.panNumber &&
    formData.panPhoto &&
    formData.aadharNumber &&
    formData.aadharPhoto &&
    formData.accountNumber &&
    formData.ifsc &&
    formData.isEmailVerified;

  const canFinish =
    formData.nomineeName &&
    formData.nomineeRelation &&
    formData.nomineeAadharNumber &&
    formData.nomineeAadharPhoto;

  /* ================= FINAL SUBMIT ================= */
  const handleFinish = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (
        formData.accountNumber !==
        formData.confirmAccountNumber
      ) {
        setAlert({
          message: "Account numbers do not match",
          status: "Error",
        });
        setTimeout(() => {
          setAlert(null);
        }, 5000);
        return;
      }
      let panPhotoUrl = "";
      let aadharPhotoUrl = "";
      let nomineeAadharPhotoUrl = "";
      if (formData.panPhoto) {
        const panUpload =
          await uploadImage(formData.panPhoto);
        panPhotoUrl = panUpload.url;
      }
      if (formData.aadharPhoto) {
        const aadharUpload =
          await uploadImage(formData.aadharPhoto);
        aadharPhotoUrl = aadharUpload.url;
      }
      if (formData.nomineeAadharPhoto) {
        const nomineeUpload =
          await uploadImage(formData.nomineeAadharPhoto);
        nomineeAadharPhotoUrl = nomineeUpload.url;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,

        role: mood,

        // MLM
        referralId: formData.referralId,
        position: formData.position,

        // PERSONAL
        address: formData.address,

        // PAN
        panNumber: formData.panNumber,
        panPhoto: panPhotoUrl,

        // AADHAR
        aadharNumber: formData.aadharNumber,
        aadharPhoto: aadharPhotoUrl,

        // BANK
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifsc: formData.ifsc,

        // NOMINEE
        nomineeName: formData.nomineeName,
        nomineeRelation: formData.nomineeRelation,
        nomineeAadharNumber:
          formData.nomineeAadharNumber,
        nomineeAadharPhoto:
          nomineeAadharPhotoUrl,
      };
      console.log(payload, "FINAL PAYLOAD");

      const res = await fetch(
        `${Host}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setAlert({
          message:
            data.msg || data.error || "Registration failed",
          status: "Error",
        });
        setTimeout(() => {
          setAlert(null);
        }, 5000);

        return;
      }

      if (mood === "user") {
        localStorage.setItem("token", data.token);

        setAlert({
          message: "Registration Successful!",
          status: "Success",
        });

        setTimeout(() => {
          setAlert(null);
          navigate("/dashboard");
        }, 1500);
      } else {
        // Agent / Staff
        setStep(5);
      }

      setFormData({});
    } catch (error) {
      console.log(error);
      setAlert({
        message: "Something went wrong",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      setSaving(false);
    }
  };

  const isAccountMatch =
    formData.accountNumber &&
    formData.confirmAccountNumber &&
    formData.accountNumber === formData.confirmAccountNumber;

  if (mood === "admin") {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <h2>Access Restricted</h2>
          <p>Admin cannot be created from here.</p>
          <button onClick={() => navigate("/role")}>
            Select Role
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-header">
          {step !== 1 && mood === "agent" && (
            <ChevronLeft
              className="back-button"
              onClick={() => setStep(step - 1)}
            />
          )}
          <h2>{mood === "agent" ? "Associate Signup" : "Signup"}</h2>
        </div>
        {mood === "user" && (
          <form onSubmit={handleFinish}>
            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <span
                className="password-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <NiClosseye /> : <NiOpenEye />}
              </span>
            </div>
            <button
              type="submit"
              className={`role-${mood}`}
            >
              Signup
            </button>
            <p className="auth-footer">
              Already have account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        )}
        {mood === "staff" && (
          <>
            {step === 1 && (
              <form onSubmit={handleFinish}>
                <input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                  required
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />

                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <span
                    className="password-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <NiClosseye /> : <NiOpenEye />}
                  </span>
                </div>

                {/* Optional staff role */}
                {/* <input
              placeholder="Department / Role"
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            /> */}
                <button className={`role-${mood}`} type="submit">
                  Sign Up
                </button>
                <p className="auth-footer">
                  Already have account? <Link to="/login">Sign in</Link>
                </p>
              </form>
            )}
          </>
        )}
        {mood === "agent" && (
          <>
            <p>Step {step} of 5</p>
            {/* ================= STEP 1 ================= */}
            {step === 1 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}>
                <input
                  placeholder="Name (as per Aadhaar)"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                  required
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <span
                    className="password-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <NiClosseye /> : <NiOpenEye />}
                  </span>
                </div>

                <input
                  type="number"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />

                <input
                  placeholder="Referral Code"
                  value={formData.referralId}
                  onChange={(e) => handleReferralCheck(e.target.value.toUpperCase())}
                />

                {referalMsg !== null && (
                  referalMsg?.payload?.msg ?
                    <>
                      <p style={{ color: "red" }}>{referalMsg?.payload?.msg}</p>
                    </>
                    :
                    <>
                      <p style={{ color: "green" }}>Referred by: {referalMsg?.payload?.name}</p>
                    </>

                )}
                <div className="plot-modal field">
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Position</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <button type="submit" className={canGoStep2 ? `role-${mood}` : ""} disabled={!canGoStep2} >
                  Next
                </button>

                <p className="auth-footer">
                  Already have account? <Link to="/login">Sign in</Link>
                </p>
              </form>
            )}

            {/* ================= STEP 2 ================= */}
            {step === 2 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                setStep(3);
              }}>
                <input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />

                {/* <input
                  placeholder="PAN Number"
                  value={formData.panNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      panNumber: e.target.value.toUpperCase(),
                    })
                  }
                /> */}
                <input
                  placeholder="PAN Number"
                  value={formData.panNumber}
                  maxLength={10}
                  onChange={(e) => {
                    const value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");

                    setFormData({
                      ...formData,
                      panNumber: value,
                    });
                  }}
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload("panPhoto", e.target.files[0])
                  }
                />

                <input
                  placeholder="Aadhaar Number"
                  value={formData.aadharNumber}
                  maxLength={12}
                  inputMode="numeric"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, aadharNumber: value })
                  }
                  }
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload("aadharPhoto", e.target.files[0])
                  }
                />

                <input
                  placeholder="Bank Name"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                />

                <input
                  type="password"
                  placeholder="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                />

                <input
                  type="password"
                  placeholder="Confirm Account Number"
                  value={formData.confirmAccountNumber}
                  className={
                    formData.confirmAccountNumber
                      ? isAccountMatch
                        ? "input-success"
                        : "input-error"
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmAccountNumber: e.target.value,
                    })
                  }
                />

                <input
                  placeholder="IFSC Code"
                  value={formData.ifsc}
                  onChange={(e) =>
                    setFormData({ ...formData, ifsc: e.target.value })
                  }
                />

                {/* OTP */}
                <p className="email-otp-messge">Check email for OTP</p>
                <div className="otp-box">
                  <input
                    placeholder="Enter OTP"
                    value={formData.emailOtp}
                    disabled={formData.isEmailVerified}
                    onChange={(e) =>
                      setFormData({ ...formData, emailOtp: e.target.value })
                    }
                  />

                  <button
                    className={`role-${mood} ${formData.isEmailVerified ? "verified" : ""}`}
                    onClick={verifyOtp}
                    disabled={formData.isEmailVerified}
                  >
                    {formData.isEmailVerified ? `Verified` : "Verify"}
                  </button>

                </div>
                {formData.isEmailVerified ? `` : <p className="email-otp-messge" style={{ color: "red", cursor: "pointer" }}>Resend OTP</p>}

                <button type="submit" className={canGoStep3 ? `role-${mood}` : ""} disabled={!canGoStep3} >
                  Next
                </button>
              </form>
            )}

            {/* ================= STEP 3 ================= */}
            {step === 3 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep(4);
                }}
              >
                <input
                  placeholder="Nominee Name"
                  value={formData.nomineeName}
                  onChange={(e) =>
                    setFormData({ ...formData, nomineeName: e.target.value })
                  }
                />
                <div className="plot-modal field">
                  <select
                    value={formData.nomineeRelation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomineeRelation: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Relation</option>
                    <option value="wife">Wife</option>
                    <option value="husband">Husband</option>
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                  </select>
                </div>
                <input
                  placeholder="Nominee Aadhaar Number"
                  value={formData.nomineeAadharNumber}
                  maxLength={12}
                  inputMode="numeric"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, nomineeAadharNumber: value })
                  }
                  }
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload("nomineeAadharPhoto", e.target.files[0])
                  }
                />

                <button type="submit" className={canFinish ? `role-${mood}` : ""} disabled={!canFinish}>
                  Next
                </button>
              </form>
            )}
            {step === 4 && (
              <form onSubmit={handleFinish}>
                <div
                  ref={termsRef}
                  className="terms-box"
                  onScroll={(e) => {
                    const target = e.target;

                    if (
                      target.scrollTop + target.clientHeight >=
                      target.scrollHeight - 5
                    ) {
                      setHasScrolledToBottom(true);
                    }
                  }}
                >
                  <h4 style={{ marginBottom: "0" }}>Term & Conditions</h4>
                  {data?.policies?.termcondition?.sections?.map((section) => (
                    <div key={section._id} className="terms-section">
                      {section.heading && <h2>{section.heading}</h2>}
                      {section.content && <p>{section.content}</p>}
                    </div>
                  ))}
                  <hr />
                  <h4 style={{ marginBottom: "0" }}>Privacy Policy</h4>
                  {data?.policies?.privacy?.sections?.map((section) => (
                    <div key={section._id} className="terms-section">
                      {section.heading && <h2>{section.heading}</h2>}
                      {section.content && <p>{section.content}</p>}
                    </div>
                  ))}
                </div>

                <label className="terms-checkbox">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    disabled={!hasScrolledToBottom}
                    onChange={(e) =>
                      setAcceptedTerms(e.target.checked)
                    }
                  />

                  I have read and agree to the Terms & Conditions
                </label>

                {!hasScrolledToBottom && (
                  <p className="scroll-msg">
                    Please scroll to the bottom to continue.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!acceptedTerms || saving}
                  className={
                    acceptedTerms && !saving ? `role-${mood}` : ""
                  }
                >
                  {saving ? "Finishing..." : "Finish Registration"}
                </button>
              </form>
            )}

          </>
        )}
        {step === 5 && (
          <div className="approval-success">
            <div className="approval-icon">
              <NiTick />
            </div>

            <h2>Account Created Successfully</h2>

            <p>
              Your account has been created successfully.
            </p>

            <p>
              Your account is currently <strong>under approval</strong>.
              Once it has been reviewed and approved by the administrator,
              you will receive a confirmation email.
            </p>

            <button
              className={`role-${mood}`}
              onClick={() => navigate("/")}
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div >
  );
};

export default Signup;
