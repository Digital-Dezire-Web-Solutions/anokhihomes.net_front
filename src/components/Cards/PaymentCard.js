import React, { useEffect, useState } from "react";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import DeleteModal from "../Modals/DeleteModal";
import ViewModal from "../Modals/ViewModal";
import NiReport from "../../icons/ni-report";
import NiTick from "../../icons/ni-tick";
import NiCross from "../../icons/ni-cross";
import NiUser from "../../icons/ni-user";
import NiBooking from "../../icons/ni-booking";
import { useNavigate } from "react-router-dom";
import NiDownload from "../../icons/ni-download";
import formatDate from "../DateFormate/DateFormate";
import Host from "../../Host/Host";
import axios from "axios";
import { getPayments } from "../../Redux/Slices/AppSlices";
import { useDispatch } from "react-redux";
import { formatCurrency } from "../Utils/FormatCurrency";
import downloadReceipt from "../Utils/downloadReceipt";
import NiReceipt from "../../icons/ni-receipt";

const PaymentCard = ({
  item,
  setSelectedPayment,
  setIsEditMode,
  setOpen,
  mood,
  dashboard,
  setAlert,
}) => {
  const dispatch = useDispatch();
  const [activeRow, setActiveRow] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (!viewOpen) {
      setShowReport(false);
    }
  }, [viewOpen]);
  const paid = item.paidAmount || 0;

  const handleAction = async (itemId, action, extraData = {}) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${Host}/api/payment/action/${itemId}`,
        {
          action,
        },
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        },
      );

      setAlert({
        message: action === "approve" ? "Payment approved" : "Payment rejected",
        status: action === "approve" ? "Success" : "Error",
      });

      dispatch(getPayments());

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Action failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  return (
    <div className="user-card card" onClick={dashboard || undefined}>
      <div className="user-card-top">
        <div className="user-card-title">
          <div className="user-card-name">
            <h4 style={{ textTransform: "capitalize" }}>
              {item?.customer?.name}
              {/* <span>({item.phone})</span> */}
              <span
                className={`status ${item.status === "completed" ? "active" : item.status === "pending" ? "pending" : item.status === "approved" ? "active" : "failed"}`}
              >
                {item.status}
              </span>
            </h4>
            {/* <p>{item.id}</p> */}
          </div>
        </div>
        <div className="dots">
          <span onClick={() => downloadReceipt(item._id)}>
            <NiReceipt />
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setViewOpen(true);
            }}
          >
            <NiOpenEye />
          </span>
          {mood !== "user" && !dashboard && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setActiveRow(activeRow === item.id ? null : item.id);
              }}
            >
              <NiDots />
            </span>
          )}

          {activeRow === item.id && (
            <ActionModal
              item={item}
              onClose={() => setActiveRow(null)}
              onEdit={(payment) => {
                setSelectedPayment(payment);
                setIsEditMode(true);
                setOpen(true);
              }}
              onDelete={() => {
                setDeleteOpen(true);
              }}
            />
          )}
        </div>
      </div>
      <div className="user-card-bottom">
        <div className="user-card-bottom-left">
          <p>Payment Date</p>
          <p>Customer Phone No.</p>
          <p>Plot</p>
          <p>Amount</p>
          <p>Mode</p>
          <p>Associate</p>
          {item.paymentMode !== "cash" && <p>Transaction ID</p>}
        </div>
        <div className="user-card-bottom-right">
          <p>{formatDate(item?.createdAt)}</p>
          <p>{item?.customer?.phone}</p>
          <p>
            {item?.booking ? (
              <>
                {item?.booking?.plot?.plotNumber}, {item?.booking?.colony?.name}
                , {item?.booking?.location?.name}
              </>
            ) : (
              <>
                {item?.hold?.plot?.plotNumber}, {item?.hold?.colony?.name},{" "}
                {item?.hold?.location?.name}
              </>
            )}
          </p>
          <p>₹{formatCurrency(item.amount)}</p>
          <p>{item.paymentMode}</p>
          <p>{item.agent?.name}</p>
          {item.paymentMode !== "cash" && <p>{item.transactionId}</p>}
        </div>
      </div>
      {(mood === "admin" || mood === "staff") && item.status === "pending" && (
        <div className="modal-actions">
          <button
            className="site-visit-approval status active"
            disabled={saving}
            onClick={() => {
              handleAction(item._id, "approve");
            }}
          >
            <NiTick /> Approve
          </button>

          <button
            className="site-visit-approval status failed"
            disabled={saving}
            onClick={() => {
              handleAction(item._id, "reject");
            }}
          >
            <NiCross /> Disapprove
          </button>
        </div>
      )}
      <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <p>Are you sure you want to delete?</p>
        <div className="modal-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Lead deleted");

              setDeleteOpen(false);

              setAlert({
                message: "Lead deleted successfully!",
                status: "Success",
              });

              setTimeout(() => {
                setAlert(null);
              }, 5000);
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
      <ViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={item?.customer?.name}
      >
        <div className="user-card-bottom view-box">
          <div className="user-card-bottom-left">
            <p>Payment Date</p>
            <p>Plot</p>
            <p>Amount Paid</p>
            <p>Mode</p>
            <p>Payment Type</p>
            {/* {item?.paymentMode !== "cash" && (
              <p>Transaction ID</p>
            )} */}
            <p>Report</p>
          </div>
          <div className="user-card-bottom-right">
            <p>{formatDate(item?.createdAt)}</p>
            <p>
              {item?.booking?.plot?.plotId}, {item?.booking?.colony?.name},{" "}
              {item?.booking?.location?.name}
            </p>
            <p>₹{formatCurrency(item.amount)}</p>
            <p>{item.paymentMode}</p>
            <p>{item.paymentType}</p>
            {/* {item?.paymentMode !== "cash" && (
              <p>{item.transactionId}</p>
            )} */}
            <div className="table-filters">
              <button
                className={`view-report-btn ${showReport ? "active" : ""}`}
                onClick={() => setShowReport(!showReport)}
              >
                <NiReport /> {showReport ? "Hide" : "View"}
              </button>
            </div>
          </div>
        </div>
        {/* <div className="table-filters">
          {mood !== "user" && (
            <button
              className="view-report-btn "
              onClick={() => {
                // navigate(`/user/474`);
              }}
            >
              <NiUser /> Customer Details
            </button>
          )}

          <button className="view-report-btn " onClick={() => {}}>
            <NiBooking /> Booking Details
          </button>
        </div> */}
        <div className={`report-view-box-right ${showReport ? "active" : ""}`}>
          {/* PAYMENT DETAILS */}
          <div className="payment-details">
            <h5
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              Transaction Details
              <span className="download-btn">
                <NiDownload />
              </span>
            </h5>
            {item.paymentMode !== "cash" && (
              <p>
                <strong>Transaction ID:</strong> {item.transactionId}
              </p>
            )}
            <p>
              <strong>Added By:</strong> Admin
            </p>
            <p>
              <strong>Completed By:</strong> Admin
            </p>
            <p>
              <strong>Completed Date:</strong> {formatDate(item?.createdAt)}
            </p>
          </div>

          <div className="payment-note" style={{ marginTop: "1rem" }}>
            <strong>Note:</strong> 35% cancellation charges applicable.
          </div>
        </div>
      </ViewModal>
    </div>
  );
};

export default PaymentCard;
