import React from "react";
import "./PanCard.css";
import Imblem from "../../Assets/Logo/indian-emblem.svg"

const PanCard = ({panVerifyData, formatDobForPan}) => {
  return (
    <div className="pancard-card">
      {/* HEADER */}
      <div className="pancard-header">
        <div className="pan-title left">
          <div className="hindi-title">आयकर विभाग</div>
          <div className="english-title">INCOME TAX DEPARTMENT</div>
        </div>

        <div className="pan-emblem">
          <img src={Imblem} alt="" />
        </div>

        <div className="pan-title right">
          <div className="hindi-title">भारत सरकार</div>
          <div className="english-title">GOVERNMENT OF INDIA</div>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="pancard-middle">
        <div className="pan-details">
          <div className="pan-name">
            {panVerifyData.name || "YOUR NAME HERE"}
          </div>

          <div className="pan-dob">
            DOB :{" "}
            {panVerifyData.dob
              ? formatDobForPan(panVerifyData.dob)
              : "00/00/0000"}
          </div>

          <div className="pan-number-title">स्थायी खाता संख्या कार्ड</div>
          <div className="pan-number-title">PERMANENT ACCOUNT NUMBER</div>

          <div className="pan-number">{panVerifyData.pan || "XXXXXXXXXX"}</div>

          <div className="pan-signature">
            <span className="signature-line">〰〰</span>
            <span>SIGNATURE</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="pan-images">
          {/* Government hologram */}
          <div className="pan-hologram">
            <span>भारत</span>
            <span>सरकार</span>
          </div>

          {/* Photo */}
          <div className="pan-photo">
            <div className="pan-photo-placeholder">👤</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanCard;
