export default function Ruler({ scale, offset, width, height }) {
  const GRID_SIZE = 50; // pixels
  const MAJOR_GRID = 5;
  const ticksX = [];
  const ticksY = [];

  const step = GRID_SIZE * scale;

  for (let x = -offset.x; x < width; x += step) {
    ticksX.push(x);
  }

  for (let y = -offset.y; y < height; y += step) {
    ticksY.push(y);
  }

  return (
    <>
      {/* Top ruler */}
      <g>
        <rect x="0" y="0" width={width} height={30} fill="#f1f5f9" />
        {ticksX.map((x, i) => (
          <g key={i}>
            <line x1={x} y1={30} x2={x} y2={20} stroke="#475569" />
            <text x={x + 2} y={15} fontSize="10" fill="#475569">
              {Math.round((x + offset.x) / scale)}
            </text>
          </g>
        ))}
      </g>

      {/* Left ruler */}
      <g>
        <rect x="0" y="0" width={30} height={height} fill="#f1f5f9" />
        {ticksY.map((y, i) => (
          <g key={i}>
            <line x1={30} y1={y} x2={20} y2={y} stroke="#475569" />
            <text x={2} y={y - 2} fontSize="10" fill="#475569">
              {Math.round((y + offset.y) / scale)}
            </text>
          </g>
        ))}
      </g>
    </>
  );
}
