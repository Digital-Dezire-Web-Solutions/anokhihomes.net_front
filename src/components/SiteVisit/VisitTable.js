import React, { useState, useMemo, useEffect } from "react";
import NiSearch from "../../icons/ni-search";
import { LucidePlus } from "lucide-react";
import AddLocationModal from "../Modals/AddLocationModal";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import SiteVisitCard from "../Cards/SiteVisitCard";
import SearchSelect from "../SearchItems/SearchSelect";
import {
  getAllColonies,
  getLeads,
  getSiteVisit,
  getUserRole,
} from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Host from "../../Host/Host";
// import "./SiteVisit.css";

const ITEMS_PER_PAGE = 6;

const VisitTable = ({ data, mood, setAlert, landingPage }) => {
  const dispatch = useDispatch();
  const { leads, allColonies, usersRole } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getLeads());
    dispatch(getAllColonies());
    dispatch(getUserRole("agent"));
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedColonies, setSelectedColonies] = useState([]);
  const [saving, setSaving] = useState(false);
  // console.log(data,"data")

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (selectedVisit) {
      setFormData(selectedVisit);
    } else {
      setFormData({});
    }
  }, [selectedVisit]);

  // useEffect(() => {
  //   if (selectedVisit) {
  //     setFormData({
  //       lead: selectedVisit.leadId || "",
  //       customer: selectedVisit.customer || "",
  //       location: selectedVisit?.locationId?._id || "",
  //       colony: selectedVisit?._id || "",
  //       agent: selectedVisit?.agent || "",
  //       visitDate:
  //         selectedVisit.visitHour +
  //         " " +
  //         selectedVisit.visitPeriod +
  //         " " +
  //         selectedVisit.visitDate,
  //     });

  //     // also set selectedCustomer for UI
  //     setSelectedCustomer({
  //        _id: selectedVisit.customer,
  //       name: selectedVisit.name,
  //       phone: selectedVisit.phone,
  //       email: selectedVisit.email,
  //     });
  //   }
  // }, [selectedVisit]);

  // console.log(data, "data");
  const filtered = useMemo(() => {
    return data.filter((visit) => {
      const matchSearch =
        visit.customer?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
        visit.customer?.phone?.includes(search);

      const matchStatus = statusFilter === "" || visit.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, data]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleAddVisit = async () => {
    setSaving(true);
    console.log("Adding visit:", formData);
    setOpen(false);
    try {
      const token = localStorage.getItem("token");

      const payload = {
        lead: formData.leadId,
        customer: formData.customer,
        location: selectedColonies[0]?.locationId?._id,
        colonies: selectedColonies.map((c) => c._id),
        agent: formData?.agent,
        visitDate:
          formData.visitHour +
          " " +
          formData.visitPeriod +
          " " +
          formData.visitDate,
      };

      console.log(payload, "payload");

      const res = await axios.post(`${Host}/api/sitevisit/add`, payload, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      setAlert({
        message: "Site Visit added successfully!",
        status: "Success",
      });
      dispatch(getSiteVisit());
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Request failed",
        status: "Error",
      });
      setTimeout(() => {
        setAlert(null);
      }, 5000);
      setSaving(false);
    }
  };
  const handleEditVisit = async () => {
    console.log("Editing visit:", formData);
    setOpen(false);
  };

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);

  // console.log(selectedCustomer, "selected");
  // console.log(selectedProjects, "selectedProjects");

  return (
    <div>
      <div className="filter-grid page-tools table-filters">
        {mood === "admin" && (
          <button
            className="add-button"
            onClick={() => {
              setSelectedVisit(null);
              setIsEditMode(false);
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
              placeholder="Search customer / phone"
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
            <option value="">Status</option>
            <option value="Approval">Approval</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="searchItem">
          <input
            type="date"
            // value={dateFilter}
            // onChange={(e) => {
            //     setDateFilter(e.target.value);
            //     setPage(1);
            // }}
          />
        </div>
      </div>
      <div className="user-card-box">
        {paginated.length === 0 ? (
          <p>No Site Visits Found</p>
        ) : (
          paginated
            .reverse()
            .map((item) => (
              <SiteVisitCard
                item={item}
                setSelectedVisit={setSelectedVisit}
                setIsEditMode={setIsEditMode}
                setOpen={setOpen}
                mood={mood}
                setAlert={setAlert}
                landingPage={landingPage}
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
        title={isEditMode ? "Edit Visit" : "Add Visit"}
      >
        <div className="field">
          <SearchSelect
            label="Lead"
            placeholder="Search name or number"
            options={leads}
            value={selectedCustomer}
            onChange={(selected) => {
              setSelectedCustomer(selected);
              setFormData({
                ...formData,
                leadId: selected._id,
                customer: selected.customer,
                agent: selected?.agent?._id || null,
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
          <label>Customer Name</label>
          <input
            value={selectedCustomer?.name}
            readOnly
            placeholder="Phone Number"
          />
        </div>
        <div className="field">
          <label>Customer Phone</label>
          <input
            value={selectedCustomer?.phone}
            readOnly
            placeholder="Phone Number"
          />
        </div>
        <div className="field">
          <label>Date of Visit</label>

          {/* Date */}
          <input
            type="date"
            value={formData.visitDate || ""}
            onChange={(e) =>
              setFormData({ ...formData, visitDate: e.target.value })
            }
          />

          {/* Hour Dropdown */}
          <select
            value={formData.visitHour || ""}
            onChange={(e) =>
              setFormData({ ...formData, visitHour: e.target.value })
            }
          >
            <option value="">Select Hour</option>
            {[...Array(12)].map((_, i) => {
              const hour = i + 1;
              return (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              );
            })}
          </select>

          {/* AM / PM */}
          <select
            value={formData.visitPeriod}
            onChange={(e) =>
              setFormData({ ...formData, visitPeriod: e.target.value })
            }
          >
            <option value="">Select Period (AM / PM)</option>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        {selectedCustomer?.agent === null ? (
          <div className="field">
            <SearchSelect
              label="Associate"
              placeholder="Search name or number"
              options={usersRole}
              value={selectedAgent}
              onChange={(selected) => {
                setSelectedAgent(selected);
                setFormData({ ...formData, agent: selected?._id });
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
        ) : (
          <div className="field">
            <label>Associate</label>
            <input
              value={selectedCustomer?.agent?.name}
              readOnly
              placeholder="Associate"
            />
          </div>
        )}
        <div className="field">
          <SearchSelect
            label="Colonies"
            multiple
            placeholder="Select Colonies"
            options={allColonies}
            value={selectedColonies}
            onChange={setSelectedColonies}
            displayKey="name"
            searchKeys={["name"]}
            renderOption={(p) => (
              <div>
                <b>{p.name}</b>

                <small style={{ display: "block" }}>{p.locationId?.name}</small>
              </div>
            )}
          />
        </div>

        <div className="modal-actions">
          <button
            onClick={() => {
              if (isEditMode) {
                handleEditVisit();
              } else {
                if (!formData.visitDate || selectedColonies.length === 0) {
                  setAlert({
                    message: "Please select at least one colony",
                    status: "Error",
                  });
                  return;
                  setTimeout(() => setAlert(null), 3000);
                }
                handleAddVisit();
              }
              setOpen(false);
            }}
          >
            {saving ? "Saving..." : isEditMode ? "Update Visit" : "Add Visit"}
          </button>
        </div>
      </AddLocationModal>
    </div>
  );
};

export default VisitTable;
