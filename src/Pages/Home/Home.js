import React from "react";
import "./Home.css";
import CTA from "../../components/LandingPage/CTA";
import Banner from "../../components/LandingPage/Banner";
import About from "../../components/LandingPage/About";
import Projects from "../../components/LandingPage/Projects";
import Services from "../../components/LandingPage/Services";
import Testimonial from "../../components/LandingPage/Testimonial";
import Counter from "../../components/LandingPage/Counter";
import WhyUs from "../../components/LandingPage/WhyUs";

const Home = ({data, allColonies}) => {
  return (
    <>
      <Banner data={data?.home?.banner}/>
      <About data={data?.about}/>
      <Counter/>
      <Projects data={allColonies}/>
      <WhyUs/>
      <Services data={data?.home}/>
      <Testimonial data={data?.home}/>
      <CTA />
    </>
  );
};

export default Home;
