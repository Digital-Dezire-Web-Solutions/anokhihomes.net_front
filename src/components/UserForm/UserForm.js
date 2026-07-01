import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import NiClosseye from "../../icons/ni-closseye";
import NiOpenEye from "../../icons/ni-openEye";
import NiTick from "../../icons/ni-tick";

import { uploadImage } from "../../Pages/LandingSetting/LandingApi";

import { useDispatch, useSelector } from "react-redux";
import {
  getAgentByReferralId,
  getRank,
  getStaffRoles,
} from "../../Redux/Slices/AppSlices";

import Host from "../../Host/Host";

const UserForm = ({
  mode = "signup",
  role,
  data,
  setAlert,
  onSuccess,
  onClose,
}) => {
  const dispatch = useDispatch();
  const { rankData, staffRoles } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(getRank());
    dispatch(getStaffRoles());
  }, []);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [referalMsg, setReferralMsg] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const termsRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",

    referralId: "",
    position: "",

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
  const handleReferralCheck = async (code) => {
    setFormData((prev) => ({
      ...prev,
      referralId: code,
    }));
    if (code.length < 9) return;
    try {
      const res = await dispatch(getAgentByReferralId(code));

      setReferralMsg(res);
    } catch (error) {
      setReferralMsg(null);
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
        message: "Email verified successfully",
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

  const isAccountMatch =
    formData.accountNumber &&
    formData.confirmAccountNumber &&
    formData.accountNumber === formData.confirmAccountNumber;

  const currentRole = role || formData.role;

  const handleFinish = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      let panPhotoUrl = "";
      let aadharPhotoUrl = "";
      let nomineePhotoUrl = "";

      if (formData.panPhoto) {
        const upload = await uploadImage(formData.panPhoto);
        panPhotoUrl = upload.url;
      }

      if (formData.aadharPhoto) {
        const upload = await uploadImage(formData.aadharPhoto);
        aadharPhotoUrl = upload.url;
      }

      if (formData.nomineeAadharPhoto) {
        const upload = await uploadImage(formData.nomineeAadharPhoto);
        nomineePhotoUrl = upload.url;
      }

      const payload = {
        ...formData,
        role: currentRole,
        panPhoto: panPhotoUrl,
        aadharPhoto: aadharPhotoUrl,
        nomineeAadharPhoto: nomineePhotoUrl,
      };

      await onSuccess(payload);
      setSaving(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        referralId: "",
        password: "",
        position: "",
        address: "",
        panNumber: "",
        panPhoto: null,
        aadharNumber: "",
        aadharPhoto: null,
        bankName: "",
        accountNumber: "",
        confirmAccountNumber: "",
        ifsc: "",
        nomineeName: "",
        nomineeRelation: "",
        nomineeAadharNumber: "",
        nomineeAadharPhoto: null,
        emailOtp: "",
        isEmailVerified: false,
      });

      setStep(1);
      setAcceptedTerms(false);
      setHasScrolledToBottom(false);
      onClose?.();
    } catch (err) {
      console.log(err);
      setSaving(false);
    }
  };

  return (
    <div >
      {mode === "admin" && (
        <div className="field">
          <label>User Type</label>

          <select
            value={formData.role || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value,
              })
            }
          >
            <option value="">Select User Type</option>
            <option value="user">Customer</option>
            <option value="agent">Associate</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      )}

      {(currentRole === "agent" || currentRole === "staff") && (
        <p>Step {step} of 4</p>
      )}

      {(currentRole === "user" || step === 1) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (currentRole === "user") {
              handleFinish(e);
            } else {
              setStep(2);
            }
          }}
        >
          <div className="field">
            <input
              placeholder="Name (as per Aadhaar)"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
            />
          </div>
          <div className="field">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
            />
          </div>
          <div className="field">
            <input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
            />
          </div>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
            />

            <span
              className="password-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <NiClosseye /> : <NiOpenEye />}
            </span>
          </div>
          {currentRole === "agent" && (
            <>
              <input
                placeholder="Referral Code"
                value={formData.referralId}
                onChange={(e) =>
                  handleReferralCheck(e.target.value.toUpperCase())
                }
              />

              {referalMsg &&
                (referalMsg.payload?.msg ? (
                  <p style={{ color: "red" }}>{referalMsg.payload.msg}</p>
                ) : (
                  <p style={{ color: "green" }}>
                    Referred by :{referalMsg.payload?.name}
                  </p>
                ))}

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
            </>
          )}
          {currentRole === "staff" && (
            <select
              value={formData.staffRole || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  staffRole: e.target.value,
                })
              }
            >
              <option value="">Select Staff Role</option>

              {staffRoles?.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={currentRole === "agent" ? !canGoStep2 : false}
          >
            {currentRole === "user" ? "Register" : "Next"}
          </button>
        </form>
      )}
      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(3);
          }}
        >
          <div className="field">
            <input
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
            />
          </div>
          <div className="field">
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
          </div>
          <div className="field">
            <label>PAN Card</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload("panPhoto", e.target.files[0])}
            />
          </div>
          <div className="field">
            <input
              placeholder="Aadhaar Number"
              maxLength={12}
              value={formData.aadharNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");

                setFormData({
                  ...formData,
                  aadharNumber: value,
                });
              }}
            />
          </div>
          <div className="field">
            <label>Aadhaar Card</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileUpload("aadharPhoto", e.target.files[0])
              }
            />
          </div>
          <div className="field">
            <input
              placeholder="Bank Name"
              value={formData.bankName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankName: e.target.value,
                })
              }
            />
          </div>
          <div className="field">
            <input
              type="password"
              placeholder="Account Number"
              value={formData.accountNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  accountNumber: e.target.value,
                })
              }
            />
          </div>
          <div className="field">
            <input
              type="password"
              placeholder="Confirm Account Number"
              className={
                formData.confirmAccountNumber
                  ? isAccountMatch
                    ? "input-success"
                    : "input-error"
                  : ""
              }
              value={formData.confirmAccountNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmAccountNumber: e.target.value,
                })
              }
            />
          </div>
          <div className="field">
            <input
              placeholder="IFSC Code"
              value={formData.ifsc}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ifsc: e.target.value,
                })
              }
            />
          </div>
          <p className="email-otp-messge">Check your email for OTP</p>

          <div className="otp-box">
            <input
              placeholder="Enter OTP"
              value={formData.emailOtp}
              disabled={formData.isEmailVerified}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emailOtp: e.target.value,
                })
              }
            />

            <button
              type="button"
              onClick={verifyOtp}
              disabled={formData.isEmailVerified}
            >
              {formData.isEmailVerified ? "Verified" : "Verify"}
            </button>
          </div>
          {!formData.isEmailVerified && (
            <p
              className="email-otp-messge"
              style={{
                color: "red",
                cursor: "pointer",
              }}
            >
              Resend OTP
            </p>
          )}
          <button type="submit" disabled={!canGoStep3}>
            Next
          </button>
        </form>
      )}
      {step === 3 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(4);
          }}
        >
          <div className="field">
            <input
              placeholder="Nominee Name"
              value={formData.nomineeName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nomineeName: e.target.value,
                })
              }
            />
          </div>
          <div className="field">
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
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="son">Son</option>
              <option value="daughter">Daughter</option>
              <option value="brother">Brother</option>
              <option value="sister">Sister</option>
            </select>
          </div>
          <div className="field">
            <input
              placeholder="Nominee Aadhaar Number"
              maxLength={12}
              value={formData.nomineeAadharNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");

                setFormData({
                  ...formData,
                  nomineeAadharNumber: value,
                });
              }}
            />
          </div>
          <div className="field">
            <label>Nominee Aadhaar</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileUpload("nomineeAadharPhoto", e.target.files[0])
              }
            />
          </div>
          {formData.nomineeAadharPhoto && (
            <p
              style={{
                color: "green",
                fontSize: "13px",
              }}
            >
              ✔ Aadhaar Uploaded
            </p>
          )}
          {!canFinish && (
            <p
              style={{
                color: "red",
                fontSize: "13px",
              }}
            >
              Please complete all nominee details.
            </p>
          )}
          <button type="submit" disabled={!canFinish}>
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
            <h4>Terms & Conditions</h4>

            {data?.policies?.termcondition?.sections?.map((section) => (
              <div key={section._id}>
                {section.heading && <h5>{section.heading}</h5>}

                {section.content && <p>{section.content}</p>}
              </div>
            ))}
            <hr />

            <h4>Privacy Policy</h4>

            {data?.policies?.privacy?.sections?.map((section) => (
              <div key={section._id}>
                {section.heading && <h5>{section.heading}</h5>}

                {section.content && <p>{section.content}</p>}
              </div>
            ))}
          </div>
          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={acceptedTerms}
              disabled={!hasScrolledToBottom}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            I have read and agree to the Terms & Conditions
          </label>
          {!hasScrolledToBottom && (
            <p className="scroll-msg">Please scroll to bottom.</p>
          )}
          <button type="submit" disabled={!acceptedTerms || saving}>
            {saving
              ? "Saving..."
              : mode === "signup"
                ? "Finish Registration"
                : "Create User"}
          </button>
        </form>
      )}
    </div>
  );
};

export default UserForm;
