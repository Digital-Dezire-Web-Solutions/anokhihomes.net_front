import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProjectData from "./PlotData";
import AdminPanel from "../../components/PlotDraw/AdminPanel";
import PlotCanvas from "../../components/PlotDraw/PlotCanvas";
import PlotModal from "../../components/PlotDraw/PlotModal";
import { polygonArea } from "../../components/PlotDraw/geometry";
import { TOOLS } from "../../components/PlotDraw/Tools";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { ChevronLeft } from "lucide-react";
import PlotDrawCard from "../../components/Cards/PlotDrawCard";
import { useDispatch, useSelector } from "react-redux";
import { getPlots } from "../../Redux/Slices/AppSlices";

const ProjectDetail = ({ mood, setAlert }) => {
  const location = useLocation();
  // console.log(location.state);
  const projectData = location;
  const projectName = projectData?.state?.project?.name;
  const navigate = useNavigate();
  const  projectId  = projectData?.state?.project?._id;
// console.log(projectData,"projectData")
  const dispatch = useDispatch();
  const { plots } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getPlots(projectId));
  }, [projectId]);

  // console.log(projectId,"projectId")
  // console.log(plots,"plots")

  if (!plots) return <p>Project not found</p>;

  return (
    <div className="plot-container product-detail">
      <div className="table-filters">
        <div className="page-head-title">
          <div className="page-tools">
            <ChevronLeft className="back-button" onClick={() => navigate(-1)} />
            <h2>{projectName}</h2>
          </div>
          <Breadcrumb />
        </div>
      </div>
      <PlotDrawCard data={plots} mood={mood} setAlert={setAlert} />
    </div>
  );
};

export default ProjectDetail;
