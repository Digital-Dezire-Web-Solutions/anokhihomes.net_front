import React, { useEffect, useRef, useState } from "react";
import "./SearchSelect.css";

const SearchSelect = ({
  label,
  placeholder = "Search...",
  options = [],
  multiple = false,
  value = multiple ? [] : null,
  onChange,
  displayKey = "name",
  searchKeys = ["name"],
  renderOption,
  noResultComponent,
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // console.log(options,"options")

  // 🔍 Filter logic
  const filteredOptions = options?.filter((option) =>
    searchKeys?.some((key) =>
      option[key]?.toString()?.toLowerCase()?.includes(search?.toLowerCase()),
    ),
  );

  // 🖱 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync input with selected value
  useEffect(() => {
    if (!multiple && value) {
      setSearch(value[displayKey]);
    }

    if (multiple) {
      setSearch("");
    }
  }, [value, multiple]);

  const selectedIds = multiple ? value.map((v) => v._id) : [];
  // console.log(filteredOptions,"filteredOptions")

  return (
    <div className="ss-container" ref={containerRef}>
      {label && <label className="ss-label">{label}</label>}
      {multiple && value.length > 0 && (
        <div className="ss-tags">
          {value.map((item) => (
            <div className="ss-tag" key={item._id}>
              {item[displayKey]}

              <span
                onClick={(e) => {
                  e.stopPropagation();

                  onChange(value.filter((v) => v._id !== item._id));
                }}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}
      <input
        className="ss-input"
        placeholder={placeholder}
        value={search}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
      />

      {open && (
        <div className="ss-dropdown">
          {filteredOptions.length === 0 ? (
            noResultComponent ? (
              noResultComponent
            ) : (
              <div className="ss-item no-result">No results found</div>
            )
          ) : (
            filteredOptions
              .filter((o) => !multiple || !selectedIds.includes(o._id))
              .map((option) => (
                <div
                  key={option._id}
                  className="ss-item"
                  onClick={() => {
                    if (multiple) {
                      if (selectedIds.includes(option._id)) {
                        onChange(value.filter((v) => v._id !== option._id));
                      } else {
                        onChange([...value, option]);
                      }

                      setSearch("");
                    } else {
                      onChange(option);
                      setSearch(option[displayKey]);
                      setOpen(false);
                    }
                  }}
                >
                  {renderOption ? renderOption(option) : option[displayKey]}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSelect;
