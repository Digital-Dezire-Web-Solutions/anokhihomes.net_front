import React, { useEffect, useState } from "react";
import NiEdit from "../../icons/ni-edit";
import NiDelete from "../../icons/ni-delete";
import { LucidePlus } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  deletePolicySection,
  updatePolicies,
} from "../../Pages/LandingSetting/LandingApi";
import { getLandingPage } from "../../Redux/Slices/AppSlices";

const PolicyPage = ({ data, setAlert }) => {
  const dispatch = useDispatch();
  const [activeType, setActiveType] = useState("privacy");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [PolicyData, setPolicyData] = useState({
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "",
      sections: [],
    },

    termcondition: {
      title: "Terms & Conditions",
      lastUpdated: "",
      sections: [],
    },

    cancellationrefund: {
      title: "Cancellation & Refund Policy",

      lastUpdated: "",
      sections: [],
    },
  });

  useEffect(() => {
    if (data) {
      setPolicyData(data);
    }
  }, [data]);

  const [formData, setFormData] = useState(null);

  // 👉 Switch page
  const handleTabChange = (type) => {
    setActiveType(type);
    setIsEditing(false);
    setFormData(null);
  };

  // 👉 Edit section
  const handleEdit = (section) => {
    setIsEditing(true);
    setFormData(section);
  };

  // 👉 Change input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 👉 Save section
  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedPolicies = {
        ...PolicyData,
        [activeType]: {
          ...PolicyData[activeType],
          lastUpdated: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          sections: PolicyData[activeType].sections.map((sec) =>
            sec._id === formData._id ? formData : sec,
          ),
        },
      };
      const res = await updatePolicies(updatedPolicies);
      setPolicyData(res);
      dispatch(getLandingPage());
      setIsEditing(false);
      setFormData(null);
      setAlert({
        message: "Updated successfully!",
        status: "Success",
      });
      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  };

  // 👉 Add section
  const handleAdd = async () => {
    setSaving(true);
    try {
      const newSection = {
        heading: "New Section",
        content: "Write here...",
      };

      const updatedPolicies = {
        ...PolicyData,
        [activeType]: {
          ...PolicyData[activeType],
          lastUpdated: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          sections: [...PolicyData[activeType].sections, newSection],
        },
      };
      const res = await updatePolicies(updatedPolicies);
      setPolicyData(res);
      setAlert({
        message: "Section added successfully!",
        status: "Success",
      });

      setTimeout(() => setAlert(null), 3000);
      setSaving(false);
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  };

  // 👉 Delete section
  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await deletePolicySection(activeType, id);
      setPolicyData((prev) => ({
        ...prev,
        [activeType]: {
          ...prev[activeType],
          sections: prev[activeType].sections.filter((sec) => sec._id !== id),
        },
      }));
      dispatch(getLandingPage());
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

  const current = PolicyData[activeType];

  return (
    <>
      {/* Tabs */}
      <div className="table-filters">
        <h4>Policies</h4>

        <div className="page-tools">
          {Object.keys(PolicyData).map((key) => (
            <button
              key={key}
              className={activeType === key ? "active" : ""}
              onClick={() => handleTabChange(key)}
            >
              {key.toUpperCase()}
            </button>
          ))}

          <button className="add-button" disabled={saving} onClick={handleAdd}>
            <LucidePlus /> Add Section
          </button>
        </div>
      </div>

      {/* Sections */}
      <h4>
        {current.title} (Updated on : {current.lastUpdated})
      </h4>
      <div className="">
        {current?.sections?.map((sec) => (
          <div
            key={sec._id}
            className="plot-card card"
            style={{ marginBottom: "1rem" }}
          >
            <div className="plot-details meta-details">
              {/* Heading */}
              <p className="plot-modal">
                {sec.heading && <strong>Heading : </strong>}

                {isEditing && formData?._id === sec._id ? (
                  <div className="field">
                    <input
                      name="heading"
                      value={formData.heading}
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <span>{sec.heading}</span>
                )}
              </p>

              {/* Content */}
              <p className="plot-modal">
                <strong>Content : </strong>

                {isEditing && formData?._id === sec._id ? (
                  <div className="field">
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <span>{sec.content}</span>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="plot-card-actions dots">
              {isEditing && formData?._id === sec._id ? (
                <></>
              ) : (
                <>
                  <span onClick={() => handleEdit(sec)}>
                    <NiEdit />
                  </span>

                  <span onClick={() => handleDelete(sec._id)}>
                    <NiDelete />
                  </span>
                </>
              )}
            </div>
            {isEditing && formData?._id === sec._id && (
              <div className="modal-actions">
                <button disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save"}</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default PolicyPage;
