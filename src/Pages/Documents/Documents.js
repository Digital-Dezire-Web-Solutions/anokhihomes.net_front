import React, { useEffect, useState } from "react";
import LBreadcrumb from "../../components/LandingPage/LBreadcrumb";
import "./Documents.css";
import NiOpenEye from "../../icons/ni-openEye";

const Documents = ({ data }) => {
  // console.log(data?.documents, "data")
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setActiveImage(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  return (
    <>
      <div className="landing-head-box">
        <div className="landing-head">
          <div className="landing-top">
            <h1>Documents</h1>
          </div>
          <LBreadcrumb />
        </div>
      </div>

      <div className="landing-pages">

        {/* ✅ THUMBNAILS */}
        {/* <h3 className="section-title">Thumbnail</h3> */}
        <div className="document-grid">
          {data?.documents?.thumbnail?.map((item) => (
            <div
              className="document-item"
              key={item._id}
              onClick={() => setActiveImage(item.image)}
            >
              <img src={item.image} alt="thumbnail" />
            </div>
          ))}
        </div>

        {/* ✅ PDF */}
        {/* <h3 className="section-title">Documents (PDF)</h3> */}
        {/* <div className="document-grid">
          {data?.documents?.pdf?.map((item) => (
            <div
              className="document-item pdf-item"
              key={item._id}
              onClick={() => window.open(item.file, "_blank")}
            >
              <h4>{item.fileName}</h4>
              <NiOpenEye />

              <span className="pdf-badge">PDF</span>
            </div>
          ))}
        </div> */}
      </div>

      {/* ✅ Lightbox */}
      {activeImage && (
        <div className="lightbox" onClick={() => setActiveImage(null)}>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close"
              onClick={() => setActiveImage(null)}
            >
              ✕
            </button>
            <img src={activeImage} alt="preview" />
          </div>
        </div>
      )}
    </>
  );
};

export default Documents;