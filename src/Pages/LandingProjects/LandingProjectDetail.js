import React, { useEffect, useState } from "react";
import ProjectDetail from "../Plot/ProjectDetail";
import LBreadcrumb from "../../components/LandingPage/LBreadcrumb";
import PlotCardUsers from "../../components/Cards/PlotCardUsers";
import PlotDrawCard from "../../components/Cards/PlotDrawCard";
import ProjectData from "../Plot/PlotData";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getPlots } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";

const LandingProjectDetail = ({ data, mood, setAlert }) => {
  const location = useLocation();
  // console.log(location.state);
  const projectData = location;
  const projectName = projectData?.state?.project?.name;
  const navigate = useNavigate();
  const projectId = projectData?.state?.project?._id;
  console.log(projectData, "projectData");
  console.log(projectId, "projectId");
  const dispatch = useDispatch();
  const { plots } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getPlots(projectId));
  }, [projectId]);

  // console.log(projectId,"projectId")
  // console.log(plots,"plots")

  if (!plots) return <p>Project not found</p>;
  return (
    <>
      <div className="landing-head-box">
        <div className="landing-head">
          <div className="landing-top">
            <h1>Projects</h1>
          </div>
          <LBreadcrumb />
        </div>
      </div>
      <div className="landing-pages">
        <h2>{projectName}</h2>
        <PlotDrawCard
          data={plots}
          mood={mood}
          setAlert={setAlert}
          projectId={projectId}
        />
      </div>
    </>
  );
};

export default LandingProjectDetail;
