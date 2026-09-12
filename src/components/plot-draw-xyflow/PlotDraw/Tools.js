// Drawing tools available on the canvas toolbar.
export const TOOLS = {
  SELECT: "SELECT",
  POLYGON: "POLYGON",
  RECTANGLE: "RECTANGLE",
  SQUARE: "SQUARE",
  CIRCLE: "CIRCLE",
  GRID: "GRID",
  TRACE: "TRACE", // draws the outer/main plot boundary
};

export const PLOT_TYPES = {
  FOR_SALE: "FOR_SALE",
  SOLD: "SOLD",
  PENDING: "PENDING",
  NOT_FOR_SALE: "NOT_FOR_SALE",
  HOLD: "HOLD",
  ROAD: "ROAD",
};

// Visual styling per plot type (matches the colony-map legend colors)
export const PLOT_TYPE_COLORS = {
  FOR_SALE: { fill: "#8fd9e8", stroke: "#1690a8", label: "For Sale" },
  SOLD: { fill: "#f6c453", stroke: "#a97a10", label: "Sold" },
  PENDING: { fill: "#e6a6d8", stroke: "#a6338f", label: "Pending" },
  NOT_FOR_SALE: { fill: "#c9c9c9", stroke: "#6c6c6c", label: "Not For Sale" },
  HOLD: { fill: "#c9c9c9", stroke: "#5b1553", label: "Not For Sale" },
  ROAD: { fill: "#7c8a90", stroke: "#3f4a4e", label: "Road" },
};

export const CIRCLE_SEGMENTS = 32;
