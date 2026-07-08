import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import DashboardCard from "../../components/Cards/DashboardCard";
import NiPayments from "../../icons/ni-payments";
import PaymentCard from "../../components/Cards/PaymentCard";
import {
  getAccountDetails,
  getAllColonies,
  getExpense,
  getIncome,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import NiSearch from "../../icons/ni-search";
import InvoiceCard from "../../components/Cards/InvoiceCard";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import formatDate from "../../components/DateFormate/DateFormate";
import "./Expense.css";
import NiOpenEye from "../../icons/ni-openEye";
import ViewModal from "../../components/Modals/ViewModal";
import NiEdit from "../../icons/ni-edit";
import NiDelete from "../../icons/ni-delete";
import Host from "../../Host/Host";
import axios from "axios";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../../components/Modals/ActionModal";
import { LucidePlus } from "lucide-react";
import { uploadImage } from "../LandingSetting/LandingApi";
import SearchSelect from "../../components/SearchItems/SearchSelect";

const Expense = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { userDetail, expense, allColonies } = useSelector(
    (state) => state.app,
  );
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [typeFilter, setTypeFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const ITEMS_PER_PAGE = 25;
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeRow, setActiveRow] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedColonies, setSelectedColonies] = useState();
  const [formData, setFormData] = useState({
    expenseDate: "",
    type: "",
    project: "",
    name: "",
    amount: "",
    paymentMode: "",
    transactionId: "",
    chequeNumber: "",
    attachment: "",
    remark: "",
  });

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getExpense());
    dispatch(getAllColonies());
  }, []);

  useEffect(() => {
    if (selectedExpense) {
      setSelectedColonies(selectedExpense.project);

      setFormData({
        expenseDate: selectedExpense.expenseDate?.split("T")[0] || "",
        type: selectedExpense.type || "",
        project: selectedExpense.project?._id || "",
        name: selectedExpense.name || "",
        amount: selectedExpense.amount || "",
        paymentMode: selectedExpense.paymentMode || "",
        transactionId: selectedExpense.transactionId || "",
        chequeNumber: selectedExpense.chequeNumber || "",
        attachment: selectedExpense.attachment || "",
        remark: selectedExpense.remark || "",
      });
    } else {
      setSelectedColonies(null);

      setFormData({
        expenseDate: "",
        type: "",
        project: "",
        name: "",
        amount: "",
        paymentMode: "",
        transactionId: "",
        chequeNumber: "",
        attachment: "",
        remark: "",
      });
    }
  }, [selectedExpense]);

  const filtered = useMemo(() => {
    return expense?.filter((item) => {
      const searchValue = search.toLowerCase();
      const matchSearch =
        item.type?.toLowerCase()?.includes(searchValue) ||
        item.project?.name?.toLowerCase()?.includes(searchValue) ||
        item.project?.locationId?.name?.toLowerCase()?.includes(searchValue) ||
        item.remark?.toLowerCase()?.includes(searchValue) ||
        item.transactionId?.toLowerCase()?.includes(searchValue);
      const matchType = typeFilter === "" || item.type === typeFilter;
      const matchProject =
        projectFilter === "" || item.project?._id === projectFilter;
      const matchFrom =
        !fromDate || new Date(item.expenseDate) >= new Date(fromDate);
      const matchTo = !toDate || new Date(item.expenseDate) <= new Date(toDate);
      return matchSearch && matchType && matchProject && matchFrom && matchTo;
    });
  }, [expense, search, typeFilter, projectFilter, fromDate, toDate]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleFileUpload = (field, file) => {
    if (!file) return;
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setAlert({
        message: "Image size should not exceed 20MB",
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

  const handleEdit = (item) => {
    setSelectedExpense(item);
    setIsEditMode(true);
    setOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedDelete(id);
    setDeleteOpen(true);
  };

  const handleAddExpense = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      let attachment = "";
      if (formData.attachment instanceof File) {
        const upload = await uploadImage(formData.attachment);
        attachment = upload.url;
      }
      const payload = {
        ...formData,
        attachment,
      };
      await axios.post(`${Host}/api/expense/add`, payload, {
        headers: {
          "auth-token": token,
        },
      });
      dispatch(getExpense());
      setAlert({
        message: "Expense Added Successfully",
        status: "Success",
      });
      setOpen(false);
      setFormData({
        expenseDate: "",
        type: "",
        project: "",
        name: "",
        amount: "",
        paymentMode: "",
        transactionId: "",
        chequeNumber: "",
        attachment: "",
        remark: "",
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.log(err);
      setAlert({
        message: "Failed to Add Expense",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      let attachment = formData.attachment;
      if (formData.attachment instanceof File) {
        const upload = await uploadImage(formData.attachment);
        attachment = upload.url;
      }
      const payload = {
        ...formData,
        attachment,
      };

      await axios.put(
        `${Host}/api/expense/edit/${selectedExpense._id}`,
        payload,
        {
          headers: {
            "auth-token": token,
          },
        },
      );

      dispatch(getExpense());
      setAlert({
        message: "Expense Updated Successfully",
        status: "Success",
      });

      setOpen(false);
      setSelectedExpense(null);
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.log(err);
      setAlert({
        message: "Failed to Update",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${Host}/api/expense/delete/${selectedDelete}`, {
        headers: {
          "auth-token": token,
        },
      });
      dispatch(getExpense());
      setDeleteOpen(false);
      setAlert({
        message: "Expense Deleted Successfully",
        status: "Success",
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.log(err);
      setAlert({
        message: "Failed to Delete",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
    }
    setSaving(false);
  };

  const EXPENSE_TYPES = [
    "Associate Advance Loan",
    "Advertisement",
    "Commission",
    "Development",
    "Driver Payment",
    "Electricity",
    "Festival Bonanza Payout",
    "Land Owner",
    "Layout and Booking Form Expense",
    "Meeting",
    "Miscellaneous",
    "Office Canteen",
    "Office Rent",
    "Office Setup Expenses",
    "Patna Office Advance",
    "Patna Office Visit Expense",
    "Personal Vehicle Expense",
    "Stationary Expenses",
    "Tour Expense",
  ];

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Expense</h2>
          <Breadcrumb />
        </div>
      </div>
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
          <div className="filter-grid page-tools table-filters">
            <button
              className="add-button"
              onClick={() => {
                setSelectedExpense(null);
                setSelectedColonies(null);
                setIsEditMode(false);

                setFormData({
                  expenseDate: "",
                  type: "",
                  project: "",
                  name: "",
                  amount: "",
                  paymentMode: "",
                  transactionId: "",
                  chequeNumber: "",
                  attachment: "",
                  remark: "",
                });

                setOpen(true);
              }}
            >
              <LucidePlus /> Add
            </button>
            <div className="searchItem">
              <NiSearch />

              <input
                placeholder="Search Project.... "
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="searchItem">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Types</option>

                {EXPENSE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="searchItem">
              <label>From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="searchItem">
              <label>To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="searchItem">
              <select
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Projects</option>

                {allColonies?.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="card table-box">
            <div className="table expense-table">
              <div className="table-head">
                <span>S.No</span>
                <span>Date</span>
                <span>Expense Type</span>
                <span>Project</span>
                <span>Name</span>
                <span>Amount</span>
                <span>Payment</span>
                <span>Action</span>
              </div>

              {paginated?.length === 0 ? (
                <div>
                  <span>No Expense Found</span>
                </div>
              ) : (
                paginated?.map((item, index) => (
                  <div className="table-row" key={item._id}>
                    <span>{index + 1}</span>
                    <span>{formatDate(item.expenseDate)}</span>
                    <span>{item.type}</span>
                    <span>{item.project?.name || "-"}</span>
                    <span>{item.name || "-"}</span>
                    <span>₹{formatCurrency(item.amount)}</span>
                    <span>{item.paymentMode}</span>

                    <div className=" dots">
                      <span
                        onClick={() => {
                          setSelectedExpense(item);
                          setViewOpen(true);
                        }}
                      >
                        <NiOpenEye />
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                      >
                        <NiEdit />
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item._id);
                        }}
                      >
                        <NiDelete />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={page === i + 1 ? "active" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
        <ViewModal
          open={viewOpen}
          onClose={() => {
            setViewOpen(false);
            setSelectedExpense(null);
          }}
          title="Expense Details"
        >
          {selectedExpense && (
            <div className="payment-details">
              <p>
                <strong>Date :</strong>{" "}
                {formatDate(selectedExpense.expenseDate)}
              </p>
              <p>
                <strong>Name :</strong>{" "}
                {selectedExpense?.name}
              </p>

              <p>
                <strong>Expense Type :</strong> {selectedExpense.type}
              </p>

              <p>
                <strong>Project :</strong>{" "}
                {selectedExpense.project?.name || "-"}
              </p>

              <p>
                <strong>Amount :</strong> ₹
                {formatCurrency(selectedExpense.amount)}
              </p>

              <p>
                <strong>Payment Mode :</strong> {selectedExpense.paymentMode}
              </p>

              {selectedExpense.transactionId && (
                <p>
                  <strong>Transaction ID :</strong>{" "}
                  {selectedExpense.transactionId}
                </p>
              )}

              {selectedExpense.chequeNumber && (
                <p>
                  <strong>Cheque Number :</strong>{" "}
                  {selectedExpense.chequeNumber}
                </p>
              )}

              {selectedExpense.attachment && (
                <>
                  <strong>Attachment</strong>

                  <br />

                  <img
                    src={selectedExpense.attachment}
                    alt=""
                    style={{
                      width: 220,
                      borderRadius: 10,
                      marginTop: 10,
                    }}
                  />
                </>
              )}

              <p>
                <strong>Remark :</strong> {selectedExpense.remark || "-"}
              </p>

              <p>
                <strong>Created By :</strong> {selectedExpense.createdBy?.name}
              </p>
            </div>
          )}
        </ViewModal>
        <AddLocationModal
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedExpense(null);
            setIsEditMode(false);
          }}
          title={isEditMode ? "Edit Expense" : "Add Expense"}
        >
          <div className="field">
            <label>Date</label>

            <input
              type="date"
              value={formData.expenseDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expenseDate: e.target.value,
                })
              }
            />
          </div>
          <div className="field">
            <SearchSelect
              label="Project"
              placeholder="Select Project"
              options={allColonies}
              value={selectedColonies}
              onChange={(selected) => {
                setSelectedColonies(selected);

                setFormData({
                  ...formData,
                  project: selected._id,
                });
              }}
              displayKey="name"
              searchKeys={["name"]}
              renderOption={(p) => (
                <div>
                  <b>{p.name}</b>
                  <small style={{ display: "block", color: "#666" }}>
                    {p.locationId?.name}
                  </small>
                </div>
              )}
            />
          </div>

          <div className="field">
            <label>Expense Type</label>

            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                })
              }
            >
              <option value="">Select Expense Type</option>

              {EXPENSE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Name</label>

            <input
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
            <label>Amount</label>

            <input
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value,
                })
              }
            />
          </div>

          <div className="field">
            <label>Payment Mode</label>

            <select
              value={formData.paymentMode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMode: e.target.value,
                })
              }
            >
              <option value="">Select</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {["UPI", "Bank Transfer"].includes(formData.paymentMode) && (
            <div className="field">
              <label>Transaction ID</label>

              <input
                value={formData.transactionId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transactionId: e.target.value,
                  })
                }
              />
            </div>
          )}

          {formData.paymentMode === "Cheque" && (
            <div className="field">
              <label>Cheque Number</label>

              <input
                value={formData.chequeNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chequeNumber: e.target.value,
                  })
                }
              />
            </div>
          )}

          <div className="field">
            <label>Attachment</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileUpload("attachment", e.target.files[0])
              }
            />

            {formData.attachment && (
              <img
                src={
                  formData.attachment instanceof File
                    ? URL.createObjectURL(formData.attachment)
                    : formData.attachment
                }
                alt=""
                style={{
                  width: 120,
                  marginTop: 10,
                  borderRadius: 8,
                }}
              />
            )}
          </div>

          <div className="field">
            <label>Remark</label>

            <textarea
              value={formData.remark}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  remark: e.target.value,
                })
              }
            />
          </div>

          <div className="modal-actions">
            <button
              disabled={saving}
              onClick={isEditMode ? handleUpdate : handleAddExpense}
            >
              {saving
                ? "Saving..."
                : isEditMode
                  ? "Update Expense"
                  : "Add Expense"}
            </button>
          </div>
        </AddLocationModal>
        <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <p>Are you sure you want to delete this expense?</p>

          <div className="modal-actions">
            <button disabled={saving} onClick={confirmDelete}>
              {saving ? "Deleting..." : "Yes, Delete"}
            </button>

            <button
              className="btn-outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </button>
          </div>
        </DeleteModal>
      </div>
    </div>
  );
};

export default Expense;
