import React, { useState } from "react";
import EnquireModal from "../Modals/EnquireModal";
import { X } from "lucide-react";
import { formatCurrency } from "../Utils/FormatCurrency";
import ViewModal from "../Modals/ViewModal";
import axios from "axios";
import Host from "../../Host/Host";
import HoldPlotModal from "./HoldPlotModal";

const PLOT_TYPES = [
  "FOR_SALE",
  "HOLD",
  "SOLD",
  "PENDING",
  "ROAD",
  "NOT_FOR_SALE",
];

const PlotModal = ({ plot, onClose, mood, updatePlot, setAlert, projectId }) => {
  const isAdmin = mood === "admin";

  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);

  const PLOT_ACTION_CONFIG = {
    FOR_SALE: {
      label: mood === "user" ? "Enquire Now" : "Book Plot",
      className: "agent btn sale",
    },
    HOLD: {
      label: mood === "user" ? "Plot on Hold" : "Plot on Hold",
      className: "agent btn hold",
    },

    SOLD: {
      label: "Sold",
      className: "agent btn sold",
    },

    PENDING: {
      label: "Pending",
      className: "agent btn pending",
    },

    ROAD: {
      label: "Road",
      className: "agent btn road",
    },

    NOT_FOR_SALE: {
      label: "Not For Sale",
      className: "agent btn hold",
    },
  };

  const handleActionClick = () => {
    setShowEnquiryModal(true);
  };

  const agent = {
    id: "AG123",
    name: "Rahul Sharma",
  };
  const [type, setType] = useState("FREE");

  const submit = async () => {
    const token = localStorage.getItem("token");

    // await axios.post(
    //   `${Host}/api/hold/${type.toLowerCase()}`,
    //   {
    //     colony,
    //     plotId: plot._id,
    //     customer,
    //   },
    //   {
    //     headers: {
    //       "auth-token": token,
    //     },
    //   },
    // );

    setAlert({
      message: "Hold Request Submitted",
      status: "Success",
    });

    onClose();
  };

  return (
    <div className="modal-bg plot-modal" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Plot Details</h3>

        {/* ================= ADMIN VIEW ================= */}

        {isAdmin ? (
          <>
            <div className="field">
              <label>Plot ID</label>
              <input
                value={plot.plotId || ""}
                onChange={(e) =>
                  updatePlot(plot._id, {
                    plotId: e.target.value,
                  })
                }
              />
            </div>

            <div className="field">
              <label>Plot Number</label>

              <input
                value={plot.plotNumber || ""}
                onChange={(e) =>
                  updatePlot(plot._id, {
                    plotNumber: e.target.value,
                  })
                }
                placeholder="Enter plot number"
              />
            </div>

            <div className="field">
              <label>Plot Type</label>

              <select
                value={plot.plotType || "FOR_SALE"}
                onChange={(e) =>
                  updatePlot(plot._id, {
                    plotType: e.target.value,
                  })
                }
              >
                {PLOT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* AREA */}

            {plot.plotType !== "ROAD" && (
              <>
                <div className="field">
                  <label>Area (sq.ft)</label>

                  <input
                    type="number"
                    value={plot.area || 0}
                    onChange={(e) =>
                      updatePlot(plot._id, {
                        area: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label>Price / sq.ft</label>

                  <input
                    type="number"
                    value={plot.price || 0}
                    onChange={(e) =>
                      updatePlot(plot._id, {
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* PRICE RANGE */}

                <div className="field">
                  <label>Price Range</label>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={plot?.priceRange?.min || 0}
                      onChange={(e) =>
                        updatePlot(plot._id, {
                          priceRange: {
                            ...plot.priceRange,
                            min: Number(e.target.value),
                          },
                        })
                      }
                    />

                    <input
                      type="number"
                      placeholder="Max Price"
                      value={plot?.priceRange?.max || 0}
                      onChange={(e) =>
                        updatePlot(plot._id, {
                          priceRange: {
                            ...plot.priceRange,
                            max: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}

            <p className="hint">* Area auto-calculated from polygon points.</p>
          </>
        ) : (
          <>
            {/* ================= USER / AGENT VIEW ================= */}

            {/* USER / AGENT VIEW */}

            <div className="user-field">
              <label>Plot ID</label>
              <div className="value">{plot.plotId || "-"}</div>
            </div>

            <div className="user-field">
              <label>Plot Number</label>
              <div className="value">{plot.plotNumber || "-"}</div>
            </div>

            <div className="user-field">
              <label>Plot Type</label>
              <div className="value">{plot.plotType?.replaceAll("_", " ")}</div>
            </div>

            {plot.plotType !== "ROAD" && (
              <>
                <div className="user-field">
                  <label>Area</label>
                  <div className="value">{plot.area || 0} sq.ft</div>
                </div>

                {plot.plotType !== "SOLD" &&
                  plot.plotType !== "NOT_FOR_SALE" && (
                    <>
                      <div className="user-field">
                        <label>Price / sq.ft</label>
                        <div className="value">
                          ₹{formatCurrency(plot.price || 0)}
                        </div>
                      </div>

                      <div className="user-field">
                        <label>Total Price</label>
                        <div className="value">
                          ₹
                          {formatCurrency(
                            Number(plot.area || 0) * Number(plot.price || 0),
                          )}
                        </div>
                      </div>
                    </>
                  )}
              </>
            )}
          </>
        )}

        {/* ================= ACTIONS ================= */}

        <div className="modal-actions">
          {/* USER / AGENT */}

          {(mood === "agent" || mood === "user") &&
            plot.plotType !== "ROAD" &&
            plot.plotType !== "NOT_FOR_SALE" && (
              <>
                {plot.plotType === "FOR_SALE" && mood === "agent" ? (
                  <>
                    <button
                      className="btn sale"
                      onClick={() => setShowHoldModal(true)}
                    >
                      Hold Plot
                    </button>

                    <button
                      className="btn secondary"
                      onClick={handleActionClick}
                    >
                      Book Plot
                    </button>
                  </>
                ) : (
                  <button
                    className={PLOT_ACTION_CONFIG[plot.plotType]?.className}
                    disabled
                  >
                    {PLOT_ACTION_CONFIG[plot.plotType]?.label}
                  </button>
                )}
              </>
            )}

          {/* CLOSE */}

          <button className="close-btn" onClick={onClose}>
            <X />
          </button>

          {/* ADMIN */}

          {isAdmin && (
            <button className="btn secondary" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>

      {/* ================= ENQUIRY MODAL ================= */}

      {showEnquiryModal && (
        <div
          className="modal-bg enquiry-modal"
          onClick={() => setShowEnquiryModal(false)}
        >
          <EnquireModal
            setShowEnquiryModal={setShowEnquiryModal}
            plot={plot}
            mood={mood}
            agent={agent}
            onClose={onClose}
            setAlert={setAlert}
          />
        </div>
      )}
      {showHoldModal && (
        <div
          className="modal-bg enquiry-modal"
          onClick={() => setShowHoldModal(false)}
        >
          <div
            className="modal"
            onClick={() => setShowHoldModal(false)}
          >
            <HoldPlotModal
              projectId={projectId}
              plot={plot}
              setShowHoldModal={setShowHoldModal}
              onClose={onClose}
              setAlert={setAlert}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotModal;
