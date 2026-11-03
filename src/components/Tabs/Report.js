import React, { useState, useEffect } from "react";
import "./Tabs.css";
import DashboardCard from "../Cards/DashboardCard";
import NiBooking from "../../icons/ni-booking";
import NiTool from "../../icons/ni-tool";
import NiPayments from "../../icons/ni-payments";
import NiManagement from "../../icons/ni-management";
import { formatCurrency } from "../Utils/FormatCurrency";
import axios from "axios";
import Host from "../../Host/Host";
import formatDate from "../DateFormate/DateFormate";
import Loader from "../Loader/Loader";
import PaymentCard from "../Cards/PaymentCard";
import BookingCard from "../Cards/BookingCard";
import SiteVisitCard from "../Cards/SiteVisitCard";
import ManagementCard from "../Cards/ManagementCard";
import InvoiceCard from "../Cards/InvoiceCard";

const SECTIONS = [
  { key: "leads", label: "Leads" },
  { key: "sitevisits", label: "Site Visits" },
  { key: "bookings", label: "Bookings" },
  { key: "payments", label: "Payments" },
  { key: "income", label: "Income" },
];

const cap = (s) =>
  (s || "-")
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

const COLUMNS = {
  leads: [
    ["Date", (r) => formatDate(r.createdAt)],
    ["Name", (r) => r.name || "-"],
    ["Phone", (r) => r.phone || "-"],
    ["Status", (r) => cap(r.status)],
  ],
  sitevisits: [
    ["Date", (r) => formatDate(r.visitDate || r.createdAt)],
    ["Customer", (r) => r.customer?.name || "-"],
    ["Phone", (r) => r.customer?.phone || "-"],
    ["Status", (r) => cap(r.status)],
  ],
  bookings: [
    ["Date", (r) => formatDate(r.createdAt)],
    ["Customer", (r) => r.customer?.name || "-"],
    ["Colony", (r) => r.colony?.name || "-"],
    ["Plot", (r) => r.plotNumber],
    ["Total", (r) => `₹${formatCurrency(r.finalAmount || 0)}`],
    ["Paid", (r) => `₹${formatCurrency(r.amountPaid || 0)}`],
    ["Status", (r) => cap(r.status)],
  ],
  payments: [
    ["Date", (r) => formatDate(r.createdAt)],
    ["Customer", (r) => r.customer?.name || "-"],
    ["Amount", (r) => `₹${formatCurrency(r.amount || 0)}`],
    ["Mode", (r) => cap(r.paymentMode)],
    ["Type", (r) => cap(r.paymentType)],
    ["Status", (r) => cap(r.status)],
  ],
  income: [
    ["Date", (r) => formatDate(r.createdAt)],
    ["Income Type", (r) => cap(r.type)],
    ["Amount", (r) => `₹${formatCurrency(r.amount || 0)}`],
    [
      "From",
      (r) =>
        r.fromUser
          ? `${r.fromUser.name} (${r.fromUser.referralId})`
          : "Payment",
    ],
    ["Status", (r) => cap(r.status)],
  ],
};

const Report = ({ userData, incomeHistory, incomeSummary, mood, setAlert }) => {
  // ALL hooks first, before any early return
  const [section, setSection] = useState(null);
  const [sectionData, setSectionData] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!userData?._id) return;

    setSummary(null);

    const token = localStorage.getItem("token");
    axios
      .get(`${Host}/api/auth/user-report/${userData._id}?type=summary`, {
        headers: { "auth-token": token },
      })
      .then((res) => setSummary(res.data))
      .catch((err) => console.log(err));
  }, [userData?._id]);

  const currentUser = incomeSummary?.find((item) => item._id === userData?._id);
  const noop = () => {};

  const loadSection = async (key) => {
    // clicking the active button again collapses it
    if (section === key) {
      setSection(null);
      return;
    }

    setSection(key);
    setSectionData([]);
    setSectionLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${Host}/api/auth/user-report/${userData._id}?type=${key}`,
        { headers: { "auth-token": token } },
      );
      setSectionData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setSectionLoading(false);
    }
  };

  // early return comes AFTER every hook
  if (!userData) {
    return (
      <div className="card">
        <h4>No Data Available</h4>
      </div>
    );
  }

  console.log(section, "section");
  return (
    <div className="agent-report">
      {/* =======================
          MLM PERFORMANCE CARDS
      ======================== */}

      <div className="report-dashboard-grid">
        <DashboardCard
          title="Total Income"
          value={`₹${formatCurrency(summary?.totalIncome || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Total Self Business"
          value={`₹${formatCurrency(summary?.selfBusiness || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Total Team Business"
          value={`₹${formatCurrency(summary?.totalBusiness || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Left Business"
          value={`₹${formatCurrency(summary?.leftBusiness || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Right Business"
          value={`₹${formatCurrency(summary?.rightBusiness || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="My Wallet"
          value={`₹${formatCurrency(currentUser?.incomeSummary?.payableAmount || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Total Referral Income"
          value={`₹${formatCurrency(summary?.referralIncome || 0)}`}
          icons={<NiPayments />}
        />
        <DashboardCard
          title="Other Incomes"
          value={`₹${formatCurrency(summary?.otherIncome || 0)}`}
          icons={<NiPayments />}
        />
      </div>
      <div className="table-filters card-filter" style={{ marginTop: 20 }}>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={section === s.key ? "active" : ""}
            onClick={() => loadSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section && (
        <>
          {sectionLoading ? (
            <Loader />
          ) : sectionData.length === 0 ? (
            <p>No data found</p>
          ) : (
            <div className="user-card-box report-card-box">
              {section === "leads" &&
                sectionData.map((item) => (
                  <ManagementCard
                    key={item._id}
                    item={item}
                    setSelectedLead={noop}
                    setIsEditMode={noop}
                    setOpen={noop}
                    mood={mood}
                    setAlert={setAlert}
                    agentsList={[]}
                  />
                ))}

              {section === "sitevisits" &&
                sectionData.map((item) => (
                  <SiteVisitCard
                    key={item._id}
                    item={item}
                    setSelectedVisit={noop}
                    setIsEditMode={noop}
                    setOpen={noop}
                    mood={mood}
                    setAlert={setAlert}
                  />
                ))}

              {section === "bookings" &&
                sectionData.map((item) => (
                  <BookingCard
                    key={item._id}
                    item={item}
                    setSelectedBooking={noop}
                    setIsEditMode={noop}
                    setOpen={noop}
                    mood={mood}
                    setAlert={setAlert}
                  />
                ))}

              {section === "payments" &&
                sectionData.map((item) => (
                  <PaymentCard
                    key={item._id}
                    item={item}
                    setSelectedPayment={noop}
                    setIsEditMode={noop}
                    setOpen={noop}
                    mood={mood}
                    setAlert={setAlert}
                  />
                ))}

              {section === "income" &&
                sectionData.map((item) => (
                  <InvoiceCard
                    key={item._id}
                    item={item}
                    mood={mood}
                    setAlert={setAlert}
                  />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Report;
