import React from "react";
import "./Footer.css";
import {
  FaEnvelope,
  FaFacebook,
  FaLinkedin,
  FaPhoneAlt,
  FaYoutube,
} from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { Link, NavLink } from "react-router-dom";
import { FaLocationDot, FaXTwitter } from "react-icons/fa6";
import Logo from "../../Assets/Logo/logo-anokhi-home-green.png";
import { MdChevronRight } from "react-icons/md";
import AdminLogo from "../../Assets/Logo/logo-anokhi-home-parpul.png";
import StaffLogo from "../../Assets/Logo/logo-anokhi-home-green.png";
import AgentLogo from "../../Assets/Logo/logo-anokhi-home-blue.png";
import UserLogo from "../../Assets/Logo/logo-anokhi-home-yellow.png";

const Footer = ({ data, mood }) => {
  return (
    <footer className="footer">
      {/* TOP */}
      <div className="footer-top landing-pages">
        {/* Company */}
        <div className="footer-col">
          {mood === "admin" ? (
            <img className="footer-logo" src={AdminLogo} alt="" />
          ) : mood === "staff" ? (
            <img className="footer-logo" src={StaffLogo} alt="" />
          ) : mood === "agent" ? (
            <img className="footer-logo" src={AgentLogo} alt="" />
          ) : (
            <img className="footer-logo" src={UserLogo} alt="" />
          )}
          {/* <img className="footer-logo" src={Logo} alt="" /> */}
          {/* <div className="footer-logo">
                        <Logo />
                    </div> */}
          <p>
            At Anokhi Homes, we don't just sell plots we help you own a piece of
            your future, where your dreams take root and your legacy begins.
          </p>
        </div>

        {/* Useful Links */}
        <div className="footer-col">
          {/* <h4>Useful Links</h4> */}
          <ul className="footer-navitems">
            <li>
              <NavLink to="/contact">
                <MdChevronRight /> Contact Us
              </NavLink>
            </li>
            <li>
              <NavLink to="/">
                <MdChevronRight /> Career
              </NavLink>
            </li>
            <li>
              <NavLink to="/privacy-policy">
                <MdChevronRight /> Privacy Policy
              </NavLink>
            </li>
            <li>
              <NavLink to="/term-condition">
                <MdChevronRight /> Terms & Conditions
              </NavLink>
            </li>
            <li>
              <NavLink to="/cancellation-refund">
                <MdChevronRight /> Cancellation and Refund Policy
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <ul className="footer-contact">
            {data?.footer?.contact?.map((item) => (
              <li key={item._id}>
                {item.title === "Email Address" && <FaEnvelope />}
                {item.title === "Location" && <FaLocationDot />}
                {item.content}
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <div className="social-icons">
            {data?.footer?.socialmedia?.map((item) => {
              const title = item.title?.toLowerCase();

              return (
                <Link
                  key={item._id}
                  to={item.content}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {title === "facebook" && <FaFacebook />}
                  {title === "instagram" && <AiFillInstagram />}
                  {title === "linkedin" && <FaLinkedin />}
                  {(title === "twitter" || title === "x") && <FaXTwitter />}
                  {title === "youtube" && <FaYoutube />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom landing-pages">
        <p>© 2026 Anokhi Homes Private Limited | All rights reserved.</p>
        <p>
          Developed by :{" "}
          <Link
            to={"https://digitaldezire.com/"}
            style={{ textDecoration: "none" }}
          >
            <span>Digital Dezire</span>
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
