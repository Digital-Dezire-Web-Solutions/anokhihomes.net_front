import axios from "axios";
import Host from "../../Host/Host";

const API = `${Host}/api/landing`;

// ================= UPDATE =================

export const updateHome = async (data) => {
  const res = await axios.put(`${API}/home`, data);
  return res.data;
};

export const updateAbout = async (data) => {
  const res = await axios.put(`${API}/about`, data);
  return res.data;
};

export const updateGallery = async (data) => {
  const res = await axios.put(`${API}/gallery`, data);
  return res.data;
};

export const updateDocuments = async (data) => {
  const res = await axios.put(`${API}/documents`, data);
  return res.data;
};

export const updateContact = async (data) => {
  const res = await axios.put(`${API}/contact`, data);
  return res.data;
};

export const updateFooter = async (data) => {
  const res = await axios.put(`${API}/footer`, data);
  return res.data;
};

export const updateMeta = async (data) => {
  const res = await axios.put(`${API}/meta`, data);
  return res.data;
};

export const updatePolicies = async (data) => {
  const res = await axios.put(`${API}/policies`, data);
  return res.data;
};

// ================= DELETE =================

export const deleteService = async (id) => {
  const res = await axios.delete(`${API}/home/service/${id}`);
  return res.data;
};

export const deleteTestimonial = async (id) => {
  const res = await axios.delete(`${API}/home/testimonial/${id}`);
  return res.data;
};

export const deleteGallery = async (id) => {
  const res = await axios.delete(`${API}/gallery/${id}`);
  return res.data;
};

export const deleteThumbnail = async (id) => {
  const res = await axios.delete(`${API}/documents/thumbnail/${id}`);
  return res.data;
};

export const deletePdf = async (id) => {
  const res = await axios.delete(`${API}/documents/pdf/${id}`);
  return res.data;
};

export const deleteContact = async (id) => {
  const res = await axios.delete(`${API}/contact/address/${id}`);
  return res.data;
};

export const deletePolicySection = async (type, sectionId) => {
  const res = await axios.delete(`${API}/policies/${type}/${sectionId}`);

  return res.data;
};

export const uploadImage = async (image) => {
  const formData = new FormData();

  formData.append("image", image);

  const res = await axios.post(`${API}/upload/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const uploadPdf = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const res = await axios.post(`${API}/upload/pdf`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
