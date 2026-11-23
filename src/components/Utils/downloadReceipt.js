import axios from "axios";
import Host from "../../Host/Host";
import { saveBlob } from "../Utils/saveFile";

const downloadReceipt = async (paymentId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${Host}/api/payment/receipt/${paymentId}`,
      { responseType: "blob", headers: { "auth-token": token } },
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    await saveBlob(blob, `Receipt-${paymentId}.pdf`, "application/pdf");
  } catch (err) {
    console.log(err);
    alert("Unable to download receipt.");
  }
};

export default downloadReceipt;