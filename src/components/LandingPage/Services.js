// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "./Services.css";
import "swiper/css/navigation";

const Services = ({ data }) => {
  const ServicesData = data?.services;
  return (
    <div className="landing-pages">
      <h2>Your Trusted Partner</h2>
      <p>
        Anokhi Homes Pvt. Ltd. proudly presents premium real estate solutions
        with a commitment to honesty, transparency, and customer satisfaction.
      </p>
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={24}
        slidesPerView={3}
        navigation
        // modules={[Autoplay]}
        // speed={5000}
        autoplay={{
          delay: 3000, // 3 seconds
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
          1024: {
            slidesPerView: 3,
          },
        }}
        className="projects-swiper"
      >
        {ServicesData?.map((p, index) => (
          <SwiperSlide key={index}>
            <div className="plot-card card Services-card">
              <div className="plot-img service-images">
                <img src={p.image} alt="" />
              </div>
              <div className="plot-details">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Services;
