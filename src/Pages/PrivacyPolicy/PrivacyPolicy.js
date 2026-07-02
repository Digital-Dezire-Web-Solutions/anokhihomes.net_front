import React from "react";
import LBreadcrumb from "../../components/LandingPage/LBreadcrumb";
import PolicyData from "../../components/Data/PolicyData";
import { Link } from "react-router-dom";

const PrivacyPolicy = ({ data }) => {
  // console.log(data.policies, "policies");
  return (
    <>
      <div className="landing-head-box">
        <div className="landing-head">
          <div className="landing-top">
            <h1>Privacy Policy</h1>
          </div>
          <LBreadcrumb />
        </div>
      </div>
      <div className="landing-pages">
        {data?.policies?.privacy?.sections?.map((section) => (
          <div key={section._id}>
            {section.heading && <h2>{section.heading}</h2>}
            {section.content && <p>{section.content}</p>}
          </div>
        ))}
        <p>
          If you wish to permanently delete your account and all associated
          data, you can submit an account deletion request by visiting our{" "}
          <Link
            to="/delete-account"
            style={{
              color: "var(--mood-color)",
              fontWeight: "600",
              textDecoration: "underline",
            }}
          >
            Account Deletion Request
          </Link>
          .
        </p>
      </div>
    </>
  );
};

export default PrivacyPolicy;
