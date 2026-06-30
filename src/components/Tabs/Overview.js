import React, { useEffect, useState } from "react";
import "./Tabs.css";
import NiCross from "../../icons/ni-cross";
import NiTick from "../../icons/ni-tick";
import DeleteModal from "../Modals/DeleteModal";
import AddLocationModal from "../Modals/AddLocationModal";
import formatDate from "../DateFormate/DateFormate";
import { useDispatch, useSelector } from "react-redux";
import { updateUserApproval, updateUser, getRank, getStaffRoles } from "../../Redux/Slices/AppSlices";
import NiEdit from "../../icons/ni-edit";
import { X } from "lucide-react";
import { uploadImage } from "../../Pages/LandingSetting/LandingApi";
import axios from "axios";
import Host from "../../Host/Host";
import { formatCurrency } from "../Utils/FormatCurrency";
import Stars from "../Utils/Stars";

const Overview = ({ userData, mood, setAlert }) => {
  const dispatch = useDispatch();
  const { rankData, staffRoles } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(getRank());
    dispatch(getStaffRoles());
  }, []);
  const [rankOpen, setRankOpen] = useState(false);
  const [staffRoleOpen, setStaffRoleOpen] = useState(false);
  const [ranks, setRanks] = useState(rankData);
  // console.log(userData, "userData2")
  const [localUser, setLocalUser] = useState(userData);
  const [selectedLevel, setSelectedLevel] = useState(localUser?.level || "");
  const [disapproveOpen, setDisapproveOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [editKyc, setEditKyc] = useState(false);
  const [editBank, setEditBank] = useState(false);
  const [editNominee, setEditNominee] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [confirmPasswordModal, setConfirmPasswordModal] = useState(false);
  const [staffPermissions, setStaffPermissions] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  const ALL_PERMISSIONS = [
    // Lead
    { key: "lead.view", label: "View Leads" },
    { key: "lead.add", label: "Add Lead" },
    { key: "lead.edit", label: "Edit Lead" },
    { key: "lead.assign", label: "Assign Lead" },
    // Site Visit
    { key: "sitevisit.view", label: "View Site Visit" },
    { key: "sitevisit.add", label: "Create Site Visit" },
    { key: "sitevisit.complete", label: "Complete Site Visit" },

    // Booking
    { key: "booking.view", label: "View Booking" },
    { key: "booking.add", label: "Create Booking" },
    { key: "booking.approve", label: "Approve Booking" },
    { key: "booking.reject", label: "Reject Booking" },

    // Plot
    { key: "plot.view", label: "View Plot" },
    { key: "plot.add", label: "Add Plot" },
    { key: "plot.edit", label: "Edit Plot" },
    { key: "plot.delete", label: "Delete Plot" },
    { key: "plot.change_status", label: "Change Status" },

    // Payment
    { key: "payment.view", label: "View Payments" },
    { key: "payment.add", label: "Add Payment" },
    { key: "payment.approve", label: "Approve Payment" },

    // Reports
    { key: "report.view", label: "View Reports" },
    { key: "report.export", label: "Export Reports" },
  ];

  useEffect(() => {
    setLocalUser("")
    setSelectedLevel(localUser?.level || "");
    setLocalUser(userData)
  }, [userData]);

  useEffect(() => {
    if (localUser?.staffRole) {
      const role = staffRoles.find(
        (item) =>
          item._id ===
          (typeof localUser.staffRole === "object"
            ? localUser.staffRole._id
            : localUser.staffRole)
      );

      setStaffPermissions(role || null);
    }
  }, [localUser, staffRoles]);


  const [editData, setEditData] = useState({
    panNumber: localUser?.panNumber || "",
    aadharNumber: localUser?.aadharNumber || "",
    panPhoto: localUser?.panPhoto || "",
    aadharPhoto: localUser?.aadharPhoto || "",
    address: localUser?.address || "",

    bankName: localUser?.bankName || "",
    accountNumber: localUser?.accountNumber || "",
    ifsc: localUser?.ifsc || "",

    nomineeName: localUser?.nomineeName || "",
    nomineeRelation: localUser?.nomineeRelation || "",
    nomineeAadharNumber: localUser?.nomineeAadharNumber || "",
    nomineeAadharPhoto: localUser?.nomineeAadharPhoto || "",
  });

  useEffect(() => {
    if (localUser) {
      setFormData((prev) => ({
        ...prev,
        staffRole: localUser?.staffRole?._id || "",
      }));
    }
  }, [localUser]);

  useEffect(() => {
    if (localUser) {
      setEditData({
        panNumber: localUser.panNumber || "",
        aadharNumber: localUser.aadharNumber || "",
        panPhoto: localUser?.panPhoto || "",
        aadharPhoto: localUser?.aadharPhoto || "",
        address: localUser.address || "",

        bankName: localUser.bankName || "",
        accountNumber: localUser.accountNumber || "",
        ifsc: localUser.ifsc || "",

        nomineeName: localUser.nomineeName || "",
        nomineeRelation: localUser.nomineeRelation || "",
        nomineeAadharNumber: localUser.nomineeAadharNumber || "",
        nomineeAadharPhoto: localUser?.nomineeAadharPhoto || "",
      });
    }
  }, [localUser]);

  if (!localUser) return null;

  const handleApprove = async () => {
    setSaving(true)
    try {
      const result = await dispatch(
        updateUserApproval({
          id: localUser._id,
          status: "active",
        }),
      );

      if (result.payload?.user) {
        setLocalUser(result.payload.user);

        setAlert({
          message: "Associate approved successfully",
          status: "Success",
        });

        setTimeout(() => {
          setAlert(null);
        }, 3000);
      }
      setSaving(false)
    } catch (error) {
      console.log(error);

      setAlert({
        message: "Approval failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    }
  };

  const handleReject = async () => {
    setSaving(true)
    try {
      const result = await dispatch(
        updateUserApproval({
          id: localUser._id,
          status: "rejected",
          notes: formData.notes,
        }),
      );

      if (result.payload?.user) {
        setLocalUser(result.payload.user);

        setAlert({
          message: "Associate disapproved successfully",
          status: "Success",
        });

        setDisapproveOpen(false);

        setTimeout(() => {
          setAlert(null);
        }, 3000);
      }
      setSaving(false)
    } catch (error) {
      console.log(error);

      setAlert({
        message: "Disapproval failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    }
  };

  const isPasswordFormValid =
    passwordData.currentPassword.trim() &&
    passwordData.newPassword.trim() &&
    passwordData.confirmPassword.trim() &&
    passwordData.newPassword.length >= 6 &&
    passwordData.newPassword === passwordData.confirmPassword;

  const handleSave = async () => {
    try {
      setSaving(true);
      let panPhotoUrl = "";
      let aadharPhotoUrl = "";
      let nomineeAadharPhotoUrl = "";
      console.log(editData, "editData")
      if (editData.panPhoto instanceof File) {
        const panUpload = await uploadImage(editData.panPhoto);
        panPhotoUrl = panUpload.url;
      }

      if (editData.aadharPhoto instanceof File) {
        const aadharUpload = await uploadImage(editData.aadharPhoto);
        aadharPhotoUrl = aadharUpload.url;
      }

      if (editData.nomineeAadharPhoto instanceof File) {
        const nomineeUpload = await uploadImage(
          editData.nomineeAadharPhoto
        );
        nomineeAadharPhotoUrl = nomineeUpload.url;
      }
      console.log(panPhotoUrl, "panUpload")
      console.log(aadharPhotoUrl, "aadharPhotoUrl")
      console.log(nomineeAadharPhotoUrl, "nomineeAadharPhotoUrl")
      const payload = {
        ...editData,

        panPhoto:
          panPhotoUrl ||
          (typeof editData.panPhoto === "string"
            ? editData.panPhoto
            : localUser.panPhoto),

        aadharPhoto:
          aadharPhotoUrl ||
          (typeof editData.aadharPhoto === "string"
            ? editData.aadharPhoto
            : localUser.aadharPhoto),

        nomineeAadharPhoto:
          nomineeAadharPhotoUrl ||
          (typeof editData.nomineeAadharPhoto === "string"
            ? editData.nomineeAadharPhoto
            : localUser.nomineeAadharPhoto),
      };
      console.log(payload, "payload2")
      const result = await dispatch(
        updateUser({
          id: localUser._id,
          data: payload,
        })
      ).unwrap();

      setLocalUser(result);

      setEditKyc(false);
      setEditBank(false);
      setEditNominee(false);

      setAlert({
        message: "Details updated successfully",
        status: "Success",
      });

      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    } catch (error) {
      console.log(error);

      setAlert({
        message: "Update failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    }
  };

  const handleUpdateRank = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${Host}/api/auth/update-rank/${localUser._id}`,
        {
          level: selectedLevel,
        },
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      setLocalUser(res.data.user);

      setAlert({
        message: "Designation updated successfully",
        status: "Success",
      });

      setRankOpen(false);

      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    } catch (err) {
      console.log(err);

      setAlert({
        message:
          err.response?.data?.msg || "Failed to update designation",
        status: "Error",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    }
  };

  const handleChangePassword = async () => {
    setSaving(true)
    if (!passwordData.currentPassword) {
      return setAlert({
        message: "Current password is required",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    }

    if (passwordData.newPassword.length < 6) {
      return setAlert({
        message: "Password must be at least 6 characters",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      return setAlert({
        message: "Passwords do not match",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${Host}/api/auth/change-password`,
        passwordData,
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      setAlert({
        message: "Password changed successfully",
        status: "Success",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    } catch (err) {
      setAlert({
        message:
          err.response?.data?.message || "Failed to change password",
        status: "Error",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    }
  };

  const handleUpdateStaffRole = async () => {
    setSaving(true)
    try {
      const result = await dispatch(
        updateUser({
          id: localUser._id,
          data: {
            staffRole: formData.staffRole,
          },
        })
      ).unwrap();

      const role = staffRoles.find(
        (item) => item._id === formData.staffRole
      );

      setLocalUser({
        ...result,
        staffRole: role,
      });

      setStaffPermissions(role || null);
      setStaffRoleOpen(false);
      setAlert({
        message: "Staff role updated successfully",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    } catch (err) {
      console.log(err);
      setAlert({
        message: "Failed to update staff role",
        status: "Error",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    }
  };


  const parentRank = rankData.find(
    (r) => r.designation === localUser.referredBy?.designation
  );

  const allowedRanks = rankData.filter(
    (rank) => !parentRank || rank.level <= parentRank.level
  );

  // console.log(staffPermissions, "staffPermissions")

  return (
    <div className="card overview-card">
      {localUser.role === "agent" && (
        <div className="agent-mini-stats">
          <div className="overview-grid">
            <div>
              <label>Email</label>
              <p>{localUser.email}</p>
            </div>
            <div>
              <label>Phone</label>
              <p>{localUser.phone}</p>
            </div>
            <div>
              <label>Referral ID</label>
              <p>{localUser.referralId}</p>
            </div>

            <div>
              <label>
                Designation

                {mood === "admin" && localUser.role === "agent" && (
                  <span
                    style={{ marginLeft: 8, cursor: "pointer" }}
                    onClick={() => setRankOpen(true)}
                  >
                    <NiEdit />
                  </span>
                )}
              </label>

              <p>{localUser.designation}</p>
            </div>

            <div>
              <label>Designation Percent</label>
              <p>{localUser.directIncomePercent || 0}%</p>
            </div>

            <div>
              <label>Wallet</label>
              <p>₹{formatCurrency(localUser.wallet)}</p>
            </div>

            <div>
              <label>Total Income</label>
              <p>₹{formatCurrency(localUser.totalIncome)}</p>
            </div>

            <div>
              <label>Total Withdraw</label>
              <p>₹{formatCurrency(localUser.totalWithdraw)}</p>
            </div>

            <div>
              <label>Total Team</label>
              <p>{localUser.totalTeam}</p>
            </div>
            <div>
              <label>Left Team</label>
              <p>{localUser.leftChildren?.length}</p>
            </div>
            <div>
              <label>Right Team</label>
              <p>{localUser.rightChildren?.length}</p>
            </div>
            <div>
              <label>Joined On</label>
              <p>{formatDate(localUser?.createdAt)}</p>
            </div>
            <div>
              <label>Position</label>
              <p>{localUser.position}</p>
            </div>
          </div>
          {mood === "admin" && localUser.status === "approval" && (
            <div className="modal-actions">
              <button
                disabled={saving}
                className="site-visit-approval status active"
                onClick={handleApprove}
              >
                {saving ? "Approving" : <>
                  <NiTick /> Approve
                </>}
              </button>

              <button
                className="site-visit-approval status failed"
                onClick={() => setDisapproveOpen(true)}
              >
                <NiCross /> Disapprove
              </button>
            </div>
          )}

          <h4>Referred By</h4>
          {localUser.referredBy && (
            <>
              <div className="overview-grid">
                <div>
                  <label>Name</label>
                  <p>{localUser.referredBy.name}</p>
                </div>

                <div>
                  <label>Phone</label>
                  <p>{localUser.referredBy.phone}</p>
                </div>
                <div>
                  <label>Email</label>
                  <p>{localUser.referredBy.email}</p>
                </div>

                <div>
                  <label>Referral ID</label>
                  <p>{localUser.referredBy.referralId}</p>
                </div>

                <div>
                  <label>Designation</label>
                  <p>{localUser.referredBy.designation}</p>
                </div>

              </div>
            </>
          )}

          <h4>Rating</h4>

          <div className="overview-grid">
            <div>
              <label>Overall Rating </label>
              <Stars rating={localUser.overallRating} />
            </div>
            <div>
              <label>Lead Rating </label>
              <Stars rating={localUser.leadRating} />
            </div>
            <div>
              <label>Site Visit Rating</label>
              <Stars rating={localUser.siteVisitRating} />
            </div>
            <div>
              <label>Booking Rating</label>
              <Stars rating={localUser.bookingRating} />
            </div>
            <div>
              <label>Customer Rating</label>
              <Stars rating={localUser.customerRating} />
            </div>
            <div>
              <label>Total Rating</label>
              <p>{localUser.totalCustomerRatings || 0}</p>
            </div>
          </div>
          <h4>Business Statistics</h4>

          <div className="overview-grid">
            <div>
              <label>Self Business</label>
              <p>₹{formatCurrency(localUser.selfBusiness)}</p>
            </div>

            <div>
              <label>Left Business</label>
              <p>₹{formatCurrency(localUser.leftBusiness)}</p>
            </div>

            <div>
              <label>Right Business</label>
              <p>₹{formatCurrency(localUser.rightBusiness)}</p>
            </div>

            <div>
              <label>Total Business</label>
              <p>₹{formatCurrency(localUser.totalBusiness)}</p>
            </div>

            <div>
              <label>Cycle 1 Business</label>
              <p>₹{formatCurrency(localUser.cycle1Business)}</p>
            </div>

            <div>
              <label>Cycle 2 Business</label>
              <p>₹{formatCurrency(localUser.cycle2Business)}</p>
            </div>
          </div>

          <div className="section-header">
            <h4>
              KYC Details
              {mood === "admin" && (
                <span onClick={() => setEditKyc(!editKyc)}>
                  {editKyc ? <X /> : <NiEdit />}
                </span>
              )}
            </h4>

            {/* {(mood === "admin" || mood === "staff") && (
              <button onClick={() => setEditKyc(!editKyc)}>
                {editKyc ? <X /> : <NiEdit />}
              </button>
            )} */}
          </div>

          <div className="overview-grid">
            <div>
              <label>PAN Number</label>

              {editKyc ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      value={editData.panNumber}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          panNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>{localUser.panNumber}</p>
              )}
            </div>

            <div>
              <label>Aadhar Number</label>
              {editKyc ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      value={editData.aadharNumber}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          aadharNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>{localUser.aadharNumber}</p>
              )}
            </div>

            <div>
              <label>Address</label>
              {editKyc ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      value={editData.address}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>{localUser.address}</p>
              )}
            </div>
            <div>
              <label>Pan Photo</label>
              {editKyc ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      type="file"
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          panPhoto: e.target.files[0]
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>
                  <img
                    onClick={() => {
                      setPreviewImage(localUser?.panPhoto);
                      setPreviewOpen(true);
                    }}
                    className="doc-thumbnail" src={localUser?.panPhoto} alt="" />
                </p>
              )}
            </div>
            <div>
              <label>Aadhar Photo</label>
              {editKyc ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      type="file"
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          aadharPhoto: e.target.files[0]
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>
                  <img
                    onClick={() => {
                      setPreviewImage(localUser?.aadharPhoto);
                      setPreviewOpen(true);
                    }}
                    className="doc-thumbnail" src={localUser?.aadharPhoto} alt="" />
                </p>
              )}
            </div>
          </div>

          <div className="section-header">
            <h4>Bank Details
              {mood === "admin" && (<span onClick={() => setEditBank(!editBank)}> {editBank ? <X /> : <NiEdit />}</span>)}</h4>

            {/* {(mood === "admin" || mood === "staff") && (
              <button onClick={() => setEditBank(!editBank)}>
                {editBank ? <X /> : <NiEdit />}
              </button>
            )} */}
          </div>

          <div className="overview-grid">
            <div>
              <label>Bank Name</label>
              {editBank ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      value={editData.bankName}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          bankName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>{localUser.bankName}</p>
              )}
            </div>

            <div>
              <label>Account Number</label>
              {editBank ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      value={editData.accountNumber}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          accountNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>{localUser.accountNumber}</p>
              )}
            </div>

            <div>
              <label>IFSC</label>
              {editBank ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      value={editData.ifsc}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          ifsc: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>{localUser.ifsc}</p>
              )}
            </div>
          </div>

          <div className="section-header">
            <h4>Nominee Details {mood === "admin" && (<span onClick={() => setEditNominee(!editNominee)}>{editNominee ? <X /> : <NiEdit />}</span>)}</h4>

            {/* {(mood === "admin" || mood === "staff") && (
              <button onClick={() => setEditNominee(!editNominee)}>
                {editNominee ? <X /> : <NiEdit />}
              </button>
            )} */}
          </div>

          <div className="overview-grid">
            <div>
              <label>Nominee Name</label>
              {editNominee ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      value={editData.nomineeName}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          nomineeName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>{localUser.nomineeName}</p>
              )}
            </div>

            <div>
              <label>Relation</label>
              {editNominee ? (
                <div className="plot-modal">
                  <div className="field">
                    <select
                      value={editData.nomineeRelation}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
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
                    {/* <input
                      value={editData.nomineeRelation}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          nomineeRelation: e.target.value,
                        })
                      }
                    /> */}
                  </div>
                </div>
              ) : (
                <p>{localUser.nomineeRelation}</p>
              )}
            </div>

            <div>
              <label>Nominee Aadhar</label>
              {editNominee ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      value={editData.nomineeAadharNumber}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          nomineeAadharNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>{localUser.nomineeAadharNumber}</p>
              )}
            </div>
            <div>
              <label>Nominee Aadhar Photo</label>
              {editNominee ? (
                <div className="plot-modal">
                  <div className="field">
                    <input
                      type="file"
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          nomineeAadharPhoto: e.target.files[0]
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <p>
                  <img
                    onClick={() => {
                      setPreviewImage(localUser?.nomineeAadharPhoto);
                      setPreviewOpen(true);
                    }}
                    className="doc-thumbnail"
                    src={localUser?.nomineeAadharPhoto}
                    alt="" />
                </p>
              )}
            </div>
          </div>
          {(editKyc || editBank || editNominee) && (
            <div className="modal-actions">
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= STAFF ================= */}

      {userData.role === "staff" && (
        <div className="agent-mini-stats">
          <div className="overview-grid">
            <div>
              <label>Name</label>
              <p>{localUser.name}</p>
            </div>

            <div>
              <label>Email</label>
              <p>{localUser.email}</p>
            </div>

            <div>
              <label>Phone</label>
              <p>{localUser.phone}</p>
            </div>

            <div>
              <label>Staff Role

                {mood === "admin" && localUser.role === "staff" && (
                  <span
                    style={{ marginLeft: 8, cursor: "pointer" }}
                    onClick={() => setStaffRoleOpen(true)}
                  >
                    <NiEdit />
                  </span>
                )}
              </label>

              <p>{localUser.staffRole?.name}</p>
            </div>

            {/* <div>
              <label>Staff Role</label>
              <p>{localUser.staffRole?.name}</p>
            </div> */}

            <div>
              <label>Status</label>
              <p>{localUser.status}</p>
            </div>
          </div>
          {mood === "admin" && localUser.status === "approval" && (
            <div className="modal-actions">
              <button
                className="site-visit-approval status active"
                onClick={handleApprove}
              >
                <NiTick /> Approve
              </button>

              <button
                className="site-visit-approval status failed"
                onClick={() => setDisapproveOpen(true)}
              >
                <NiCross /> Disapprove
              </button>
            </div>
          )}

          <h4>Permissions</h4>

          <div className="permission-list">
            {staffPermissions?.permissions?.length ? (
              ALL_PERMISSIONS.filter((item) =>
                staffPermissions.permissions.includes(item.key)
              ).map((item) => (
                <div key={item.key} className="permission-item active">
                  {item.label}
                </div>
              ))
            ) : (
              <p>No permissions assigned</p>
            )}
          </div>
        </div>
      )}

      {/* ================= CUSTOMER ================= */}

      {localUser.role === "user" && (
        <div className="agent-mini-stats">
          <div className="overview-grid">
            <div>
              <label>Name</label>
              <p>{localUser.name}</p>
            </div>

            <div>
              <label>Email</label>
              <p>{localUser.email}</p>
            </div>

            <div>
              <label>Phone</label>
              <p>{localUser.phone}</p>
            </div>
          </div>
        </div>
      )}
      {localUser.role === "admin" && (
        <div className="agent-mini-stats">
          <div className="overview-grid">
            <div>
              <label>Name</label>
              <p>{localUser.name}</p>
            </div>

            <div>
              <label>Email</label>
              <p>{localUser.email}</p>
            </div>

            <div>
              <label>Phone</label>
              <p>{localUser.phone}</p>
            </div>
            <div>
              <label>Referral ID</label>
              <p>{localUser.referralId}</p>
            </div>

            <div>
              <label>Designation</label>
              <p>{localUser.designation}</p>
            </div>

            <div>
              <label>Designation Percent</label>
              <p>{localUser.directIncomePercent || 0}%</p>
            </div>

            <div>
              <label>Wallet</label>
              <p>₹{localUser.wallet}</p>
            </div>

            <div>
              <label>Total Income</label>
              <p>₹{localUser.totalIncome}</p>
            </div>

            <div>
              <label>Total Team</label>
              <p>{localUser.totalTeam}</p>
            </div>
            <div>
              <label>Left Team</label>
              <p>{localUser.leftChildren?.length}</p>
            </div>
            <div>
              <label>Right Team</label>
              <p>{localUser.rightChildren?.length}</p>
            </div>
          </div>
        </div>
      )}
      {mood !== "admin" && (
        <div className="modal-actions">
          <button disabled={saving} onClick={() => setPasswordModalOpen(true)}>
            {saving ? "Changing" : "Change Password"}
          </button>
        </div>
      )}
      <DeleteModal
        open={disapproveOpen}
        onClose={() => setDisapproveOpen(false)}
      >
        <h4>Disapprove Associate</h4>
        <div className="field">
          <label>Notes</label>
          <textarea
            placeholder="Add Notes..."
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        <div className="modal-actions">
          <button
            className="site-visit-approval status failed"
            disabled={saving}
            onClick={handleReject}
          >
            <NiCross /> Reject
          </button>
        </div>
      </DeleteModal>
      <AddLocationModal
        open={rankOpen}
        onClose={() => setRankOpen(false)}
        title="Update Designation"
      >
        <div className="field">
          <label>Designation</label>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(Number(e.target.value))}
          >
            <option value="">Select Designation</option>
            {allowedRanks.map((rank) => (
              <option key={rank.level} value={rank.level}>
                {rank.designation} ({rank.directIncome}%)
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button disabled={saving} onClick={handleUpdateRank}>
            Update Designation
          </button>
        </div>
      </AddLocationModal>
      <AddLocationModal
        open={staffRoleOpen}
        onClose={() => setStaffRoleOpen(false)}
        title="Update Staff Role"
      >
        <div className="field">
          <label>Staff Role</label>

          <select
            value={formData.staffRole}
            onChange={(e) =>
              setFormData({
                ...formData,
                staffRole: e.target.value,
              })
            }
          >
            <option value="">Select Staff Role</option>

            {staffRoles.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button disabled={saving} onClick={handleUpdateStaffRole}>
            Update Staff Role
          </button>
        </div>
      </AddLocationModal>
      <AddLocationModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Document Preview"
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={previewImage}
            alt="Document"
            className="image-preview-full"
          />
        </div>
      </AddLocationModal>
      <AddLocationModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
      >
        <div className="field">
          <label>Current Password</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
          />
        </div>

        <div className="field">
          <label>New Password</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                newPassword: e.target.value,
              })
            }
          />
        </div>

        <div className="field">
          <label>Confirm Password</label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
          />
        </div>

        <div className="modal-actions">
          <button
            disabled={!isPasswordFormValid}
            disabled={saving}
            style={{
              opacity: !isPasswordFormValid ? 0.5 : 1,
              cursor: !isPasswordFormValid ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              if (passwordData.newPassword.length < 6) {
                return setAlert({
                  message: "Password must be at least 6 characters",
                  status: "Error",
                });
              }

              if (
                passwordData.newPassword !== passwordData.confirmPassword
              ) {
                return setAlert({
                  message: "Passwords do not match",
                  status: "Error",
                });
              }

              setConfirmPasswordModal(true);
            }}
          >
            Continue
          </button>
        </div>
      </AddLocationModal>
    </div>
  );
};

export default Overview;
