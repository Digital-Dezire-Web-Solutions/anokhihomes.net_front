import React, { useEffect, useState } from "react";
import "./PosterView.css";
import { createPortal } from "react-dom";

const PosterView = ({ offersData }) => {
  const posterOffers = offersData?.filter(
    (offer) => offer.poster && offer.poster.trim() !== "",
  );

  const [activeIndex, setActiveIndex] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  useEffect(() => {
    const seen = sessionStorage.getItem("welcomePopup");

    // console.log(seen, "seen2")
    if (!seen) {
      console.log(seen, "seen");
      setShowWelcomePopup(true);
      sessionStorage.setItem("welcomePopup", "true");
    }
  }, []);

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % posterOffers.length);
  };

  const prevImage = () => {
    setActiveIndex(
      (prev) => (prev - 1 + posterOffers.length) % posterOffers.length,
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeIndex === null) return;

      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);
  return (
    <>
      <div className="poster-view">
        {posterOffers?.map((item, index) => (
          <div key={item._id} onClick={() => setActiveIndex(index)}>
            <img src={item.poster} alt={item.title} />
          </div>
        ))}
      </div>

      {showWelcomePopup &&
        createPortal(
          <div
            className="welcome-popup-overlay"
            onClick={() => setShowWelcomePopup(false)}
          >
            <div className="welcome-popup" onClick={(e) => e.stopPropagation()}>
              <button
                className="welcome-popup-close"
                onClick={() => setShowWelcomePopup(false)}
              >
                ✕
              </button>

              <img src={posterOffers?.[0]?.poster} alt="Welcome" />
            </div>
          </div>,
          document.body,
        )}
      {activeIndex !== null &&
        posterOffers?.length > 0 &&
        createPortal(
          <div className="lightbox" onClick={() => setActiveIndex(null)}>
            <div
              className="lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="lightbox-close"
                onClick={() => setActiveIndex(null)}
              >
                ✕
              </button>

              <button className="lightbox-prev" onClick={prevImage}>
                ❮
              </button>

              <img
                src={posterOffers[activeIndex].poster}
                alt={posterOffers[activeIndex].title}
              />

              <button className="lightbox-next" onClick={nextImage}>
                ❯
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default PosterView;
