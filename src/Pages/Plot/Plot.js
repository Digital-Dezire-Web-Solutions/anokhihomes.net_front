import React, { useEffect, useState } from "react";
import "./Plot.css";
import ProjectCards from "../../components/Cards/ProjectCards";
import ProjectData from "./PlotData";
import SearchItems from "../../components/SearchItems/SearchItems";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { LucidePlus } from "lucide-react";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import NiSearch from "../../icons/ni-search";
import { getLocation } from "../../Redux/Slices/AppSlices";
import { useDispatch, useSelector } from "react-redux";
import Host from "../../Host/Host";
import axios from "axios";

const PlotList = ({ mood, setAlert }) => {
  const dispatch = useDispatch();
  const { location } = useSelector((state) => state.app);

  useEffect(() => {
    dispatch(getLocation());
  }, []);
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    if (selectedLocation) {
      setFormData({
        name: selectedLocation.name || "",
        description: selectedLocation.description || "",
        image: selectedLocation.image || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        image: "",
      });
    }
  }, [selectedLocation]);

  const handleAddLocation = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token");
      
      await axios.post(`${Host}/api/location/add`, formData, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
        },
      });
      
      dispatch(getLocation());
      
      setAlert({
        message: "Location added successfully!",
        status: "Success",
      });
      
      setOpen(false);
      
      setFormData({
        name: "",
        description: "",
        image: "",
      });
      
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    } catch (err) {
      console.log(err);
      
      setAlert({
        message: "Failed to add location",
        status: "Error",
      });
      
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    }
  };
  const handleEditLocation = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token");
      
      await axios.put(
        `${Host}/api/location/edit/${selectedLocation._id}`,
        formData,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
          },
        },
      );
      
      dispatch(getLocation());
      
      setAlert({
        message: "Location updated successfully!",
        status: "Success",
      });
      
      setOpen(false);
      
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    } catch (err) {
      console.log(err);
      
      setAlert({
        message: "Failed to update location",
        status: "Error",
      });
      
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    }
  };
  
  const handleDeleteLocation = async (id) => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token");
      
      await axios.delete(`${Host}/api/location/delete/${id}`, {
        headers: {
          "auth-token": token,
        },
      });
      
      dispatch(getLocation());
      
      setAlert({
        message: "Location deleted successfully!",
        status: "Success",
      });
      
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    } catch (err) {
      console.log(err);
      
      setAlert({
        message: "Failed to delete location",
        status: "Error",
      });
      
      setTimeout(() => {
        setAlert(null);
      }, 3000);
      setSaving(false)
    }
  };

  console.log(selectedLocation, "selectedLocation");
  console.log(formData, "formData");
  return (
    <div className="plot-container">
      <div className="table-filters">
        <div className="page-head-title">
          <h2>Trending Locations</h2>
          <Breadcrumb />
        </div>
        <div className="page-tools">
          <div className="searchItem">
            <NiSearch />
            <input
              placeholder="Search Location..."
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
        {location
          ?.filter((p) =>
            p?.name?.toLowerCase().includes(search?.toLowerCase() || ""),
          )
          .map((p) => (
            <ProjectCards
              p={p}
              setSelectedLocation={setSelectedLocation}
              setIsEditMode={setIsEditMode}
              setOpen={setOpen}
              mood={mood}
              setAlert={setAlert}
              onDelete={handleDeleteLocation}
            />
          ))}
      </div>
      {/* ADD LOCATION MODAL */}
      <AddLocationModal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedLocation(null);
          setIsEditMode(false);
          // setFormData({
          //   name: "",
          //   description: "",
          //   image: "",
          // });
        }}
        title={isEditMode ? "Edit Location" : "Add Location"}
      >
        <div className="field">
          <label>Image</label>
          <input
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            placeholder="Image"
          />
        </div>
        <div className="field">
          <label>Location Name</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Location Name"
          />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            placeholder="Description"
          />
        </div>
        {/* <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</p> */}
        <div className="modal-actions">
          <button onClick={isEditMode ? handleEditLocation : handleAddLocation}>
            {isEditMode ? "Update Location" : "Add Location"}
          </button>
        </div>
      </AddLocationModal>
    </div>
  );
};

export default PlotList;
