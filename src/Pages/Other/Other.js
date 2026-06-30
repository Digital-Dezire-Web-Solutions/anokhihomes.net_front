import React, { useEffect, useRef, useState } from "react";
import "./Other.css";
import SearchItems from "../../components/SearchItems/SearchItems";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useNavigate } from "react-router-dom";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import NiDelete from "../../icons/ni-delete";
import NiEdit from "../../icons/ni-edit";
import NiSearch from "../../icons/ni-search";
import NiCard from "../../icons/ni-card";
import NiList from "../../icons/ni-list";
import { LucidePlus } from "lucide-react";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import ActionModal from "../../components/Modals/ActionModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import NiClosseye from "../../icons/ni-closseye";
import { useDispatch, useSelector } from "react-redux";
import {
  getUser,
  addUser,
  updateUserStatus,
  updateUser,
  deleteUser,
  getAgentByReferralId,
  getStaffRoles,
} from "../../Redux/Slices/AppSlices";
import NiUser from "../../icons/ni-user";
import Stars from "../../components/Utils/Stars";

const ITEMS_PER_PAGE = 15;
const Other = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { users, staffRoles } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getUser());
    dispatch(getStaffRoles());
  }, []);

  // console.log(staffRoles, "staffRoles")
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRow, setActiveRow] = useState(null);
  const [viewItem, setViewItem] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDeleteUser, setSelectedDeleteUser] = useState(null);
  const [referalMsg, setReferralMsg] = useState(null)

  const [formData, setFormData] = useState({
    user: "",
    name: "",
    avatar: "",
    status: "",
  });

  useEffect(() => {
    if (selectedUser) {
      setFormData(selectedUser);
    } else {
      setFormData({
        user: "",
        name: "",
        avatar: "",
        status: "",
      });
    }
  }, [selectedUser]);

  const filteredData = users
    ?.filter((item) => item.role !== "admin")
    ?.filter((item) => {
      // Role filter
      const matchesRole =
        filter === "all" || item.role?.toLowerCase() === filter?.toLowerCase();

      // Search filter
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.name.toLowerCase().includes(searchValue) ||
        item.email?.toLowerCase().includes(searchValue) ||
        item.phone?.includes(searchValue) ||
        item.id.toString().includes(searchValue) ||
        item.user.toLowerCase().includes(searchValue);

      return matchesRole && matchesSearch;
    });
  // reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.ceil(filteredData?.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData?.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setActiveRow(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setActiveRow]);

  const handleAddUser = async () => {
    setSaving(true)
    try {
      const result = await dispatch(addUser(formData)).unwrap();

      setAlert({
        message: result.msg || "User created successfully",
        status: "Success",
      });

      dispatch(getUser());

      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setOpen(false);
      setSaving(false)
    } catch (error) {
      setAlert({
        message: error.msg || "Failed to create user",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    }
  };
  const handleEditUser = async () => {
    setSaving(true)
    try {
      await dispatch(
        updateUser({
          id: formData._id,
          data: formData,
        })
      );

      setOpen(false);

      setAlert({
        message: "User updated successfully",
        status: "Success",
      });
      dispatch(getUser());

      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    } catch (error) {
      console.log(error);
      setSaving(false)
    }
  };

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

  const handleStatusToggle = async (item) => {
    try {
      const status =
        item.status === "active"
          ? "inactive"
          : "active";

      await dispatch(
        updateUserStatus({
          id: item._id,
          status,
        })
      );

      setAlert({
        message: `User ${status} successfully`,
        status: "Success",
      });
      dispatch(getUser());

      setTimeout(() => {
        setAlert(null);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  const createSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // console.log(currentData, "currentData")

  return (
    <div className="plot-container user-table-box">
      {/* Filters */}
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Users</h2>
          <Breadcrumb />
        </div>
        <div className="page-tools">
          {(mood === "admin" || mood === "staff") && (
            <button
              className="add-button"
              onClick={() => {
                setSelectedUser(null);
                setIsEditMode(false);
                setOpen(true);
              }}
            >
              <LucidePlus /> Add
            </button>
          )}
          <div className="searchItem">
            <NiSearch />
            <input
              placeholder="Search Nane"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
          <div className="filter-buttons">
            <button
              // key={f}
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              // key={f}
              className={filter === "user" ? "active" : ""}
              onClick={() => setFilter("user")}
            >
              Customer
            </button>
            <button
              // key={f}
              className={filter === "staff" ? "active" : ""}
              onClick={() => setFilter("staff")}
            >
              Staff
            </button>
            <button
              // key={f}
              className={filter === "agent" ? "active" : ""}
              onClick={() => setFilter("agent")}
            >
              Associate
            </button>
            {/* ))} */}
          </div>
          <div className="page-toggle">
            <span
              className={`${viewItem === false ? "active" : ""}`}
              onClick={() => setViewItem(false)}
            >
              <NiList />
            </span>
            <span
              className={`${viewItem === true ? "active" : ""}`}
              onClick={() => setViewItem(true)}
            >
              <NiCard />
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {viewItem === false ? (
        <div className="card table-box">
          <div className="table ">
            <div className="table-head">
              <span>S.No</span>
              <span>Image</span>
              <span>Role</span>
              <span>Name</span>
              <span>Referral Id</span>
              <span>Designation</span>
              <span>Referral By</span>
              <span>Rating</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {currentData?.map((item, index) => (
              <div key={item.id} className="table-row">
                <span>{index + 1}</span>
                {item?.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="profile-avatar"
                  />
                ) : (
                  <NiUser />
                )}
                {/* <img src={item.avatar} alt="" /> */}
                <span>
                  {item.role === "staff"
                    ? "Staff"
                    : item.role === "agent"
                      ? "Associate"
                      : item.role === "admin"
                        ? "Admin"
                        : "Customer"}
                </span>
                <span className="title" style={{ textTransform: "capitalize" }}>
                  {item.name} {item.position && `(${item.position})`}
                </span>
                <span>{item?.referralId}</span>
                <span className="title">{item.role === "agent" ? <>{item.designation}({item.directIncomePercent}%) </> : item.role === "staff" ? <>{item.staffRole?.name}</> : "-"}</span>
                <span className="title">{item?.referredBy?.name || "-"} {item?.referredBy?.referralId && `(${item?.referredBy?.referralId})`}</span>
                {item.role === "agent" ? <span className="title"><Stars rating={item.overallRating} />({item.overallRating?.toFixed(1)})</span> : "-"}

                {((item.status !== "approval" && mood === "admin" || item.status !== "approval" && mood === "staff") && (
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.status === "active"}
                      onChange={() => handleStatusToggle(item)}
                    />
                    <span className="slider"></span>
                  </label>
                )) || (
                    <span className={`status ${item.status === "approval" ? "pending" : item.status}`}>
                      {item.status}
                    </span>
                  )}

                <div className="dots">
                  <span
                    onClick={() =>
                      navigate(`/user/${createSlug(item.name)}`, {
                        state: item._id,
                      })
                    }
                  >
                    <NiOpenEye />
                  </span>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRow(activeRow === item._id ? null : item._id);
                    }}
                  >
                    <NiDots />
                  </span>

                  {activeRow === item._id && (
                    <ActionModal
                      item={item}
                      onClose={() => setActiveRow(null)}
                      onEdit={(booking) => {
                        setSelectedUser(booking);
                        setIsEditMode(true);
                        setOpen(true);
                      }}
                      onDelete={() => {
                        setSelectedDeleteUser(item);
                        setDeleteOpen(true);
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="user-card-box">
          {currentData.map((item) => (
            <div className="user-card card">
              <div className="user-card-top">
                <div className="user-card-title">
                  {/* <img src={item.avatar} alt="" /> */}
                  <div className="user-card-detail">
                    <h4>{item.name} <span className="title">{item.role === "agent" ? <>{item.designation}({item.directIncomePercent}%) </> : item.role === "staff" ? <>({item.staffRole?.name})</> : "-"}</span></h4>
                    {/* <p></p> */}
                  </div>
                </div>
                <div className="dots">
                  <span
                    onClick={() =>
                      navigate(`/user/${createSlug(item.name)}`, {
                        state: item._id,
                      })
                    }
                  >
                    <NiOpenEye />
                  </span>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRow(activeRow === item._id ? null : item._id);
                    }}
                  >
                    <NiDots />
                  </span>

                  {activeRow === item._id && (
                    <ActionModal
                      item={item}
                      onClose={() => setActiveRow(null)}
                      onEdit={(booking) => {
                        setSelectedUser(booking);
                        setIsEditMode(true);
                        setOpen(true);
                      }}
                      onDelete={() => {
                        setSelectedDeleteUser(item);
                        setDeleteOpen(true);
                      }}
                    />
                  )}
                </div>
              </div>
              {item.role === "agent" &&
                <div className="user-card-bottom">
                  <span>Referal Id </span>
                  <span>{item.referralId}</span>
                </div>
              }
              <div className="user-card-bottom">
                <span>
                  {item.role === "staff"
                    ? "Staff"
                    : item.role === "agent"
                      ? "Associate"
                      : item.role === "admin"
                        ? "Admin"
                        : "Customer"}
                </span>
                <span className="title">
                  {/* {item.connected?.name || item.referralId || "-"} */}
                </span>
                {(item.status !== "approval" && mood === "admin" && (
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.status === "active"}
                      onChange={() => handleStatusToggle(item)}
                    />
                    <span className="slider"></span>
                  </label>
                )) || (
                    <span className={`status ${item.status === "approval" ? "pending" : ""}`}>
                      {item.status === "approval" && "Pending"}
                    </span>
                  )}

              </div>

              {/* <div className="user-card-bottom">
                <span>Referal By </span>
                <span>{item.referredBy}</span>
              </div> */}
            </div>
          ))}
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? "Edit User" : "Add User"}
      >
        {/* User Type */}
        <div className="field">
          <label>User Type</label>
          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
          >
            <option value="">Select Type</option>
            <option value="user">Customer</option>
            <option value="agent">Associate</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Common Fields */}
        {/* {formData.user && ( */}
        <>
          <div className="field">
            <input
              placeholder="Name (as per Aadhaar) "
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="field">
            <input
              type="email"
              placeholder="Email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="field">
            <input
              placeholder="Phone"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="field password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password || ""}
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
        </>
        {/* )} */}


        {/* Agent Only */}
        {formData.role === "agent" && (
          <>
            <div className="field password-field">
              <input
                placeholder="Referral Code"
                value={formData.referralId}
                onChange={(e) => handleReferralCheck(e.target.value)}
              />
            </div>
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
          </>
        )}

        {/* Staff Only */}
        {formData.role === "staff" && (
          <div className="field">
            <select
              value={formData.staffRole}
              onChange={(e) =>
                setFormData({ ...formData, staffRole: e.target.value })
              }
            >
              {staffRoles.map((item) => (
                <option value={item._id}>{item.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="modal-actions">
          <button
            disabled={saving}
            onClick={() => {
              if (isEditMode) {
                handleEditUser();
              } else {
                handleAddUser();
              }
              setOpen(false);
            }}
          >
            {saving ? "Saving..." : isEditMode ? "Update User" : "Add User"}
          </button>
        </div>
      </AddLocationModal>
      <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <p>Are you sure you want to delete?</p>
        <div className="modal-actions">
          <button
            onClick={async (e) => {
              e.stopPropagation();

              try {
                await dispatch(
                  deleteUser(selectedDeleteUser._id)
                );

                setDeleteOpen(false);

                setAlert({
                  message: "User deleted successfully",
                  status: "Success",
                });
                dispatch(getUser());

                setTimeout(() => {
                  setAlert(null);
                }, 3000);
              } catch (error) {
                console.log(error);
              }
            }}
          >
            Yes
          </button>

          <button
            className="btn-outline"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      </DeleteModal>
    </div>
  );
};

export default Other;
