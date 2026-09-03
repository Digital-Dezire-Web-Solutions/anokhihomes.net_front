import React from "react";

const Pagination = ({ setPage, page, totalPages }) => {
  const getPaginationPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    // Beginning
    if (page <= 3) {
      return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    // End
    if (page >= totalPages - 2) {
      return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    // Middle
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  return (
    <div className="pagination">
      {/* PREVIOUS */}
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => p - 1)}
        className="pagination-arrow"
      >
        Prev
      </button>

      {/* PAGE NUMBERS */}
      {getPaginationPages().map((item, index) => {
        if (item === "...") {
          return (
            <span key={`dots-${index}`} className="pagination-dots">
              ...
            </span>
          );
        }

        return (
          <button
            key={item}
            className={page === item ? "active" : ""}
            onClick={() => setPage(item)}
          >
            {item}
          </button>
        );
      })}

      {/* NEXT */}
      <button
        disabled={page === totalPages || totalPages === 0}
        onClick={() => setPage((p) => p + 1)}
        className="pagination-arrow"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
