import { CIRCLE_SEGMENTS } from "./Tools";

/** Shoelace formula. points: [[x,y], ...] absolute coords. Returns positive area. */
export function polygonArea(points) {
  if (!points || points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

export function polygonBBox(points) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

/** Convert absolute points to a node's local (0,0 origin) coordinate space. */
export function toRelative(points, origin) {
  return points.map(([x, y]) => [x - origin.x, y - origin.y]);
}

/** Convert a node's local points back to absolute canvas coords. */
export function toAbsolute(points, origin) {
  return points.map(([x, y]) => [x + origin.x, y + origin.y]);
}

export function rectPoints(x1, y1, x2, y2) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
}

export function squarePoints(x1, y1, x2, y2) {
  const side = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) || 1;
  const sx = x2 >= x1 ? 1 : -1;
  const sy = y2 >= y1 ? 1 : -1;
  return rectPoints(x1, y1, x1 + sx * side, y1 + sy * side);
}

export function circlePoints(x1, y1, x2, y2, segments = CIRCLE_SEGMENTS) {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const rx = Math.abs(x2 - x1) / 2 || 1;
  const ry = Math.abs(y2 - y1) / 2 || 1;
  const pts = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    pts.push([
      Math.round((cx + rx * Math.cos(angle)) * 100) / 100,
      Math.round((cy + ry * Math.sin(angle)) * 100) / 100,
    ]);
  }
  return pts;
}

export function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function snap(value, size) {
  if (!size) return value;
  return Math.round(value / size) * size;
}

let uidCounter = 0;
export function tempId(prefix = "tmp") {
  uidCounter += 1;
  return `${prefix}_${Date.now()}_${uidCounter}`;
}

/**
 * Generate a rows x cols grid of rectangular plots inside a bounding box,
 * so many identical plots can be stamped down in one action.
 */
export function buildGridPlots({
  x,
  y,
  totalWidth,
  totalHeight,
  rows,
  cols,
  gapX = 4,
  gapY = 4,
  startNumber = 1,
  prefix = "A-",
  plotType = "FOR_SALE",
  priceRange = { min: 0, max: 0 },
  price = 0,
}) {
  const cellW = (totalWidth - gapX * (cols - 1)) / cols;
  const cellH = (totalHeight - gapY * (rows - 1)) / rows;
  const plots = [];
  let n = startNumber;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = x + c * (cellW + gapX);
      const py = y + r * (cellH + gapY);
      const points = rectPoints(px, py, px + cellW, py + cellH);
      plots.push({
        _id: tempId("plot"),
        plotNumber: `${prefix}${n}`,
        plotType,
        points,
        area: Math.round(polygonArea(points)),
        priceRange,
        price,
      });
      n += 1;
    }
  }
  return plots;
}
