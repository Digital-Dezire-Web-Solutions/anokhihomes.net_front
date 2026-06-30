import React, { useEffect, useState } from "react";
import LandingCard from "./LandingCard";
import Icon1 from "../../Assets/icons/Plot Sale Services.png";
import AddLocationModal from "../Modals/AddLocationModal";
import {
  updateAbout,
  uploadImage,
} from "../../Pages/LandingSetting/LandingApi";
import { useDispatch } from "react-redux";
import { getLandingPage } from "../../Redux/Slices/AppSlices";

const About = ({ data, setAlert }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];

      // 1 MB = 1024 * 1024 bytes
      if (file.size > 1024 * 1024) {
        setAlert({
          message: "Please upload an image smaller than 1 MB",
          status: "Error",
        });

        setTimeout(() => setAlert(null), 3000);

        e.target.value = "";
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: file,
        preview: URL.createObjectURL(file),
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

  const handleEdit = (section, item) => {
    setType(section);
    setSelectedItem(item);
    setIsEditMode(true);
    setOpen(true);
  };

  //   console.log(data, "data");
  const [homePageData, setHomePageData] = useState({
    about: {},
    mission: {},
    vision: {},
  });

  useEffect(() => {
    if (data) {
      setHomePageData(data);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      setSaving(true);
      let imageUrl = null;

      // Upload only if image is a File object
      if (formData.image instanceof File) {
        const uploadedImage = await uploadImage(formData.image);
        imageUrl = uploadedImage?.url;
      }

      let updatedData = {
        ...homePageData,
        about: { ...homePageData.about },
        mission: { ...homePageData.mission },
        vision: { ...homePageData.vision },
      };

      if (type === "about") {
        updatedData.about = {
          ...updatedData.about,
          ...formData,

          // if uploaded use new image
          // otherwise keep existing image/link
          image: imageUrl || formData.image || updatedData.about.image,
        };
      }

      if (type === "mission") {
        updatedData.mission = {
          ...updatedData.mission,
          ...formData,
        };
      }

      if (type === "vision") {
        updatedData.vision = {
          ...updatedData.vision,
          ...formData,
        };
      }

      await updateAbout(updatedData);

      setHomePageData(updatedData);

      dispatch(getLandingPage());

      setAlert({
        message: "Updated successfully!",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);

      setFormData({});
      setOpen(false);
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
      setAlert({
        message: "Failed to update",
        status: "Error",
      });

      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <>
      <h4>About</h4>
      <LandingCard
        p={homePageData.about}
        onEdit={() => handleEdit("about", homePageData.about)}
      />
      <h4>Our Mission</h4>
      <LandingCard
        p={homePageData.mission}
        onEdit={() => handleEdit("mission", homePageData.mission)}
      />
      <h4>Our Vision</h4>
      <LandingCard
        p={homePageData.vision}
        onEdit={() => handleEdit("vision", homePageData.vision)}
      />
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? `Edit ${type}` : `Add ${type}`}
      >
        <div className="field">
          {type === "about" && (
            <>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />

              {/* <input
                type="text"
                name="image"
                value={typeof formData.image === "string" ? formData.image : ""}
                onChange={handleChange}
                placeholder="Or paste image URL"
              /> */}
              <input
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="Service Title"
              />
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Service Description"
              />
              <textarea
                name="subdescription"
                value={formData.subdescription || ""}
                onChange={handleChange}
                placeholder="Service Sub-Description"
              />

              {(formData.preview || formData.image) && (
                <img
                  src={formData.preview || formData.image}
                  alt=""
                  width="80"
                />
              )}
            </>
          )}

          {type === "mission" && (
            <>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
              />
            </>
          )}

          {type === "vision" && (
            <>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
              />
            </>
          )}
        </div>
        <div className="modal-actions">
          <button
            onClick={() => {
              handleSave();
            }}
            disabled={saving}
          >
            {saving ? "Saving..." : isEditMode ? "Update " : "Add"}
          </button>
        </div>
      </AddLocationModal>
    </>
  );
};

export default About;
