// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "./Testimonial.css";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

const Testimonial = ({ data }) => {
  const ServicesData = data?.testimonials;
  return (
    <div className="landing-pages">
      <h2>Testimonial</h2>
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={24}
        slidesPerView={2}
        navigation
        autoplay={{
          delay: 8000, // 3 seconds
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        breakpoints={{
          0: {
            slidesPerView: 1,
          },
          640: {
            slidesPerView: 2,
          },
        }}
        className="projects-swiper"
      >
        {ServicesData?.map((p, index) => (
          <SwiperSlide key={index}>
            <div className="Testimonial-card card">
              <div className="Testimonial-details">
                <FaQuoteLeft className="svg-left" />
                <p>{p.content}</p>
                <FaQuoteRight className="svg-right" />
              </div>
              <div className="Testimonial-img">
                <img src={p.image} alt="" />
                <div className="testimonial-title">
                  <h3>{p.name}</h3>
                  <p>{p.position}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Testimonial;
