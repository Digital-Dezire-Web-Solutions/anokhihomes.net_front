import React, { useEffect } from "react";
import "./Contact.css";
import { Link, useLocation } from "react-router-dom";
import {
  FaEnvelope,
  FaFacebook,
  FaLinkedin,
  FaPhoneAlt,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import LBreadcrumb from "../../components/LandingPage/LBreadcrumb";
import Form from "../../components/Form/Form";
import { AiFillInstagram } from "react-icons/ai";

const Contact = ({ data }) => {
  const email = data?.footer?.contact?.find(
    (i) => i.title === "Email Address",
  )?.content;

  const socialMedia = data?.footer?.socialmedia || [];
  console.log(socialMedia,"socialMedia")

  const getSocialIcon = (title) => {
    switch (title?.toLowerCase()) {
      case "facebook":
        return <FaFacebook />;

      case "twitter":
        return <FaTwitter />;

      case "linkedin":
        return <FaLinkedin />;

      case "instagram":
        return <AiFillInstagram />;

      case "youtube":
        return <FaYoutube />;

      default:
        return null;
    }
  };
  return (
    <>
      <div className="landing-head-box">
        <div className="landing-head">
          <div className="landing-top">
            <h1>Contact Us</h1>
          </div>
          <LBreadcrumb />
        </div>
      </div>
      <div className="landing-pages">
        <div className="contact-container">
          {/* LEFT IMAGE */}
          <div className="contact-left">
            <img
              src="https://images.unsplash.com/photo-1591389703635-e15a07b842d7?q=80&w=2833&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Contact"
            />
            <div className="contact-left-items">
              <Link to={`mailto:${email}`} className="contact-bottom-box card">
                <h5>
                  <FaEnvelope /> Email Address
                </h5>

                <p>{email}</p>
              </Link>
            </div>
            <div className="contact-socail-box">
              {socialMedia.map((item) => (
                <Link
                  key={item._id}
                  to={item.content}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(item.title)}
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="contact-right">
            <div className="test-right">
              <span>Contact Us</span>
              <h2>Get in Touch with Us</h2>
              <Form />
            </div>
          </div>
        </div>
        {/* <div className="contact-bottom">
          <Link to="tel:+918792405697" className="contact-bottom-box card">
            <FaPhoneAlt />
            <h5>Call Cs Any Time!</h5>
            <p>+91 87924 05697</p>
          </Link>
          <Link
            to="mailto:ssadmission732@gmail.com"
            className="contact-bottom-box card"
          >
            <FaEnvelope />
            <h5>Send Us E-mail</h5>
            <p>ssadmission732@gmail.com</p>
          </Link>
          <div className="contact-bottom-box card">
            <div className="contact-socail-box">
              <FaFacebook />
              <FaTwitter />
              <FaLinkedin />
              <AiFillInstagram />
            </div>
            <h5>Social Media</h5>
          </div>
        </div> */}
        <div className="contact-bottom">
          {data?.contact?.address?.map((item) => (
            <div className="contact-bottom-box card">
              <FaLocationDot />
              <h5>{item?.title}</h5>
              <p>{item?.content}</p>
            </div>
          ))}
          {/* <div className="contact-bottom-box card">
            <FaLocationDot />
            <h5>Branch Office 1</h5>
            <p>
              Basement of Najo Bazar, JK Tower, Qamaruddin Gunj, Biharsharif,
              Nalanda - 803101
            </p>
          </div>
          <div className="contact-bottom-box card">
            <FaLocationDot />
            <h5>Branch Office 2</h5>
            <p>
              Beside Prabha Inn, Baitarani Road Rajgir, Nalanda, Bihar - 803116
            </p>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Contact;
