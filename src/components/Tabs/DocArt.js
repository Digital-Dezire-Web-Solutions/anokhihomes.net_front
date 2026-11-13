import React from "react";
import receptFooter from "../../Assets/Logo/Payout-reciept-footer.jpg";
import receptCorner from "../../Assets/Logo/Payout-reciept-head-LeftandRight.png";

/* ---------- CERTIFIED MEDAL (gold seal + green ribbons) ---------- */
export const CertifiedMedal = ({ width = 96 }) => {
  const bumps = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * 2 * Math.PI;
    return [60 + 46 * Math.cos(a), 58 + 46 * Math.sin(a)];
  });

  // laurel leaves: left side + mirrored right side, open at the top
  const leaves = [];
  [105, 125, 145, 165, 185, 205, 225].forEach((deg) => {
    [deg, 180 - deg].forEach((d) => {
      const a = (d * Math.PI) / 180;
      const x = 60 + 24 * Math.cos(a);
      const y = 58 + 24 * Math.sin(a);
      leaves.push(
        <ellipse
          key={`${deg}-${d}`}
          cx={x}
          cy={y}
          rx="4.2"
          ry="1.9"
          transform={`rotate(${d + 90} ${x} ${y})`}
          fill="#f6e3a1"
        />,
      );
    });
  });

  return (
    <svg
      viewBox="0 0 120 150"
      width={width}
      height={(width * 150) / 120}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="cm-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f9e79a" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#a67c00" />
        </linearGradient>
        <linearGradient id="cm-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a8040" />
          <stop offset="1" stopColor="#0b4a22" />
        </linearGradient>
      </defs>

      {/* ribbons (behind the seal) */}
      <polygon
        points="34,86 64,96 52,148 39,136 26,144"
        fill="url(#cm-green)"
        stroke="#d4af37"
        strokeWidth="1.2"
      />
      <polygon
        points="86,86 56,96 68,148 81,136 94,144"
        fill="url(#cm-green)"
        stroke="#d4af37"
        strokeWidth="1.2"
      />

      {/* scalloped gold seal */}
      <circle cx="60" cy="58" r="46" fill="url(#cm-gold)" />
      {bumps.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6.5" fill="url(#cm-gold)" />
      ))}
      <circle
        cx="60"
        cy="58"
        r="41"
        fill="url(#cm-gold)"
        stroke="#fff7d6"
        strokeWidth="1.5"
      />

      {/* green centre */}
      <circle cx="60" cy="58" r="35" fill="#0b4a22" />
      <circle
        cx="60"
        cy="58"
        r="32"
        fill="none"
        stroke="#d4af37"
        strokeWidth="1"
      />

      {leaves}

      {/* house */}
      <path d="M60 44 L47 56 h4 v11 h18 v-11 h4 z" fill="#f6e3a1" />
      <rect x="56.5" y="58" width="7" height="9" fill="#0b4a22" />
    </svg>
  );
};

/* ---------- ID CARD BOTTOM ART (skyline + roof + green band) ---------- */
export const CardFooter = ({ text }) => {
  // [x, y, width, height] buildings on the left, mirrored for the right
  const left = [
    [26, 34, 10, 18],
    [40, 26, 12, 26],
    [56, 32, 9, 20],
    [69, 20, 12, 32],
    [85, 36, 9, 16],
    [98, 30, 10, 22],
    [112, 38, 8, 14],
  ];
  const city = [...left, ...left.map(([x, y, w, h]) => [340 - x - w, y, w, h])];

  return (
    <div className="idc-foot">
      <img className="ac-city" src={receptFooter} alt="" />
    </div>
  );
};

/* ---------- small icons for the details box ---------- */
export const IconId = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6 16c.6-1.6 1.8-2.3 3-2.3s2.4.7 3 2.3M14 10h4M14 13h4" />
  </svg>
);

export const IconPhone = () => (
  <svg viewBox="0 0 24 24">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

export const IconCalendar = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
