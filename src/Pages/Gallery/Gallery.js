import React, { useEffect, useState } from "react";
import LBreadcrumb from "../../components/LandingPage/LBreadcrumb";
import "./Gallery.css";

const Gallery = ({ data }) => {
  const [activeImage, setActiveImage] = useState(null);

  // Close on ESC
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
            <h1>Gallery</h1>
          </div>
          <LBreadcrumb />
        </div>
      </div>

      {/* Gallery */}
      <div className="landing-pages">
        <div className="gallery-grid">
          {data?.gallery?.gallery?.map((img, i) => (
            <div
              className="gallery-item"
              key={i}
              onClick={() => setActiveImage(img.image)}
            >
              <img src={img.image} alt={img.alt} />
            </div>
          ))}
        </div>
      </div>
      {/* Lightbox */}
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
            <img src={activeImage} alt="full-view" />
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
