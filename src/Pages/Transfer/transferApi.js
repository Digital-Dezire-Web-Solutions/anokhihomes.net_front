import axios from "axios";
import Host from "../../Host/Host";

const cfg = () => ({
  headers: { "auth-token": localStorage.getItem("token") },
});

export const api = {
  get: async (path) =>
    (await axios.get(`${Host}/api/transfer${path}`, cfg())).data,
  post: async (path, body) =>
    (await axios.post(`${Host}/api/transfer${path}`, body, cfg())).data,
};

export const errMsg = (err, fallback) =>
  err.response?.data?.message || fallback;

export const flash = (setAlert, status, message) => {
  setAlert?.({ status, message });
  setTimeout(() => setAlert?.(null), 3500);
};
