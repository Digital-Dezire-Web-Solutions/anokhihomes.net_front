import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
import {
  LucidePlus,
  Download,
  FileSpreadsheet,
  FileText,
  X,
} from "lucide-react";
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
import UserForm from "../../components/UserForm/UserForm";
import Pagination from "../../components/Pagination/Pagination";

const ITEMS_PER_PAGE = 25;
const Other = ({ mood, setAlert, data }) => {
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
  const [referalMsg, setReferralMsg] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRole, setExportRole] = useState("all");

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

  const filteredData = users?.filter((item) => {
    // Role filter
    const matchesRole =
      filter === "all" ||
      item?.role?.toLowerCase() === filter.toLowerCase();

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

  const handleAddUser = async () => {
    setSaving(true);
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
      setSaving(false);
    } catch (error) {
      setAlert({
        message: error.msg || "Failed to create user",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false);
    }
  };
  const handleEditUser = async () => {
    setSaving(true);
    try {
      await dispatch(
        updateUser({
          id: formData._id,
          data: formData,
        }),
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
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  };

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

  const handleStatusToggle = async (item) => {
    try {
      const status = item.status === "active" ? "inactive" : "active";

      await dispatch(
        updateUserStatus({
          id: item._id,
          status,
        }),
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

  // console.log(currentData, "item")

  /* =====================================================
   EXPORT USERS
===================================================== */

  const getExportUsers = () => {
    if (!users || !Array.isArray(users)) {
      return [];
    }

    if (exportRole === "all") {
      return users;
    }

    return users.filter(
      (user) => user?.role?.toLowerCase() === exportRole.toLowerCase()
    );
  };

  /* =====================================================
     FORMAT USER DATA FOR EXPORT
  ===================================================== */

  const getExportRows = () => {
    const selectedUsers = getExportUsers();

    return selectedUsers.map((user) => {
      const referredBy =
        user?.role === "agent" && user?.referredBy
          ? user.referredBy
          : null;

      const role =
        user?.role === "agent"
          ? "Associate"
          : user?.role === "staff"
            ? "Staff"
            : user?.role === "admin"
              ? "Admin"
              : "Customer";

      /* =========================
         CUSTOMER
      ========================= */
      if (exportRole === "user") {
        return {
          Name: user?.name || "-",
          Phone: user?.phone || "-",
          Email: user?.email || "-",
          "User Type": role,
          UserID: user?.referralId || "-",
          Address: user?.address || "-",
        };
      }

      /* =========================
         ASSOCIATE
      ========================= */
      if (exportRole === "agent") {
        return {
          Name: user?.name || "-",
          Phone: user?.phone || "-",
          Email: user?.email || "-",
          "User Type": "Associate",
          UserID: user?.referralId || "-",

          "Referred By Name": referredBy?.name || "-",
          "Referred By Email": referredBy?.email || "-",
          "Referred By Phone": referredBy?.phone || "-",
          "Referred By UserID": referredBy?.referralId || "-",

          Designation: user?.designation || "-",
          "Direct Income %": `${user?.directIncomePercent ?? 0}%`,

          Address: user?.address || "-",
        };
      }

      /* =========================
         STAFF
      ========================= */
      if (exportRole === "staff") {
        return {
          Name: user?.name || "-",
          Phone: user?.phone || "-",
          Email: user?.email || "-",
          "User Type": "Staff",
          UserID: user?.referralId || "-",
          Role: user?.staffRole?.name || "-",
          Address: user?.address || "-",
        };
      }

      /* =========================
         ALL USERS
      ========================= */
      return {
        Name: user?.name || "-",
        Phone: user?.phone || "-",
        Email: user?.email || "-",
        "User Type": role,
        UserID: user?.referralId || "-",

        "Referred By Name":
          user?.role === "agent"
            ? referredBy?.name || "-"
            : "-",

        "Referred By Email":
          user?.role === "agent"
            ? referredBy?.email || "-"
            : "-",

        "Referred By Phone":
          user?.role === "agent"
            ? referredBy?.phone || "-"
            : "-",

        "Referred By UserID":
          user?.role === "agent"
            ? referredBy?.referralId || "-"
            : "-",

        Designation:
          user?.role === "agent" || user?.role === "admin"
            ? user?.designation || "-"
            : "-",

        "Direct Income %":
          user?.role === "agent" || user?.role === "admin"
            ? `${user?.directIncomePercent ?? 0}%`
            : "-",

        Role:
          user?.role === "staff"
            ? user?.staffRole?.name || "-"
            : "-",

        Address: user?.address || "-",
      };
    });
  };

  /* =====================================================
     EXPORT EXCEL
  ===================================================== */

  const exportToExcel = () => {
    const rows = getExportRows();

    if (!rows.length) {
      setAlert({
        message: "No users found for selected filter",
        status: "Error",
      });

      setTimeout(() => {
        setAlert(null);
      }, 3000);

      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);

    /* Auto column width */

    const columnWidths = Object.keys(rows[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...rows.map((row) =>
          String(row[key] ?? "").length
        )
      );

      return {
        wch: Math.min(maxLength + 3, 40),
      };
    });

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Users"
    );

    const fileName =
      exportRole === "all"
        ? "all-users.xlsx"
        : `${exportRole}-users.xlsx`;

    XLSX.writeFile(workbook, fileName);

    setAlert({
      message: "Excel exported successfully",
      status: "Success",
    });

    setTimeout(() => {
      setAlert(null);
    }, 3000);

    setExportOpen(false);
  };

  /* =====================================================
     EXPORT PDF
  ===================================================== */

  const exportToPDF = () => {
    const rows = getExportRows();

    if (!rows.length) {
      setAlert({
        message: "No users found for selected filter",
        status: "Error",
      });

      setTimeout(() => {
        setAlert(null);
      }, 3000);

      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const title =
      exportRole === "all"
        ? "All Users"
        : exportRole === "agent"
          ? "All Associates"
          : exportRole === "staff"
            ? "All Staff"
            : "All Customers";

    doc.setFontSize(18);
    doc.text(title, 14, 15);

    doc.setFontSize(9);
    doc.text(
      `Total Records: ${rows.length}`,
      14,
      22
    );

    const columns = Object.keys(rows[0]);

    const body = rows.map((row) =>
      columns.map((column) => row[column] ?? "-")
    );

    const columnStyles = {};

    columns.forEach((column, index) => {
      let width = 18;

      switch (column) {
        case "Name":
          width = 20;
          break;

        case "Phone":
          width = 17;
          break;

        case "Email":
          width = 28;
          break;

        case "User Type":
          width = 17;
          break;

        case "UserID":
          width = 20;
          break;

        case "Referred By Name":
          width = 20;
          break;

        case "Referred By Email":
          width = 28;
          break;

        case "Referred By Phone":
          width = 17;
          break;

        case "Referred By UserID":
          width = 20;
          break;

        case "Designation":
          width = 25;
          break;

        case "Direct Income %":
          width = 17;
          break;

        case "Role":
          width = 20;
          break;

        case "Address":
          width = 45;
          break;

        default:
          width = 18;
      }

      columnStyles[index] = {
        cellWidth: width,
      };
    });

    autoTable(doc, {
  head: [columns],
  body,

  startY: 27,

  theme: "grid",

  tableWidth: "wrap",

  styles: {
    fontSize: 5.5,
    cellPadding: 1.2,
    overflow: "linebreak",
    valign: "middle",
    halign: "left",
    lineWidth: 0.1,
  },

  headStyles: {
    fontSize: 5.5,
    fontStyle: "bold",
    valign: "middle",
  },

  bodyStyles: {
    valign: "middle",
  },

  columnStyles,

  margin: {
    top: 27,
    left: 5,
    right: 5,
    bottom: 8,
  },
});

    const fileName =
      exportRole === "all"
        ? "all-users.pdf"
        : `${exportRole}-users.pdf`;

    doc.save(fileName);

    setAlert({
      message: "PDF exported successfully",
      status: "Success",
    });

    setTimeout(() => {
      setAlert(null);
    }, 3000);

    setExportOpen(false);
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
          {(mood === "admin" || mood === "staff") && (
            <>
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
              <button
                className="add-button"
                onClick={() => {
                  setExportRole("all");
                  setExportOpen(true);
                }}
              >
                <Download size={18} />
                Export
              </button>
            </>
          )}
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
              <span>User ID</span>
              <span>Designation</span>
              <span>Referred By</span>
              <span>Rating</span>
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
                  {item.name} {item.position && `(${item.position})`}
                </span>
                <span>{item?.referralId}</span>
                <span className="title">
                  {item.role === "agent" || item.role === "admin" ? (
                    <>
                      {item.designation}({item.directIncomePercent}%){" "}
                    </>
                  ) : item.role === "staff" ? (
                    <>{item.staffRole?.name}</>
                  ) : (
                    "-"
                  )}
                </span>
                <span className="title">
                  {item?.referredBy?.name || "-"}{" "}
                  {item?.referredBy?.referralId &&
                    `(${item?.referredBy?.referralId})`}
                </span>
                {item.role === "agent" ? (
                  <span className="title">
                    <Stars rating={item.overallRating} />(
                    {item.overallRating?.toFixed(1)})
                  </span>
                ) : (
                  "-"
                )}

                {(((item.status !== "approval" && mood === "admin") ||
                  (item.status !== "approval" && mood === "staff")) && (
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.status === "active"}
                        onChange={() => handleStatusToggle(item)}
                      />
                      <span className="slider"></span>
                    </label>
                  )) || (
                    <span
                      className={`status ${item.status === "approval" ? "pending" : item.status}`}
                    >
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

                  {/* <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRow(activeRow === item._id ? null : item._id);
                    }}
                  >
                    <NiDots />
                  </span> */}

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
                    <h4>
                      {item.name}{" "}
                      <span className="title">
                        {item.role === "agent" ? (
                          <>
                            {item.designation}({item.directIncomePercent}%){" "}
                          </>
                        ) : item.role === "staff" ? (
                          <>({item.staffRole?.name})</>
                        ) : (
                          "-"
                        )}
                      </span>
                    </h4>
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

                  {/* <span
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
                  )} */}
                </div>
              </div>
              {item.role === "agent" && (
                <div className="user-card-bottom">
                  <span>Referal Id </span>
                  <span>{item.referralId}</span>
                </div>
              )}
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
                    <span
                      className={`status ${item.status === "approval" ? "pending" : ""}`}
                    >
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
      <div className="pagination-wrapper">
        <div className="pagination-info">
          {filteredData?.length > 0 ? (
            <>
              Showing{" "}
              <strong>{startIndex + 1}</strong>
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
          <Pagination
          page={currentPage}
          totalPages={totalPages}
          setPage={setCurrentPage}
        />
        )}
      </div>
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? "Edit User" : "Add User"}
      >
        <div className="auth-card" style={{ padding: "0", width: "auto", boxShadow: "none" }}>
          <UserForm
            mode="admin"
            setAlert={setAlert}
            onClose={() => {
              setOpen(false);
            }}
            onSuccess={async (payload) => {
              await dispatch(addUser(payload)).unwrap();
              setAlert({
                message: "Account created successfully",
                status: "Success",
              });
              setTimeout(() => {
                setAlert(null);
              }, 3000);
              dispatch(getUser());
            }}
            data={data}
          />
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
      {/* =====================================================
    EXPORT MODAL
===================================================== */}
      <AddLocationModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export User"
      >
        {/* <div className="export-modal"> */}
        <div className="export-modal-body">
          <p>
            Select which users you want to export
          </p>

          <label>
            Select Users {getExportUsers().length}
          </label>

          <select
            value={exportRole}
            onChange={(e) =>
              setExportRole(e.target.value)
            }
          >
            <option value="all">
              All Users
            </option>

            <option value="agent">
              All Associates
            </option>

            <option value="staff">
              All Staff
            </option>

            <option value="user">
              All Customers
            </option>
          </select>

          {/* <div className="export-count">
              {getExportUsers().length} users selected
            </div> */}

          <div className="export-fields">
            <p>Export includes:</p>

            {/* =========================
      CUSTOMER
  ========================= */}
            {exportRole === "user" && (
              <>
                <span>Name</span>
                <span>Phone</span>
                <span>Email</span>
                <span>User Type</span>
                <span>UserID</span>
                <span>Address</span>
              </>
            )}

            {/* =========================
      ASSOCIATE / AGENT
  ========================= */}
            {exportRole === "agent" && (
              <>
                <span>Name</span>
                <span>Phone</span>
                <span>Email</span>
                <span>User Type</span>
                <span>UserID</span>
                <span>Referred By Name</span>
                <span>Referred By Email</span>
                <span>Referred By Phone</span>
                <span>Referred By UserID</span>
                <span>Designation</span>
                <span>Direct Income %</span>
                <span>Address</span>
              </>
            )}

            {/* =========================
      STAFF
  ========================= */}
            {exportRole === "staff" && (
              <>
                <span>Name</span>
                <span>Phone</span>
                <span>Email</span>
                <span>User Type</span>
                <span>UserID</span>
                <span>Role</span>
                <span>Address</span>
              </>
            )}

            {/* =========================
      ALL USERS
  ========================= */}
            {exportRole === "all" && (
              <>
                <span>Name</span>
                <span>Phone</span>
                <span>Email</span>
                <span>User Type</span>
                <span>UserID</span>
                <span>Referred By Name</span>
                <span>Referred By Email</span>
                <span>Referred By Phone</span>
                <span>Referred By UserID</span>
                <span>Designation</span>
                <span>Direct Income %</span>
                <span>Role</span>
                <span>Address</span>
              </>
            )}
          </div>

        </div>

        <div className="modal-actions" style={{marginTop:"1rem"}}>
          <button
            type="button"
            className="export-excel-btn"
            onClick={exportToExcel}
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

          <button
            type="button"
            className="export-pdf-btn"
            onClick={exportToPDF}
          >
            <FileText size={18} />
            PDF
          </button>

        </div>

        {/* </div> */}
      </AddLocationModal>
    </div>
  );
};

export default Other;
