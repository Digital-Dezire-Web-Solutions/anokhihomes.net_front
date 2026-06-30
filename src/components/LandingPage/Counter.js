import React, { useEffect, useRef, useState } from "react";
import "./Counter.css";
import { FaUsers } from "react-icons/fa";
import { LuLandPlot } from "react-icons/lu";
import { GoLaw } from "react-icons/go";
import { SiTicktick } from "react-icons/si";

const Counter = () => {
  const counters = [
    { icon: <SiTicktick />, num: 1, label: "Years Completed" },
    { icon: <LuLandPlot />, num: 500, label: "Plot Sold" },
    { icon: <FaUsers />, num: 100, label: "Team Associates" },
    { icon: <GoLaw />, num: 100, label: "Legal Support" },
  ];

  const [counts, setCounts] = useState(counters.map(() => 0));
  const [startAnimation, setStartAnimation] = useState(false);
  const sectionRef = useRef(null);

  // Start animation when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartAnimation(true);
          observer.disconnect(); // Run only once
        }
      },
      {
        threshold: 0.3, // 30% visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    if (!startAnimation) return;

    counters.forEach((item, index) => {
      const end = item.num;
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = Math.floor(progress * end);

        setCounts((prev) => {
          const updated = [...prev];
          updated[index] = value;
          return updated;
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    });
  }, [startAnimation]);

  return (
    <div className="landing-pages" ref={sectionRef}>
      <div className="testimonial-box">
        <div className="counter-grid">
          {counters.map((item, i) => (
            <div className="counter-bx" key={i}>
              <div className="counter-icon">{item.icon}</div>

              <div className="counter-num">
                <h3 className="count">
                  {counts[i]}
                  {i === 3 ? "%" : "+"}
                </h3>
                <span>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Counter;