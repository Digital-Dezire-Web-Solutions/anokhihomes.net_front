import React, { useEffect, useState } from "react";
import ProjectData from "../Plot/PlotData";
import SearchSelect from "../../components/SearchItems/SearchSelect";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import { useDispatch, useSelector } from "react-redux";
import {
  addUser,
  getAgentByReferralId,
  getUser,
} from "../../Redux/Slices/AppSlices";
import axios from "axios";
import Host from "../../Host/Host";
import NiClosseye from "../../icons/ni-closseye";
import NiOpenEye from "../../icons/ni-openEye";
import UserForm from "../../components/UserForm/UserForm";
import AddBookingForm from "../../components/UserForm/AddBookingForm";
import AddPaymentForm from "../../components/UserForm/AddPaymentForm";

const RenderFormFields = ({
  actionType,
  formData,
  setFormData,
  setAlert,
  data,
  onClose,
}) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.app);
  const [customersList, setCustomersList] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const [showPassword, setShowPassword] = useState(false);
  const handleAddLead = async () => {
    const token = localStorage.getItem("token");
    // console.log(token, "token");
    // console.log("Adding lead:", formData);
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
      // setOpen(false);
      setFormData({
        customerId: "",
        name: "",
        phone: "",
        email: "",
      });
      setTimeout(() => setAlert(null), 3000);
      // dispatch(getLeads());
    } catch (err) {
      console.error(err);
      setAlert({ message: "Failed to add lead", status: "Error" });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleAddCustomerAndLead = async () => {
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

      // dispatch(getLeads());
      // await dispatch(getUser());

      setFormData({
        customerId: "",
        name: "",
        phone: "",
        email: "",
        password: "",
      });

      setSelectedCustomer(null);
      setShowNewCustomer(false);
      // setIsEditMode(false);
      // setSelectedLead(null);

      // setOpen(false);

      setAlert({
        message: "Customer & Lead created successfully",
        status: "Success",
      });
      setTimeout(() => setAlert(null), 5000);
    } catch (err) {
      setAlert({
        message: err?.msg || "Failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const [referalMsg, setReferralMsg] = useState(null);

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

  const handleAddUser = async () => {
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
      // setOpen(false);
    } catch (error) {
      setAlert({
        message: error.msg || "Failed to create user",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    }
  };

  const customers = [
    { id: "C001", name: "Rahul Sharma", phone: "9876543210" },
    { id: "C002", name: "Imran Khan", phone: "9123456789" },
    { id: "C003", name: "Arjun Mehta", phone: "9988776655" },
  ];

  const ProjectsLocations = [
    { id: "L1", name: "Rajgir", location: "Bihar" },
    { id: "L2", name: "Patna", location: "Bihar" },
  ];
  const Projects = [
    { id: "PJ101", name: "SunShine Colony", location: "Mumbai" },
    { id: "PJ102", name: "Moon Colony", location: "Delhi" },
  ];
  const plots = [
    {
      id: "P101",
      name: "Plot A-12",
      projectId: "PJ101",
      price: 1200000,
      status: "Vacant",
    },
    {
      id: "P102",
      name: "Plot B-07",
      projectId: "PJ102",
      price: 2300000,
      status: "Hold",
    },
  ];

  const bookings = [
    {
      id: "B001",
      customerId: "C001",
      projectId: "PJ101",
      plotId: "P101",
      totalAmount: 500000,
      payments: [
        { amount: 100000, type: "Token" },
        { amount: 150000, type: "Installment" },
      ],
    },
  ];

  const staffPositions = [
    "Manager",
    "Lead Manager",
    "Sales Manager",
    "Plot Manager",
    "Finance Manager",
  ];

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  // console.log(selectedCustomer, "selectedCustomer")
  const totalAmount = Number(selectedPlot?.price || 0);
  const paidAmount = Number(formData.amountPaid || 0);
  const remainingAmount = totalAmount - paidAmount;

  const [amountInfo, setAmountInfo] = useState({
    total: 0,
    paid: 0,
    remaining: 0,
    remainingType: "",
  });

  const customerBookings = bookings.filter(
    (b) => b.customerId === selectedCustomer?.id,
  );

  const customerProjects = Projects.filter((project) =>
    customerBookings.some((b) => b.projectId === project.id),
  );

  const customerPlots = plots.filter(
    (plot) =>
      plot.projectId === selectedProject?.id &&
      customerBookings.some((b) => b.plotId === plot.id),
  );

  switch (actionType) {
    case "Add Associate / Staff / Customer":
      return (
        <div
          className="auth-card"
          style={{ padding: "0", width: "auto", boxShadow: "none" }}
        >
          <UserForm
            mode="admin"
            setAlert={setAlert}
            onClose={onClose}
            onSuccess={async (payload) => {
              await dispatch(addUser(payload)).unwrap();
              setAlert({
                message: "Account created successfully",
                status: "Success",
              });
              setTimeout(() => {
                setAlert(null);
              }, 3000);
              // dispatch(getUser());
            }}
            data={data}
          />
        </div>
      );

    case "Add Project":
      return (
        <>
          <div className="field">
            <SearchSelect
              label="Project Location"
              placeholder="Search Project Location"
              options={ProjectsLocations}
              value={selectedLocation}
              onChange={(selected) => {
                setSelectedLocation(selected);
                setFormData({ ...formData, location: selected.id });
              }}
              displayKey="name"
              searchKeys={["name", "location"]}
              renderOption={(c) => (
                <div>
                  <b>{c.name}</b> ({c.location})
                </div>
              )}
            />
          </div>

          <div className="field">
            <label>Project Name</label>
            <input
              placeholder="Project Name"
              value={formData.plotName || ""}
              onChange={(e) =>
                setFormData({ ...formData, plotName: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Image </label>
            <input
              placeholder="Image URL"
              value={formData.image || ""}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Price Range</label>
            <input
              placeholder="Price Range"
              value={formData.price || ""}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Area in sqft</label>
            <input
              placeholder="Area in sqft"
              value={formData.area || ""}
              onChange={(e) =>
                setFormData({ ...formData, area: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </>
      );

    case "Add Booking":
      return (
        <AddBookingForm
          setAlert={setAlert}
          setOpen={onClose}
        />
      );

    case "Add Payment (Received)":
      return (
        <AddPaymentForm
          setAlert={setAlert}
          setOpen={onClose}
          />
      );
    case "Add Lead":
      return (
        <>
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
                  placeholder="Search Customer by Name or Number"
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
                          className="add-button"
                          onClick={() => setShowNewCustomer(true)}
                        >
                          + Add New Customer
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
              onClick={() => {
                if (showNewCustomer) {
                  handleAddCustomerAndLead();
                } else {
                  handleAddLead();
                }
              }}
            >
              {showNewCustomer ? "Create Customer & Lead" : "Add Lead"}
            </button>
          </div>
        </>
      );
    case "Schedule Site Visit":
      return (
        <>
          <div className="field">
            <label>Date of Visit</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>

          <div className="field">
            <SearchSelect
              label="Customer Name"
              placeholder="Search Customer by Name or Number"
              options={customers}
              value={selectedCustomer}
              onChange={(selected) => {
                setSelectedCustomer(selected);
                setFormData({
                  ...formData,
                  customerName: selected.customerName,
                });
              }}
              displayKey="name"
              searchKeys={["name", "phone"]}
              renderOption={(c) => (
                <div>
                  <b>{c.name}</b> ({c.phone})
                </div>
              )}
            />
          </div>

          <div className="field">
            <label>Phone</label>
            <input
              value={selectedCustomer?.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Phone Number"
            />
          </div>

          <div className="field">
            <label>Date of Visit</label>
            <input
              type="date"
              value={formData.visitDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, visitDate: e.target.value })
              }
            />
          </div>
          <div className="field">
            <SearchSelect
              label="Site"
              placeholder="Search Project or location"
              options={Projects}
              value={selectedProjects}
              onChange={(selected) => {
                setSelectedProjects(selected);
                setFormData({ ...formData, Project: selected.name });
              }}
              displayKey="name"
              searchKeys={["name", "location"]}
              renderOption={(p) => (
                <div>
                  <b>{p.name}</b>
                  <small style={{ display: "block", color: "#666" }}>
                    {p.location}
                  </small>
                </div>
              )}
            />
          </div>
          <div className="field">
            <SearchSelect
              label="Plots"
              placeholder="Search Plot..."
              options={plots}
              value={selectedPlot}
              onChange={(selected) => {
                setSelectedPlot(selected);

                setFormData({
                  ...formData,
                  plotId: selected.id,
                  amount: selected.price,
                });
              }}
              displayKey="name"
              searchKeys={["name", "location"]}
              renderOption={(p) => (
                <div>
                  <b>{p.name}</b>
                  <small style={{ display: "block", color: "#666" }}>
                    {p.status}
                  </small>
                </div>
              )}
            />
          </div>

          {/* <div className="field">
                        <label>Agent</label>
                        <select
                            value={formData.agent}
                            onChange={(e) =>
                                setFormData({ ...formData, agent: e.target.value })
                            }
                        >
                            <option value="">Select Agent</option>
                            <option value="Amit">Amit</option>
                            <option value="Sana">Sana</option>
                            <option value="Raj">Raj</option>
                        </select>
                    </div> */}
        </>
      );
    case "Approve Payment":
      return (
        <>
          <div className="field">
            <label>
              Date: <span>26/2/2026</span>
            </label>
            <label>
              Client: <span>Rahul</span>
            </label>
            <label>
              Phone: <span>9876543210</span>
            </label>
            <label>
              Project: <span>B-198, Moon Colony</span>
            </label>
            <label>
              Amount: <span>12,34,567</span>
            </label>
            <label>Payment Mode</label>
            <select
              value={formData.mode}
              onChange={(e) =>
                setFormData({ ...formData, mode: e.target.value })
              }
            >
              <option value="">Select Mode</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="field">
            <label>Due Status</label>
            <select
              value={formData.dueStatus}
              onChange={(e) =>
                setFormData({ ...formData, dueStatus: e.target.value })
              }
            >
              <option value="">Select Due Status</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </>
      );
    case "Verify Booking":
      return (
        <>
          <div className="field">
            <label>
              Customer ID <span>98765431208132</span>
            </label>
            <label>
              Plot <span>B-198, Moon Colony</span>
            </label>
            <label>
              Amount <span>12,34,567</span>
            </label>
            <label>
              Amount Paid <span>50,000</span>
            </label>
            <label>
              Remaining Amount <span>11,84,567</span>
            </label>
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="">Select Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </>
      );
    case "Download Receipt":
      return (
        <>
          <div className="field">
            <label>Select Booking</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="">Select Status</option>
              <option value="B-198, Moon Colony">B-198, Moon Colony</option>
              <option value="A-77, Sun Colony">A-77, Sun Colony</option>
            </select>
          </div>
          <div className="field">
            <label>Select Payment</label>
            <select
              value={formData.paymentMode}
              onChange={(e) =>
                setFormData({ ...formData, paymentMode: e.target.value })
              }
            >
              <option value="">Select Payment</option>
              <option value="50,000">50,000</option>
              <option value="10,00,000">10,00,000</option>
              <option value="15,00,000">15,00,000</option>
            </select>
          </div>
        </>
      );

    default:
      return null;
  }
};

export default RenderFormFields;
