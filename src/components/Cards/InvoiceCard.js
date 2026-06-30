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
import { formatCurrency } from "../Utils/FormatCurrency";

const InvoiceCard = ({
  item,
  setSelectedPayment,
  setIsEditMode,
  setOpen,
  mood,
  dashboard,
  setAlert,
}) => {
  const [activeRow, setActiveRow] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!viewOpen) {
      setShowReport(false);
    }
  }, [viewOpen]);
  const paid = item.paidAmount || 0;

  console.log(item,"item")

  return (
    <div className="user-card card" onClick={dashboard || undefined}>
      <div className="user-card-top">
        <div className="user-card-title">
          <div className="user-card-name">
            <h4 style={{ textTransform: "capitalize" }}>
              {mood === "admin" ? item?.user?.name : item?.type}
              {/* {item?.type} */}
              {/* <span>({item.phone})</span> */}
              <span
                className={`status ${item.status === "credited" ? "active" : item.status === "pending" ? "pending" : item.status === "approved" ? "active" : "failed"}`}
              >
                {item.status}
              </span>
            </h4>
            {/* <p>{item.id}</p> */}
          </div>
        </div>
        <div className="dots">
          <span
            onClick={(e) => {
              e.stopPropagation();
              setViewOpen(true);
            }}
          >
            <NiOpenEye />
          </span>
          {/* {mood !== "user" && !dashboard && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setActiveRow(activeRow === item.id ? null : item.id);
              }}
            >
              <NiDots />
            </span>
          )} */}

          {/* {activeRow === item.id && (
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
          )} */}
        </div>
      </div>
      <div className="user-card-bottom">
        <div className="user-card-bottom-left">
          <p>Date</p>
          <p>Income Type</p>
          <p>Amount</p>
        </div>
        <div className="user-card-bottom-right">
          <p>{formatDate(item?.createdAt)}</p>
          <p style={{ textTransform: "capitalize" }}>{item?.type}</p>
          <p>₹{formatCurrency(item.amount)}</p>
        </div>
      </div>
      <ViewModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title={item?.type}
      >
        <div className="user-card-bottom view-box">
          <div className="user-card-bottom-left">
            <p>Date</p>
            <p>Income Type</p>
            <p>Amount</p>
          </div>
          <div className="user-card-bottom-right">
            <p>{formatDate(item?.createdAt)}</p>
            <p style={{ textTransform: "capitalize" }}>{item?.type}</p>
            <p>₹{formatCurrency(item.amount)}</p>
          </div>
        </div>
        <div className={`report-view-box-right active`}>
          <div className="payment-details">

            {item?.type !== "referal_income" && (
              <>
                <h5>Payment Details</h5>

                <p>
                  <strong>Name:</strong> {item?.payment?.customer?.name || "-"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {item?.payment?.customer?.phone || "-"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {item?.payment?.customer?.email || "-"}
                </p>
                <p>
                  <strong>Amount:</strong> ₹{formatCurrency(item?.payment?.amount || 0)}
                </p>
                <p>
                  <strong>Payment Mode:</strong>{" "}
                  {item?.payment?.paymentMode || "N/A"}
                </p>
                <p>
                  <strong>Payment Type:</strong>{" "}
                  {item?.payment?.paymentType || "N/A"}
                </p>

                {/* <hr /> */}

                <h5>Approved By</h5>

                <p>
                  <strong>Name:</strong>{" "}
                  {item?.payment?.approvedBy?.name || "-"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {item?.payment?.approvedBy?.phone || "-"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {item?.payment?.approvedBy?.email || "-"}
                </p>

                <hr />

                <p>
                  <strong>Business Amount:</strong> ₹{formatCurrency(item?.businessAmount || 0)}
                </p>

                <p>
                  <strong>Income %:</strong> {item?.percentage || 0}%
                </p>

                <p>
                  <strong>Income Earned:</strong> ₹{formatCurrency(item?.amount || 0)}
                </p>
              </>
            )}

            {item?.type === "referal_income" && (
              <>
                <h5>From User</h5>

                <p>
                  <strong>Name:</strong> {item?.fromUser?.name}
                </p>

                <p>
                  <strong>Designation:</strong> {item?.fromUser?.designation}
                </p>

                <p>
                  <strong>Email:</strong> {item?.fromUser?.email}
                </p>

                <p>
                  <strong>Phone:</strong> {item?.fromUser?.phone}
                </p>

                <p>
                  <strong>Referral ID:</strong> {item?.fromUser?.referralId}
                </p>

                {/* <hr /> */}

                <h5>User Details</h5>

                <p>
                  <strong>Name:</strong> {item?.user?.name}
                </p>

                <p>
                  <strong>Designation:</strong> {item?.user?.designation}
                </p>

                <p>
                  <strong>Email:</strong> {item?.user?.email}
                </p>

                <p>
                  <strong>Phone:</strong> {item?.user?.phone}
                </p>

                <p>
                  <strong>Referral ID:</strong> {item?.user?.referralId}
                </p>

                {item?.level && (
                  <p>
                    <strong>Level:</strong> {item.level}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </ViewModal>
    </div>
  );
};

export default InvoiceCard;
