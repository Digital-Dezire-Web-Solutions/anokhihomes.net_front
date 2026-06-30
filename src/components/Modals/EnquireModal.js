import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import "./EnquireModal.css";
import StatusModal from "./StatusModal";
import axios from "axios";
import Host from "../../Host/Host";
import { getAccountDetails, getUserRole } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import SearchSelect from "../SearchItems/SearchSelect";

const EnquireModal = ({
  setShowEnquiryModal,
  plot,
  mood,
  agent,
  onClose,
  setAlert,
}) => {
  const dispatch = useDispatch();
  const { userDetail, usersRole } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getUserRole("user"));
  }, []);

  console.log("usersRole", usersRole);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  useEffect(() => {
    if (mood === "user" && userDetail) {
      if (userDetail) {
        setFormData((prev) => ({
          ...prev,
          customerId: userDetail?._id || "",
          name: userDetail?.name || "",
          phone: userDetail?.phone || "",
          email: userDetail?.email || "",
        }));
      }
    }
  }, [userDetail]);

  //   console.log("plot", plot);
  const [showStatus, setShowStatus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("processing");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    setShowStatus(true);
    setSaving(true);
    setStatus("processing");
    try {
      const payload = {
        customerId: formData.customerId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        source: `plot enquiry of ${plot._id}`,
      };
      const res = await axios.post(`${Host}/api/lead/add`, payload, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });
      // console.log(res.data);
      setAlert({ message: "Lead added successfully!", status: "Success" });
      //   setOpen(false);
      setFormData({
        customerId: "",
        name: "",
        phone: "",
        email: "",
      });

      setTimeout(() => {
        setStatus("success"); // change to "failed" if needed
      }, 3000);

      setTimeout(() => {
        setShowStatus(false);
        setShowEnquiryModal(false);
        onClose();
      }, 5000);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setAlert({ message: "Failed to add lead", status: "Error" });
      setSaving(false);
    } finally {
      setTimeout(() => setAlert(null), 5000);
      setSaving(false);
    }
  };

  // console.log(plot, "plot");

  return (
    <>
      <div className="modal enquiry-box" onClick={(e) => e.stopPropagation()}>
        {/* X Button */}
        <div className="modal-actions">
          <button
            className="close-btn"
            onClick={() => setShowEnquiryModal(false)}
          >
            <X />
          </button>
        </div>

        <h3>{mood === "agent" ? `"Book Plot"` : "Enquire About Plot"}</h3>
        {mood === "agent" ? (
          <>
            <div className="enquirefield-box">
              <div className="agent-detail">
                <label>
                  {userDetail?.name}({userDetail?.phone})
                </label>
              </div>
            </div>
            <div className="field">
              <SearchSelect
                label="Customer Name"
                placeholder="Search name or number"
                options={usersRole}
                value={selectedCustomer}
                onChange={(selected) => {
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
        ) : (
          <>
            <div className="enquirefield-box">
              <div className="field">
                <label>Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* <div className="field">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div> */}

        {/* Auto Filled Plot Details */}
        <div className="field plot-details-enq">
          <label>Plot Details</label>
          <textarea
            value={`Plot ID: ${plot.plotId}
Plot Number: ${plot.plotNumber}
Price: ${plot.price}
Area: ${plot.area} sq.ft`}
            disabled
          />
        </div>

        <div className="modal-actions">
          <button
            className="btn primary"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving
              ? "Saving..."
              : mood === "agent"
                ? "Add Lead"
                : "Send Enquiry"}
          </button>
        </div>
      </div>
      {showStatus && (
        <div className="modal-bg">
          <StatusModal status={status} />
        </div>
      )}
    </>
  );
};

export default EnquireModal;
