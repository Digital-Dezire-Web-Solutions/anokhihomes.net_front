import React, { useState } from "react";

/**
 * Shown after the user drags a bounding box with the GRID tool.
 * Lets them say "split this area into N rows x M cols" to stamp down many
 * identical plots in one action, instead of drawing each one by hand.
 */
function GridModal({ bbox, defaultType, onCancel, onConfirm }) {
  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(4);
  const [gapX, setGapX] = useState(4);
  const [gapY, setGapY] = useState(4);
  const [prefix, setPrefix] = useState("A-");
  const [startNumber, setStartNumber] = useState(1);
  const [plotType, setPlotType] = useState(defaultType || "FOR_SALE");
  const [price, setPrice] = useState(1600);
  const [priceMin, setPriceMin] = useState(1500);
  const [priceMax, setPriceMax] = useState(1600);

  if (!bbox) return null;

  const cellW = Math.round((bbox.width - gapX * (cols - 1)) / cols);
  const cellH = Math.round((bbox.height - gapY * (rows - 1)) / rows);

  return (
    <div className="plot-modal-backdrop">
      <div className="modal">
        <h3>Generate Plot Grid</h3>
        <p className="plot-modal-hint">
          Splitting a {Math.round(bbox.width)} x {Math.round(bbox.height)} area
          into {rows * cols} plots (~{cellW} x {cellH} each).
        </p>

        <div className="plot-modal-grid">
          <label>
            Rows
            <input
              type="number"
              min={1}
              value={rows}
              onChange={(e) => setRows(Math.max(1, +e.target.value))}
            />
          </label>
          <label>
            Columns
            <input
              type="number"
              min={1}
              value={cols}
              onChange={(e) => setCols(Math.max(1, +e.target.value))}
            />
          </label>
          <label>
            Gap X (px)
            <input type="number" min={0} value={gapX} onChange={(e) => setGapX(+e.target.value)} />
          </label>
          <label>
            Gap Y (px)
            <input type="number" min={0} value={gapY} onChange={(e) => setGapY(+e.target.value)} />
          </label>
          <label>
            Number prefix
            <input value={prefix} onChange={(e) => setPrefix(e.target.value)} />
          </label>
          <label>
            Start number
            <input
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(+e.target.value)}
            />
          </label>
          <label>
            Plot type
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
            <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} />
          </label>
          <label>
            Price min
            <input type="number" value={priceMin} onChange={(e) => setPriceMin(+e.target.value)} />
          </label>
          <label>
            Price max
            <input type="number" value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} />
          </label>
        </div>

        <div className="plot-modal-actions">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={() =>
              onConfirm({
                x: bbox.x,
                y: bbox.y,
                totalWidth: bbox.width,
                totalHeight: bbox.height,
                rows,
                cols,
                gapX,
                gapY,
                prefix,
                startNumber,
                plotType,
                price,
                priceRange: { min: priceMin, max: priceMax },
              })
            }
            className="btn-primary"
          >
            Generate {rows * cols} Plots
          </button>
        </div>
      </div>
    </div>
  );
}

export default GridModal;
