import React, { useEffect, useState } from 'react'
import LandingCard from './LandingCard'
import Icon1 from "../../Assets/icons/Plot Sale Services.png"
import Icon2 from "../../Assets/icons/Liasoning Services.png"
import Icon3 from "../../Assets/icons/Property Services.png"
import Icon4 from "../../Assets/icons/Construction Services.png"
import AddLocationModal from '../Modals/AddLocationModal'
import { LucidePlus } from 'lucide-react'
import ViewModal from '../Modals/ViewModal'
import NiDelete from '../../icons/ni-delete'
import NiEdit from '../../icons/ni-edit'
import { useDispatch } from 'react-redux'
import { getLandingPage } from '../../Redux/Slices/AppSlices'
import { deletePdf, deleteThumbnail, updateDocuments, uploadImage, uploadPdf } from '../../Pages/LandingSetting/LandingApi'
import { FaFilePdf } from "react-icons/fa6";

const Gallery = ({ data, setAlert }) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [previewPdf, setPreviewPdf] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const handlePreviewPdf = (file) => {
        setPreviewPdf(file);
        setPreviewOpen(true);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0];
            if (!file) return;
            if (type === "thumbnail") {
                setFormData((prev) => ({
                    ...prev,
                    image: file,
                    preview: URL.createObjectURL(file),
                }));
            }
            if (type === "pdf") {
                setFormData((prev) => ({
                    ...prev,
                    file: file,
                    fileName: file.name,
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    console.log(data, "data")

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
        thumbnail: [],
        pdf: [],
    });

    useEffect(() => {
        if (data) {
            setHomePageData(data);
        }
    }, [data]);

    const handleSave = async () => {
        try {
            setSaving(true)
            let updatedData = {
                ...homePageData,
                thumbnail: [...(homePageData.thumbnail || [])],
                pdf: [...(homePageData.pdf || [])],
            };
            /* ================= THUMBNAIL ================= */
            if (type === "thumbnail") {
                let uploadedImage = null;
                // upload only if new file selected
                if (formData.image instanceof File) {
                    uploadedImage = await uploadImage(
                        formData.image
                    );
                }
                if (isEditMode) {
                    updatedData.thumbnail =
                        updatedData.thumbnail.map((item) =>
                            item._id === selectedItem._id
                                ? {
                                    ...item,

                                    image:
                                        uploadedImage?.url ||
                                        item.image,

                                    public_id:
                                        uploadedImage?.public_id ||
                                        item.public_id,
                                }
                                : item
                        );

                } else {

                    updatedData.thumbnail.push({
                        image: uploadedImage.url,

                        public_id:
                            uploadedImage.public_id,
                    });
                }
            }

            /* ================= PDF ================= */

            if (type === "pdf") {
                let uploadedPdf = null;

                // upload only if file selected
                if (formData.file instanceof File) {
                    uploadedPdf = await uploadPdf(
                        formData.file
                    );
                }
                if (isEditMode) {
                    updatedData.pdf =
                        updatedData.pdf.map((item) =>
                            item._id === selectedItem._id
                                ? {
                                    ...item,
                                    file:
                                        uploadedPdf?.file ||
                                        item.file,
                                    fileName:
                                        uploadedPdf?.fileName ||
                                        item.fileName,
                                    public_id:
                                        uploadedPdf?.public_id ||
                                        item.public_id,
                                }
                                : item
                        );
                } else {
                    updatedData.pdf.push({
                        file: uploadedPdf.file,
                        fileName:
                            uploadedPdf.fileName,
                        public_id:
                            uploadedPdf.public_id,
                    });
                }
            }
            /* ================= SAVE ================= */
            await updateDocuments(updatedData);
            setHomePageData(updatedData);
            dispatch(getLandingPage());
            setAlert({
                message: `${isEditMode
                    ? "Updated"
                    : "Added"
                    } successfully!`,
                status: "Success",
            });
            setTimeout(() => setAlert(null), 3000);
            setFormData({});
            setOpen(false);
            setSaving(false)
        } catch (error) {
            setSaving(false)
            console.log(error);
        }
    };

    const handleDelete = async (section, id) => {
        try {
            // ================= THUMBNAIL =================
            if (section === "thumbnail") {
                await deleteThumbnail(id);
            }
            // ================= PDF =================
            if (section === "pdf") {
                await deletePdf(id);
            }
            // UPDATE LOCAL STATE
            setHomePageData((prev) => ({
                ...prev,
                [section]: prev[section].filter(
                    (item) => item._id !== id
                ),
            }));
            dispatch(getLandingPage());
            setAlert({
                message: "Deleted successfully!",
                status: "Success",
            });
            setTimeout(() => setAlert(null), 3000);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div className="table-filters">
                <h4>Thumbnail</h4>
                <div className="page-tools">
                    <button
                        className="add-button"
                        onClick={() => handleAdd("thumbnail")}
                    >
                        <LucidePlus /> Add
                    </button>
                </div>
            </div>
            <div className="user-card-box">
                {homePageData.thumbnail?.map((p) => (
                    <LandingCard
                        key={p._id}
                        p={p}
                        action="delete"
                        onEdit={() => handleEdit("thumbnail", p)}
                        onDelete={() => handleDelete("thumbnail", p._id)}
                    />
                ))}
            </div>
            {/* <div className="table-filters">
                <h4>PDF</h4>
                <div className="page-tools">
                    <button
                        className="add-button"
                        onClick={() => handleAdd("pdf")}
                    >
                        <LucidePlus /> Add
                    </button>
                </div>
            </div> */}
            {/* <div className="user-card-box">
                {homePageData.pdf?.map((p) => (
                    <div
                        key={p._id}
                        className="plot-card card"
                        onClick={() => handlePreviewPdf(p.file)}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="plot-details">
                            <h3>📄 {p.fileName || "PDF File"}</h3>
                            <p>Click to preview</p>
                        </div>

                        <div className="plot-card-actions dots">
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit("pdf", p);
                                }}
                            >
                                <NiEdit />
                            </span>

                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete("pdf", p._id);
                                }}
                            >
                                <NiDelete />
                            </span>
                        </div>
                    </div>
                ))}
            </div> */}
            <AddLocationModal
                open={open}
                onClose={() => setOpen(false)}
                title={
                    isEditMode
                        ? `Edit ${type}`
                        : `Add ${type}`
                }
            >
                <div className="field">
                    {type === "thumbnail" && (
                        <>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                            />

                            {(formData.preview || formData.image) && (
                                <img src={formData.preview || formData.image} width="100" />
                            )}
                        </>
                    )}
                    {type === "pdf" && (
                        <>
                            <input
                                type="file"
                                name="file"
                                accept="application/pdf"
                                onChange={handleChange}
                            />

                            {(formData.fileName || selectedItem?.fileName) && (
                                <p><FaFilePdf /> {formData.fileName || selectedItem?.fileName}</p>
                            )}
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
            <ViewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                title={previewOpen}
            >
                <div className="user-card-bottom view-box">
                    {previewPdf && (
                        <iframe
                            src={`${previewPdf}#toolbar=0`}
                            width="100%"
                            height="600px"
                        />
                    )}
                </div>
            </ViewModal>
        </>
    )
}

export default Gallery
