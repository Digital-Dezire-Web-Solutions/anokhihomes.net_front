import formatDate from "../DateFormate/DateFormate";
import { esc, amountInWordsIN, printHtml } from "./printdocument";
// Left logo: Anokhi Homes (change the file name to yours)
import logoLeft from "../../Assets/Logo/ah-logo.png";
// Right logo: Patliputra Anokhi Homes
import logoRight from "../../Assets/Logo/ah-logo.png";

// One row per income field on the Payout document. Only rows with an
// amount > 0 are printed. The "rule" text is yours to reword.
const INCOME_ROWS = [
  { field: "directIncome", label: "Direct Income", rule: "Slab percentage on personal business" },
  { field: "differenceIncome", label: "Difference Income", rule: "Hierarchy percentage differential" },
  { field: "matchingIncome", label: "Matching Income", rule: "Team business matching (six-month cycle)" },
  { field: "royaltyIncome", label: "Royalty Income", rule: "Rank-based royalty (six-month cycle)" },
  { field: "cashbackIncome", label: "Cashback Income", rule: "Special payment clearance criteria" },
  { field: "bestPerformanceIncome", label: "Performer Income", rule: "Best Performer Income" },
  { field: "festivalBonusIncome", label: "Festival Bonus Income", rule: "Festival bonus scheme" },
  { field: "referralIncome", label: "Referral Income", rule: "Referral earnings" },
  { field: "rewardIncome", label: "Reward Income", rule: "Approved target reward schemes" },
];

const CATEGORY_LABEL = { "Anokhi Homes": "Anokhi Homes + Other", Patliputra: "Patliputra" };
const MODE_LABEL = { cash: "Cash", upi: "UPI", cheque: "Cheque", bank: "Bank Transfer" };

// ₹1,23,456.00 (always 2 decimals, Indian grouping)
const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const pct = (n) => Number(Number(n || 0).toFixed(2));
const abs = (src) => new URL(src, window.location.href).href;

// Uses a stored number if the payout has one (p.invoiceNo / p.voucherNo),
// otherwise derives one: PAY20260930-A3F2 (cycle end date + last 4 of the id)
const getInvoiceNo = (p) => {
  if (p.invoiceNo || p.voucherNo) return p.invoiceNo || p.voucherNo;
  const d = String(p.cycleEnd || "").slice(0, 10).replace(/-/g, "");
  return `PAY${d}-${String(p._id || "").slice(-4).toUpperCase()}`;
};

const CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1b2233;
    font-size: 14px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { display: flex; flex-direction: column; width: 210mm; min-height: 296.5mm; padding: 9mm 10mm 12mm; }

  .head { display: grid; grid-template-columns: 124px 1fr 124px; align-items: center; gap: 12px; margin: 0 -6mm 22px; }
  .logo { width: 124px; height: 124px; object-fit: contain; }
  .mid { text-align: center; }
  h1 { margin: 0 0 18px; font-size: 17.5px; line-height: 1.3; font-weight: 800; letter-spacing: .2px; text-transform: uppercase; color: #111827; }
  .badge { display: inline-block; padding: 5px 18px; border: 1px solid #bfc4cc; border-radius: 6px; background: #f4f5f7; font-size: 11.5px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; }

  .box { display: grid; grid-template-columns: 1fr 1fr; gap: 26px 20px; padding: 18px 22px; margin-bottom: 20px; border: 1.5px dashed #b8bcc4; border-radius: 16px; }
  .box .r { text-align: right; }
  .vl { font-size: 15px; font-weight: 500; color: #1f2937; }
  .vl.up { text-transform: uppercase; }
  .vv { margin-top: 3px; font-size: 20px; font-weight: 700; color: #111827; }
  .vv.up { text-transform: uppercase; }

  table { width: 100%; table-layout: fixed; border-collapse: separate; border-spacing: 0; border: 1px solid #b9bec7; border-radius: 14px; overflow: hidden; margin-bottom: 22px; }
  th { padding: 15px 16px; border-bottom: 1px solid #c3c8d0; text-align: left; font-size: 11.5px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; }
  td { padding: 12px 16px; border-bottom: 1px solid #c3c8d0; font-size: 14px; }
  tbody tr:last-child td { border-bottom: 0; }
  tr { break-inside: avoid; }
  .r { text-align: right; }
  .strong td { font-weight: 800; text-transform: uppercase; }
  .neg { color: #b42318; }
  .net td { padding: 14px 16px; font-size: 21px; font-weight: 800; text-transform: uppercase; color: #1d6b34; }

  .words { display: flex; gap: 14px; align-items: flex-start; }
  .words .k { width: 206px; flex: none; font-size: 15px; color: #4b5563; padding-top: 3px; }
  .words .v { flex: 1; font-size: 20px; line-height: 1.25; font-weight: 700; font-style: italic; color: #1d6b34; }

  .sign { display: flex; justify-content: space-between; margin: auto -3mm 0; padding-top: 70px; font-size: 13px; color: #666d7a; }
  .sign div { min-width: 182px; padding-top: 8px; border-top: 1.2px solid #c8ccd4; text-align: center; }
`;

const buildStatementHtml = (p) => {
  const tdsPct = pct(p.tdsPercent);
  const adminPct = pct(p.adminChargePercent);
  const paidEntries = (p.categoryPayments || []).filter((c) => c.status === "paid");
  const paidOn =
    p.paidAt || paidEntries.map((c) => c.paidAt).filter(Boolean).sort().pop();

  const incomeRows = INCOME_ROWS.filter((r) => Number(p[r.field]) > 0)
    .map(
      (r) =>
        `<tr><td>${esc(r.label)}</td><td>${esc(r.rule)}</td><td class="r">${money(p[r.field])}</td></tr>`,
    )
    .join("");

  const totalDeductions = (p.tdsAmount || 0) + (p.adminChargeAmount || 0);

  const modeText = (c) => {
    const mode = MODE_LABEL[c.paymentMode] || c.paymentMode || "-";
    if (!c.transactionId) return esc(mode);
    const label = c.paymentMode === "upi" || c.paymentMode === "bank" ? "TRN" : "Ref";
    return `${esc(mode)} (${label}:${esc(c.transactionId)})`;
  };

  const disbursement = paidEntries.length
    ? `<table>
        <colgroup><col style="width:32%"><col style="width:36%"><col style="width:17%"><col style="width:15%"></colgroup>
        <thead>
          <tr><th>Disbursed category</th><th>Mode / transaction ID</th><th>Paid on</th><th class="r">Net paid</th></tr>
        </thead>
        <tbody>
          ${paidEntries
            .map(
              (c) => `<tr>
                <td>${esc(CATEGORY_LABEL[c.category] || c.category)}</td>
                <td>${modeText(c)}</td>
                <td>${esc(c.paidAt ? formatDate(c.paidAt) : "-")}</td>
                <td class="r">${money(c.netAmount)}</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>`
    : "";

  const words = amountInWordsIN(p.netAmount).replace(/ Only$/, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Payout-${esc(p.user?.referralId || "statement")}</title>
<style>${CSS}</style>
</head>
<body>
<div class="page">

  <div class="head">
    <img class="logo" src="${esc(abs(logoLeft))}" alt="" onerror="this.style.visibility='hidden'" />
    <div class="mid">
      <h1>Anokhi Homes Private Limited &amp;<br />Patliputra Anokhi Homes Private Limited</h1>
      <span class="badge">Associate commission payout statement</span>
    </div>
    <img class="logo" src="${esc(abs(logoRight))}" alt="" onerror="this.style.visibility='hidden'" />
  </div>

  <div class="box">
    <div>
      <div class="vl up">Payout cycle</div>
      <div class="vv">${esc(formatDate(p.cycleStart))} to ${esc(formatDate(p.cycleEnd))}</div>
    </div>
    <div class="r">
      <div class="vl">Receipt/Invoice No:</div>
      <div class="vv">${esc(getInvoiceNo(p))}</div>
    </div>
    <div>
      <div class="vl up">Associate name/ID</div>
      <div class="vv up">${esc(p.user?.name || "-")} / ${esc(p.user?.referralId || "-")}</div>
    </div>
    <div class="r">
      <div class="vl">Paid On</div>
      <div class="vv">${esc(paidOn ? formatDate(paidOn) : "Unpaid")}</div>
    </div>
  </div>

  <table>
    <colgroup><col style="width:31%"><col style="width:50%"><col style="width:19%"></colgroup>
    <thead>
      <tr><th>Income component</th><th>Calculation rule</th><th class="r">Gross amount</th></tr>
    </thead>
    <tbody>
      ${incomeRows}
      <tr class="strong"><td colspan="2">Gross earnings for the cycle</td><td class="r">${money(p.grossAmount)}</td></tr>
      <tr><td colspan="2">Less: Statutory TDS deduction (Sec 194H @ ${tdsPct}%)</td><td class="r neg">- ${money(p.tdsAmount)}</td></tr>
      <tr><td colspan="2">Less: Admin &amp; processing platform charges (${adminPct}%)</td><td class="r neg">- ${money(p.adminChargeAmount)}</td></tr>
      <tr class="strong neg"><td colspan="2">Total statutory deductions (${pct(tdsPct + adminPct)}%)</td><td class="r">- ${money(totalDeductions)}</td></tr>
      <tr class="net"><td colspan="2">Net remittance</td><td class="r">${money(p.netAmount)}</td></tr>
    </tbody>
  </table>

  ${disbursement}

  <div class="words"><span class="k">Net amount in words:</span><span class="v">${esc(words)}</span></div>

  <div class="sign">
    <div>Verified by Accounts Team</div>
    <div>Director / Managing Authority</div>
  </div>

</div>
</body>
</html>`;
};

// Opens the browser's print dialog for this payout's statement.
// The person picks "Save as PDF" as the destination to download it.
export const printPayoutStatement = (payout) => {
  if (!payout) return;
  const cycleEnd = String(payout.cycleEnd || "").slice(0, 10);
  printHtml(
    buildStatementHtml(payout),
    `Payout-${payout.user?.referralId || "statement"}-${cycleEnd}`,
  );
};