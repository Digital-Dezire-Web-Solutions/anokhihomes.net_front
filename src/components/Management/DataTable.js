import { LucidePlus } from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import NiSearch from "../../icons/ni-search";
import AddLocationModal from "../Modals/AddLocationModal";
import ManagementCard from "../Cards/ManagementCard";
import SearchSelect from "../SearchItems/SearchSelect";
import {
  addUser,
  getLeads,
  getUser,
  getUserRole,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import Host from "../../Host/Host";
import axios from "axios";
import NiClosseye from "../../icons/ni-closseye";
import NiOpenEye from "../../icons/ni-openEye";

const ITEMS_PER_PAGE = 15;

const DataTable = ({ data, mood, setAlert }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.app);
  const [customersList, setCustomersList] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  // console.log(users, "users");

  useEffect(() => {
    if (users?.length) {
      const customers = users.filter((user) => user.role === "user");
      const agents = users.filter((user) => user.role === "agent");
      setCustomersList(customers);
      setAgentsList(agents);
    }
  }, [users]);

  // console.log(customersList, "customersList");
  // console.log(agentsList, "agentsList");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // console.log(data,"data")
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [selectedLead, setSelectedLead] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (selectedLead) {
      setFormData({
        customerId: selectedLead.customer || "",
        name: selectedLead.name || "",
        phone: selectedLead.phone || "",
        email: selectedLead.email || "",
      });

      // also set selectedCustomer for UI
      setSelectedCustomer({
        _id: selectedLead.customer,
        name: selectedLead.name,
        phone: selectedLead.phone,
        email: selectedLead.email,
      });
    }
  }, [selectedLead]);

  useEffect(() => {
    // console.log(formData, "Updated formdata");
  }, [formData]);

  // 🔥 FILTER LOGIC
  const filteredData = useMemo(() => {
    return data?.filter((lead) => {
      const matchesSearch =
        lead?.name?.toLowerCase().includes(search?.toLowerCase()) ||
        lead?.phone?.includes(search);
      const matchesStatus =
        statusFilter === "" || lead?.status === statusFilter;
      const matchesAgent = agentFilter === "" || lead?.agent === agentFilter;
      const matchesDate = dateFilter === "" || lead?.date === dateFilter;
      return matchesSearch && matchesStatus && matchesAgent && matchesDate;
    });
  }, [search, statusFilter, agentFilter, dateFilter, data]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleAddLead = async () => {
    const token = localStorage.getItem("token");
    // console.log(token, "token");
    // console.log("Adding lead:", formData);
    setSaving(true);
    try {
      const payload = {
        customerId: formData.customerId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      };
      const res = await axios.post(`${Host}/api/lead/add`, payload, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });
      // console.log(res.data);
      setAlert({ message: "Lead added successfully!", status: "Success" });
      setOpen(false);
      setFormData({
        customerId: "",
        name: "",
        phone: "",
        email: "",
      });
      dispatch(getLeads());
      setSaving(false);
    } catch (err) {
      console.error(err);
      setAlert({ message: "Failed to add lead", status: "Error" });
      setTimeout(() => setAlert(null), 5000);
      setSaving(false);
    } finally {
      setTimeout(() => setAlert(null), 5000);
      setSaving(false);
    }
  };
  const handleEditLead = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${Host}/api/lead/edit/${selectedLead._id}`,
        formData,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        },
      );

      dispatch(getLeads());
      setAlert({
        message: "Lead updated successfully",
        status: "Success",
      });
      setTimeout(() => setAlert(null), 5000);

      setSaving(false);
      setOpen(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: "Failed to update lead",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 5000);
      setSaving(false);
    }
  };

  const handleAddCustomerAndLead = async () => {
    setSaving(true);
    try {
      // Create customer
      const result = await dispatch(
        addUser({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          role: "user",
        }),
      ).unwrap();

      // Refresh users
      await dispatch(getUser());

      // Create lead using created customer id
      await axios.post(
        `${Host}/api/lead/add`,
        {
          customerId: result.user._id, // adjust according to your API
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        },
        {
          headers: {
            "auth-token": localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        },
      );

      dispatch(getLeads());
      await dispatch(getUser());

      setFormData({
        customerId: "",
        name: "",
        phone: "",
        email: "",
        password: "",
      });

      setSelectedCustomer(null);
      setShowNewCustomer(false);
      setIsEditMode(false);
      setSelectedLead(null);

      setOpen(false);

      setAlert({
        message: "Customer & Lead created successfully",
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
    <div>
      <div className="filter-grid page-tools table-filters">
        {mood !== "user" && (
          <button
            className="add-button"
            onClick={() => {
              setSelectedLead(null);
              setSelectedCustomer(null);
              setShowNewCustomer(false);
              setIsEditMode(false);

              setFormData({
                customerId: "",
                name: "",
                phone: "",
                email: "",
                password: "",
              });

              setOpen(true);
            }}
          >
            <LucidePlus /> Add
          </button>
        )}
        {mood !== "user" && (
          <div className="searchItem">
            <NiSearch />
            <input
              placeholder="Search name / phone"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        )}
        <div className="searchItem">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="searchItem">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="searchItem">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="user-card-box">
        {paginatedData.length === 0 ? (
          <p>No Leads Found</p>
        ) : (
          paginatedData
            ?.reverse()
            .map((item) => (
              <ManagementCard
                item={item}
                setSelectedLead={setSelectedLead}
                setIsEditMode={setIsEditMode}
                setOpen={setOpen}
                mood={mood}
                setAlert={setAlert}
                agentsList={agentsList}
              />
            ))
        )}
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
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? "Edit Lead" : "Add Lead"}
      >
        {showNewCustomer ? (
          <>
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
          </>
        ) : (
          <>
            <div className="field">
              <SearchSelect
                label="Customer Name"
                placeholder="Search name or number"
                options={customersList}
                value={selectedCustomer}
                onChange={(selected) => {
                  setShowNewCustomer(false);
                  setSelectedCustomer(selected);
                  setFormData({
                    ...formData,
                    customerId: selected._id,
                    name: selected.name,
                    phone: selected.phone,
                    email: selected.email,
                  });
                }}
                displayKey="name"
                searchKeys={["name", "phone"]}
                renderOption={(c) => (
                  <div>
                    <b>{c.name}</b> ({c.phone})
                  </div>
                )}
                noResultComponent={
                  <div className="ss-item no-result">
                    <p>No customer found.</p>

                    <div className="modal-actions">
                      <button
                        type="button"
                        // className="add-button"
                        onClick={() => setShowNewCustomer(true)}
                      >
                        Add New Customer
                      </button>
                    </div>
                  </div>
                }
              />
            </div>
            <div className="field">
              <label>Phone</label>
              <input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Phone Number"
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Email Address"
              />
            </div>
          </>
        )}

        <div className="modal-actions">
          <button
            disabled={saving}
            onClick={() => {
              if (showNewCustomer) {
                handleAddCustomerAndLead();
              } else if (isEditMode) {
                handleEditLead();
              } else {
                handleAddLead();
              }
            }}
          >
            {showNewCustomer
              ? "Create Customer & Lead"
              : isEditMode
                ? "Update Lead"
                : "Add Lead"}
          </button>
        </div>
      </AddLocationModal>
    </div>
  );
};

export default DataTable;
