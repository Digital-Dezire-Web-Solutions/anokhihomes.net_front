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
  deleteService,
  deleteTestimonial,
  updateHome,
  uploadImage,
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
  const [visibleCount, setVisibleCount] = useState(5);
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
    banner: {},
    services: [],
    testimonials: [],
  });
  useEffect(() => {
    if (data) {
      setHomePageData(data);
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    let uploadedImage = null;

    if (formData.image instanceof File) {
      const response = await uploadImage(formData.image);
      uploadedImage = response?.url;
    }
    try {
      let updatedData = {
        ...homePageData,
        services: [...(homePageData.services || [])],
        testimonials: [...(homePageData.testimonials || [])],
      };

      // ================= SERVICE =================

      if (type === "service") {
        if (isEditMode) {
          updatedData.services = updatedData.services.map((item) =>
            item._id === selectedItem._id
              ? {
                  ...item,
                  ...formData,
                  image: uploadedImage || item.image,
                }
              : item,
          );
        } else {
          updatedData.services = updatedData.services || [];
          updatedData.services = [
            ...updatedData.services,
            {
              ...formData,
              image: uploadedImage,
            },
          ];
        }
      }

      // ================= TESTIMONIAL =================

      if (type === "testimonial") {
        if (isEditMode) {
          updatedData.testimonials = updatedData.testimonials.map((item) =>
            item._id === selectedItem._id
              ? {
                  ...item,
                  ...formData,
                  image: uploadedImage || item.image,
                }
              : item,
          );
        } else {
          updatedData.testimonials = updatedData.testimonials || [];
          updatedData.testimonials = [
            ...updatedData.testimonials,
            {
              ...formData,
              image: uploadedImage,
            },
          ];
        }
      }

      // ================= BANNER =================

      if (type === "banner") {
        updatedData.banner = {
          ...updatedData.banner,
          ...formData,
        };
      }
      await updateHome(updatedData);
      setHomePageData(updatedData);
      dispatch(getLandingPage());
      setAlert({
        message: "Saved successfully!",
        status: "Success",
      });
      setTimeout(() => setAlert(null), 3000);
      setOpen(false);
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  };

  const handleDelete = async (section, id) => {
    setSaving(true);
    try {
      if (section === "service") {
        await deleteService(id);

        setHomePageData((prev) => ({
          ...prev,
          services: prev.services.filter((item) => item._id !== id),
        }));
      }

      if (section === "testimonial") {
        await deleteTestimonial(id);

        setHomePageData((prev) => ({
          ...prev,
          testimonials: prev.testimonials.filter((item) => item._id !== id),
        }));
      }

      setAlert({
        message: "Deleted successfully!",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  };

  return (
    <>
      <h4>Banner</h4>
      <LandingCard
        p={homePageData?.banner}
        onEdit={() => handleEdit("banner", homePageData.banner)}
      />
      <div className="table-filters">
        <h4>Your Trusted Partner</h4>
        <div className="page-tools">
          <button className="add-button" onClick={() => handleAdd("service")}>
            <LucidePlus /> Add
          </button>
        </div>
      </div>
      <div className="user-card-box">
        {homePageData?.services?.map((service) => (
          <LandingCard
            key={service._id}
            p={service}
            action="delete"
            onEdit={() => handleEdit("service", service)}
            onDelete={() => handleDelete("service", service._id)}
          />
        ))}
      </div>
      <div className="table-filters">
        <h4>Testimonial</h4>
        <div className="page-tools">
          <button
            className="add-button"
            onClick={() => handleAdd("testimonial")}
          >
            <LucidePlus /> Add
          </button>
        </div>
      </div>
      <div className="">
        {homePageData?.testimonials?.slice(0, visibleCount).map((p) => (
          <div
            className="Testimonial-card plot-card card"
            style={{ marginBottom: "1rem" }}
            key={p._id}
          >
            <div className="Testimonial-img">
              <img src={p.image} alt="" />
              <div className="testimonial-title">
                <h3>{p.name}</h3>
                <p>{p.position}</p>
              </div>
            </div>
            <div className="Testimonial-details">
              <p>{p.content}</p>
            </div>
            <div className="plot-card-actions dots">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit("testimonial", p);
                }}
              >
                <NiEdit />
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete("testimonial", p._id);
                }}
              >
                <NiDelete />
              </span>
            </div>
          </div>
        ))}
        <div className="table-filters" style={{ justifyContent: "center" }}>
          <div className="page-tools">
            {visibleCount < homePageData?.testimonials?.length && (
              <div>
                <button
                  className="add-button"
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                >
                  View More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <AddLocationModal
        open={open}
        onClose={() => setOpen(false)}
        title={isEditMode ? `Edit ${type}` : `Add ${type}`}
      >
        <div className="field">
          {type === "service" && (
            <>
              <input type="file" name="image" onChange={handleChange} />
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
                placeholder="Service description"
              />

              {(formData.preview || formData.image) && (
                <img
                  src={formData.preview || formData.image}
                  width="80"
                  alt=""
                />
              )}
            </>
          )}

          {type === "testimonial" && (
            <>
              <input type="file" name="image" onChange={handleChange} />
              <input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Name"
              />
              <input
                name="position"
                value={formData.position || ""}
                onChange={handleChange}
                placeholder="Position"
              />
              <textarea
                name="content"
                value={formData.content || ""}
                onChange={handleChange}
                placeholder="Feedback"
              />

              {formData.preview && <img src={formData.preview} width="80" />}
            </>
          )}

          {type === "banner" && (
            <>
              <input
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
              />
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
            disabled={saving}
            onClick={() => {
              handleSave();
            }}
          >
            {saving ? "Saving..." : isEditMode ? "Update " : "Add"}
          </button>
        </div>
      </AddLocationModal>
    </>
  );
};

export default Home;
