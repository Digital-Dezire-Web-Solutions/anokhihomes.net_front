import React, { useEffect, useState } from "react";
import "./Booking.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { LucidePlus } from "lucide-react";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import NiSearch from "../../icons/ni-search";
import BookingCard from "../../components/Cards/BookingCard";
import BookingData from "../../components/Data/BookingData";
// import SearchSelect from "../../components/SearchItems/SearchSelect";
import CancellationPolicy from "../../components/Policies/CancellationPolicy";
import { useDispatch, useSelector } from "react-redux";
import {
  getAccountDetails,
  getBooking,
  getPaymentTerms,
  getPlots,
  getSiteVisit,
  getUser,
} from "../../Redux/Slices/AppSlices";
import axios from "axios";
import Host from "../../Host/Host";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
import AddBookingForm from "../../components/UserForm/AddBookingForm";
const ITEMS_PER_PAGE = 12;

const Booking = ({ mood, setAlert, landingPage }) => {
  const dispatch = useDispatch();
  const { userDetail, booking, users, siteVisit, plots, paymentTerms } =
    useSelector((state) => state.app);
  const [customersList, setCustomersList] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getAccountDetails());
    dispatch(getBooking());
    dispatch(getUser());
    dispatch(getSiteVisit());
    dispatch(getPaymentTerms());
  }, []);

  useEffect(() => {
    if (users?.length) {
      const customers = users.filter((user) => user.role === "user");
      const agents = users.filter((user) => user.role === "agent");
      setCustomersList(customers);
      setAgentsList(agents);
    }
  }, [users]);

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState();
  const [policyOpen, setPolicyOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    customer: "",
    plot: "",
    amount: "",
    // amountPaid: "",
    status: "",
    amountRequested: "",
  });

  useEffect(() => {
    if (selectedBooking) {
      setFormData(selectedBooking);
    } else {
      setFormData({
        id: "",
        customer: "",
        plot: "",
        amount: "",
        // amountPaid: "",
        status: "",
        amountRequested: "",
      });
    }
  }, [selectedBooking]);

  useEffect(() => {
    if (formData?.colony) {
      dispatch(getPlots(formData?.colony?._id));
    }
  }, [formData?.colony?._id]);

  // console.log(booking, "booking")
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  // console.log(filter, "filter");

  const filteredData =
    filter === "all" ? booking : booking.filter((d) => d.status === filter);

  // reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // const handleAddBooking = () => {
  //   const newBooking = {
  //     ...formData,
  //     status: mood === "admin" ? "Confirmed" : "Pending",
  //   };
  //   console.log("Adding booking:", newBooking);
  //   setOpen(false);
  //   setAlert({
  //     message: `Plot ${newBooking.plot} has been booked successfully!`,
  //     status: "Success",
  //   });
  //   setTimeout(() => {
  //     setAlert(null);
  //   }, 5000);
  // };
  // const handleAddBooking = async () => {
  //   setSaving(true);
  //   try {
  //     const token = localStorage.getItem("token");

  //     if (!selectedPlot) {
  //       setAlert({ message: "Please select plot", status: "Error" });
  //       setTimeout(() => setAlert(null), 3000);
  //       return;
  //     }

  //     if (!formData.requestAmount) {
  //       setAlert({ message: "Enter request amount", status: "Error" });
  //       setTimeout(() => setAlert(null), 3000);
  //       return;
  //     }

  //     if (!formData.termsAccepted) {
  //       setAlert({
  //         message: "Please accept terms & conditions",
  //         status: "Error",
  //       });
  //       setTimeout(() => setAlert(null), 3000);
  //       return;
  //     }

  //     console.log(formData, "formData");
  //     const res = await axios.post(
  //       `${Host}/api/booking/add`,
  //       {
  //         sitevisitId: formData.sitevisitId, // 🔥 IMPORTANT
  //         customer: formData.customer._id,
  //         location: formData.location?._id,
  //         colony: formData.colony?._id,
  //         plot: selectedPlot._id, // 🔥 IMPORTANT

  //         requestAmount: formData.requestAmount,

  //         bookingDays: formData.bookingDays,
  //         agreementDays: formData.agreementDays,
  //         fullPaymentDays: formData.fullPaymentDays,

  //         termsAccepted: formData.termsAccepted,
  //       },
  //       {
  //         headers: {
  //           "auth-token": token,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );

  //     setAlert({
  //       message: "Booking created successfully",
  //       status: "Success",
  //     });

  //     dispatch(getBooking());
  //     setOpen(false);
  //     setTimeout(() => setAlert(null), 3000);
  //     setSaving(false);
  //   } catch (err) {
  //     console.error(err);
  //     setAlert({
  //       message: err.response?.data?.message || "Booking failed",
  //       status: "Error",
  //     });
  //     setTimeout(() => setAlert(null), 3000);
  //     setSaving(false);
  //   }
  // };

  const handleEditBooking = () => {
    setSaving(true);
    console.log("Editing booking:", formData);
    setOpen(false);
    setAlert({ message: "Booking updated successfully!", status: "Success" });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
    setSaving(false);
  };

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const totalAmount = Number(selectedPlot?.price || 0);
  const paidAmount = Number(formData.amountPaid || 0);
  const siteVisitOptions = siteVisit.map((item) => ({
    ...item,
    name: item.customer?.name,
  }));

  // console.log(siteVisit, "siteVisit")
  // console.log(selectedCustomer, "selectedCustomer")
  // console.log(selectedPlot, "selectedPlot")
  return (
    <div className="plot-container">
      {/* Filters */}
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Bookings</h2>
          <Breadcrumb />
        </div>
        <div className="page-tools">
          {(mood === "admin" || mood === "staff") && (
            <button
              className="add-button"
              onClick={() => {
                setSelectedBooking(null);
                setIsEditMode(false);
                setOpen(true);
              }}
            >
              <LucidePlus /> Add
            </button>
          )}
          <div className="searchItem">
            <NiSearch />
            <input
              placeholder="Search Name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>

          {["all", "confirmed", "pending", "approval", "rejected"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="user-card-box">
        {currentData.length === 0 ? (
          <p>No Bookings Found</p>
        ) : (
          currentData
            .reverse()
            .map((item) => (
              <BookingCard
                item={item}
                setSelectedBooking={setSelectedBooking}
                setIsEditMode={setIsEditMode}
                setOpen={setOpen}
                mood={mood}
                setAlert={setAlert}
              />
            ))
        )}
      </div>
      {/* Pagination */}
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
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? "Edit Booking" : "Add Booking"}
      >
        <AddBookingForm
          setAlert={setAlert}
          isEditMode={isEditMode}
          handleEditBooking={handleEditBooking}
          setOpen={setOpen}
          setPolicyOpen={setPolicyOpen}
        />
      </AddLocationModal>
      <AddLocationModal
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
        title="Cancellation Policy"
      >
        <CancellationPolicy landingPage={landingPage}/>
      </AddLocationModal>
    </div>
  );
};

export default Booking;
