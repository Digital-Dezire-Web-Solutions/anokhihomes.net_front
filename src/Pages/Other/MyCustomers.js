import React, { useEffect, useRef, useState } from "react";
import "./Other.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useNavigate } from "react-router-dom";
import NiOpenEye from "../../icons/ni-openEye";
import NiSearch from "../../icons/ni-search";
import { LucidePlus } from "lucide-react";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import NiClosseye from "../../icons/ni-closseye";
import { useDispatch, useSelector } from "react-redux";
import {
  getUser,
  addUser,
  deleteUser,
  getCustomers,
} from "../../Redux/Slices/AppSlices";
import NiUser from "../../icons/ni-user";

const ITEMS_PER_PAGE = 25;
const MyCustomers = ({ mood, setAlert, data }) => {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getCustomers());
  }, []);

  //   console.log(customers, "customers");

  // console.log(staffRoles, "staffRoles")
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRow, setActiveRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDeleteUser, setSelectedDeleteUser] = useState(null);

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

  const filteredData = customers?.users?.filter((item) => {
    // Role filter
    const matchesRole =
      filter === "all" || item?.role?.toLowerCase() === filter.toLowerCase();

    const searchValue = search.trim().toLowerCase();

    // If search is empty, don't need to check fields
    if (!searchValue) {
      return matchesRole;
    }

    const matchesSearch =
      item?.name?.toLowerCase().includes(searchValue) ||
      item?.email?.toLowerCase().includes(searchValue) ||
      item?.phone?.toString().includes(searchValue) ||
      item?._id?.toString().toLowerCase().includes(searchValue) ||
      item?.id?.toString().toLowerCase().includes(searchValue) ||
      item?.user?.toLowerCase().includes(searchValue) ||
      item?.referralId?.toLowerCase().includes(searchValue) ||
      item?.designation?.toLowerCase().includes(searchValue) ||
      item?.referredBy?.name?.toLowerCase().includes(searchValue);

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

  const createSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // console.log(currentData, "item")
  const handleAddCustomer = async () => {
    setSaving(true);
    try {
      // Create customer
      const result = await dispatch(
        addUser({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          role: "user",
        }),
      ).unwrap();
      // Refresh users
      await dispatch(getCustomers());

      setFormData({
        customerId: "",
        name: "",
        phone: "",
        email: "",
        password: "",
      });
      setOpen(false);

      setAlert({
        message: "Customer created successfully",
        status: "Success",
      });
      setTimeout(() => setAlert(null), 5000);
      setSaving(false);
    } catch (err) {
      setAlert({
        message: err?.msg || "Failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 5000);
      setSaving(false);
    }
  };

  return (
    <div className="plot-container user-table-box">
      {/* Filters */}
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Users</h2>
          <Breadcrumb />
        </div>
        <div className="page-tools">
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
          <div className="searchItem">
            <NiSearch />
            <input
              placeholder="Search Name, Number, Referral Id..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <div className="card table-box">
        <div className="table ">
          <div className="table-head">
            <span>S.No</span>
            <span>Image</span>
            <span>Role</span>
            <span>Name</span>
            <span>User ID</span>
            <span>Phone</span>
            <span>Email</span>
            <span>Stage</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {currentData?.map((item, index) => (
            <div key={item._id} className="table-row">
              <span>{startIndex + index + 1}</span>
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
                {item.name}
              </span>
              <span>{item?.referralId}</span>
              <span className="title">{item?.phone}</span>
              <span className="title">{item.email}</span>
              <span className="title">
                {item.stage.type || "-"}{" "}
                <span
                  className={`status ${
                    item.stage.status === "assigned" ||
                    item.stage.status === "scheduled" ||
                    item.stage.status === "unassigned" ||
                    item.stage.status === "pending"
                      ? "pending"
                      : item.stage.status === "approval" ||
                          item.stage.status === "new" ||
                          item.stage.status === "rescheduled"
                        ? "pending2"
                        : item.stage.status === "completed" ||
                            item.stage.status === "confirmed" ||
                            item.stage.status === "converted"
                          ? "active"
                          : item.stage.status === "lost" ||
                              item.stage.status === "rejected"
                            ? "lost"
                            : item.stage.status
                  }`}
                >
                  {item.stage.status}
                </span>
              </span>
              <span
                className={`status ${item.status === "approval" ? "pending" : item.status}`}
              >
                {item.status}
              </span>
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
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Pagination */}
      <div className="pagination-wrapper">
        <div className="pagination-info">
          {filteredData?.length > 0 ? (
            <>
              Showing <strong>{startIndex + 1}</strong>
              {" – "}
              <strong>
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}
              </strong>{" "}
              of <strong>{filteredData.length}</strong> users
            </>
          ) : (
            "No users found"
          )}
        </div>

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
      </div>
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? "Edit User" : "Add User"}
      >
        <div className="field">
          <label>Name</label>
          <input
            value={formData.name || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />
        </div>

        <div className="field">
          <label>Phone</label>
          <input
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
          />
        </div>

        <div className="field">
          <label>Email</label>
          <input
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />
        </div>

        {/* <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
              />
            </div> */}
        <div className="field password-field">
          <label>Password</label>
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
        <div className="field">
          <label>Address</label>
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
        <div className="modal-actions">
          <button
            disabled={saving}
            onClick={() => {
              handleAddCustomer();
            }}
          >
            Create Customer
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
                await dispatch(deleteUser(selectedDeleteUser._id));

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

export default MyCustomers;
