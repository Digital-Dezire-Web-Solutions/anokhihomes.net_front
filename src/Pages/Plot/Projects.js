import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./Plot.css";
import PlotCard from "../../components/Cards/PlotCard";
import ProjectData from "./PlotData";
import SearchItems from "../../components/SearchItems/SearchItems";
import { ChevronLeft, LucidePlus } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import NiSearch from "../../icons/ni-search";
import { useDispatch, useSelector } from "react-redux";
import { getCashback, getProjects } from "../../Redux/Slices/AppSlices";
import Host from "../../Host/Host";
import axios from "axios";
import { uploadImage } from "../LandingSetting/LandingApi";

const Projects = ({ mood, setAlert }) => {
  const location = useLocation();
  const plotData = location.state;
  let plotId = plotData?._id;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { projects, cashbackData } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getProjects(plotId));
    dispatch(getCashback());
  }, [plotId]);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState();
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    area: "",
    priceRange: "",
  });

  useEffect(() => {
    if (selectedProject) {
      setFormData({
        name: selectedProject.name || "",
        image: selectedProject.image || "",
        area: selectedProject.area || "",
        priceRange: selectedProject.priceRange || "",
      });
    } else {
      setFormData({
        name: "",
        image: "",
        area: "",
        priceRange: "",
      });
    }
  }, [selectedProject]);

  const handleFileUpload = (file) => {
    if (!file) return;

    const MAX_SIZE = 20 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      setAlert({
        message: "Image size should not exceed 20 MB",
        status: "Error",
      });

      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleAddPlots = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      let imageUrl = "";

      if (formData.image) {
        const upload = await uploadImage(formData.image);
        imageUrl = upload.url;
      }

      const payload = {
        name: formData.name,
        image: imageUrl,
        area: formData.area,
        priceRange: formData.priceRange,
        locationId: plotId,
      };

      await axios.post(`${Host}/api/colony/add`, payload, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      dispatch(getProjects(plotId));

      setAlert({
        message: "Project added successfully!",
        status: "Success",
      });

      setOpen(false);

      setFormData({
        name: "",
        image: "",
        area: "",
        priceRange: "",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (err) {
      console.log(err);

      setAlert({
        message: "Failed to add project",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  const handleEditPlots = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      let imageUrl = selectedProject.image;

      if (formData.image instanceof File) {
        const upload = await uploadImage(formData.image);
        imageUrl = upload.url;
      }

      const payload = {
        name: formData.name,
        image: imageUrl,
        area: formData.area,
        priceRange: formData.priceRange,
      };

      await axios.put(
        `${Host}/api/colony/edit/${selectedProject._id}`,
        payload,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        },
      );

      dispatch(getProjects(plotId));

      setAlert({
        message: "Project updated successfully!",
        status: "Success",
      });

      setOpen(false);
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (err) {
      console.log(err);

      setAlert({
        message: "Failed to update project",
        status: "Error",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      await axios.delete(`${Host}/api/colony/delete/${id}`, {
        headers: {
          "auth-token": token,
        },
      });

      dispatch(getProjects(plotId));

      setAlert({
        message: "Project deleted successfully!",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (err) {
      console.log(err);

      setAlert({
        message: "Failed to delete project",
        status: "Error",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    }
  };

  // const plot = ProjectData.find((p) => p.id === plotId);

  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <div className="page-tools">
            <ChevronLeft className="back-button" onClick={() => navigate(-1)} />
            <h2>{plotData?.name} Projects</h2>
          </div>
          <Breadcrumb />
        </div>
        <div className="page-tools">
          <div className="searchItem">
            <NiSearch />
            <input
              placeholder="Search Project..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
          {mood === "admin" && (
            <button className="add-button" onClick={() => setOpen(true)}>
              <LucidePlus /> Add
            </button>
          )}
        </div>
      </div>

      <div className="plot-grid ">
        {projects?.length === 0 ? (
          <div className="no-data">
            <p>No Colony Found</p>
          </div>
        ) : (
          projects

            ?.filter((p) =>
              p?.name?.toLowerCase().includes(search?.toLowerCase() || ""),
            )

            .map((p) => {
              const cashback = cashbackData?.find(
                (c) => c.colonyId?._id === p._id,
              );

              return (
                <PlotCard
                  key={p._id}
                  p={p}
                  cashback={cashback}
                  mood={mood}
                  setSelectedProject={setSelectedProject}
                  setIsEditMode={setIsEditMode}
                  setOpen={setOpen}
                  setAlert={setAlert}
                  onDelete={handleDeleteProject}
                  plotData={plotData}
                  saving={saving}
                />
              );
            })
          // ?.filter((p) =>
          //   p?.name?.toLowerCase().includes(search?.toLowerCase() || ""),
          // )
          // .map((p) => (
          //   <PlotCard
          //     p={p}
          //     plotId={plotId}
          //     mood={mood}
          //     setSelectedProject={setSelectedProject}
          //     setIsEditMode={setIsEditMode}
          //     setOpen={setOpen}
          //     setAlert={setAlert}
          //     onDelete={handleDeleteProject}
          //   />
          // ))
        )}
      </div>

      {/* ADD PLOT MODAL */}
      <AddLocationModal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedProject(null);
          setIsEditMode(false);

          setFormData({
            name: "",
            image: "",
            area: "",
            priceRange: "",
          });
        }}
        title={isEditMode ? "Edit Project" : "Add Project"}
      >
        <div className="field">
          <label>Project Name</label>

          <input
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            placeholder="Project Name"
          />
        </div>

        {/* <div className="field">
          <label>Image</label>

          <input
            value={formData.image}
            onChange={(e) =>
              setFormData({
                ...formData,
                image: e.target.value,
              })
            }
            placeholder="Image"
          />
        </div> */}
        <div className="field">
          <label>Image</label>

          {formData.image && (
            <img
              src={
                formData.image instanceof File
                  ? URL.createObjectURL(formData.image)
                  : formData.image
              }
              alt="Preview"
              className="image-preview-full"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
        </div>
        <div className="field">
          <label>Area in sqft</label>

          <input
            type="number"
            value={formData.area}
            onChange={(e) =>
              setFormData({
                ...formData,
                area: e.target.value,
              })
            }
            placeholder="Area"
          />
        </div>

        <div className="field">
          <label>Price Range in sqft</label>

          <input
            value={formData.priceRange}
            onChange={(e) =>
              setFormData({
                ...formData,
                priceRange: e.target.value,
              })
            }
            placeholder="Price Range"
          />
        </div>

        <div className="modal-actions">
          <button onClick={isEditMode ? handleEditPlots : handleAddPlots}>
            {saving
              ? "Saving..."
              : isEditMode
                ? "Update Project"
                : "Add Project"}
          </button>
        </div>
      </AddLocationModal>
    </div>
  );
};

export default Projects;
