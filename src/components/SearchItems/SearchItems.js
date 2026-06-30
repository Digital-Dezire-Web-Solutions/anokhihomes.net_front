import React, { useEffect, useRef, useState } from "react";
import SearchModal from "../Modals/SearchModal";
import NiSearch from "../../icons/ni-search";

const SearchItems = () => {
  const [openSearch, setOpenSearch] = useState(false);
  const searchRef = useRef();
  // close when click outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpenSearch(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="searchItem"
      ref={searchRef}
      onClick={() => {
        setOpenSearch(!openSearch);
      }}
    >
      <NiSearch />
      Search...
      {openSearch && <SearchModal />}
    </div>
  );
};

export default SearchItems;
