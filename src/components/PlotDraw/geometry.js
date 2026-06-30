export const GRID = 20;
export const SQFT_PER_PIXEL = 1.2;

export const snap = ([x, y]) => [
  Math.round(x / GRID) * GRID,
  Math.round(y / GRID) * GRID,
];

export const distance = ([x1, y1], [x2, y2]) =>
  Math.hypot(x2 - x1, y2 - y1);

export function polygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

export function pointInPolygon(point, polygon) {
  let inside = false;
  const [x, y] = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function polygonInside(inner, outer) {
  return inner.every((p) => pointInPolygon(p, outer));
}

export function polygonsOverlap(p1, p2) {
  const intersect = (a, b, c, d) => {
    const det =
      (b[0] - a[0]) * (d[1] - c[1]) -
      (b[1] - a[1]) * (d[0] - c[0]);
    if (det === 0) return false;

    const l =
      ((d[1] - c[1]) * (d[0] - a[0]) +
        (c[0] - d[0]) * (d[1] - a[1])) / det;
    const g =
      ((a[1] - b[1]) * (d[0] - a[0]) +
        (b[0] - a[0]) * (d[1] - a[1])) / det;

    return l > 0 && l < 1 && g > 0 && g < 1;
  };

  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      if (
        intersect(
          p1[i],
          p1[(i + 1) % p1.length],
          p2[j],
          p2[(j + 1) % p2.length]
        )
      ) return true;
    }
  }
  return false;
}

