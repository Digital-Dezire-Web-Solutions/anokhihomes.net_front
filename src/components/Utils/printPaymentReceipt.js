import formatDate from "../DateFormate/DateFormate";
import { formatCurrency } from "./FormatCurrency";
// Point this at your logo file (the one shown in the top-left of your PDF)
import logo from "../../Assets/Logo/logo-anokhi-home-green.png";

const COMPANY = {
  name: "Anokhi Homes Pvt. Ltd.",
  desk: "Customer Payment & Collection Desk",
  title: "Payment Receipt",
};

const TYPE_LABEL = { booking: "Booking", agreement: "Agreement", full: "Registry" };
const MODE_LABEL = { cash: "Cash", upi: "UPI", cheque: "Cheque", bank: "Bank Transfer" };

/* ---------- helpers ---------- */

const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const below100 = (n) =>
  n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : "");

const below1000 = (n) =>
  [n >= 100 ? `${ones[Math.floor(n / 100)]} Hundred` : "", n % 100 ? below100(n % 100) : ""]
    .filter(Boolean)
    .join(" ");

// 130200 -> "One Lakh Thirty Thousand Two Hundred Rupees Only"
export const amountInWordsIN = (value) => {
  const num = Math.round((Number(value) || 0) * 100) / 100;
  let rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  if (rupees === 0 && paise === 0) return "Zero Rupees Only";

  const crore = Math.floor(rupees / 10000000);
  rupees %= 10000000;
  const lakh = Math.floor(rupees / 100000);
  rupees %= 100000;
  const thousand = Math.floor(rupees / 1000);
  rupees %= 1000;

  const parts = [];
  if (crore) parts.push(`${below1000(crore)} Crore`);
  if (lakh) parts.push(`${below100(lakh)} Lakh`);
  if (thousand) parts.push(`${below100(thousand)} Thousand`);
  if (rupees) parts.push(below1000(rupees));

  let words = parts.length ? `${parts.join(" ")} Rupees` : "";
  if (paise) words += `${words ? " and " : ""}${below100(paise)} Paise`;
  return `${words} Only`;
};

const getReceiptNo = (item) =>
  item.receiptNo || String(item._id || "").slice(-8).toUpperCase();

/* ---------- receipt document ---------- */

const buildReceiptHtml = (item) => {
  const src = item.booking || item.hold;
  const plot = [src?.plot?.plotNumber, src?.colony?.name, src?.location?.name]
    .filter(Boolean)
    .join(", ");

  const receiptNo = getReceiptNo(item);
  const typeLabel =
    TYPE_LABEL[item.paymentType] || esc(item.paymentType || "Payment");
  const modeLabel = MODE_LABEL[item.paymentMode] || esc(item.paymentMode || "-");
  const amount = `₹${formatCurrency(item.amount || 0)}`;
  const associate = [
    item.agent?.name,
    item.agent?.referralId ? `(${item.agent.referralId})` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const showTxn = item.paymentMode !== "cash" && item.transactionId;
  const logoUrl = new URL(logo, window.location.href).href;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Receipt-${esc(receiptNo)}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1f2a44;
    font-size: 13px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { width: 210mm; min-height: 297mm; padding: 14mm 12mm; }
  .head { display: flex; align-items: center; gap: 18px; }
  .logo { width: 92px; height: auto; flex: none; }
  h1 { margin: 0; font-size: 23px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; color: #0e1a3a; }
  .sub { margin: 4px 0 9px; color: #5b6577; font-size: 13px; }
  .badge { display: inline-block; padding: 4px 12px; border: 1px solid #cfd6e2; border-radius: 6px; background: #f6f8fb; font-size: 11px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; color: #0e1a3a; }
  .rule { border: 0; border-top: 1px solid #d9dfe9; margin: 16px 0; }
  .voucher { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; padding: 16px 20px; margin-bottom: 14px; border: 1px dashed #b9c2d3; border-radius: 10px; }
  .k { font-size: 10.5px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; color: #1b2744; }
  .voucher .v { margin-top: 3px; font-size: 15px; font-weight: 700; color: #0e1a3a; }
  .line { display: flex; gap: 12px; padding: 9px 0; border-bottom: 1px dotted #c6cddb; font-size: 14px; }
  .line .k { width: 190px; flex: none; font-size: 14px; font-weight: 400; letter-spacing: 0; text-transform: none; color: #4a5468; }
  .line .v { flex: 1; font-weight: 500; color: #0e1a3a; }
  table { width: 100%; margin: 18px 0 10px; border-collapse: separate; border-spacing: 0; border: 1px solid #dde3ee; border-radius: 10px; overflow: hidden; }
  th { padding: 13px 14px; border-bottom: 1px solid #e6ebf3; text-align: left; font-size: 11px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; color: #1b2744; }
  td { padding: 13px 14px; border-bottom: 1px solid #eef1f6; font-size: 13.5px; }
  tr { break-inside: avoid; }
  .r { text-align: right; }
  .total td { border-bottom: 0; font-weight: 800; text-transform: uppercase; }
  .total .amt { font-size: 19px; color: #1d6b34; }
  .words .v { font-size: 17px; font-weight: 700; font-style: italic; color: #1d6b34; }
  .note { margin-top: 14px; font-size: 11.5px; color: #6a7385; }
  .sign { display: flex; justify-content: space-between; margin-top: 72px; padding: 0 20px; font-size: 12.5px; color: #6a7385; }
  .sign div { min-width: 180px; padding-top: 6px; border-top: 1px solid #c6cddb; text-align: center; }
  .cap { text-transform: capitalize; }
</style>
</head>
<body>
  <div class="page">
    <div class="head">
      <img class="logo" src="${esc(logoUrl)}" alt="" onerror="this.style.display='none'" />
      <div>
        <h1>${esc(COMPANY.name)}</h1>
        <p class="sub">${esc(COMPANY.desk)}</p>
        <span class="badge">${esc(COMPANY.title)}</span>
      </div>
    </div>

    <hr class="rule" />

    <div class="voucher">
      <div><div class="k">Receipt #</div><div class="v">${esc(receiptNo)}</div></div>
      <div><div class="k">Payment date</div><div class="v">${esc(formatDate(item.createdAt))}</div></div>
      <div><div class="k">Payment type</div><div class="v">${typeLabel}</div></div>
      <div><div class="k">Payment mode</div><div class="v">${modeLabel}</div></div>
    </div>

    <div class="line"><span class="k">Received from:</span><span class="v cap">${esc(item.customer?.name || "-")}</span></div>
    <div class="line"><span class="k">Customer phone:</span><span class="v">${esc(item.customer?.phone || "-")}</span></div>
    <div class="line"><span class="k">Plot:</span><span class="v">${esc(plot || "-")}</span></div>
    <div class="line"><span class="k">Associate:</span><span class="v">${esc(associate || "-")}</span></div>
    <div class="line"><span class="k">Payment status:</span><span class="v cap">${esc(item.status || "-")}</span></div>

    <table>
      <thead>
        <tr><th>Payment component</th><th>Details</th><th class="r">Amount</th></tr>
      </thead>
      <tbody>
        <tr><td>${typeLabel} payment</td><td>Received against ${esc(plot || "booking")}</td><td class="r">${amount}</td></tr>
        <tr><td>Mode of payment</td><td>${modeLabel}</td><td></td></tr>
        ${showTxn ? `<tr><td>Transaction ID</td><td>${esc(item.transactionId)}</td><td></td></tr>` : ""}
        <tr class="total"><td colspan="2">Total amount received</td><td class="r amt">${amount}</td></tr>
      </tbody>
    </table>

    <div class="line words"><span class="k">Amount in words:</span><span class="v">${esc(amountInWordsIN(item.amount))}</span></div>

    <p class="note"><strong>Note:</strong> 35% cancellation charges applicable.</p>

    <div class="sign">
      <div>Verified by Accounts Team</div>
      <div>Director / Managing Authority</div>
    </div>
  </div>
</body>
</html>`;
};

/* ---------- print ---------- */

// Opens the browser's print dialog for this payment's receipt.
// The user picks "Save as PDF" as the destination to download it.
export const printPaymentReceipt = (item) => {
  if (!item) return;

  const prevTitle = document.title;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
  });

  let cleaned = false;
  let printed = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.title = prevTitle;
    iframe.remove();
  };

  // onload fires once the receipt (including the logo) has loaded
  iframe.onload = () => {
    if (printed) return;
    printed = true;
    const win = iframe.contentWindow;
    if (!win) return cleanup();

    // the title becomes the default file name in "Save as PDF"
    document.title = `Receipt-${getReceiptNo(item)}`;
    win.onafterprint = cleanup;

    setTimeout(() => {
      win.focus();
      win.print();
    }, 100);

    setTimeout(cleanup, 10 * 60 * 1000); // safety net if afterprint never fires
  };

  iframe.srcdoc = buildReceiptHtml(item);
  document.body.appendChild(iframe);
};