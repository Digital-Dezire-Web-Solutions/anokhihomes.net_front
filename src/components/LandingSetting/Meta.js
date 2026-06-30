import React, { useEffect, useState } from "react";
import NiEdit from "../../icons/ni-edit";
import { updateMeta } from "../../Pages/LandingSetting/LandingApi";
import { useDispatch } from "react-redux";
import { getLandingPage } from "../../Redux/Slices/AppSlices";

const Meta = ({ data, setAlert }) => {
  const dispatch = useDispatch();
  const [activePage, setActivePage] = useState("home");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [metaData, setMetaData] = useState({
    home: {
      title: "",
      description: "",
      keywords: "",
      canonical: "",
    },

    about: {
      title: "",
      description: "",
      keywords: "",
      canonical: "",
    },

    gallery: {
      title: "",
      description: "",
      keywords: "",
      canonical: "",
    },

    documents: {
      title: "",
      description: "",
      keywords: "",
      canonical: "",
    },

    contact: {
      title: "",
      description: "",
      keywords: "",
      canonical: "",
    },
  });

  useEffect(() => {
    if (data) {
      setMetaData(data);
      setFormData(data[activePage] || {});
    }
  }, [data, activePage]);

  const [formData, setFormData] = useState({});

  // switch page
  const handleTabChange = (page) => {
    setActivePage(page);
    setFormData(metaData[page] || {});
    setIsEditing(false);
  };

  // input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // save
  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedMeta = {
        ...metaData,

        [activePage]: {
          ...formData,
        },
      };

      const res = await updateMeta(updatedMeta);

      setMetaData(res);

      setIsEditing(false);
      dispatch(getLandingPage());
      setAlert({
        message: "Meta saved successfully!",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  };
  const handleEdit = () => {
    setIsEditing(true);
    setFormData(metaData[activePage]); // load current data
  };

  return (
    <>
      <div className="table-filters">
        <h4>SEO Meta Data</h4>
        <div className="page-tools">
          {Object.keys(metaData).map((page) => (
            <button
              key={page}
              className={activePage === page ? "active" : ""}
              onClick={() => handleTabChange(page)}
            >
              {page.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <h4>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h4>
      <div className="plot-card card">
        <div className="plot-details meta-details">
          {/* TITLE */}
          <p className="plot-modal">
            <strong>Title : </strong>

            {isEditing ? (
              <div className="field">
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <span>{metaData[activePage].title || "-"}</span>
            )}
          </p>

          {/* DESCRIPTION */}
          <p className="plot-modal">
            <strong>Meta Description : </strong>

            {isEditing ? (
              <div className="field">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <span>{metaData[activePage].description || "-"}</span>
            )}
          </p>

          {/* KEYWORDS */}
          <p className="plot-modal">
            <strong>Meta Keywords : </strong>

            {isEditing ? (
              <div className="field">
                <input
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <span>{metaData[activePage].keywords || "-"}</span>
            )}
          </p>

          {/* CANONICAL */}
          <p className="plot-modal">
            <strong>Canonical : </strong>

            {isEditing ? (
              <div className="field">
                <input
                  name="canonical"
                  value={formData.canonical}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <span>{metaData[activePage].canonical || "-"}</span>
            )}
          </p>
        </div>
        <div className="plot-card-actions dots">
          {!isEditing ? (
            <span onClick={handleEdit}>
              <NiEdit />
            </span>
          ) : (
            <></>
          )}
        </div>
        {isEditing && (
          <div className="modal-actions">
            <button
              disabled={saving}
              onClick={() => {
                handleSave();
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Meta;
