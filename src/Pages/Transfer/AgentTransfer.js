import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import "./Transfer.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import SearchSelect from "../../components/SearchItems/SearchSelect";
import { getBooking } from "../../Redux/Slices/AppSlices";
import BookingSelect, { BookingSummary } from "./BookingSelect";
import TransferHistory from "./TransferHistory";
import { api, errMsg, flash } from "./transferApi";
import ConfirmModal from "./ConfirmModal";

const transferable = (b) => b.status !== "rejected" && !!b.agent;

const AgentTransfer = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const allowed = mood === "admin" || mood === "staff";

  const [booking, setBooking] = useState(null);
  const [agents, setAgents] = useState([]);
  const [newAgent, setNewAgent] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadAgents = async (id) => {
    try {
      setAgents(await api.get(`/options/agents/${id}`));
    } catch (err) {
      setAgents([]);
      flash(setAlert, "Error", errMsg(err, "Unable to load associates"));
    }
  };

  useEffect(() => {
    setNewAgent(null);
    setNote("");
    if (booking?._id) loadAgents(booking._id);
    else setAgents([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?._id]);

  const canSubmit = booking && newAgent && note.trim().length >= 3 && !saving;

  const submit = async () => {
    setSaving(true);
    try {
      const res = await api.post("/agent", {
        bookingId: booking._id,
        newAgentId: newAgent._id,
        note: note.trim(),
      });

      flash(
        setAlert,
        "Success",
        res.incomeNeedsReview
          ? `${res.message}. Commission already credited was not changed, please review it.`
          : res.message,
      );

      setBooking((prev) => ({
        ...prev,
        agent: { _id: newAgent._id, name: newAgent.name },
      }));
      setNewAgent(null);
      setNote("");
      loadAgents(booking._id);
      setRefreshKey((k) => k + 1);
      dispatch(getBooking());
    } catch (err) {
      flash(setAlert, "Error", errMsg(err, "Associate transfer failed"));
    }
    setSaving(false);
    setConfirmOpen(false);
  };

  if (!allowed) {
    return (
      <div className="plot-container">
        <h3>Only admin or staff can transfer associates.</h3>
      </div>
    );
  }

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Associate Transfer</h2>
          <Breadcrumb />
        </div>
      </div>

      <div className="transfer-layout">
        <div className="card transfer-card plot-modal">
          <h4>1. Select booking</h4>
          <BookingSelect
            filter={transferable}
            value={booking}
            onChange={setBooking}
          />
          <BookingSummary b={booking} />
        </div>

        <div className="card transfer-card plot-modal">
          <h4>2. Move to another associate</h4>

          {!booking ? (
            <p className="transfer-note">Select a booking first.</p>
          ) : (
            <>
              <div className="transfer-warn">
                The new associate must be in the same tree. It is not allowed
                once the payout for any payment of this booking is released.
                Commission already credited is not recalculated.
              </div>

              <div className="field">
                <SearchSelect
                  label="New associate"
                  placeholder="Search associate by name or referral ID"
                  options={agents}
                  value={newAgent}
                  onChange={setNewAgent}
                  displayKey="name"
                  searchKeys={["name", "referralId"]}
                  renderOption={(a) => (
                    <div>
                      <b>{a.name}</b> ({a.referralId})
                    </div>
                  )}
                />
                {agents.length === 0 && (
                  <p className="transfer-note">
                    No other active associate in this tree.
                  </p>
                )}
              </div>

              <div className="field">
                <label>Reason / note *</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Why is the associate being changed?"
                />
              </div>

              <div className="modal-actions">
                <button
                  disabled={!canSubmit}
                  onClick={() => setConfirmOpen(true)}
                >
                  {saving ? "Transferring..." : "Transfer associate"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <TransferHistory
        bookingId={booking?._id}
        type="agent"
        refreshKey={refreshKey}
      />
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Associate Transfer"
        message="Commission already credited is not recalculated."
        details={
          booking && newAgent
            ? [
                ["Customer", booking.customer?.name],
                ["Plot", booking.plot?.plotNumber],
                ["From", booking.agent?.name],
                ["To", `${newAgent.name} (${newAgent.referralId})`],
              ]
            : []
        }
        confirmText="Yes, transfer"
        loading={saving}
        onConfirm={submit}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default AgentTransfer;
