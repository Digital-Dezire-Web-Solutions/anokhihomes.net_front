import formatDate from "../DateFormate/DateFormate";
import { formatCurrency } from "./FormatCurrency";
import {
  esc,
  amountInWordsIN,
  headerHtml,
  signatureHtml,
  wrapDocument,
  printHtml,
} from "./printdocument";

// One row per income field on the Payout document. Only rows with an
// amount > 0 are printed. The "rule" text is yours to reword.
const INCOME_ROWS = [
  { field: "directIncome", label: "Direct Income", rule: "Slab percentage on personal business" },
  { field: "differenceIncome", label: "Difference Income", rule: "Hierarchy percentage differential" },
  { field: "matchingIncome", label: "Matching Income", rule: "Team business matching (six-month cycle)" },
  { field: "royaltyIncome", label: "Royalty Income", rule: "Rank-based royalty (six-month cycle)" },
  { field: "cashbackIncome", label: "Cashback Income", rule: "Special payment clearance criteria" },
  { field: "bestPerformanceIncome", label: "Best Performance Income", rule: "Top performer incentive" },
  { field: "festivalBonusIncome", label: "Festival Bonus Income", rule: "Festival bonus scheme" },
  { field: "referralIncome", label: "Referral Income", rule: "Referral earnings" },
  { field: "rewardIncome", label: "Reward Income", rule: "Approved target reward schemes" },
];

const CATEGORY_LABEL = { "Anokhi Homes": "Anokhi Homes + Other", Patliputra: "Patliputra" };
const MODE_LABEL = { cash: "Cash", upi: "UPI", cheque: "Cheque", bank: "Bank Transfer" };

const money = (n) => `₹${formatCurrency(n || 0)}`;
const pct = (n) => Number(Number(n || 0).toFixed(2));

// No voucher number is stored on the payout, so derive a stable one:
// PAY20260929-A3F2  (cycle end date + last 4 chars of the payout id)
const getVoucherNo = (p) => {
  const d = String(p.cycleEnd || "").slice(0, 10).replace(/-/g, "");
  return `PAY${d}-${String(p._id || "").slice(-4).toUpperCase()}`;
};

const buildStatementHtml = (p) => {
  const tdsPct = pct(p.tdsPercent);
  const adminPct = pct(p.adminChargePercent);
  const paidEntries = (p.categoryPayments || []).filter((c) => c.status === "paid");
  const paidOn =
    p.paidAt ||
    paidEntries.map((c) => c.paidAt).filter(Boolean).sort().pop();

  const incomeRows = INCOME_ROWS.filter((r) => Number(p[r.field]) > 0)
    .map(
      (r) =>
        `<tr><td>${esc(r.label)}</td><td>${esc(r.rule)}</td><td class="r">${money(p[r.field])}</td></tr>`,
    )
    .join("");

  const totalDeductions = (p.tdsAmount || 0) + (p.adminChargeAmount || 0);

  const disbursement = paidEntries.length
    ? `<table>
        <thead>
          <tr><th>Disbursed category</th><th>Mode / transaction ID</th><th>Paid on</th><th class="r">Net paid</th></tr>
        </thead>
        <tbody>
          ${paidEntries
            .map(
              (c) => `<tr>
                <td>${esc(CATEGORY_LABEL[c.category] || c.category)}</td>
                <td>${esc(MODE_LABEL[c.paymentMode] || c.paymentMode || "-")}${c.transactionId ? ` | ${esc(c.transactionId)}` : ""}</td>
                <td>${esc(c.paidAt ? formatDate(c.paidAt) : "-")}</td>
                <td class="r">${money(c.netAmount)}</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>`
    : "";

  const statusText =
    p.status === "paid"
      ? `Paid (Disbursed: ${money(p.netAmount)})`
      : esc(p.status || "-");

  const body = `
    ${headerHtml("Associate Compensation & Commission Disbursement Desk", "Associate commission payout statement")}

    <div class="voucher">
      <div><div class="k">Statement voucher #</div><div class="v">${esc(getVoucherNo(p))}</div></div>
      <div><div class="k">Payout cycle</div><div class="v">${esc(formatDate(p.cycleStart))} - ${esc(formatDate(p.cycleEnd))}</div></div>
      <div><div class="k">Associate ID</div><div class="v">${esc(p.user?.referralId || "-")}</div></div>
      <div><div class="k">Paid on</div><div class="v">${esc(paidOn ? formatDate(paidOn) : "-")}</div></div>
    </div>

    <div class="line"><span class="k">Beneficiary partner name:</span><span class="v cap">${esc(p.user?.name || "-")}</span></div>
    <div class="line"><span class="k">Remittance status:</span><span class="v cap">${statusText}</span></div>

    <table>
      <thead>
        <tr><th>Income component</th><th>Calculation rule</th><th class="r">Gross amount</th></tr>
      </thead>
      <tbody>
        ${incomeRows}
        <tr class="strong"><td colspan="2">Gross earnings for the cycle</td><td class="r">${money(p.grossAmount)}</td></tr>
        <tr><td colspan="2">Less: Statutory TDS deduction (Sec 194H @ ${tdsPct}%)</td><td class="r neg">- ${money(p.tdsAmount)}</td></tr>
        <tr><td colspan="2">Less: Admin &amp; processing platform charges (${adminPct}%)</td><td class="r neg">- ${money(p.adminChargeAmount)}</td></tr>
        <tr class="strong neg"><td colspan="2">Total statutory deductions (${pct(tdsPct + adminPct)}%)</td><td class="r">- ${money(totalDeductions)}</td></tr>
        <tr class="total"><td colspan="2">Net remittance eligible</td><td class="r amt">${money(p.netAmount)}</td></tr>
      </tbody>
    </table>

    ${disbursement}

    <div class="line words"><span class="k">Net amount in words:</span><span class="v">${esc(amountInWordsIN(p.netAmount))}</span></div>

    ${signatureHtml}
  `;

  return wrapDocument(`Payout-${p.user?.referralId || "statement"}`, body);
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