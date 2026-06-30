import { TOOLS } from "./Tools";
import "./AdminPanel.css"

export default function AdminPanel({
  mood,
  tool,
  setTool,
  selectedType,
  setSelectedType,
  clearAll,
}) {
  if (mood !== "admin") return null;

  return (
    <div className="admin-panel">
      <div className="tool-row">
        {Object.values(TOOLS).map((t) => (
          <button
            key={t}
            className={tool === t ? "active" : ""}
            onClick={() => setTool(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
      >
        <option value="FOR_SALE">For Sale</option>
        <option value="SOLD">Sold</option>
        <option value="PENDING">Pending</option>
        <option value="NOT_FOR_SALE">Not For Sale</option>
        <option value="ROAD">Road</option>
      </select>

      <button onClick={clearAll}>Clear All</button>
    </div>
  );
}