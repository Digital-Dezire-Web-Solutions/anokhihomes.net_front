import * as XLSX from "xlsx";

export const isRNWebView = () =>
  typeof window !== "undefined" && !!window.ReactNativeWebView;

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(String(r.result).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

export const saveBlob = async (blob, fileName, mimeType) => {
  const type = mimeType || blob.type || "application/octet-stream";

  if (isRNWebView()) {
    const base64 = await blobToBase64(blob);
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: "DOWNLOAD_FILE", fileName, mimeType: type, base64 }),
    );
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const savePdf = (doc, fileName) =>
  saveBlob(doc.output("blob"), fileName, "application/pdf");

export const saveWorkbook = (workbook, fileName) => {
  const out = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return saveBlob(new Blob([out], { type: XLSX_MIME }), fileName, XLSX_MIME);
};