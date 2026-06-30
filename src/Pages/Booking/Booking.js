import React, { useEffect, useState } from "react";
import "./Booking.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { LucidePlus } from "lucide-react";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import NiSearch from "../../icons/ni-search";
import BookingCard from "../../components/Cards/BookingCard";
import BookingData from "../../components/Data/BookingData";
import SearchSelect from "../../components/SearchItems/SearchSelect";
import CancellationPolicy from "../../components/Policies/CancellationPolicy";
import { useDispatch, useSelector } from "react-redux";
import { getAccountDetails, getBooking, getPaymentTerms, getPlots, getSiteVisit, getUser } from "../../Redux/Slices/AppSlices";
import axios from "axios";
import Host from "../../Host/Host";
import { formatCurrency } from "../../components/Utils/FormatCurrency";
const ITEMS_PER_PAGE = 12;

const Booking = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { userDetail, booking, users, siteVisit, plots, paymentTerms } = useSelector((state) => state.app);
  const [customersList, setCustomersList] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [saving,setSaving] = useState(false)

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
    filter === "all"
      ? booking
      : booking.filter((d) => d.status === filter);

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
  const handleAddBooking = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token");
      
      if (!selectedPlot) {
        setAlert({ message: "Please select plot", status: "Error" });
        return;
      }
      
      if (!formData.requestAmount) {
        setAlert({ message: "Enter request amount", status: "Error" });
        return;
      }
      
      if (!formData.termsAccepted) {
        setAlert({
          message: "Please accept terms & conditions",
          status: "Error",
        });
        return;
      }
      
      console.log(formData, "formData")
      const res = await axios.post(
        `${Host}/api/booking/add`,
        {
          sitevisitId: formData.sitevisitId, // 🔥 IMPORTANT
          customer: formData.customer._id,
          location: formData.location?._id,
          colony: formData.colony?._id,
          plot: selectedPlot._id, // 🔥 IMPORTANT
          
          requestAmount: formData.requestAmount,

          bookingDays: formData.bookingDays,
          agreementDays: formData.agreementDays,
          fullPaymentDays: formData.fullPaymentDays,
          
          termsAccepted: formData.termsAccepted,
        },
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      
      setAlert({
        message: "Booking created successfully",
        status: "Success",
      });
      
      dispatch(getBooking());
      setOpen(false);
      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
      
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Booking failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    }
  };
  
  const handleEditBooking = () => {
    setSaving(true)
    console.log("Editing booking:", formData);
    setOpen(false);
    setAlert({ message: "Booking updated successfully!", status: "Success" });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
    setSaving(false)
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
          currentData.reverse().map((item) => (
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
        <div className="field">
          <SearchSelect
            label="Site Visit"
            placeholder="Search name or number"
            options={siteVisitOptions}
            value={selectedCustomer}
            onChange={(selected) => {
              setSelectedCustomer(selected);
              setFormData({
                ...formData,
                sitevisitId: selected._id,
                customer: selected.customer,
                agent: selected?.agent?._id || null,
                location: selected?.location,
                colony: selected?.colony
              });
            }}
            displayKey="name"
            searchKeys={["name", "customer.phone"]}
            renderOption={(c) => (
              <div>
                <b>{c?.customer?.name}</b> ({c?.customer?.phone})
                <small style={{ display: "block", color: "#666" }}>
                  {c?.colony?.name}, {c?.location?.name}
                </small>
              </div>
            )}
          />
        </div>
        <div className="field">
          <label>Customer Name</label>
          <input
            value={selectedCustomer?.customer?.name}
            readOnly
            placeholder="Phone Number"
          />
        </div>
        <div className="field">
          <label>Customer Phone</label>
          <input
            value={selectedCustomer?.customer?.phone}
            readOnly
            placeholder="Phone Number"
          />
        </div>
        <div className="field">
          <SearchSelect
            label="Plots"
            placeholder="Search Plot..."
            options={plots?.plots}
            value={selectedPlot}
            onChange={(selected) => {
              setSelectedPlot(selected);

              setFormData({
                ...formData,
                plot: selected._id,
                plotId: selected.plotId,
                pricePerSqft: selected.price,
                plotArea: selected.area,
                priceRange: selected.priceRange,
              });
            }}
            displayKey="plotNumber"
            searchKeys={["plotNumber", "plotType"]}
            renderOption={(p) => (
              <div>
                <b>{p.plotNumber}</b>
                <small style={{ display: "block", color: "#666" }}>
                  {p.plotType}
                </small>
              </div>
            )}
          />
        </div>

        <div className="field">
          <label>Rate <small style={{ fontSize: "12px", color: "green" }}>₹{formatCurrency(selectedPlot?.price || 0)} / sq.ft </small></label>
          <input
            placeholder="Rate with sqft"
            value={formData.pricePerSqft ? `₹${formData.pricePerSqft} * ${formData.plotArea} sq.ft` : ""}
            // {"₹550 * 1200 sq.ft"}
            readOnly
          />
        </div>

        <div className="field">
          <label>Price Request in sq.ft
            <small style={{ fontSize: "12px", color: "green" }}>₹{formData.requestAmount * formData.plotArea || 0} </small>
          </label>
          <input
            type="number"
            placeholder="Price request in sq.ft"
            value={formData.requestAmount || ""}
            onChange={(e) =>
              setFormData({ ...formData, requestAmount: e.target.value })
            }
          />
        </div>


        {selectedPlot &&
          formData.requestAmount &&
          (Number(formData.requestAmount) < selectedPlot.priceRange.min ||
            Number(formData.requestAmount) > selectedPlot.priceRange.max) && (
            <div className="field">
              <label>
                Notes <small style={{ fontSize: "12px", color: "#ff6969" }}>(Price Doesn't Match Allowed Range)</small><span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                placeholder="Enter reason for requesting amount outside allowed range"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          )}

        <div className="field">
          <label>Booking Payment Days</label>

          <select
            value={formData.bookingDays || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                bookingDays: Number(e.target.value),
              })
            }
          >
            <option value="">Select Days</option>

            {paymentTerms?.bookingDays?.map((day) => (
              <option key={day} value={day}>
                {day} Days
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Agreement Payment Days</label>

          <select
            value={formData.agreementDays || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                agreementDays: Number(e.target.value),
              })
            }
          >
            <option value="">Select Days</option>

            {paymentTerms?.agreementDays?.map((day) => (
              <option key={day} value={day}>
                {day} Days
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Full Payment Days</label>

          <select
            value={formData.fullPaymentDays || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                fullPaymentDays: Number(e.target.value),
              })
            }
          >
            <option value="">Select Days</option>

            {paymentTerms?.fullPaymentDays?.map((day) => (
              <option key={day} value={day}>
                {day} Days
              </option>
            ))}
          </select>
        </div>
        <p style={{ color: "#ff6969", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "5px", padding: "10px 0" }}>
          <input style={{ width: "5%" }} type="checkbox"
            checked={formData.termsAccepted || false}
            onChange={(e) =>
              setFormData({ ...formData, termsAccepted: e.target.checked })
            } />
          Notes : 35% cancellation charges
          <span style={{ borderBottom: "1px solid #ff6969", cursor: "pointer" }} onClick={() => setPolicyOpen(true)}>
            Read Cancellation Policy
          </span>
        </p>

        <div className="modal-actions">
          <button
          disabled={saving}
            onClick={() => {
              if (!selectedPlot) {
                setAlert({
                  message: "Please select a plot",
                  status: "Error",
                });
                setTimeout(() => setAlert(null), 3000);
                return;
              }

              const requestedAmount = Number(formData.requestAmount);
              const min = selectedPlot.priceRange.min;
              const max = selectedPlot.priceRange.max;

              const isInRange = requestedAmount >= min && requestedAmount <= max;

              if (!requestedAmount) {
                setAlert({
                  message: "Please enter amount request",
                  status: "Error",
                });
                setTimeout(() => setAlert(null), 3000);
                return;
              }

              if (!isInRange && !formData.notes?.trim()) {
                setAlert({
                  message: "Notes are required when amount is outside the allowed range",
                  status: "Error",
                });
                setTimeout(() => setAlert(null), 3000);
                return;
              }

              if (isEditMode) {
                handleEditBooking();
              } else {
                handleAddBooking();
              }
              setOpen(false);
            }}
          >
            {saving? "Saving..." :isEditMode ? "Update Booking" : "Book Now"}
          </button>
        </div>
      </AddLocationModal>
      <AddLocationModal
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
        title="Cancellation Policy"
      >
        <CancellationPolicy />
      </AddLocationModal>
    </div>
  );
};

export default Booking;
