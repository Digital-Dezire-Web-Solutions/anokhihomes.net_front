import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Maximize, Minimize, Pencil, X } from "lucide-react";
import AdminPanel from "../PlotDraw/AdminPanel";
import PlotCanvas from "../PlotDraw/PlotCanvas";
import { TOOLS } from "../PlotDraw/Tools";
import "../PlotDraw/plot-draw.css";
import Host from "../../../Host/Host";
import PlotModal from "../../PlotDraw/PlotModal";

const PlotDrawCard = ({ data, mood, setAlert, projectId }) => {
  const isAdmin = mood === "admin";

  const [editMode, setEditMode] = useState(false);
  const canEdit = isAdmin && editMode; // tools + canvas editing only while editing

  const [tool, setTool] = useState(TOOLS.SELECT);
  const [plots, setPlots] = useState([]);
  const [mainPlot, setMainPlot] = useState(null);
  const [selectedType, setSelectedType] = useState("FOR_SALE");
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [bg, setBg] = useState(null);
  const [snapSize, setSnapSize] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef(null);

  // last saved layout: what "Cancel" goes back to
  const savedLayout = useRef({ mainPlot: null, plots: [] });

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
    const layout = {
      mainPlot: data.mainPlot || null,
      plots: data.plots || [],
    };
    savedLayout.current = layout;
    setMainPlot(layout.mainPlot);
    setPlots(layout.plots);
  }, [data, projectId]);

  // switching to another colony always goes back to view mode
  useEffect(() => {
    setEditMode(false);
    setTool(TOOLS.SELECT);
    setSelectedPlot(null);
    setBg(null);
  }, [projectId]);

  const leaveEditMode = () => {
    setTool(TOOLS.SELECT);
    setSelectedPlot(null);
    setBg(null);
    setEditMode(false);
  };

  const cancelEdit = () => {
    const changed =
      JSON.stringify({ mainPlot, plots }) !==
      JSON.stringify(savedLayout.current);

    if (changed && !window.confirm("Discard unsaved changes?")) return;

    setMainPlot(savedLayout.current.mainPlot);
    setPlots(savedLayout.current.plots);
    leaveEditMode();
  };

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

      // use what the server saved: new plots now carry their real _id
      const saved = Array.isArray(res.data?.plots)
        ? {
            mainPlot: res.data.mainPlot || null,
            plots: res.data.plots,
          }
        : { mainPlot, plots: cleanedPlots };

      savedLayout.current = saved;
      setMainPlot(saved.mainPlot);
      setPlots(saved.plots);

      setAlert({ message: "Plot Saved successfully!", status: "Success" });
      setTimeout(() => setAlert(null), 3000);

      leaveEditMode(); // back to the read-only view
    } catch (error) {
      console.error(error);
      setAlert({
        message: error.response?.data?.message || "Failed To Save Plot!",
        status: "Error",
      });
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

        // sync selected plot
        if (selectedPlot?._id === id) {
          setSelectedPlot(updatedPlot);
        }

        return updatedPlot;
      }),
    );
  };

  return (
    <div
      ref={wrapperRef}
      className={`plot-draw-wrapper ${isFullscreen ? "is-fullscreen" : ""}`}
    >
      {canEdit && (
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

      {isAdmin &&
        (canEdit ? (
          <button className="plot-edit-btn cancel" onClick={cancelEdit}>
            <X size={16} /> Cancel
          </button>
        ) : (
          <button className="plot-edit-btn" onClick={() => setEditMode(true)}>
            <Pencil size={16} /> Edit
          </button>
        ))}

      <button
        className="fullscreen-toggle-btn"
        title={isFullscreen ? "Exit full screen" : "Full screen"}
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      <PlotCanvas
        mood={mood}
        isAdmin={canEdit}
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
          readOnly={!canEdit}
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