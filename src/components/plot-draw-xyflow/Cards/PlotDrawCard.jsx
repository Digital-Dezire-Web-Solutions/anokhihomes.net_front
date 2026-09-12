import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Maximize, Minimize } from "lucide-react";
import AdminPanel from "../PlotDraw/AdminPanel";
import PlotCanvas from "../PlotDraw/PlotCanvas";
import { TOOLS } from "../PlotDraw/Tools";
import "../PlotDraw/plot-draw.css";
import Host from "../../../Host/Host";
import PlotModal from "../../PlotDraw/PlotModal";

const PlotDrawCard = ({ data, mood, setAlert, projectId }) => {
  const isAdmin = mood === "admin";

  const [tool, setTool] = useState(TOOLS.SELECT);
  const [plots, setPlots] = useState([]);
  const [mainPlot, setMainPlot] = useState(null);
  const [selectedType, setSelectedType] = useState("FOR_SALE");
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [bg, setBg] = useState(null);
  const [snapSize, setSnapSize] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef(null);

  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (!projectId || !data) return;
    setMainPlot(data.mainPlot || null);
    setPlots(data.plots || []);
  }, [data, projectId]);

  const handleBackgroundImage = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setBg({
          src: reader.result,
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          opacity: 0.6,
        });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const saveLayout = async () => {
    try {
      const token = localStorage.getItem("token");

      const cleanedPlots = plots.map((p) => {
        const isTemp = typeof p._id === "string" && p._id.startsWith("plot_");
        if (!isTemp) return p;
        const { _id, ...rest } = p;
        return rest;
      });

      const layout = {
        mainPlot,
        plots: cleanedPlots,
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
      setAlert({ message: "Plot Saved successfully!", status: "Success" });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error(error);
      setAlert({ message: "Failed To Save Plot!", status: "Error" });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const deleteSelectedPlot = useCallback(() => {
    if (!selectedPlot?._id) return;
    setPlots((prev) => prev.filter((p) => p._id !== selectedPlot._id));
    setSelectedPlot(null);
  }, [selectedPlot]);

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

  console.log(selectedPlot,"selectedPlot")

  return (
    <div ref={wrapperRef} className={`plot-draw-wrapper ${isFullscreen ? "is-fullscreen" : ""}`}>
      {isAdmin && (
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
          deleteSelected={deleteSelectedPlot}
          hasSelection={!!selectedPlot?._id}
          saveLayout={saveLayout}
          onBackgroundImage={handleBackgroundImage}
          bg={bg}
          setBg={setBg}
          snapSize={snapSize}
          setSnapSize={setSnapSize}
        />
      )}

      <button
        className="fullscreen-toggle-btn"
        title={isFullscreen ? "Exit full screen" : "Full screen"}
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      <PlotCanvas
        mood={mood}
        isAdmin={isAdmin}
        tool={tool}
        setTool={setTool}
        mainPlot={mainPlot}
        setMainPlot={setMainPlot}
        plots={plots}
        setPlots={setPlots}
        selectedType={selectedType}
        onSelectPlot={setSelectedPlot}
        bg={bg}
        setBg={setBg}
        snapSize={snapSize}
        fullscreen={isFullscreen}
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
    </div>
  );
};

export default PlotDrawCard;
