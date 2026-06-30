import React, { useEffect, useState } from "react";
import LandingCard from "./LandingCard";
import Icon1 from "../../Assets/icons/Plot Sale Services.png";
import Icon2 from "../../Assets/icons/Liasoning Services.png";
import Icon3 from "../../Assets/icons/Property Services.png";
import Icon4 from "../../Assets/icons/Construction Services.png";
import { LucidePlus } from "lucide-react";
import NiEdit from "../../icons/ni-edit";
import NiDelete from "../../icons/ni-delete";
import AddLocationModal from "../Modals/AddLocationModal";
import {
  deleteFooterContact,
  deleteSocialMedia,
  updateFooter,
} from "../../Pages/LandingSetting/LandingApi";
import { getLandingPage } from "../../Redux/Slices/AppSlices";
import { useDispatch } from "react-redux";

const Home = ({ data, setAlert }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(""); // "banner" | "service" | "testimonial"
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
        preview: URL.createObjectURL(file), // for preview
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    if (selectedItem) {
      setFormData(selectedItem);
    } else {
      setFormData({});
    }
  }, [selectedItem]);

  const handleAdd = (section) => {
    setType(section);
    setSelectedItem(null);
    setIsEditMode(false);
    setOpen(true);
  };

  const handleEdit = (section, item) => {
    setType(section);
    setSelectedItem(item);
    setIsEditMode(true);
    setOpen(true);
  };

  const [homePageData, setHomePageData] = useState({
    contact: [],
    socialmedia: [],
  });

  useEffect(() => {
    if (data) {
      setHomePageData(data);
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let updatedData = {
        ...homePageData,
        contact: [...(homePageData.contact || [])],
        socialmedia: [...(homePageData.socialmedia || [])],
      };

      if (type === "contact" || type === "socialmedia") {
        if (isEditMode) {
          updatedData[type] = updatedData[type].map((item) =>
            item._id === selectedItem._id
              ? {
                  ...item,
                  ...formData,
                }
              : item,
          );
        } else {
          updatedData[type].push({
            ...formData,
          });
        }
      }

      const res = await updateFooter(updatedData);
      dispatch(getLandingPage());
      setHomePageData(res);

      setAlert({
        message: `${isEditMode ? "Updated" : "Added"} successfully!`,
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);

      setFormData({});
      setOpen(false);
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  };

  return (
    <>
      <div className="table-filters">
        <h4>Contact</h4>
        {/* <div className="page-tools">
          <button className="add-button" onClick={() => handleAdd("contact")}>
            <LucidePlus /> Add
          </button>
        </div> */}
      </div>
      <div className="user-card-box">
        {homePageData.contact.map((contact) => (
          <LandingCard
            key={contact._id}
            p={contact}
            onEdit={() => handleEdit("contact", contact)}
          />
        ))}
      </div>
      <div className="table-filters">
        <h4>Social Media</h4>
        {/* <div className="page-tools">
          <button
            className="add-button"
            onClick={() => handleAdd("socialmedia")}
          >
            <LucidePlus /> Add
          </button>
        </div> */}
      </div>
      <div className="user-card-box">
        {homePageData.socialmedia.map((socialmedia) => (
          <LandingCard
            key={socialmedia._id}
            p={socialmedia}
            onEdit={() => handleEdit("socialmedia", socialmedia)}
          />
        ))}
      </div>

      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? `Edit ${type}` : `Add ${type}`}
      >
        <div className="field">
          {type === "contact" && (
            <>
              <input
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Office Title"
                disabled
              />

              <textarea
                name="content"
                value={formData.content || ""}
                onChange={handleChange}
                placeholder="Office Address"
              />
            </>
          )}
          {type === "socialmedia" && (
            <>
              <input
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Platform (e.g. Facebook)"
                disabled
              />

              <input
                name="content"
                value={formData.content || ""}
                onChange={handleChange}
                placeholder="Profile URL"
              />
            </>
          )}
        </div>
        <div className="modal-actions">
          <button
            onClick={() => {
              handleSave();
            }}
          >
            {saving ? "saving..." : isEditMode ? "Update " : "Add"}
          </button>
        </div>
      </AddLocationModal>
    </>
  );
};

export default Home;
