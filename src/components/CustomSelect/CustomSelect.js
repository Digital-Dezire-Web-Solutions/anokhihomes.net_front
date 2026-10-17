import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({ value, onChange, options, placeholder, className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`cs ${className}`} ref={ref}>
      <button
        type="button"
        className={`cs-trigger ${open ? "open" : ""} add-button` }
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={18} />
      </button>

      {open && (
        <ul className="cs-menu">
          {options.map((o) => (
            <li
              key={o.value}
              className={`cs-option ${o.value === value ? "active" : ""} ${o.disabled ? "disabled" : ""}`}
              onClick={() => {
                if (o.disabled) return;
                onChange(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;