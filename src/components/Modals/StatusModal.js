import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import React from "react";

const StatusModal = ({ status }) => {
  return (
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      {status === "success" ? (
        <div className="status-box">
          <DotLottieReact
            className="status-loader"
            src="https://lottie.host/af27d778-e933-4111-8c85-62d5bb650cac/etKsJ4brV6.lottie"
            loop
            autoplay
            onError={(e) => console.error("Lottie load error:", e)}
          />
          <h2>Success!</h2>
          <p>Your action was completed successfully.</p>
        </div>
      ) : status === "error" ? (
        <div className="status-box">
          <DotLottieReact
            className="status-loader"
            src="https://lottie.host/0969dd2c-3c8e-460b-92e5-d488b6b755b8/EjeZPo53RS.lottie"
            loop
            autoplay
            onError={(e) => console.error("Lottie load error:", e)}
          />
          <h2>Error</h2>
          <p>There was an issue completing your action. Please try again.</p>
        </div>
      ) : (
        <div className="status-box">
          <DotLottieReact
            className="status-loader"
            src="https://lottie.host/3c8d2a19-c02c-431d-867a-26a9e88d13a9/wpzf5X1FoZ.lottie"
            loop
            autoplay
            onError={(e) => console.error("Lottie load error:", e)}
          />
          <h2>Processing...</h2>
          <p>Your action is being processed. Please wait.</p>
        </div>
      )}
    </div>
  );
};

export default StatusModal;
