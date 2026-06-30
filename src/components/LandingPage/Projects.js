import React from "react";
import "./Projects.css";
// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import PlotCardUsers from "../Cards/PlotCardUsers";

const Projects = ({data}) => {
    
    const plot = data
    return (
        <div className="landing-pages">
            <h2>Latest Projects</h2>
            <Swiper
                modules={[Navigation]}
                spaceBetween={24}
                slidesPerView={3}
                navigation
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                    },
                    640: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                }}
                className="projects-swiper"
            >
                {plot?.map((p, index) => (
                    <SwiperSlide key={index}>
                        <PlotCardUsers p={p} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Projects;
