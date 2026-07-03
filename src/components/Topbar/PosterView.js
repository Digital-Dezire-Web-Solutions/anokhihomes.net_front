import React, { useEffect, useState } from "react";
import poster1 from "../../Assets/offfer/of1.jpeg";
import poster2 from "../../Assets/offfer/of2.jpeg";
import "./PosterView.css";
import { createPortal } from "react-dom";

const PosterView = () => {
    const images = [
        { id: 1, image: poster1, alt: "Banner 1" },
        { id: 2, image: poster2, alt: "Banner 2" },
    ];

    const [activeIndex, setActiveIndex] = useState(null);
    const [showWelcomePopup, setShowWelcomePopup] = useState(false);
    useEffect(() => {
        const seen = sessionStorage.getItem("welcomePopup");

        console.log(seen, "seen2")
        if (!seen) {
            console.log(seen, "seen")
            setShowWelcomePopup(true);
            sessionStorage.setItem("welcomePopup", "true");
        }
    }, []);

    const nextImage = () => {
        setActiveIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
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
    console.log(showWelcomePopup, "showWelcomePopup")

    return (
        <>
            <div className="poster-view">
                {images.map((item, index) => (
                    <div key={item.id} onClick={() => setActiveIndex(index)}>
                        <img src={item.image} alt={item.alt} />
                    </div>
                ))}
            </div>

            {showWelcomePopup &&
                createPortal(
                    <div
                        className="welcome-popup-overlay"
                        onClick={() => setShowWelcomePopup(false)}
                    >
                        <div
                            className="welcome-popup"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="welcome-popup-close"
                                onClick={() => setShowWelcomePopup(false)}
                            >
                                ✕
                            </button>

                            <img
                                src={poster1}
                                alt="Welcome"
                            />
                        </div>
                    </div>,
                    document.body
                )}
            {activeIndex !== null &&
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
                                src={images[activeIndex].image}
                                alt={images[activeIndex].alt}
                            />

                            <button className="lightbox-next" onClick={nextImage}>
                                ❯
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default PosterView;