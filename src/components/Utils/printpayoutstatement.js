import formatDate from "../DateFormate/DateFormate";
import { esc, amountInWordsIN, printHtml } from "./printdocument";
// Left logo: Anokhi Homes
import logoLeft from "../../Assets/Logo/ah-logo.png";
// Right logo: Patliputra Anokhi Homes
import logoRight from "../../Assets/Logo/pah-logo.png";
import receptFooter from "../../Assets/Logo/Payout-reciept-footer.jpg";
import receptCorner from "../../Assets/Logo/Payout-reciept-head-LeftandRight.png";

const INCOME_ROWS = [
  {
    field: "directIncome",
    label: "Direct Income",
    rule: "Slab percentage on personal business",
  },
  {
    field: "differenceIncome",
    label: "Difference Income",
    rule: "Hierarchy percentage differential",
  },
  {
    field: "matchingIncome",
    label: "Matching Income",
    rule: "Team business matching (six-month cycle)",
  },
  {
    field: "royaltyIncome",
    label: "Royalty Income",
    rule: "Rank-based royalty (six-month cycle)",
  },
  {
    field: "cashbackIncome",
    label: "Cashback Income",
    rule: "Special payment clearance criteria",
  },
  {
    field: "bestPerformanceIncome",
    label: "Performer Income",
    rule: "Best Performer Income",
  },
  {
    field: "festivalBonusIncome",
    label: "Festival Bonus Income",
    rule: "Festival bonus scheme",
  },
  {
    field: "referralIncome",
    label: "Referral Income",
    rule: "Referral earnings",
  },
  {
    field: "rewardIncome",
    label: "Reward Income",
    rule: "Approved target reward schemes",
  },
];

const CATEGORY_LABEL = {
  "Anokhi Homes": "Anokhi Homes + Other",
  Patliputra: "Patliputra",
};
const MODE_LABEL = {
  cash: "Cash",
  upi: "UPI",
  cheque: "Cheque",
  bank: "Bank Transfer",
};

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const pct = (n) => Number(Number(n || 0).toFixed(2));
const abs = (src) => new URL(src, window.location.href).href;

const getInvoiceNo = (p) => {
  if (p.invoiceNo || p.voucherNo) return p.invoiceNo || p.voucherNo;
  const d = String(p.cycleEnd || "")
    .slice(0, 10)
    .replace(/-/g, "");
  return `PAY${d}-${String(p._id || "")
    .slice(-4)
    .toUpperCase()}`;
};

/* ---------- decorative SVG pieces ---------- */

const GREEN = "#0f4d2a";
const GOLD = "#c9a227";

// row of building silhouettes
const skyline = (heights, color, opacity, vbW, vbH) => {
  const step = vbW / heights.length;
  const rects = heights
    .map((h, i) => {
      const bh = h * vbH;
      return `<rect x="${(i * step + step * 0.12).toFixed(2)}" y="${(vbH - bh).toFixed(2)}" width="${(step * 0.7).toFixed(2)}" height="${bh.toFixed(2)}" />`;
    })
    .join("");
  return `<g fill="${color}" opacity="${opacity}">${rects}</g>`;
};

const H_HEAD = [
  0.3, 0.5, 0.35, 0.65, 0.45, 0.8, 0.4, 0.55, 0.9, 0.5, 0.7, 0.4, 0.6, 0.85,
  0.45, 0.6, 0.35, 0.7, 0.5, 0.4, 0.6, 0.3,
];
const H_FOOT = [
  0.35, 0.55, 0.4, 0.7, 0.5, 0.85, 0.45, 0.6, 0.9, 0.5, 0.65, 0.4, 0, 0, 0, 0.4,
  0.65, 0.5, 0.9, 0.6, 0.45, 0.85, 0.5, 0.7, 0.4, 0.55, 0.35,
];

const cornersSvg = `
<svg class="corners" viewBox="0 0 210 30" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="0,0 24,0 0,24" fill="${GREEN}"/>
  <polygon points="27,0 31,0 0,31 0,27" fill="${GOLD}"/>
  <polygon points="210,0 186,0 210,24" fill="${GREEN}"/>
  <polygon points="183,0 179,0 210,31 210,27" fill="${GOLD}"/>
</svg>`;

const headerSkyline = `
<svg class="sky" viewBox="0 0 230 36" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  ${skyline(H_HEAD, GOLD, 0.35, 230, 36)}
  <polyline points="85,36 115,10 145,36" fill="none" stroke="${GOLD}" stroke-width="1.6"/>
  <rect x="111" y="22" width="8" height="8" fill="${GREEN}"/>
</svg>`;

const footerSvg = `
<svg class="foot" viewBox="0 0 210 40" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(0,2)">${skyline(H_FOOT, GOLD, 0.35, 210, 22)}</g>
  <polygon points="0,18 40,30 80,30 105,16 130,30 170,30 210,18 210,40 0,40" fill="${GREEN}"/>
  <polyline points="0,18 40,30 80,30 105,16 130,30 170,30 210,18" fill="none" stroke="${GOLD}" stroke-width="0.8"/>
  <rect x="101" y="24" width="8" height="8" fill="none" stroke="${GOLD}" stroke-width="0.6"/>
  <path d="M105 24v8M101 28h8" stroke="${GOLD}" stroke-width="0.5"/>
  <text x="105" y="37.6" text-anchor="middle" fill="#fff" font-size="3" letter-spacing=".6" font-family="Inter, Arial, sans-serif" font-weight="600">TOGETHER WE GROW, TOGETHER WE SUCCEED.</text>
  <rect x="0" y="39.3" width="210" height="0.7" fill="${GOLD}"/>
</svg>`;

const ICON = (inner) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const ICONS = {
  calendar: ICON(
    `<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>`,
  ),
  doc: ICON(
    `<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9.5 12h5M9.5 16h5"/>`,
  ),
  user: ICON(
    `<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>`,
  ),
};

const CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1b2233;
    font-size: 13px;
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
  .page { position: relative; width: 210mm; height: 296mm; overflow: hidden; display: flex; flex-direction: column; padding: 10mm 12mm 44mm; }
    .corner { position: absolute; top: 0; width: 24mm; height: auto; display: block; }
  .corner.l { left: 0; }
  .corner.r { right: 0; transform: scaleX(-1); } /* mirrored copy of the left corner */
  .foot { position: absolute; left: 0; bottom: 0; width: 210mm; height: auto; display: block; }

    .head { position: relative; display: grid; grid-template-columns: 30mm 1fr 30mm; align-items: center; gap: 8px; margin: 0 6mm 8mm; }
  .logo { width: 30mm; height: 30mm; object-fit: contain; }
  .mid { position: relative; text-align: center; }
  .sky { position: absolute; left: 50%; bottom: 8mm; transform: translateX(-50%); width: 100%; height: 12mm; z-index: 0; }
  h1 { position: relative; z-index: 1; margin: 0 0 16px; font-size: 16.5px; line-height: 1.3; font-weight: 800; text-transform: uppercase; color: #12301d; }
  .badge { position: relative; z-index: 1; display: inline-block; padding: 7px 26px; border: 2px solid ${GOLD}; border-radius: 9px; background: ${GREEN}; color: #fff; font-size: 14px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; }

  .box { position: relative; display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #e3d6a4; border-radius: 12px; margin-bottom: 7mm; }
  .box::before { content: ""; position: absolute; left: 50%; top: 14px; bottom: 14px; width: 1px; background: #e3d6a4; }
  .cell { display: flex; align-items: center; gap: 14px; padding: 14px 18px; }
  .cell:nth-child(-n+2) { border-bottom: 1px solid #efe6c3; }
  .ic { flex: none; width: 40px; height: 40px; border-radius: 50%; background: ${GREEN}; display: flex; align-items: center; justify-content: center; }
  .vl { font-size: 12.5px; color: #4b5563; }
  .vl.up { text-transform: uppercase; }
  .vv { margin-top: 2px; font-size: 15px; font-weight: 600; color: #111827; }
  .vv.up { text-transform: uppercase; }

  table { width: 100%; table-layout: fixed; border-collapse: separate; border-spacing: 0; border: 1px solid #cfd5cf; border-radius: 10px; overflow: hidden; margin-bottom: 6mm; }
  th { padding: 12px 16px; background: ${GREEN}; color: #fff; text-align: left; font-size: 11.5px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; }
  th + th { border-left: 1px solid rgba(255,255,255,.25); }
  td { padding: 8px 16px; border-bottom: 1px solid #e3e7e3; font-size: 13px; }
  tbody tr:last-child td { border-bottom: 0; }
  tr { break-inside: avoid; }
  .r { text-align: right; white-space: nowrap; }
  .c { text-align: center; }
  tr.inc td:not(:last-child) { border-right: 1px solid #e3e7e3; }
  tr.gross td { background: #e4f1e7; color: #14532d; font-weight: 800; text-transform: uppercase; }
  .neg { color: #c62828; }
  tr.ded td { background: #fdeaea; color: #c62828; font-weight: 800; text-transform: uppercase; }
  tr.net td { padding: 12px 16px; font-size: 20px; font-weight: 800; text-transform: uppercase; color: #14532d; white-space: nowrap; }

  .words { display: flex; gap: 14px; align-items: baseline; padding: 0 2mm; }
  .words .k { width: 190px; flex: none; font-size: 14px; color: #4b5563; }
  .words .v { flex: 1; font-size: 14px; line-height: 1.3; font-weight: 600; color: #1d6b34; }

  /* 1. force a minimum gap above the signatures */
.sign { display: flex; justify-content: space-between; margin-top: auto; padding: 14mm 2mm 0; font-size: 12.5px; color: #4b5563; }
.sign div { min-width: 62mm; padding-top: 8px; border-top: 2px solid ${GOLD}; text-align: center; }
`;

const buildStatementHtml = (p) => {
  const tdsPct = pct(p.tdsPercent);
  const adminPct = pct(p.adminChargePercent);
  const categoryPayments = p.categoryPayments || [];
  const categoryBreakdown = p.categoryBreakdown || [];

  const isPaid = (c) => c && c.status === "paid" && (c.paidAt || c.paymentMode);

  const paidEntries = categoryPayments.filter(isPaid);
  const paidOn =
    p.paidAt ||
    paidEntries
      .map((c) => c.paidAt)
      .filter(Boolean)
      .sort()
      .pop();

  const incomeRows = INCOME_ROWS.filter((r) => Number(p[r.field]) > 0)
    .map(
      (r) =>
        `<tr class="inc"><td>${esc(r.label)}</td><td>${esc(r.rule)}</td><td class="r">${money(p[r.field])}</td></tr>`,
    )
    .join("");

  const totalDeductions = (p.tdsAmount || 0) + (p.adminChargeAmount || 0);

  const modeText = (c) => {
    const mode = MODE_LABEL[c.paymentMode] || c.paymentMode || "-";
    if (!c.transactionId) return esc(mode);
    const label =
      c.paymentMode === "upi" || c.paymentMode === "bank" ? "TRN" : "Ref";
    return `${esc(mode)}<br/>(${label}:${esc(c.transactionId)})`;
  };

  const disbursement = `<table>
    <colgroup><col style="width:30%"><col style="width:34%"><col style="width:16%"><col style="width:20%"></colgroup>
    <thead>
      <tr><th>Disbursed category</th><th>Mode / transaction ID</th><th class="c">Paid on</th><th class="r">Net amount (₹)</th></tr>
    </thead>
    <tbody>
      ${Object.keys(CATEGORY_LABEL)
        .map((cat) => {
          const c = categoryPayments.find((x) => x.category === cat);
          const b = categoryBreakdown.find((x) => x.category === cat);
          const paid = isPaid(c);
          const net = b?.netAmount ?? c?.netAmount ?? 0;
          return `<tr class="inc">
            <td>${esc(CATEGORY_LABEL[cat])}</td>
            <td>${paid ? modeText(c) : "-"}</td>
            <td class="c">${paid ? esc(c.paidAt ? formatDate(c.paidAt) : "-") : "Unpaid"}</td>
            <td class="r">${money(net)}</td>
          </tr>`;
        })
        .join("")}
    </tbody>
  </table>`;

  const words = amountInWordsIN(p.netAmount).replace(/ Only$/, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Payout-${esc(p.user?.referralId || "statement")}</title>
<style>${CSS}</style>
</head>
<body>
<img class="watermark" src="${esc(logoLeft)}" alt="" onerror="this.style.display='none'" />
<div class="page">
  <img class="corner l" src="${esc(abs(receptCorner))}" alt="" />
  <img class="corner r" src="${esc(abs(receptCorner))}" alt="" />

  <div class="head">
    <img class="logo" src="${esc(abs(logoLeft))}" alt="" onerror="this.style.visibility='hidden'" />
    <div class="mid">
      <h1>Anokhi Homes Private Limited &amp;<br />Patliputra Anokhi Homes Private Limited</h1>
      <span class="badge">Associate commission payout statement</span>
    </div>
    <img class="logo" src="${esc(abs(logoRight))}" alt="" onerror="this.style.visibility='hidden'" />
  </div>

  <div class="box">
    <div class="cell">
      <div class="ic">${ICONS.calendar}</div>
      <div>
        <div class="vl">Payout cycle</div>
        <div class="vv">${esc(formatDate(p.cycleStart))} to ${esc(formatDate(p.cycleEnd))}</div>
      </div>
    </div>
    <div class="cell">
      <div class="ic">${ICONS.doc}</div>
      <div>
        <div class="vl">Receipt/Invoice No.</div>
        <div class="vv">${esc(getInvoiceNo(p))}</div>
      </div>
    </div>
    <div class="cell">
      <div class="ic">${ICONS.user}</div>
      <div>
        <div class="vl up">Associate name/ID</div>
        <div class="vv up">${esc(p.user?.name || "-")} / ${esc(p.user?.referralId || "-")}</div>
      </div>
    </div>
    <div class="cell">
      <div class="ic">${ICONS.calendar}</div>
      <div>
        <div class="vl">Paid On</div>
        <div class="vv">${esc(paidOn ? formatDate(paidOn) : "Unpaid")}</div>
      </div>
    </div>
  </div>

  <table>
    <colgroup><col style="width:30%"><col style="width:42%"><col style="width:28%"></colgroup>
    <thead>
      <tr><th>Income component</th><th>Calculation rule</th><th class="r">Gross amount (₹)</th></tr>
    </thead>
    <tbody>
      ${incomeRows}
      <tr class="gross"><td colspan="2">Gross earnings for the cycle</td><td class="r">${money(p.grossAmount)}</td></tr>
      <tr><td colspan="2">Less: Statutory TDS deduction (Sec 194H @ ${tdsPct}%)</td><td class="r neg">- ${money(p.tdsAmount)}</td></tr>
      <tr><td colspan="2">Less: Admin &amp; processing platform charges (${adminPct}%)</td><td class="r neg">- ${money(p.adminChargeAmount)}</td></tr>
      <tr class="ded"><td colspan="2">Total statutory deductions (${pct(tdsPct + adminPct)}%)</td><td class="r">- ${money(totalDeductions)}</td></tr>
      <tr class="net"><td colspan="2">Net remittance</td><td class="r">${money(p.netAmount)}</td></tr>
    </tbody>
  </table>

  ${disbursement}

  <div class="words"><span class="k">Net amount in words:</span><span class="v">${esc(words)}</span></div>

  <div class="sign">
    <div>Verified by Accounts Team</div>
    <div>Director / Managing Authority<br/>(Anokhi Homes Pvt. Ltd.)</div>
  </div>

    <img class="foot" src="${esc(abs(receptFooter))}" alt="" />
</div>
</body>
</html>`;
};

export const printPayoutStatement = (payout) => {
  if (!payout) return;
  const cycleEnd = String(payout.cycleEnd || "").slice(0, 10);
  printHtml(
    buildStatementHtml(payout),
    `Payout-${payout.user?.referralId || "statement"}-${cycleEnd}`,
  );
};
