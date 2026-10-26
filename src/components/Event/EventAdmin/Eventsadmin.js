import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Eventsadmin.css";
import { uploadImage } from "../../../Pages/LandingSetting/LandingApi";
import Host from "../../../Host/Host";
import AddLocationModal from "../../Modals/AddLocationModal";
import formatDate from "../../DateFormate/DateFormate";
import NiDelete from "../../../icons/ni-delete";

const authHeaders = () => ({
  headers: { "auth-token": localStorage.getItem("token") },
});

const EMPTY_EVENT = {
  title: "",
  message: "",
  image: "",
  date: "",
  endDate: "",
  audience: "all",
  viewers: [],
};

const EventsAdmin = ({ setAlert }) => {
  const [tab, setTab] = useState("festivals");

  /* ---------- festivals ---------- */
  const [year, setYear] = useState(new Date().getFullYear());
  const [festivals, setFestivals] = useState([]);
  const [edits, setEdits] = useState({}); // { [id]: { date, isActive, message } }
  const [savingId, setSavingId] = useState(null);

  /* ---------- events ---------- */
  const [events, setEvents] = useState([]);
  const [agents, setAgents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_EVENT);
  const [agentSearch, setAgentSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [eventImageFile, setEventImageFile] = useState(null);
  const [birthdayImage, setBirthdayImage] = useState("");
  const [birthdayFile, setBirthdayFile] = useState(null);
  const [birthdaySaving, setBirthdaySaving] = useState(false);

  const EMPTY_FESTIVAL = { name: "", emoji: "🎉", date: "", message: "" };
  const [festivalOpen, setFestivalOpen] = useState(false);
  const [festivalForm, setFestivalForm] = useState(EMPTY_FESTIVAL);
  const [festivalImageFile, setFestivalImageFile] = useState(null);
  const [festivalSaving, setFestivalSaving] = useState(false);

  const notify = (status, message) => {
    setAlert?.({ status, message });
    setTimeout(() => setAlert?.(null), 3000);
  };

  const errMsg = (err, fallback) => err.response?.data?.message || fallback;

  /* ---------- loaders ---------- */
  const loadFestivals = async () => {
    try {
      const res = await axios.get(
        `${Host}/api/events/festivals?year=${year}`,
        authHeaders(),
      );
      setFestivals(res.data);
      setEdits({});
    } catch (err) {
      notify("Error", errMsg(err, "Unable to load festivals."));
    }
  };

  const loadEvents = async () => {
    try {
      const res = await axios.get(`${Host}/api/events`, authHeaders());
      setEvents(res.data);
    } catch (err) {
      notify("Error", errMsg(err, "Unable to load events."));
    }
  };
  const loadBirthday = async () => {
    try {
      const res = await axios.get(`${Host}/api/events/birthday`, authHeaders());
      setBirthdayImage(res.data.image || "");
    } catch (err) {
      notify("Error", errMsg(err, "Unable to load birthday image."));
    }
  };

  const saveBirthday = async () => {
    try {
      setBirthdaySaving(true);
      let image = birthdayImage;
      if (birthdayFile) {
        const upload = await uploadImage(birthdayFile);
        image = upload.url;
      }
      await axios.put(`${Host}/api/events/birthday`, { image }, authHeaders());
      setBirthdayImage(image);
      setBirthdayFile(null);
      notify("Success", "Birthday image saved.");
    } catch (err) {
      notify("Error", errMsg(err, "Unable to save birthday image."));
    }
    setBirthdaySaving(false);
  };

  useEffect(() => {
    loadFestivals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  useEffect(() => {
    loadEvents();
    loadBirthday();
    axios
      .get(`${Host}/api/events/agents`, authHeaders())
      .then((res) => setAgents(res.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- festival actions ---------- */
  const setEdit = (id, patch) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const saveFestival = async (f) => {
    const e = edits[f._id];
    if (!e) return;
    try {
      setSavingId(f._id);
      const { imageFile, ...payload } = e;
      if (imageFile) {
        const upload = await uploadImage(imageFile);
        payload.image = upload.url;
      }
      const res = await axios.put(
        `${Host}/api/events/festivals/${f._id}`,
        payload,
        authHeaders(),
      );
      setFestivals((list) =>
        list
          .map((x) => (x._id === f._id ? res.data : x))
          .sort((a, b) => a.date.localeCompare(b.date)),
      );
      setEdits((prev) => {
        const next = { ...prev };
        delete next[f._id];
        return next;
      });
      notify("Success", `${f.name} updated.`);
    } catch (err) {
      notify("Error", errMsg(err, "Unable to update festival."));
    }
    setSavingId(null);
  };

  /* ---------- event actions ---------- */
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_EVENT);
    setEventImageFile(null);
    setAgentSearch("");
    setOpen(true);
  };

  const openEdit = (ev) => {
    setEditingId(ev._id);
    setForm({
      title: ev.title,
      message: ev.message || "",
      image: ev.image || "",
      date: ev.date,
      endDate: ev.endDate,
      audience: ev.audience,
      viewers: (ev.viewers || []).map((v) => v._id || v),
    });
    setEventImageFile(null);
    setAgentSearch("");
    setOpen(true);
  };

  const toggleViewer = (id) =>
    setForm((f) => ({
      ...f,
      viewers: f.viewers.includes(id)
        ? f.viewers.filter((v) => v !== id)
        : [...f.viewers, id],
    }));

  const saveEvent = async () => {
    try {
      setSaving(true);
      const payload = { ...form, endDate: form.endDate || form.date };
      if (eventImageFile) {
        const upload = await uploadImage(eventImageFile);
        payload.image = upload.url;
      }
      if (editingId) {
        await axios.put(
          `${Host}/api/events/${editingId}`,
          payload,
          authHeaders(),
        );
      } else {
        await axios.post(`${Host}/api/events`, payload, authHeaders());
      }
      notify("Success", editingId ? "Event updated." : "Event created.");
      setOpen(false);
      loadEvents();
    } catch (err) {
      notify("Error", errMsg(err, "Unable to save event."));
    }
    setSaving(false);
  };

  const deleteEvent = async (ev) => {
    if (!window.confirm(`Delete "${ev.title}"?`)) return;
    try {
      await axios.delete(`${Host}/api/events/${ev._id}`, authHeaders());
      notify("Success", "Event deleted.");
      loadEvents();
    } catch (err) {
      notify("Error", errMsg(err, "Unable to delete event."));
    }
  };

  const filteredAgents = useMemo(() => {
    const k = agentSearch.toLowerCase();
    return agents.filter(
      (a) =>
        a.name?.toLowerCase().includes(k) ||
        a.referralId?.toLowerCase().includes(k),
    );
  }, [agents, agentSearch]);

  const openAddFestival = () => {
    setFestivalForm(EMPTY_FESTIVAL);
    setFestivalImageFile(null);
    setFestivalOpen(true);
  };

  const addFestival = async () => {
    try {
      setFestivalSaving(true);
      const payload = { ...festivalForm, name: festivalForm.name.trim() };
      if (festivalImageFile) {
        const upload = await uploadImage(festivalImageFile);
        payload.image = upload.url;
      }
      await axios.post(`${Host}/api/events/festivals`, payload, authHeaders());
      notify("Success", `${payload.name} added.`);
      setFestivalOpen(false);
      loadFestivals();
    } catch (err) {
      notify("Error", errMsg(err, "Unable to add festival."));
    }
    setFestivalSaving(false);
  };

  /* ---------- render ---------- */
  return (
    <div className="admin-config-box">
      <div>
        <div className="table-filters">
          <button
            className={tab === "festivals" ? "active" : ""}
            onClick={() => setTab("festivals")}
          >
            Festivals
          </button>
          <button
            className={tab === "events" ? "active" : ""}
            onClick={() => setTab("events")}
          >
            Events
          </button>
          <button
            className={tab === "birthday" ? "active" : ""}
            onClick={() => setTab("birthday")}
          >
            Birthday
          </button>
        </div>

        {tab === "festivals" && (
          <div className="card table-box">
            <div className="events-toolbar">
              <button className="add-button" onClick={openAddFestival}>
                Add festival
              </button>
              <label>Year</label>
              <input
                type="number"
                value={year}
                min="2024"
                max="2100"
                onChange={(e) => setYear(Number(e.target.value))}
              />
              <p className="events-hint">
                Festivals marked "Check date" follow the moon or regional
                calendar. Set the correct date and save.
              </p>
            </div>

            <div className="table events-table">
              <div className="table-head">
                <span>Festival</span>
                <span>Date</span>
                <span>Background</span>
                <span>Show</span>
                <span>Action</span>
              </div>

              {festivals.map((f) => {
                const e = edits[f._id] || {};
                const date = e.date ?? f.date;
                const isActive = e.isActive ?? f.isActive;
                const dirty = !!edits[f._id];
                const savedImage = e.image ?? f.image ?? "";

                return (
                  <div className="table-row" key={f._id}>
                    <span>
                      {f.emoji} {f.name}
                      {!f.confirmed && (
                        <em className="events-flag"> Check date</em>
                      )}
                    </span>
                    <span>
                      <input
                        type="date"
                        value={date}
                        min={`${year}-01-01`}
                        max={`${year}-12-31`}
                        onChange={(ev) =>
                          setEdit(f._id, { date: ev.target.value })
                        }
                      />
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {savedImage && !e.imageFile && (
                        <img src={savedImage} alt="" className="events-thumb" />
                      )}
                      {savedImage && !e.imageFile && (
                        <span onClick={() => setEdit(f._id, { image: "" })}>
                          <NiDelete />
                        </span>
                      )}
                      {e.imageFile && <small>New image selected</small>}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(ev) =>
                          setEdit(f._id, {
                            imageFile: ev.target.files[0] || null,
                          })
                        }
                      />
                    </span>
                    <span>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(ev) =>
                          setEdit(f._id, { isActive: ev.target.checked })
                        }
                      />
                    </span>
                    <span>
                      <button
                        className="table-btn"
                        disabled={!dirty || savingId === f._id}
                        onClick={() => saveFestival(f)}
                      >
                        {savingId === f._id ? "Saving..." : "Save"}
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "birthday" && (
          <div className="card table-box events-birthday">
            <p className="events-hint">
              This image is shown in the birthday wish popup for every
              associate.
            </p>

            {birthdayImage && !birthdayFile && (
              <img src={birthdayImage} alt="" className="events-preview" />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBirthdayFile(e.target.files[0] || null)}
            />

            <div className="modal-actions">
              {birthdayImage && !birthdayFile && (
                <button type="button" onClick={() => setBirthdayImage("")}>
                  Remove
                </button>
              )}
              <button disabled={birthdaySaving} onClick={saveBirthday}>
                {birthdaySaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
        {tab === "events" && (
          <>
            <div className="events-toolbar">
              <button className="add-button" onClick={openCreate}>
                Add event
              </button>
            </div>

            <div className="card table-box">
              <div className="table events-table events-table-wide">
                <div className="table-head">
                  <span>Title</span>
                  <span>Date</span>
                  <span>Visible to</span>
                  <span>Action</span>
                </div>

                {events.length === 0 ? (
                  <div>
                    <span>No events yet</span>
                  </div>
                ) : (
                  events.map((ev) => (
                    <div className="table-row" key={ev._id}>
                      <span>{ev.title}</span>
                      <span>
                        {formatDate(ev.date)}
                        {ev.endDate !== ev.date
                          ? ` - ${formatDate(ev.endDate)}`
                          : ""}
                      </span>
                      <span>
                        {ev.audience === "all"
                          ? "All agents"
                          : `${ev.viewers?.length || 0} selected`}
                      </span>
                      <span className="events-row-actions">
                        <button
                          className="table-btn"
                          onClick={() => openEdit(ev)}
                        >
                          Edit
                        </button>
                        <button
                          className="table-btn"
                          onClick={() => deleteEvent(ev)}
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
        <AddLocationModal
          open={festivalOpen}
          onClose={() => setFestivalOpen(false)}
          title="Add Festival"
        >
          <div className="field">
            <label>Festival name *</label>
            <input
              value={festivalForm.name}
              onChange={(e) =>
                setFestivalForm({ ...festivalForm, name: e.target.value })
              }
              placeholder="e.g. Chhath Puja"
            />
          </div>

          <div className="field">
            <label>Emoji</label>
            <input
              value={festivalForm.emoji}
              onChange={(e) =>
                setFestivalForm({ ...festivalForm, emoji: e.target.value })
              }
              placeholder="🎉"
            />
          </div>

          <div className="field">
            <label>Date * ({year})</label>
            <input
              type="date"
              value={festivalForm.date}
              min={`${year}-01-01`}
              max={`${year}-12-31`}
              onChange={(e) =>
                setFestivalForm({ ...festivalForm, date: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label>Message (optional)</label>
            <textarea
              rows={3}
              value={festivalForm.message}
              onChange={(e) =>
                setFestivalForm({ ...festivalForm, message: e.target.value })
              }
              placeholder="Leave empty to use the default wish"
            />
          </div>

          <div className="field">
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFestivalImageFile(e.target.files[0] || null)}
            />
          </div>

          <div className="modal-actions">
            <button
              disabled={
                festivalSaving ||
                !festivalForm.name.trim() ||
                !festivalForm.date
              }
              onClick={addFestival}
            >
              {festivalSaving ? "Saving..." : "Add festival"}
            </button>
          </div>
        </AddLocationModal>
        <AddLocationModal
          open={open}
          onClose={() => setOpen(false)}
          title={editingId ? "Edit Event" : "Add Event"}
        >
          <div className="field">
            <label>Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual Meet 2026"
            />
          </div>

          <div className="field">
            <label>Message</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Shown to agents in the popup"
            />
          </div>

          <div className="field">
            <label>Start date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="field">
            <label>End date (leave empty for a one-day event)</label>
            <input
              type="date"
              value={form.endDate}
              min={form.date}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Who can see it</label>
            <select
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            >
              <option value="all">All agents</option>
              <option value="selected">Selected agents</option>
            </select>
          </div>
          <div className="field">
            <label>Image</label>
            {form.image && !eventImageFile && (
              <img src={form.image} alt="" className="events-preview" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEventImageFile(e.target.files[0] || null)}
            />
            {form.image && !eventImageFile && (
              <button
                type="button"
                className="table-btn"
                onClick={() => setForm({ ...form, image: "" })}
              >
                Remove image
              </button>
            )}
          </div>

          {form.audience === "selected" && (
            <div className="field">
              <label>Agents ({form.viewers.length} selected)</label>
              <input
                placeholder="Search by name or referral ID"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
              />
              <div className="events-agent-list">
                {filteredAgents.map((a) => (
                  <label key={a._id}>
                    <input
                      type="checkbox"
                      checked={form.viewers.includes(a._id)}
                      onChange={() => toggleViewer(a._id)}
                    />
                    {a.name} ({a.referralId})
                  </label>
                ))}
                {filteredAgents.length === 0 && <p>No agents found</p>}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button
              disabled={saving || !form.title || !form.date}
              onClick={saveEvent}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create event"}
            </button>
          </div>
        </AddLocationModal>
      </div>
    </div>
  );
};

export default EventsAdmin;
