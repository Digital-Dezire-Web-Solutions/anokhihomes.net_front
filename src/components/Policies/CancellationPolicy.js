import React from "react";
import PolicyData from "../Data/PolicyData";

const CancellationPolicy = ({landingPage}) => {
  console.log(landingPage?.policies,"landingPage")
  return (
    <div>
      {landingPage?.policies?.privacy?.sections?.map((section) => (
          <div key={section._id}>
            {section.heading && <h2>{section.heading}</h2>}
            {section.content && <p>{section.content}</p>}
          </div>
        ))}
    </div>
  );
};

export default CancellationPolicy;
