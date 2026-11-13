import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import formatDate from "../DateFormate/DateFormate";
import logoLeft from "../../Assets/Logo/ah-logo.png";
import logoRight from "../../Assets/Logo/pah-logo.png";
import "./AgentDocuments.css";
import receptFooter from "../../Assets/Logo/Payout-reciept-footer.jpg";
import receptCorner from "../../Assets/Logo/Payout-reciept-head-LeftandRight.png";
import {
  CertifiedMedal,
  CardFooter,
  IconId,
  IconPhone,
  IconCalendar,
} from "./DocArt";
import { FaLocationDot } from "react-icons/fa6";

// ✏️ EDIT THESE: company details printed on the letter and the card back
const COMPANY = {
  name: "Anokhi Homes Pvt. Ltd.",
  address: "Patna, Bihar - 800001",
  //   phone: "+91 00000 00000",
  email: "anokhihomesprivetlimted@gmail.com",
  website: "www.anokhihomes.net",
  signatory: "Authorised Signatory",
};

// cache-buster so the avatar is re-fetched with CORS headers (needed for PDF capture)
const corsUrl = (url) =>
  url ? `${url}${url.includes("?") ? "&" : "?"}cb=1` : "";

const toCanvas = (el) =>
  html2canvas(el, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });

// ✏️ Add your Patliputra logo file, then uncomment the import and set it below
const PATLIPUTRA_LOGO = logoRight; // replace with: patliputraLogo

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// last completed 16th -> 15th cycle
const defaultPeriod = () => {
  const t = new Date();
  let end = new Date(t.getFullYear(), t.getMonth(), 15);
  if (end > t) end = new Date(t.getFullYear(), t.getMonth() - 1, 15);
  const start = new Date(end.getFullYear(), end.getMonth() - 1, 16);
  return { from: iso(start), to: iso(end) };
};

const dmy = (s) => (s ? s.split("-").reverse().join("-") : "");

const isRNWebView = () =>
  typeof window !== "undefined" && !!window.ReactNativeWebView;

const sendToApp = (pdf, fileName) => {
  const dataUri = pdf.output("datauristring"); // data:application/pdf;filename=...;base64,XXXX
  const base64 = dataUri.split("base64,")[1];
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: "DOWNLOAD_PDF", fileName, base64 }),
  );
};

const AgentDocuments = ({ userData, setAlert, data }) => {
  const [doc, setDoc] = useState("letter");
  const [busy, setBusy] = useState(false);
  const letterRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const certRef = useRef(null);
  const [period, setPeriod] = useState(defaultPeriod);
  const isApproved = userData?.status === "active";

  if (userData?.role !== "agent") return null;

  if (!isApproved) {
    return (
      <div className="card ad-locked">
        Welcome letter and ID card will be available once the associate is
        approved.
      </div>
    );
  }

  const initials = (userData.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // one source of truth for what goes on the page (used by both PDF and print)
  const getLayout = async () => {
    if (doc === "certificate") {
      const c = await toCanvas(certRef.current);
      return {
        orientation: "landscape",
        items: [{ src: c.toDataURL("image/png"), x: 0, y: 0, w: 297, h: 210 }],
      };
    }

    if (doc === "letter") {
      const c = await toCanvas(letterRef.current);
      return {
        orientation: "portrait",
        items: [{ src: c.toDataURL("image/png"), x: 0, y: 0, w: 210, h: 297 }],
      };
    }

    const front = await toCanvas(frontRef.current);
    const back = await toCanvas(backRef.current);
    const w = 54;
    const h = 85.6;
    const gap = 10;
    const x1 = (210 - (w * 2 + gap)) / 2;
    const y = 30;

    return {
      orientation: "portrait",
      items: [
        { src: front.toDataURL("image/png"), x: x1, y, w, h },
        { src: back.toDataURL("image/png"), x: x1 + w + gap, y, w, h },
      ],
    };
  };

  const buildPdf = async () => {
    const layout = await getLayout();
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: layout.orientation,
    });
    layout.items.forEach((i) => pdf.addImage(i.src, "PNG", i.x, i.y, i.w, i.h));
    return pdf;
  };

  // prints from a hidden frame on THIS page (no new tab)
  const printInPlace = (layout, title) =>
    new Promise((resolve) => {
      const pageW = layout.orientation === "landscape" ? 297 : 210;
      const pageH = layout.orientation === "landscape" ? 210 : 297;

      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
      document.body.appendChild(iframe);

      const d = iframe.contentWindow.document;
      d.open();
      d.write(`<!doctype html><html><head><title>${title}</title><style>
      @page { size: A4 ${layout.orientation}; margin: 0; }
      html, body { margin: 0; padding: 0; }
      .page { position: relative; width: ${pageW}mm; height: ${pageH}mm; overflow: hidden; }
      img { position: absolute; display: block; }
    </style></head><body><div class="page">
      ${layout.items
        .map(
          (i) =>
            `<img src="${i.src}" style="left:${i.x}mm;top:${i.y}mm;width:${i.w}mm;height:${i.h}mm">`,
        )
        .join("")}
    </div></body></html>`);
      d.close();

      const cleanup = () => setTimeout(() => iframe.remove(), 1000);

      // wait until every image has loaded, then print
      Promise.all(
        Array.from(d.images).map((img) =>
          img.complete
            ? null
            : new Promise((r) => {
                img.onload = r;
                img.onerror = r;
              }),
        ),
      ).then(() => {
        const w = iframe.contentWindow;
        w.onafterprint = cleanup;
        setTimeout(cleanup, 120000); // fallback if the browser never fires afterprint
        w.focus();
        w.print();
        resolve();
      });
    });

  const label = {
    letter: "Welcome-Letter",
    card: "ID-Card",
    certificate: "Associate-Certificate",
  }[doc];
  const fileName = `${label}-${userData.referralId}.pdf`;

  const handleDownload = async () => {
    try {
      setBusy(true);
      const pdf = await buildPdf();
      if (isRNWebView()) {
        sendToApp(pdf, fileName);
      } else {
        pdf.save(fileName);
      }
    } catch (err) {
      console.log(err);
      setAlert?.({ message: "Failed to create PDF", status: "Error" });
      setTimeout(() => setAlert?.(null), 3000);
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = async () => {
    try {
      setBusy(true);
      const layout = await getLayout();
      await printInPlace(layout, fileName);
    } catch (err) {
      console.log(err);
      setAlert?.({ message: "Failed to print", status: "Error" });
      setTimeout(() => setAlert?.(null), 3000);
    } finally {
      setBusy(false);
    }
  };

  const avatar = corsUrl(userData.avatar);
  console.log(userData, "userData");

  return (
    <div className="ad-wrap">
      <div className="ad-toolbar">
        <div className="ad-tabs">
          <button
            type="button"
            className={doc === "letter" ? "active" : ""}
            onClick={() => setDoc("letter")}
          >
            Welcome Letter
          </button>
          <button
            type="button"
            className={doc === "card" ? "active" : ""}
            onClick={() => setDoc("card")}
          >
            ID Card
          </button>
          <button
            type="button"
            className={doc === "certificate" ? "active" : ""}
            onClick={() => setDoc("certificate")}
          >
            Certificate
          </button>
        </div>

        <div className="ad-actions">
          <button type="button" disabled={busy} onClick={handlePrint}>
            {busy ? "Preparing..." : "Print"}
          </button>
          <button type="button" disabled={busy} onClick={handleDownload}>
            {busy ? "Preparing..." : "Download PDF"}
          </button>
        </div>
      </div>
      {/* {doc === "certificate" && (
        <div className="ad-period">
          <label>
            Cycle from
            <input
              type="date"
              value={period.from}
              onChange={(e) => setPeriod({ ...period, from: e.target.value })}
            />
          </label>
          <label>
            to
            <input
              type="date"
              value={period.to}
              onChange={(e) => setPeriod({ ...period, to: e.target.value })}
            />
          </label>
        </div>
      )} */}
      <div className="ad-preview">
        {/* ================= WELCOME LETTER ================= */}
        {doc === "letter" && (
          <div className="wl" ref={letterRef}>
            <img className="wm wl-wm" src={logoLeft} alt="" />
            <img className="wl-corner l" src={receptCorner} alt="" />
            <img className="wl-corner r" src={receptCorner} alt="" />

            <div className="wl-head">
              <img className="wl-logo" src={logoLeft} alt="" />
              <div className="wl-title">
                <h2>ANOKHI HOMES PRIVATE LIMITED &amp;</h2>
                <h2>PATLIPUTRA ANOKHI HOMES PRIVATE LIMITED</h2>
                <div className="wl-badge">WELCOME LETTER</div>
              </div>
              <img className="wl-logo" src={logoRight} alt="" />
            </div>

            <div className="wl-body">
              {/* <div className="wl-meta">
                <span>Ref: {userData.referralId}</span>
                <span>Date: {formatDate(userData.createdAt)}</span>
              </div> */}

              <p className="wl-to">
                {/* <strong>To,</strong> */}
                <br />
                <span
                  style={{ textTransform: "capitalize", fontWeight: "600" }}
                >
                  {userData.name}
                </span>
                {userData.address && (
                  <>
                    <br />
                    {userData.address}
                  </>
                )}
                <br />
                Phone: {userData.phone}
              </p>

              <p className="wl-subject">Subject: Welcome to {COMPANY.name}</p>

              <p>Dear {userData.name},</p>

              <p>
                We are delighted to welcome you to the {COMPANY.name} family.
                Thank you for choosing to work with us as an associate. Your
                registration has been approved, and you are now an official
                member of our team.
              </p>

              <p>Your associate details are as follows:</p>

              <table className="wl-table">
                <tbody>
                  <tr>
                    <td>Associate Name</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {userData.name}
                    </td>
                  </tr>
                  <tr>
                    <td>Associate ID</td>
                    <td>{userData.referralId}</td>
                  </tr>
                  <tr>
                    <td>Designation</td>
                    <td>{userData.designation || "Sales Executive"}</td>
                  </tr>
                  <tr>
                    <td>Registered Phone</td>
                    <td>{userData.phone}</td>
                  </tr>
                  <tr>
                    <td>Registered Email</td>
                    <td>{userData.email}</td>
                  </tr>
                  <tr>
                    <td>Date of Joining</td>
                    <td>{formatDate(userData.createdAt)}</td>
                  </tr>
                </tbody>
              </table>

              <p>
                Please keep your Associate ID safe. You will need it to share referrals, track your team and follow up on your bookings. You can log in to your dashboard at any time to view your leads, site visits, bookings and earnings.
              </p>

              <p>
                We expect you to represent {COMPANY.name} with honesty and
                professionalism in every dealing with customers. We look forward
                to a successful journey together and wish you the very best.
              </p>

              <div className="wl-sign">
                <p>Warm regards,</p>
                <i />
                <strong>{COMPANY.signatory}</strong>
                <br />
                {COMPANY.name}
              </div>
            </div>

            <div className="wl-contact">
              <div className="wl-offices">
                {/* {OFFICES.filter((o) => o.address).map((o) => (
                  <div className="wl-office" key={o.title}>
                    <b>{o.title}</b>
                    <span>{o.address}</span>
                  </div>
                ))} */}
                {data?.contact?.address?.map((item) => (
                  <div className="wl-office" key={item.title}>
                    {/* <FaLocationDot /> */}
                    <b>{item?.title}</b>
                    {" - "}
                    <span style={{ fontWeight: "400" }}>{item?.content}</span>
                  </div>
                ))}
              </div>

              <div>
                {COMPANY.website} | {COMPANY.email}
              </div>
            </div>

            <div className="wl-foot">
              <img src={receptFooter} alt="" />
            </div>
          </div>
        )}

        {/* ================= ID CARD ================= */}
        {doc === "card" && (
          <div className="ad-cards">
            {/* ---------- FRONT ---------- */}
            <div className="idc" ref={frontRef}>
              <img className="wm idc-wm" src={logoLeft} alt="" />
              <img className="idc-corner l" src={receptCorner} alt="" />
              <img className="idc-corner r" src={receptCorner} alt="" />
              <div className="idc-slot" />

              <img className="idc-logo" src={logoLeft} alt="" />
              <div className="idc-title">ASSOCIATE IDENTITY CARD</div>

              <div className="idc-photo-wrap">
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    crossOrigin="anonymous"
                    className="idc-photo"
                  />
                ) : (
                  <div className="idc-photo-empty">{initials}</div>
                )}
              </div>
              <div
                className="idc-name"
                style={{
                  fontSize: (userData.name || "").length > 18 ? 19 : 24,
                }}
              >
                {userData.name}
              </div>
              <div className="idc-desig">
                {userData.designation || "Sales Executive"}
              </div>

              <div className="idc-details">
                <div className="idc-row">
                  <IconId />
                  <b>ID</b>
                  <em>:</em>
                  <span>{userData.referralId}</span>
                </div>
                <div className="idc-row">
                  <IconPhone />
                  <b>Phone</b>
                  <em>:</em>
                  <span>{userData.phone}</span>
                </div>
                <div className="idc-row">
                  <IconCalendar />
                  <b>Joined</b>
                  <em>:</em>
                  <span>{formatDate(userData.createdAt)}</span>
                </div>
              </div>

              <CardFooter text="ANOKHI HOMES PRIVATE LIMITED" />
            </div>

            {/* ---------- BACK ---------- */}
            <div className="idc" ref={backRef}>
              <img className="wm idc-wm" src={logoRight} alt="" />
              <img className="idc-corner l" src={receptCorner} alt="" />
              <img className="idc-corner r" src={receptCorner} alt="" />
              <div className="idc-slot" />

              <img className="idc-logo" src={logoRight} alt="" />
              <div className="idc-title">TERMS &amp; CONTACT</div>

              <div className="idc-back-body">
                <p>
                  <b>Email:</b> {userData.email}
                </p>
                {userData.address && (
                  <p>
                    <b>Address:</b> {userData.address}
                  </p>
                )}
                <p className="idc-terms">
                  This card is the property of {COMPANY.name} and must be
                  produced on demand. If found, please return it to the office
                  below.
                </p>
                <p>{COMPANY.address}</p>
                <p>{COMPANY.website}</p>
              </div>

              <div className="idc-back-sign">{COMPANY.signatory}</div>

              <CardFooter text={COMPANY.website} />
            </div>
          </div>
        )}
        {/* ================= ASSOCIATE CERTIFICATE ================= */}
        {doc === "certificate" && (
          <div className="ac-cert" ref={certRef}>
            <img className="wm ac-wm" src={logoLeft} alt="" />
            <div className="ac-corner ac-tl">
              <img className="corner l" src={receptCorner} alt="" />
            </div>
            <div className="ac-corner ac-tr">
              <img className="corner r" src={receptCorner} alt="" />
            </div>

            <div className="ac-seal ac-seal-l">
              <img src={logoLeft} alt="" />
            </div>
            <div className="ac-seal ac-seal-r">
              <img src={PATLIPUTRA_LOGO} alt="" />
            </div>

            <div className="ac-main">
              <h2>ANOKHI HOMES PRIVATE LIMITED &amp;</h2>
              <h2>PATLIPUTRA ANOKHI HOMES PRIVATE LIMITED</h2>

              <div className="ac-badge">ASSOCIATE CERTIFICATE</div>

              <div className="ac-certify">
                <i />
                <span>This is to Certify that</span>
                <i />
              </div>

              <div className="ac-name">{userData.name}</div>

              <div className="ac-pill">
                Associate ID : {userData.referralId}
              </div>

              <p className="ac-text">
                is a registered Associate of Anokhi Homes Private Limited &amp;
                Patliputra Anokhi Homes Private Limited.
                {/* <br />
                and has successfully completed the performance cycle. */}
              </p>

              <p className="ac-thanks">
                We appreciate your contribution, commitment and valuable
                association
                <br />
                in the growth of our organization.
              </p>
            </div>

            {/* signatures + medal on one row, so they always line up */}
            <div className="ac-foot">
              <div className="ac-sign">
                <i />
                <span>
                  CMD / Managing Authority
                  <br />
                  (Anokhi Homes Pvt. Ltd.)
                </span>
              </div>

              <CertifiedMedal width={96} />
              <div className="ac-sign">
                <i />
                <span>
                  CMD / Managing Authority
                  <br />
                  (Patliputra Anokhi Homes Pvt. Ltd.)
                </span>
              </div>
            </div>

            <div className="ac-bottom">
              <img className="ac-city" src={receptFooter} alt="" />
            </div>
          </div>
        )}
      </div>

      <p className="ad-hint">
        {doc === "letter"
          ? "Prints on one A4 page."
          : doc === "card"
            ? "Prints at real card size (54 × 85.6 mm), front and back on one A4 sheet. Cut along the edges."
            : "Prints on one landscape A4 page. Choose 'Landscape' if your printer asks."}
      </p>
    </div>
  );
};

export default AgentDocuments;
