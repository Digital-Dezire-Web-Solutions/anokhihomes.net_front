import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { esc, amountInWordsIN, printHtml } from "./printdocument";
import logoAnokhi from "../../Assets/Logo/ah-logo.png";
import logoPatliputra from "../../Assets/Logo/ah-logo.png";

/* =====================================================
   CONFIG - edit freely
===================================================== */

// If you have a public page that verifies a receipt, put its base URL here,
// e.g. "https://anokhihomes.in/verify/" - the QR then opens <base><receiptNo>.
// Left empty, the QR holds a plain-text summary of the receipt.
const VERIFY_URL = "";

// Company block, picked by the colony's category. Lines with an empty value
// are left out of the receipt.
const COMPANIES = {
  "Anokhi Homes": {
    legalName: "Anokhi Homes Private Limited",
    logo: logoAnokhi,
    cin: "U68100BR2025PTC076057",
    address: [
      "406,4th Floor, Pandey Plaza, Exhibition Road,",
      "Patna - 800001",
    ],
    phone: "+91 8298554555",
    email: "info@anokhihomes.in",
    web: "www.anokhihomes.in",
  },
  Patliputra: {
    legalName: "Patliputra Anokhi Homes Private Limited",
    logo: logoPatliputra,
    cin: "", // fill in
    address: [
      "406,4th Floor, Pandey Plaza, Exhibition Road,",
      "Patna - 800001",
    ],
    phone: "+91 8298554555",
    email: "info@anokhihomes.in",
    web: "www.anokhihomes.in",
  },
};

const NOTES = [
  "Please pay your balance allotment amount within 30 days from date of booking",
  "PLC charges will be applicable",
  "Cheque/DD payment is subject to realization in company account",
  "All the terms & conditions shall be applicable as per the company policy",
  "35% cancellation charges applicable",
];

const TYPE_LABEL = {
  booking: "Booking",
  agreement: "Agreement",
  full: "Registry",
};
const MODE_LABEL = {
  cash: "Cash",
  upi: "UPI",
  cheque: "Cheque",
  bank: "Bank Transfer",
};

/* =====================================================
   HELPERS
===================================================== */

const getReceiptNo = (item) =>
  item.receiptNo ||
  String(item._id || "")
    .slice(-8)
    .toUpperCase();

// 425000 -> "425000", 1234.5 -> "1234.50" (no thousands separators, like the old receipt)
const plain = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "";
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
};

// "20-09-2025 16:42:21" in Indian time
const stamp = (d) =>
  new Date(d)
    .toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
    .replace(/\//g, "-")
    .replace(", ", " ");

const row = (label, value) =>
  value || value === 0 ? `<div>${label} : ${esc(value)}</div>` : "";

const makeQr = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      margin: 0,
      width: 260,
      errorCorrectionLevel: "M",
    });
  } catch {
    return "";
  }
};

const makeBarcode = (value) => {
  try {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svg, String(value), {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      height: 40,
      width: 1.6,
    });
    const w = parseFloat(svg.getAttribute("width"));
    const h = parseFloat(svg.getAttribute("height"));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    return svg.outerHTML;
  } catch {
    return "";
  }
};

/* =====================================================
   DOCUMENT
===================================================== */

const CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #111;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
    .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 130mm;
    height: 130mm;
    transform: translate(-50%, -50%);
    object-fit: contain;
    opacity: 0.07;
    z-index: 0;
    pointer-events: none;
  }
    .page { position: relative; z-index: 1; display: flex; flex-direction: column; width: 210mm; height: 296mm; overflow: hidden; padding: 5mm 8mm 9mm; }
    .sheet { display: flex; flex-direction: column; min-height: 280mm; padding: 4mm 5mm 4mm; border: 1.2px solid #222; }

  .row1 { position: relative; min-height: 22mm; }
  .logo { display: block; height: 22mm; width: auto; }
  .badge { position: absolute; left: 50%; top: 3mm; transform: translateX(-50%); padding: 5px 22px; border: 2px solid #111; border-radius: 10px; background: #fff; font-size: 16px; font-weight: 700; white-space: nowrap; }

  .row2 { display: flex; justify-content: space-between; gap: 10mm; margin-top: 4mm; }
  .co { font-size: 11.5px; line-height: 1.85; font-weight: 500; }
  .meta { width: 42%; }
  .meta .no { margin-bottom: 6px; font-size: 15.5px; font-weight: 800; }
  .meta div { font-size: 11.5px; font-weight: 700; line-height: 1.5; }
  .up { text-transform: uppercase; }

  .rule { margin: 2mm 0; border: 0; border-top: 2px solid #8a5a44; }

  .cust .big { font-size: 15.5px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; line-height: 1.7; }
  .cust .sm { font-size: 11.5px; font-weight: 800; line-height: 1.9; }

  .plot { display: grid; grid-template-columns: 56% 44%; }
  .plot .big { font-size: 17px; font-weight: 800; line-height: 1.7; }
  .plot .sm { font-size: 12px; font-weight: 800; line-height: 1.9; }

  .head2 { margin: 4mm 0 2mm; font-size: 15px; font-weight: 800; text-decoration: underline; }
  .recv { font-size: 11.5px; line-height: 1.7; }
  .recv b { font-weight: 800; }

  .thanks { font-size: 11.5px; font-weight: 800; line-height: 1.9; }
  .note-h { margin: 4mm 0 2mm; font-size: 15px; font-weight: 800; }
  ul.notes { margin: 0; padding-left: 5mm; }
  ul.notes li { font-size: 10px; font-weight: 800; line-height: 1.9; text-transform: uppercase; }

  .bottom { display: grid; grid-template-columns: 38% 18% 44%; align-items: start; margin-top: 2mm; }
  .amt { display: inline-block; padding: 8px 22px; border: 2px solid #111; font-size: 19px; font-weight: 800; }
  .bar { margin-top: 2mm; }
  .bar svg { display: block; width: 24mm; height: 15mm; }
  .barno { margin-top: 2mm; font-size: 13px; color: #333; }
  .qr img { display: block; width: 28mm; height: 28mm; }

  .sig { margin: 10% 0 0 50%; padding-top: 2mm; }
  .sig .n { font-size: 15px; font-weight: 800; }
  .sig .t { font-size: 11px; font-weight: 700; }
  .foot { text-align: center; font-size: 11px; font-weight: 700; }
`;

const buildReceiptHtml = (item, { qr, barcode }) => {
  const b = item.booking || item.hold || {};
  const plot = b.plot || {};
  const colony = b.colony || {};
  const customer = item.customer || {};
  console.log(customer, "customer");
  const co = COMPANIES[colony.category] || COMPANIES["Anokhi Homes"];

  const receiptNo = getReceiptNo(item);
  const amount = Number(item.amount) || 0;
  const total = Number(b.finalAmount) || 0;
  const area = Number(b.plotArea || plot.area) || 0;
  const rate =
    Number(b.requestAmount || b.pricePerSqft) ||
    (area && total ? Math.round(total / area) : 0);
  const dues = total ? Math.max(total - (Number(b.amountPaid) || 0), 0) : null;
  const agreement = b.paymentSchedule?.agreement;
  const agreementStatus = agreement
    ? agreement.paid
      ? "PAID"
      : "PENDING"
    : "";

  const customerCode =
    customer.customerCode ||
    (customer._id ? String(customer._id).slice(-8).toUpperCase() : "");

  const typeLabel =
    TYPE_LABEL[item.paymentType] || item.paymentType || "Payment";
  const modeLabel = MODE_LABEL[item.paymentMode] || item.paymentMode || "";
  const modeText = `${modeLabel}${item.transactionId ? ` (Tran No. ${item.transactionId})` : ""}`;

  const plotNo = plot.plotNumber || "";
  const project = colony.name || b.location?.name || "";
  const dateText = stamp(item.createdAt || item.paymentDate);

  const coLines = [
    co.cin && `CIN : ${co.cin}`,
    ...(co.address || []),
    co.phone && `Contact No. ${co.phone}`,
    co.email && `Email : ${co.email}`,
    co.web && `Visit Us @ ${co.web}`,
  ]
    .filter(Boolean)
    .map((l) => `<div>${esc(l)}</div>`)
    .join("");

  const words = amountInWordsIN(amount).toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Receipt-${esc(receiptNo)}</title>
<style>${CSS}</style>
</head>
<body>
<img class="watermark" src="${esc(logoAnokhi)}" alt="" onerror="this.style.display='none'" />
<div class="page">
<div class="sheet">

  <div class="row1">
    <img class="logo" src="${esc(new URL(co.logo, window.location.href).href)}" alt="" onerror="this.style.display='none'" />
    <div class="badge">PAYMENT e-RECEIPT</div>
  </div>

  <div class="row2">
    <div class="co">${coLines}</div>
    <div class="meta">
      <div class="no">RECEIPT NO. : ${esc(receiptNo)}</div>
      <div>RECEIPT DATE : ${esc(dateText)}</div>
      ${project ? `<div class="up">PROJECT : ${esc(project)}</div>` : ""}
    </div>
  </div>

  <hr class="rule" />

  <div class="cust">
    <div class="big">CUSTOMER CODE : ${esc(customer.referralId || "-")}</div>
    <div class="big">NAME : ${esc(customer.name || "-")}</div>
    <div class="sm">ADDRESS : ${esc(customer.address || "")}</div>
    <div class="sm">CONTACT.: ${esc(customer.phone || "")}</div>
    <div class="sm">PAN NO. : ${esc(customer.panNumber || "")}</div>
  </div>

  <hr class="rule" />

  <div class="plot">
    <div>
      ${plotNo ? `<div class="big">PLOT NO : ${esc(plotNo)}</div>` : ""}
      ${rate ? `<div class="sm">PLOT RATE : ${esc(plain(rate))}/ Sq. Ft.</div>` : ""}
      ${total ? `<div class="sm">TOTAL PRICE : ${esc(plain(total))} INR</div>` : ""}
    </div>
    <div>
      ${area ? `<div class="sm" style="padding-top:5px">PLOT AREA : ${esc(plain(area))}(Sq. Ft.)</div>` : ""}
      ${plot.plc ? `<div class="sm">PLC : ${esc(plot.plc)}</div>` : ""}
      ${dues !== null ? `<div class="sm">DUES AMOUNT : ${esc(plain(dues))} INR</div>` : ""}
      ${agreementStatus ? `<div class="sm">AGREEMENT STATUS : ${agreementStatus}</div>` : ""}
    </div>
  </div>

  <div class="head2">PAYMENTS DETAILS</div>
  <div class="recv">
    Received with thanks a sum of <b>₹ ${esc(plain(amount))} ( ${esc(words)})</b>
    ${modeText ? ` by <b>${esc(modeText)}</b>` : ""}
    against <b>${esc(typeLabel)} payment</b> in ${esc(co.legalName)}
  </div>

  <hr class="rule" />

  <div class="thanks">
    <div>THANK YOU FOR CHOOSING ${esc(co.legalName)}</div>
    ${plotNo ? `<div class="up">YOUR PLOT NO. IS ${esc(plotNo)}${project ? ` IN ${esc(project)}` : ""}</div>` : ""}
  </div>

  <div class="note-h">NOTE</div>
  <ul class="notes">${NOTES.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>

  <div class="bottom">
    <div>
      <div class="amt">₹ ${esc(plain(amount))}/-</div>
      ${barcode ? `<div class="bar">${barcode}<div class="barno">${esc(receiptNo)}</div></div>` : ""}
    </div>
    <div class="qr">${qr ? `<img src="${qr}" alt="" />` : ""}</div>
    <div></div>
  </div>

  <div class="sig">
    <div class="n">${esc(co.legalName)}</div>
    <div class="t">Authorised Signatory</div>
  </div>

  <div class="foot">This is Computer Generated Printout.</div>

</div></div>
<div id="probe" style="position:absolute;visibility:hidden;height:280mm;width:1px"></div>
<script>
  // If the content is taller than one A4 sheet (long address, long project
  // name...), shrink the sheet just enough to fit on a single page.
  (function () {
    var sheet = document.querySelector('.sheet');
    var avail = document.getElementById('probe').getBoundingClientRect().height;
    var h = sheet.getBoundingClientRect().height;
    if (h > avail + 1) {
      var k = avail / h;
      sheet.style.width = (198 / k) + 'mm';
      sheet.style.minHeight = (284 / k) + 'mm';
      sheet.style.zoom = k;
    }
  })();
</script>
</body>
</html>`;
};

/* =====================================================
   PRINT
===================================================== */

// Opens the browser's print dialog for this payment's e-receipt.
// The person picks "Save as PDF" as the destination to download it.
export const printPaymentReceipt = async (item) => {
  if (!item) return;
  const receiptNo = getReceiptNo(item);
  const qrText = VERIFY_URL
    ? `${VERIFY_URL}${receiptNo}`
    : `Receipt ${receiptNo} | Rs ${plain(item.amount)} | ${stamp(item.createdAt || item.paymentDate)}`;

  const [qr, barcode] = await Promise.all([
    makeQr(qrText),
    makeBarcode(receiptNo),
  ]);
  printHtml(buildReceiptHtml(item, { qr, barcode }), `Receipt-${receiptNo}`);
};
