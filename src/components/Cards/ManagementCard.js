import React, { useEffect, useState } from "react";
import NiOpenEye from "../../icons/ni-openEye";
import NiDots from "../../icons/ni-dots";
import ActionModal from "../Modals/ActionModal";
import DeleteModal from "../Modals/DeleteModal";
import ViewModal from "../Modals/ViewModal";
import NiReport from "../../icons/ni-report";
import NiCross from "../../icons/ni-cross";
import NiUser from "../../icons/ni-user";
import SearchSelect from "../SearchItems/SearchSelect";
import formatDate from "../DateFormate/DateFormate";
import Host from "../../Host/Host";
import axios from "axios";
import { addUser, getAllColonies, getLeads } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import NiTick from "../../icons/ni-tick";
import NiEdit from "../../icons/ni-edit";
import NiDelete from "../../icons/ni-delete";
import NoteItem from "../NoteItem/NoteItem";

const ManagementCard = ({
  item,
  setSelectedLead,
  setIsEditMode,
  setOpen,
  mood,
  dashboard,
  setAlert,
  agentsList,
  onDeleteLead
}) => {
  const dispatch = useDispatch();
  const { allColonies } = useSelector((state) => state.app);
  const [activeRow, setActiveRow] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [panelMode, setPanelMode] = useState(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState(item.notes || []);
  const [disapproveOpen, setDisapproveOpen] = useState(false);
  const [lostReason, setLostReason] = useState(item.lostReason || "");
  const [formData, setFormData] = useState({});
  // const [selectedProjects, setSelectedProjects] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedColonies, setSelectedColonies] = useState([]);

  useEffect(() => {
    dispatch(getAllColonies());
  }, [dispatch]);


  useEffect(() => {
    if (!viewOpen) {
      setPanelMode(null);
      setSelectedAgent(null);
    }
  }, [viewOpen]);

  const handleAssignAgent = async (leadId, agentId) => {
    setSaving(true)
    console.log("Assigning", agentId, "to lead", leadId);
    const token = localStorage.getItem("token");
    const res = await axios.put(`${Host}/api/lead/assign/${leadId}`, { agentId }, {
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
      },
    });
    dispatch(getLeads());
    setAlert({
      message: "Agent Assigned Successfully",
      status: "Success",
    });

    setTimeout(() => setAlert(null), 3000);
    setSaving(false)
  };

  const handleReAssignAgent = async (leadId, agentId) => {
    setSaving(true)
    console.log("Reassigning", agentId, "to lead", leadId);
    const token = localStorage.getItem("token");
    const res = await axios.put(`${Host}/api/lead/assign/${leadId}`, { agentId }, {
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
      },
    });
    dispatch(getLeads());
    setAlert({
      message: "Agent Ressigned Successfully",
      status: "Success",
    });

    setTimeout(() => setAlert(null), 3000);
    setSaving(false)
  };

  const handleAgentAction = async (leadId, action, note = "") => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${Host}/api/lead/agent-action/${leadId}`,
        {
          action,
          note,
        },
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      dispatch(getLeads());

      setAlert({
        message:
          action === "accept"
            ? "Lead accepted successfully"
            : "Lead rejected successfully",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false)
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Something went wrong",
        status: "Error",
      });
      setSaving(false)
    }
  };

  const handleAddNote = async (leadId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${Host}/api/lead/add-note/${leadId}`,
        { note: noteText },
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ update UI from backend response
      setNotes(res.data.lead.notes);
      setNoteText("");

      setAlert({
        message: "Note added successfully",
        status: "Success",
      });

      dispatch(getLeads()); // optional refresh
      setSaving(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error(err);
      setSaving(false);
      setAlert({
        message: err.response?.data?.message || "Failed to add note",
        status: "Error",
      });
    }
  };

  const handleEditNote = async (leadId, noteId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${Host}/api/lead/edit-note/${leadId}/${noteId}`,
        { note: editingNote },
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      setNotes(res.data.lead.notes);
      setEditingNote(null);
      dispatch(getLeads());
      setSaving(false);
      setAlert({ message: "Note updated", status: "Success" });
    } catch (err) {
      setSaving(false);
      console.error(err);
      setAlert({ message: "Edit failed", status: "Error" });
    }
  };

  const handleDeleteNote = async (leadId, noteId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `${Host}/api/lead/delete-note/${leadId}/${noteId}`,
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      setNotes(res.data.lead.notes);
      dispatch(getLeads());
      setAlert({ message: "Note deleted", status: "Success" });
    } catch (err) {
      console.error(err);
      setAlert({ message: "Delete failed", status: "Error" });
    }
  };

  const handleMarkAsLost = async (leadId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${Host}/api/lead/mark-lost/${leadId}`,
        { reason: formData.lostReason },
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      dispatch(getLeads());

      setAlert({
        message: "Lead marked as lost",
        status: "Success",
      });

      setViewOpen(false);
      setFormData({});

      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Failed",
        status: "Error",
      });
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${Host}/api/lead/delete/${leadId}`, {
        headers: {
          "auth-token": token,
        },
      });

      dispatch(getLeads());

      setAlert({
        message: "Lead deleted successfully!",
        status: "Success",
      });
      setTimeout(() => setAlert(null), 3000);
      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
      setAlert({
        message: "Delete failed",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleRequestSiteVisit = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        lead: item._id,
        customer: item.customer,
        location: selectedColonies[0]?.locationId?._id,
        colonies: selectedColonies.map((c) => c._id),
        visitDate: formData.visitHour + " " + formData.visitPeriod + " " + formData.visitDate,
      };

      // console.log(payload,"payload")

      const res = await axios.post(
        `${Host}/api/sitevisit/add`,
        payload,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      setAlert({
        message: "Site visit requested",
        status: "Success",
      });
      dispatch(getLeads());
      setViewOpen(false);
      setFormData({});
      setSelectedColonies(null);
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error(err);
      setAlert({
        message: err.response?.data?.message || "Request failed",
        status: "Error",
      });
    }
  };

  const filteredAgents = agentsList.filter(
    (a) =>
      a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
      a.phone.includes(agentSearch),
  );
  // console.log(mood, "item")
  const isSystemNote = (text) => {
    return text?.toLowerCase().includes("accepted by");
  };

  // console.log(item, "item")
  // console.log(selectedProjects, "allCoselectedProjectslonies")
  return (
    <div className="user-card card" onClick={dashboard || undefined}>
      <div className="user-card-top">
        <div className="user-card-title">
          <div className="user-card-name">
            <h4 style={{ textTransform: "capitalize" }}>
              {item?.name}
              {/* <span>({item.phone})</span> */}
              <span
                className={`status ${item?.status === "new" ? "active2" : item?.status === "converted" ? "active" : item?.status === "assigned" ? "pending" : item?.status === "unassigned" ? "pending2" : "failed"}`}
              >
                {item?.status}
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
          {mood !== "user" && mood !== "agent" && !dashboard && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setActiveRow(activeRow === item._id ? null : item._id);
              }}
            >
              <NiDots />
            </span>
          )}

          {activeRow === item._id && (
            <ActionModal
              item={item}
              onClose={() => setActiveRow(null)}
              onEdit={(lead) => {
                setSelectedLead(lead);
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
          <p>Date</p>
          <p>Phone No.</p>
          {mood !== "agent" && <p>Associate</p>}
        </div>
        <div className="user-card-bottom-right">
          <p>
            {formatDate(item?.createdAt)}
          </p>
          <p>{item?.phone}</p>
          {mood !== "agent" && <p>{item?.agent?.name || ""}</p>}
        </div>
      </div>
      {mood === "admin" &&
        (item?.status === "new" ? (
          <div className="modal-actions">
            <button
              className="view-report-btn"
              onClick={(e) => {
                e.stopPropagation();
                setViewOpen(true);
                setPanelMode("assign")
              }}
            >
              <NiUser /> Assign Associate
            </button>
          </div>
        ) : item?.status === "unassigned" ? (
          <div className="modal-actions">
            <button
              className=" view-report-btn"
              onClick={(e) => {
                e.stopPropagation();
                setViewOpen(true);
                setPanelMode("reassign")
              }}
            >
              <NiUser /> Re-assign Associate
            </button>
          </div>
        ) : "")
      }
      {mood === "agent" && item?.status === "assigned" && (
        <div className="modal-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewOpen(true);
              setPanelMode("siteVisit")
            }}
          >
            Request Site Visit
          </button>
        </div>
      )}
      {mood === "agent" && item?.status === "new" && (
        <div className="modal-actions">
          <button
            className="site-visit-approval status active"
            onClick={(e) => {
              e.stopPropagation();
              handleAgentAction(item._id, "accept");
            }}
          >
            <NiTick /> Accept
          </button>

          <button
            className="site-visit-approval status failed"
            onClick={() => setDisapproveOpen(true)}
          >
            <NiCross /> Reject
          </button>
        </div>
      )}
      <DeleteModal open={disapproveOpen} onClose={() => setDisapproveOpen(false)}>
        <h4>Reject Lead</h4>
        <div className="field">
          <label>
            Notes
          </label>
          <textarea
            placeholder="Add Notes..."
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        <div className="modal-actions">
          <button
            onClick={() => {
              handleAgentAction(item._id, "reject", formData.notes);
              setDisapproveOpen(false);
              setFormData({});
            }}
          >
            Reject
          </button>
        </div>
      </DeleteModal>
      <DeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <p>Are you sure you want to delete?</p>
        <div className="modal-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteLead(item._id);

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
        title={item.name}
      >
        <div className="user-card-bottom view-box report-view-box-left">
          <div className="user-card-bottom-left">
            <p>Date</p>
            <p>Status</p>
            <p>Phone No.</p>
            {mood !== "agent" && <p>Associate</p>}
            {item?.status === "converted" ? (
              <p>Report</p>
            ) : item?.status === "lost" ? (
              <p>Report</p>
            ) :
              // item?.status === "new" && mood === "admin" ? (
              //   <div className="table-filters">
              //     <button
              //       className="view-report-btn"
              //       onClick={() => setPanelMode("reassign")}
              //     >
              //       <NiUser />
              //       Reassign
              //     </button>
              //   </div>
              // ) :
              ""}
          </div>
          <div className="user-card-bottom-right">
            <p>
              {formatDate(item?.createdAt)}
            </p>
            <p>{item?.status}</p>
            <p>{item?.phone}</p>

            {item?.status === "new" && mood === "admin" ? (
              <>
                <div className="table-filters">
                  <button
                    className="view-report-btn"
                    onClick={() => setPanelMode("assign")}
                  >
                    <NiUser />
                    Assign
                  </button>
                </div>
              </>
            ) : (
              <>
                {mood !== "agent" && <p>{item?.agent?.name || ""}</p>}
              </>
            )}

            <div className="table-filters">
              {(item?.status === "assigned" || item?.status === "unassigned") && (
                <button
                  className="view-report-btn"
                  onClick={() => setPanelMode("notes")}
                >
                  <NiReport /> Notes
                </button>
              )}

              {item?.status === "lost" && (
                <button
                  className="view-report-btn"
                  onClick={() => setPanelMode("lost")}
                >
                  <NiReport /> Lost Reason
                </button>
              )}

              {item?.status === "converted" && (
                <button
                  className="view-report-btn"
                  onClick={() => setPanelMode("report")}
                >
                  <NiReport /> View
                </button>
              )}
            </div>
          </div>
        </div>
        {mood === "agent" && item?.status === "assigned" && (
          <div className="modal-actions">
            <button
              onClick={() => setPanelMode("siteVisit")}
            >
              Request Site Visit
            </button>
            <button
              className="status failed"
              style={{ border: "none" }}
              onClick={() => setPanelMode("lostReason")}
            >
              Mark as Lost
            </button>
          </div>
        )}

        {/* STATUS BASED ACTIONS */}

        <div className={`report-view-box-right ${panelMode ? "active" : ""}`}>
          {/* ASSIGN AGENT PANEL */}
          {panelMode === "assign" && (
            <>
              <h4>Assign Associate</h4>

              {/* IF NO AGENT SELECTED → SHOW SEARCH + LIST */}
              {!selectedAgent && (
                <>
                  <div className="field">
                    <SearchSelect
                      label=""
                      placeholder="Search name or number"
                      options={agentsList}
                      value={selectedAgent}
                      onChange={(selected) => {
                        setSelectedAgent(selected);
                        setFormData({ ...formData, name: selected.name });
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
                </>
              )}

              {/* IF AGENT SELECTED → SHOW ONLY SELECTED CARD */}
              {selectedAgent && (
                <div className="agent-list">
                  <div className="selected-agent-card">
                    <div className="notif-item">
                      <img src={selectedAgent.avatar} alt="" />
                      <div>
                        <p>
                          {selectedAgent.name}
                        </p>
                        <p className="associate-location">{selectedAgent.phone}</p>
                      </div>
                    </div>
                    <span
                      onClick={() => {
                        setSelectedAgent(null);
                        setAgentSearch("");
                      }}
                    >
                      <NiCross />
                    </span>
                  </div>
                  <p className="associate-note">Assinging agent will move lead to assigned</p>
                  <div className="modal-actions">
                    <button
                      onClick={() => {
                        handleAssignAgent(item._id, selectedAgent._id);
                        setPanelMode(null);
                        setSelectedAgent(null);
                        setViewOpen(false);
                      }}
                      disabled={saving}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {panelMode === "reassign" && (
            <>
              <h4>Reassign Associate</h4>

              {/* IF NO AGENT SELECTED → SHOW SEARCH + LIST */}
              {!selectedAgent && (
                <>
                  <div className="field">
                    <SearchSelect
                      label=""
                      placeholder="Search name or number"
                      options={agentsList}
                      value={selectedAgent}
                      onChange={(selected) => {
                        setSelectedAgent(selected);
                        setFormData({ ...formData, name: selected.name });
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
                </>
              )}

              {/* IF AGENT SELECTED → SHOW ONLY SELECTED CARD */}
              {selectedAgent && (
                <div className="agent-list">
                  <div className="selected-agent-card">
                    <div className="notif-item">
                      <img src={selectedAgent.avatar} alt="" />
                      <div>
                        <p>
                          {selectedAgent.name}
                        </p>
                        <p className="associate-location">{selectedAgent.phone}</p>
                      </div>
                    </div>
                    <span
                      onClick={() => {
                        setSelectedAgent(null);
                        setAgentSearch("");
                      }}
                    >
                      <NiCross />
                    </span>
                  </div>
                  {/* <div class="field">
                    <textarea
                      placeholder="Add reason or note of re-assigning"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                  </div> */}
                  <p>Reassinging agent will move lead to assigned</p>
                  <div className="modal-actions">
                    <button
                      onClick={() => {
                        handleReAssignAgent(item._id, selectedAgent._id);
                        setPanelMode(null);
                        setSelectedAgent(null);
                        setViewOpen(false);
                      }}
                    >
                      Reassign
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {panelMode === "siteVisit" && (
            <>
              <h4>Request Site Visit</h4>

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
              {/* <div className="field">
                <SearchSelect
                  label="Site"
                  placeholder="Search Project or location"
                  options={allColonies}
                  value={selectedProjects}
                  onChange={(selected) => {
                    setSelectedProjects(selected);
                    setFormData({ ...formData, location: selected.name });
                  }}
                  displayKey="name"
                  searchKeys={["name", "location"]}
                  renderOption={(p) => (
                    <div>
                      <b>{p.name}</b>
                      <small style={{ display: "block", color: "#666" }}>
                        {p?.locationId?.name}
                      </small>
                    </div>
                  )}
                />
              </div> */}

              <div className="modal-actions">
                <button
                  onClick={() => {
                    // console.log("Site Visit Requested", formData);
                    if (!formData.visitDate || !selectedColonies[0]?.locationId?._id) {
                      setAlert({
                        message: "Please select date and location",
                        status: "Error",
                      });
                      return;
                      setTimeout(() => setAlert(null), 3000);
                    }
                    handleRequestSiteVisit();
                  }}
                >
                  Submit Request
                </button>
              </div>
            </>
          )}
          {panelMode === "lostReason" && mood === "agent" && (
            <>
              <h4>Lost Reason</h4>
              <div className="field">
                <label>Notes</label>
                <textarea
                  placeholder="Enter reason..."
                  value={formData.lostReason || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, lostReason: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => {
                    if (!formData.lostReason?.trim()) {
                      setAlert({ message: "Please add reason", status: "Error" });
                      setTimeout(() => setAlert(null), 3000);
                      return;
                    }

                    handleMarkAsLost(item._id);
                  }}
                >
                  Mark as Lost
                </button>
              </div>
            </>
          )}

          {/* ASSIGNED → NOTES */}
          {panelMode === "notes" && (
            <NoteItem
              item={item}
              notes={notes}
              noteText={noteText}
              setNoteText={setNoteText}
              handleAddNote={handleAddNote}
              handleEditNote={handleEditNote}
              handleDeleteNote={handleDeleteNote}
              editingNote={editingNote}
              setEditingNote={setEditingNote}
              saving={saving}
              setSaving={setSaving}
            />
          )}

          {/* LOST */}
          {/* LOST */}
          {panelMode === "lost" && (
            <>
              {/* EXISTING NOTES */}


              {notes.length === 0 && <><h5>Notes History</h5> <p>No notes available.</p></>}

              <NoteItem
                item={item}
                notes={notes}
                noteText={noteText}
                setNoteText={setNoteText}
                handleAddNote={handleAddNote}
                handleEditNote={handleEditNote}
                handleDeleteNote={handleDeleteNote}
                editingNote={editingNote}
                setEditingNote={setEditingNote}
                saving={saving}
                setSaving={setSaving}
              />

              {/* ONLY AGENT CAN ADD NOTE */}
              {/* {mood === "agent" && (
                <>
                  <div className="add-note-section">
                    <div class="field">
                      <textarea
                        placeholder="Add reason or note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                      />
                    </div>

                    <div className="modal-actions">
                      <button
                        onClick={() => {
                          if (!noteText.trim()) return;
                          handleAddNote(item._id);
                        }}
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                </>
              )} */}
            </>
          )}

          {/* CONVERTED */}
          {panelMode === "report" && (
            <>
              <h4>Lead Conversion Report</h4>

              <p>
                <strong>Converted By:</strong> {item?.agent.name}
              </p>
              <p>
                <strong>Conversion Date:</strong> {formatDate(item?.updatedAt)}
              </p>

              {/* <h5>Notes History</h5> */}
              <NoteItem
                item={item}
                notes={notes}
                noteText={noteText}
                setNoteText={setNoteText}
                handleAddNote={handleAddNote}
                handleEditNote={handleEditNote}
                handleDeleteNote={handleDeleteNote}
                editingNote={editingNote}
                setEditingNote={setEditingNote}
                saving={saving}
                setSaving={setSaving}
              />
            </>
          )}
        </div>
      </ViewModal>
    </div>
  );
};

export default ManagementCard;
