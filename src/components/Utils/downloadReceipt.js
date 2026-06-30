import axios from "axios";
import Host from "../../Host/Host";

const downloadReceipt = async (paymentId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${Host}/api/payment/receipt/${paymentId}`,
      {
        responseType: "blob",
        headers: {
          "auth-token": token,
        },
      },
    );
    const blob = new Blob([response.data], {
      type: "application/pdf",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt-${paymentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.log(err);
    alert("Unable to download receipt.");
  }
};

export default downloadReceipt;
