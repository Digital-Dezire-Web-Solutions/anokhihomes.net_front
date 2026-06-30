import NiDelete from "../../icons/ni-delete";
import NiEdit from "../../icons/ni-edit";

const LandingCard = ({ p, action, onEdit, onDelete }) => {
  return (
    <div className="plot-card card">
      {p?.image && (
        <div className="plot-img">
          <img src={p?.image} alt={p?.title} />
        </div>
      )}

      <div className="plot-details">
        <h3>{p?.title || p?.name}</h3>
        {p?.fileName && <p>📄 {p?.fileName}</p>}
        <p>{p?.description || p?.content}</p>
        {p?.subdescription && <p>{p?.subdescription}</p>}
        {/* {p?.phone && <p>📞 {p?.phone}</p>} */}
        {p?.alt && <p>Alt Tag: {p?.alt}</p>}
      </div>

      <div className="plot-card-actions dots">
        <span
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit();
          }}
        >
          <NiEdit />
        </span>

        {action === "delete" && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <NiDelete />
          </span>
        )}
      </div>
    </div>
  );
};

export default LandingCard;
