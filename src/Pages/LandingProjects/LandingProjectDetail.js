import React, { useEffect, useState } from "react";
import ProjectDetail from "../Plot/ProjectDetail";
import LBreadcrumb from "../../components/LandingPage/LBreadcrumb";
import PlotCardUsers from "../../components/Cards/PlotCardUsers";
import PlotDrawCard from "../../components/Cards/PlotDrawCard";
import ProjectData from "../Plot/PlotData";
import { useParams } from "react-router-dom";
import { getPlots } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";

const LandingProjectDetail = ({ data }) => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { plots } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getPlots(projectId));
  }, [projectId]);
  const [project, setProject] = useState(plots);

  if (!project) return <p>Project not found</p>;
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
        <h2>{project?.name}</h2>
        <PlotDrawCard data={plots} />
      </div>
    </>
  );
};

export default LandingProjectDetail;
