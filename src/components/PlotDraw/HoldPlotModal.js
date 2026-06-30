import React, { useEffect, useState } from "react";
import SearchSelect from "../SearchItems/SearchSelect";
import { useDispatch, useSelector } from "react-redux";
import {
  getAccountDetails,
  getUserRole,
  getPlotHold,
  getPlotsetting,
} from "../../Redux/Slices/AppSlices";
import axios from "axios";
import Host from "../../Host/Host";
import { formatCurrency } from "../Utils/FormatCurrency";

export default function HoldPlotModal({
  projectId,
  plot,
  setShowHoldModal,
  onClose,
  setAlert,
}) {
  // console.log(projectId,"projectId")
  // console.log(plot,"plot")
  const dispatch = useDispatch();

  const { userDetail, usersRole, plotSetting } = useSelector(
    (state) => state.app,
  );
  const [customer, setCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState("FREE");

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getUserRole("user"));
    dispatch(getPlotsetting());
  }, []);
  const submit = async () => {
    if (!customer) {
      setAlert({
        message: "Select Customer",
        status: "Error",
      });
      return;
    }
    const token = localStorage.getItem("token");
    setSaving(true);
    await axios.post(
      `${Host}/api/plothold/${type.toLowerCase()}`,
      {
        colony: projectId,
        plotId: plot._id,
        customer: customer._id,
      },
      {
        headers: {
          "auth-token": token,
        },
      },
    );
    setAlert({
      message: "Hold Request Submitted",
      status: "Success",
    });
    setTimeout(() => setAlert(null), 3000);
    setShowHoldModal(false);
    onClose();
    setSaving(false);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <h3>Hold Plot</h3>

      <div className="field">
        <label>Agent</label>

        <input value={`${userDetail?.name} (${userDetail?.phone})`} readOnly />
      </div>

      <div className="field">
        <SearchSelect
          label="Customer"
          placeholder="Search Customer"
          options={usersRole}
          value={customer}
          onChange={setCustomer}
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
        <label>Hold Type</label>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="FREE">Shadow Hold (Free)</option>
          <option value="PAID">Token Hold (Paid)</option>
        </select>
      </div>
      <div className="installment-box">
        {type === "FREE" ? (
          <>
            <h4>Free Hold</h4>
            <div className="installment">
              <span>Hold Days</span>
              <span>{plotSetting?.freeHoldDays} Days</span>
            </div>
            <div className="installment">
              <span>Amount</span>
              <span>₹{formatCurrency(0)}</span>
            </div>
            <div className="installment">
              <span>First Hold </span>
              <span> No Approval</span>
            </div>
            <div className="installment">
              <span>Second Hold </span>
              <span>Admin Approval Required</span>
            </div>
          </>
        ) : (
          <>
            <h4>Paid Hold</h4>
            <div className="installment">
              <span>Hold Days</span>
              <span>{plotSetting?.paidHoldDays} Days</span>
            </div>
            <div className="installment">
              <span>Amount</span>
              <span>₹{formatCurrency(plotSetting?.paidAmount)}</span>
            </div>
            <div className="installment">
              <span>Admin Approval Required</span>
            </div>
          </>
        )}
      </div>

      {/* <div className="field plot-details-enq">
        <label>Plot</label>

        <textarea
          disabled
          value={`Plot ID : ${plot._id}
Plot No : ${plot.plotNumber}
Area : ${plot.area}
Price : ₹${plot.price}`}
        />
      </div> */}

      <div className="modal-actions">
        <button disabled={saving} onClick={submit}>
          {saving ? "Saving..." : "Submit Hold"}
        </button>
      </div>
    </div>
  );
}
