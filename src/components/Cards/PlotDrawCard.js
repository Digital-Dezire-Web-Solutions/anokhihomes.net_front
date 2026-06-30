import React, { useEffect, useState } from "react";
import PlotModal from "../PlotDraw/PlotModal";
import PlotCanvas from "../PlotDraw/PlotCanvas";
import AdminPanel from "../PlotDraw/AdminPanel";
import { useNavigate, useParams } from "react-router-dom";
import { TOOLS } from "../PlotDraw/Tools";
import ProjectData from "../../Pages/Plot/PlotData";
import { polygonArea } from "../PlotDraw/geometry";
import Host from "../../Host/Host";
import axios from "axios";

const PlotDrawCard = ({ data, mood, setAlert, projectId }) => {
  // const { projectId } = useParams();
  // console.log(data,"data")
  // const [project, setProject] = useState(null);
  console.log(projectId,"projectId")

  const [tool, setTool] = useState(TOOLS.POLYGON);
  const [plots, setPlots] = useState([]);
  const [mainPlot, setMainPlot] = useState(null);
  const [selectedType, setSelectedType] = useState("FOR_SALE");
  const [selectedPlot, setSelectedPlot] = useState(null);

  useEffect(() => {
    if (!projectId || !data) return;

    setMainPlot(data.mainPlot || null);
    setPlots(data.plots || []);
  }, [data, projectId]);

  // console.log(mainPlot,"mainPlot")
  // console.log(plots,"plots")
  const updatePlot = (id, changes) => {
    setPlots((prevPlots) =>
      prevPlots.map((p) => {
        if (p._id !== id) return p;

        let updatedPlot;

        // Drag / resize
        if (typeof changes === "function") {
          updatedPlot = {
            ...p,
            points: changes(p.points),
          };
        } else {
          // Modal form update
          updatedPlot = {
            ...p,
            ...changes,
          };
        }

        // 🔥 sync selected plot
        if (selectedPlot?._id === id) {
          setSelectedPlot(updatedPlot);
        }

        return updatedPlot;
      }),
    );
  };

  useEffect(() => {
    if (!selectedPlot) return;
    const fresh = plots.find((p) => p._id === selectedPlot._id);
    if (fresh) {
      setSelectedPlot(fresh);
    }
  }, [plots, selectedPlot]);

  const saveLayout = async () => {
    try {
      const token = localStorage.getItem("token");

      const layout = {
        mainPlot,
        plots,
      };

      const res = await axios.post(
        `${Host}/api/plot/save/${projectId}`,
        { layout },
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Layout Saved", res.data);
      setAlert({
        message: "Plot Saved successfully!",
        status: "Success",
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error(error);

      setAlert({
        message: "Failed To Save Plot!",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <>
      <AdminPanel
        mood={mood}
        tool={tool}
        setTool={setTool}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        undoShape={() => setPlots((p) => p.slice(0, -1))}
        clearAll={() => {
          setMainPlot(null);
          setPlots([]);
        }}
      />

      <PlotCanvas
        mood={mood}
        tool={tool}
        mainPlot={mainPlot}
        setMainPlot={setMainPlot}
        plots={plots}
        setPlots={setPlots}
        selectedType={selectedType}
        onSelectPlot={setSelectedPlot}
        updatePlot={updatePlot}
        saveLayout={saveLayout}
      />

      {selectedPlot && (
        <PlotModal
          plot={selectedPlot}
          mood={mood}
          updatePlot={updatePlot}
          onClose={() => setSelectedPlot(null)}
          setAlert={setAlert}
          projectId={projectId}
        />
      )}
    </>
  );
};

export default PlotDrawCard;
