import React, { useEffect, useState } from 'react'
import LandingCard from './LandingCard'
import Icon1 from "../../Assets/icons/Plot Sale Services.png"
import Icon2 from "../../Assets/icons/Liasoning Services.png"
import Icon3 from "../../Assets/icons/Property Services.png"
import Icon4 from "../../Assets/icons/Construction Services.png"
import { LucidePlus } from 'lucide-react'
import NiEdit from '../../icons/ni-edit'
import NiDelete from '../../icons/ni-delete'
import AddLocationModal from '../Modals/AddLocationModal'
import { deleteContact, updateContact } from '../../Pages/LandingSetting/LandingApi'
import { getLandingPage } from '../../Redux/Slices/AppSlices'
import { useDispatch } from 'react-redux'

const Home = ({ data, setAlert }) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState(""); // "banner" | "service" | "testimonial"
    const [selectedItem, setSelectedItem] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
        address: [],
    });

    useEffect(() => {
        if (data) {
            setHomePageData(data);
        }
    }, [data]);

    // const [homePageData, setHomePageData] = useState({
    //     address: [
    //         {
    //             id: 1,
    //             title: "Head Office",
    //             content: "406,4th Floor, Pandey Plaza, Exhibition Road, Patna - 800001",
    //             phone: "+919876543210",
    //         },
    //         {
    //             id: 2,
    //             title: "Branch Office 1",
    //             content: "Basement of Najo Bazar, JK Tower, Qamaruddin Gunj, Biharsharif, Nalanda - 803101",
    //         },
    //         {
    //             id: 3,
    //             title: "Branch Office 2",
    //             content: "Beside Prabha Inn, Baitarani Road Rajgir, Nalanda, Bihar - 803116",
    //             phone: "+919876543210",
    //         },
    //     ],

    // });

    const handleSave = async () => {
        setSaving(true)
        try {

            let updatedData = {
                ...homePageData,
                address: [...(homePageData.address || [])],
            };

            if (type === "address") {

                if (isEditMode) {

                    updatedData.address =
                        updatedData.address.map((item) =>
                            item._id === selectedItem._id
                                ? {
                                    ...item,
                                    ...formData,
                                }
                                : item
                        );

                } else {

                    updatedData.address.push({
                        ...formData,
                    });
                }
            }

            const res = await updateContact(updatedData);

            setHomePageData(res);
            dispatch(getLandingPage());
            setAlert({
                message: `${isEditMode
                    ? "Updated"
                    : "Added"
                    } successfully!`,
                status: "Success",
            });

            setTimeout(
                () => setAlert(null),
                3000
            );

            setFormData({});
            setOpen(false);
            setSaving(false)

        } catch (error) {
            console.log(error);
            setSaving(false)
        }
    };

    const handleDelete = async (
        section,
        id
    ) => {
        setSaving(true)
        try {
            await deleteContact(id);
            setHomePageData((prev) => ({
                ...prev,
                address:
                    prev.address.filter(
                        (item) =>
                            item._id !== id
                    ),
            }));
            dispatch(getLandingPage());
            setAlert({
                message:
                    "Deleted successfully!",
                status: "Success",
            });
            setTimeout(
                () => setAlert(null),
                3000
            );
            setSaving(false)
        } catch (error) {
            console.log(error);
            setSaving(false)
        }
    };

    return (
        <>
            <div className="table-filters">
                <h4>Contact</h4>
                <div className="page-tools">
                    <button
                        disabled={saving}
                        className="add-button"
                        onClick={() => handleAdd("address")}
                    >
                        <LucidePlus /> Add
                    </button>
                </div>
            </div>
            <div className="user-card-box">
                {homePageData.address.map((address) => (
                    <LandingCard
                        key={address._id}
                        p={address}
                        action="delete"
                        onEdit={() => handleEdit("address", address)}
                        onDelete={() => handleDelete("address", address._id)}
                    />
                ))}
            </div>

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
                    {type === "address" && (
                        <>
                            <input
                                name="title"
                                value={formData.title || ""}
                                onChange={handleChange}
                                placeholder="Office Title"
                            />
                            {/* <input
                                type='number'
                                name="phone"
                                value={formData.phone || ""}
                                onChange={handleChange}
                                placeholder="Office Phone"
                            /> */}

                            <textarea
                                name="content"
                                value={formData.content || ""}
                                onChange={handleChange}
                                placeholder="Office Address"
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
                        {saving ? "saving... " : isEditMode ? "Update " : "Add"}
                    </button>
                </div>
            </AddLocationModal>
        </>
    )
}

export default Home
