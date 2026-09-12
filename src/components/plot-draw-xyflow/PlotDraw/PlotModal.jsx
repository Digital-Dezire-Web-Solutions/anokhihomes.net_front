import React, { useEffect, useState } from "react";
import { polygonArea } from "./geometry";

/**
 * Kept API-compatible with the original PlotModal: (plot, updatePlot, onClose).
 * `mood` is accepted for theming, setAlert/projectId are accepted so this can
 * be swapped in without touching PlotDrawCard's calling code.
 */
function PlotModal({ plot, mood, updatePlot, onClose, onDelete }) {
  const [plotNumber, setPlotNumber] = useState(plot.plotNumber || "");
  const [plotType, setPlotType] = useState(plot.plotType || "FOR_SALE");
  const [price, setPrice] = useState(plot.price || 0);
  const [priceMin, setPriceMin] = useState(plot.priceRange?.min || 0);
  const [priceMax, setPriceMax] = useState(plot.priceRange?.max || 0);

  useEffect(() => {
    setPlotNumber(plot.plotNumber || "");
    setPlotType(plot.plotType || "FOR_SALE");
    setPrice(plot.price || 0);
    setPriceMin(plot.priceRange?.min || 0);
    setPriceMax(plot.priceRange?.max || 0);
  }, [plot]);

  const computedArea = plot.points ? Math.round(polygonArea(plot.points)) : plot.area;

  const handleSave = () => {
    updatePlot(plot._id, {
      plotNumber,
      plotType,
      price: Number(price),
      priceRange: { min: Number(priceMin), max: Number(priceMax) },
      area: computedArea,
    });
    onClose();
  };

  return (
    <div className={`plot-modal-backdrop ${mood || ""}`}>
      <div className="modal">
        <h3>Edit Plot {plot.plotNumber}</h3>

        <div className="plot-modal-grid">
          <label>
            Plot Number
            <input value={plotNumber} onChange={(e) => setPlotNumber(e.target.value)} />
          </label>
          <label>
            Plot Type
            <select value={plotType} onChange={(e) => setPlotType(e.target.value)}>
              <option value="FOR_SALE">For Sale</option>
              <option value="SOLD">Sold</option>
              <option value="PENDING">Pending</option>
              <option value="NOT_FOR_SALE">Not For Sale</option>
              <option value="ROAD">Road</option>
            </select>
          </label>
          <label>
            Price
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <label>
            Price Min
            <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
          </label>
          <label>
            Price Max
            <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
          </label>
          <label>
            Area (auto)
            <input value={`${computedArea} sqft`} disabled />
          </label>
        </div>

        <div className="plot-modal-actions">
          <button onClick={() => onDelete && onDelete(plot._id)} className="btn-danger">
            Delete
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlotModal;
