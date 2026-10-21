
import { useLang } from "./lang.js";

const COLOR = {
  low: "#16a34a",
  medium: "#d97706",
  high: "#dc2626",
};

const RISK = {
  en: { low: "Low Risk", medium: "Suspicious", high: "High Risk" },
  hi: { low: "Kam Khatra", medium: "Shak Wala", high: "Zyada Khatra" },
};

const TEXT = {
  en: {
    score: "TRUST SCORE",
    why: "Risk Indicators",
    todo: "Recommended Actions",
    extracted: "Text read from image",
    safe: "Automated checks are estimates, not guarantees.",
    report: "Report to National Cyber Crime Portal ↗",
    tips: "Prevention Tips",
  },
  hi: {
    score: "TRUST SCORE",
    why: "Khatre ke sanket",
    todo: "Kya karein",
    extracted: "Image se padha gaya text",
    safe: "Automated check ki report guarantee nahi hoti.",
    report: "National Cyber Crime Portal par report karein ↗",
    tips: "Bachav ke tips",
  },
};

export default function Result({ res }) {
  const [lang] = useLang();
  const language = TEXT[lang] ? lang : "en";
  const level = ["low", "medium", "high"].includes(res?.level)
    ? res.level
    : "medium";
  const score = Math.max(0, Math.min(100, Number(res?.score) || 0));
  const color = COLOR[level];
  const circumference = 2 * Math.PI * 54;

  const reasons = Array.isArray(res?.reasons) ? res.reasons : [];
  const advice = Array.isArray(res?.advice?.[language])
    ? res.advice[language]
    : Array.isArray(res?.advice?.en)
      ? res.advice.en
      : [];

  function textOf(item) {
    if (typeof item === "string") return item;
    return item?.[language] || item?.en || "Review this indicator.";
  }

  return (
    <section className="result" style={{ "--c": color }}>
      <div className="result-overview">
        <svg viewBox="0 0 140 140" className="gauge" role="img"
          aria-label={`${score} out of 100`}>
          <circle cx="70" cy="70" r="54" className="g-track" />
          <circle cx="70" cy="70" r="54" className="g-bar"
            style={{
              stroke: color,
              strokeDasharray: circumference,
              strokeDashoffset: circumference * (1 - score / 100),
            }}
          />
          <text x="70" y="76" textAnchor="middle" fill={color}>{score}</text>
          <text x="70" y="94" textAnchor="middle" className="g-caption">/100</text>
        </svg>

        <div className="result-summary">
          <small>{TEXT[language].score}</small>
          <h2>{RISK[language][level]}</h2>
          <p>{res?.note?.[language] || res?.note?.en || TEXT[language].safe}</p>
          <span className={`result-badge ${level}`}>
            {level === "high" ? "⚠" : level === "medium" ? "!" : "✓"}{" "}
            {RISK[language][level]}
          </span>
        </div>
      </div>

      <div className="result-section">
        <h3>🛡 Security Scan Summary</h3>
        <p>{TEXT[language].safe}</p>
        <div className="result-metrics">
          <div><strong>{score}/100</strong><span>Risk score</span></div>
          <div><strong>{reasons.length}</strong><span>Indicators reported</span></div>
          <div><strong>{advice.length}</strong><span>Safety recommendations</span></div>
        </div>
      </div>

      <div className="result-section">
        <h3>🚨 {TEXT[language].why}</h3>
        {reasons.length ? (
          <ul>{reasons.map((item, i) => <li key={i}>{textOf(item)}</li>)}</ul>
        ) : (
          <p>No additional risk indicators were provided by the scan.</p>
        )}
      </div>

      <div className="result-section">
        <h3>➡ {TEXT[language].todo}</h3>
        {advice.length ? (
          <ul>{advice.map((item, i) => <li key={i}>{textOf(item)}</li>)}</ul>
        ) : (
          <ul>
            <li>Do not enter passwords, OTPs, or payment details.</li>
            <li>Verify the website through its official source.</li>
          </ul>
        )}
      </div>

      <div className="result-section">
        <h3>💡 {TEXT[language].tips}</h3>
        <ul>
          <li>Check the website address carefully before signing in.</li>
          <li>Never share your OTP, password, or UPI PIN.</li>
          <li>Do not download unexpected files from suspicious links.</li>
        </ul>
      </div>

      {res?.extracted_text && (
        <div className="result-section">
          <h3>{TEXT[language].extracted}</h3>
          <p className="extracted-text">{res.extracted_text}</p>
        </div>
      )}

      <p className="result-disclaimer">{TEXT[language].safe}</p>

      <a
        className="cybercrime-report-button"
        href="https://cybercrime.gov.in/webform/cyber_suspect.aspx"
        target="_blank"
        rel="noopener noreferrer"
      >
        {TEXT[language].report}
      </a>

      <p className="result-report-note">
        The official portal opens in a new tab. Review the details and submit
        your complaint there. This button does not automatically submit a report.
        For financial cyber fraud in India, call 1930 promptly.
      </p>
    </section>
  );
}
