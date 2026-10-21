
import { useState, useEffect } from "react";
import { useLang } from "./lang.js";
import { HOME_IMAGES } from "./homeImages.js";
import "./scanner.css";

const API = import.meta.env.VITE_API || "http://localhost:8001";

const CYBERCRIME_URL =
  "https://cybercrime.gov.in/webform/cyber_suspect.aspx";

const LOG = [
  "resolving host...",
  "extracting URL features...",
  "running ML classifier...",
  "scanning suspicious patterns...",
  "building explanation...",
];

const T = {
  en: {
    url: "Check a link",
    msg: "Check a message",
    scan: "Analyze for threats",
    ph1: "Paste a suspicious URL, e.g. example.com/login",
    ph2: "Paste the complete SMS or WhatsApp message here...",
    why: "Why this result?",
    todo: "Recommended actions",
    report: "Report to college IT",
    sent: "Report submitted",
    err: "Backend not reachable. Check that the API is running.",
    risk: {
      low: "Low risk",
      medium: "Suspicious",
      high: "High risk",
    },
    links: "Links found",
  },
  hi: {
    url: "Link check karein",
    msg: "Message check karein",
    scan: "Threat scan karein",
    ph1: "Shak wala link paste karein",
    ph2: "Poora SMS ya WhatsApp message yahan paste karein...",
    why: "Aisa result kyun aaya?",
    todo: "Ab kya karein?",
    report: "College IT ko report karein",
    sent: "Report submit ho gayi",
    err: "Backend nahi mila. API connection check karein.",
    risk: {
      low: "Kam khatra",
      medium: "Shak wala",
      high: "Zyada khatra",
    },
    links: "Mile hue links",
  },
};

const COLOR = {
  low: "#16a34a",
  medium: "#d97706",
  high: "#dc2626",
};

function Gauge({ score, level }) {
  const circumference = 2 * Math.PI * 54;
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const color = COLOR[level] || COLOR.medium;

  return (
    <svg
      viewBox="0 0 140 140"
      className="scanner-gauge"
      role="img"
      aria-label={`Risk score ${safeScore} out of 100`}
    >
      <circle
        cx="70"
        cy="70"
        r="54"
        className="scanner-gauge-track"
      />

      <circle
        cx="70"
        cy="70"
        r="54"
        className="scanner-gauge-bar"
        style={{
          stroke: color,
          strokeDasharray: circumference,
          strokeDashoffset:
            circumference * (1 - safeScore / 100),
        }}
      />

      <text
        x="70"
        y="78"
        textAnchor="middle"
        className="scanner-gauge-number"
        fill={color}
      >
        {safeScore}
      </text>

      <text
        x="70"
        y="96"
        textAnchor="middle"
        className="scanner-gauge-caption"
      >
        OUT OF 100
      </text>
    </svg>
  );
}

export default function App() {
  const [tab, setTab] = useState("url");
  const [input, setInput] = useState("");
  const [lang] = useLang();

  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState("");

  const [sent, setSent] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const t = T[lang] || T.en;

  useEffect(() => {
    if (!loading) return undefined;

    setStep(0);

    const id = window.setInterval(() => {
      setStep((current) =>
        Math.min(current + 1, LOG.length - 1)
      );
    }, 500);

    return () => window.clearInterval(id);
  }, [loading]);

  function resetResult() {
    setRes(null);
    setErr("");
    setSent(false);

    setRating(0);
    setFeedback("");
    setFeedbackSent(false);
    setFeedbackError("");
  }

  async function scan() {
    if (!input.trim() || loading) return;

    setLoading(true);
    setErr("");
    setRes(null);
    setSent(false);

    setRating(0);
    setFeedback("");
    setFeedbackSent(false);
    setFeedbackError("");

    try {
      const token = localStorage.getItem("phishshield_token");

      const [response] = await Promise.all([
        fetch(
          `${API}/analyze/${tab === "url" ? "url" : "message"}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            },
            body: JSON.stringify(
              tab === "url"
                ? { url: input.trim() }
                : { text: input.trim() }
            ),
          }
        ),

        new Promise((resolve) => window.setTimeout(resolve, 900)),
      ]);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "The scan could not be completed."
        );
      }

      setRes(data);
    } catch (error) {
      setErr(error.message || t.err);
    } finally {
      setLoading(false);
    }
  }

  async function report() {
    if (!res || sent) return;

    setErr("");

    try {
      const token = localStorage.getItem("phishshield_token");

      const response = await fetch(`${API}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body: JSON.stringify({
          kind: tab,
          content: input,
          score: res.score,
          level: res.level,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Report could not be saved. Please try again."
        );
      }

      setSent(true);
    } catch (error) {
      setErr(error.message || "Report could not be submitted.");
    }
  }

  function submitFeedback() {
    if (!res || !rating || feedbackSent) return;

    setFeedbackError("");

    try {
      const stored = localStorage.getItem("phishshield_feedback");
      const previous = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(previous)) {
        throw new Error("Invalid feedback data");
      }

      const item = {
        rating,
        feedback: feedback.trim(),
        score: res.score,
        level: res.level,
        kind: tab,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "phishshield_feedback",
        JSON.stringify([...previous, item])
      );

      setFeedbackSent(true);
    } catch {
      setFeedbackError(
        "Feedback could not be saved in this browser."
      );
    }
  }

  const level = res?.level?.toLowerCase();
  const riskLabel = t.risk[level] || t.risk.medium;

  const reasons = Array.isArray(res?.reasons)
    ? res.reasons
    : [];

  const advice = Array.isArray(res?.advice?.[lang])
    ? res.advice[lang]
    : Array.isArray(res?.advice?.en)
      ? res.advice.en
      : [];

  function readable(item) {
    if (typeof item === "string") return item;

    return (
      item?.[lang] ||
      item?.en ||
      "Review this indicator."
    );
  }

  return (
    <main className="scanner-page">
      {/* HERO */}
      <section className="scanner-hero">
        <div className="scanner-hero-copy">
          <span className="scanner-eyebrow">
            PHISHSHIELD / AI SECURITY LAB
          </span>

          <h1>
            Stop. Scan.
            <br />
            <span>Stay protected.</span>
          </h1>

          <p>
            Check suspicious links and messages before you click,
            pay, or share personal information. Get a risk score
            and the reasons behind it.
          </p>

          <div className="scanner-trust-points">
            <span>01 / ANALYZE</span>
            <span>02 / UNDERSTAND</span>
            <span>03 / ACT SAFELY</span>
          </div>
        </div>

        <div className="scanner-hero-image">
          <img
            src={HOME_IMAGES.threatIntelligence}
            alt="Cybersecurity analysis on a computer"
          />

          <div className="scanner-image-overlay">
            <span className="scanner-live-dot" />
            THREAT ANALYSIS SYSTEM
          </div>
        </div>
      </section>

      {/* SCANNER */}
      <section className="scanner-workspace">
        <div className="scanner-workspace-heading">
          <div>
            <span className="scanner-eyebrow">
              SECURITY CHECK
            </span>
            <h2>What would you like to scan?</h2>
            <p>
              Choose a scan type and enter the content below.
            </p>
          </div>

          <span className="scanner-status">
            <span className="scanner-live-dot" />
            READY
          </span>
        </div>

        <div className="scanner-console">
          <div
            className="scanner-tabs"
            role="tablist"
            aria-label="Scan type"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "url"}
              className={tab === "url" ? "active" : ""}
              onClick={() => {
                setTab("url");
                setInput("");
                resetResult();
              }}
            >
              <img src={HOME_IMAGES.urlScanner} alt="" />
              <span>
                <strong>{t.url}</strong>
                <small>Check suspicious URLs</small>
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={tab === "msg"}
              className={tab === "msg" ? "active" : ""}
              onClick={() => {
                setTab("msg");
                setInput("");
                resetResult();
              }}
            >
              <img src={HOME_IMAGES.messageScanner} alt="" />
              <span>
                <strong>{t.msg}</strong>
                <small>Check SMS and messages</small>
              </span>
            </button>
          </div>

          <label
            className="scanner-input-label"
            htmlFor="scanner-input"
          >
            {tab === "url" ? "SUSPICIOUS LINK" : "MESSAGE CONTENT"}
          </label>

          {tab === "url" ? (
            <input
              id="scanner-input"
              className="scanner-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") scan();
              }}
              placeholder={t.ph1}
              autoComplete="off"
              spellCheck={false}
            />
          ) : (
            <textarea
              id="scanner-input"
              className="scanner-input scanner-textarea"
              rows={5}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.ph2}
            />
          )}

          <div className="scanner-input-footer">
            <span>{input.length} characters</span>
            <span>Do not enter passwords or OTPs.</span>
          </div>

          <button
            type="button"
            className="scanner-submit"
            onClick={scan}
            disabled={loading || !input.trim()}
          >
            {loading ? "Analyzing..." : t.scan}
            {!loading && <span aria-hidden="true"> ↗</span>}
          </button>

          {loading && (
            <div className="scanner-progress" role="status">
              <div className="scanner-progress-track">
                <span
                  style={{
                    width: `${((step + 1) / LOG.length) * 100}%`,
                  }}
                />
              </div>

              <ul className="scanner-log">
                {LOG.slice(0, step + 1).map((message) => (
                  <li key={message}>› {message}</li>
                ))}
              </ul>
            </div>
          )}

          {err && (
            <p className="scanner-error" role="alert">
              <strong>Scan notice:</strong> {err}
            </p>
          )}
        </div>
      </section>

      {/* DETAILED SCAN RESULTS */}
      {res && (
        <section
          className="scanner-result"
          style={{
            "--risk-color": COLOR[level] || COLOR.medium,
          }}
        >
          <div className="scanner-result-heading">
            <div>
              <span className="scanner-eyebrow">
                ANALYSIS COMPLETE
              </span>
              <h2>Your scan results</h2>
            </div>

            <span className="scanner-result-badge">
              {riskLabel}
            </span>
          </div>

          <div className="scanner-result-overview">
            <Gauge score={res.score} level={level} />

            <div>
              <h3>{riskLabel}</h3>
              <p>
                {res.note?.[lang] ||
                  res.note?.en ||
                  "Review the details below carefully."}
              </p>
              <small>Risk score: {res.score}/100</small>
            </div>
          </div>

          <div className="scanner-result-grid">
            {/* RISK INDICATORS */}
            <article className="scanner-result-card">
              <span className="scanner-result-icon">!</span>
              <h3>{t.why}</h3>

              {reasons.length > 0 ? (
                <ul>
                  {reasons.map((reason, index) => (
                    <li key={index}>{readable(reason)}</li>
                  ))}
                </ul>
              ) : (
                <p>
                  No additional reasons were provided by the scan.
                </p>
              )}
            </article>

            {/* LINKS FOUND */}
            {Array.isArray(res.links) && res.links.length > 0 && (
              <article className="scanner-result-card">
                <span className="scanner-result-icon">↗</span>
                <h3>{t.links}</h3>

                <ul className="scanner-found-links">
                  {res.links.map((link, index) => (
                    <li key={`${link.url}-${index}`}>
                      <span>{link.url}</span>
                      <strong>{link.score}/100</strong>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {/* RECOMMENDED ACTIONS */}
            <article className="scanner-result-card">
              <span className="scanner-result-icon">✓</span>
              <h3>{t.todo}</h3>

              {advice.length > 0 ? (
                <ul>
                  {advice.map((item, index) => (
                    <li key={index}>{readable(item)}</li>
                  ))}
                </ul>
              ) : (
                <ul>
                  <li>
                    Verify the website through an official source.
                  </li>
                  <li>
                    Do not enter passwords, OTPs or payment details.
                  </li>
                </ul>
              )}
            </article>
          </div>

          {/* PREVENTION TIPS */}
          <div className="scanner-prevention">
            <h3>🛡 Prevention Tips</h3>
            <ul>
              <li>
                Check the website address carefully before signing in.
              </li>
              <li>
                Never share your OTP, password or UPI PIN.
              </li>
              <li>
                Avoid downloading unexpected files from suspicious links.
              </li>
              <li>
                Verify urgent payment requests using a trusted channel.
              </li>
            </ul>
          </div>

          {/* OPTIONAL BACKEND REPORT */}
          <div className="scanner-report-actions">
            <h3>Report this result</h3>
            <p>
              You can save this report to the PhishShield backend,
              if the report API is available.
            </p>

            <button
              type="button"
              className="scanner-report-button"
              onClick={report}
              disabled={sent}
            >
              {sent ? t.sent : t.report}
            </button>

            {/* OFFICIAL CYBERCRIME PORTAL */}
            <a
              className="cybercrime-report-button"
              href={CYBERCRIME_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              🚨 Report to National Cyber Crime Portal ↗
            </a>

            <p className="cybercrime-note">
              The official portal opens in a new tab. You must
              review the details and submit the complaint yourself.
              PhishShield does not automatically send your scan
              or personal information to the portal.
            </p>

            <p className="cybercrime-note">
              If money has been lost to cyber fraud in India,
              call helpline 1930 promptly.
            </p>
          </div>
        </section>
      )}

      {/* USER FEEDBACK */}
      {res && (
        <section className="scanner-feedback">
          <h3>Was this result helpful?</h3>
          <p>Your feedback helps us improve PhishShield.</p>

          <div
            className="feedback-stars"
            role="group"
            aria-label="Rate this result"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} stars`}
                aria-pressed={rating === star}
                disabled={feedbackSent}
                onClick={() => setRating(star)}
              >
                {star <= rating ? "★" : "☆"}
              </button>
            ))}
          </div>

          <textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="Tell us more... (optional)"
            rows={3}
            maxLength={1000}
            disabled={feedbackSent}
          />

          <button
            type="button"
            disabled={!rating || feedbackSent}
            onClick={submitFeedback}
          >
            {feedbackSent ? "Feedback saved ✓" : "Submit Feedback"}
          </button>

          {feedbackSent && (
            <p role="status">
              Thanks! Your feedback is saved in this browser.
            </p>
          )}

          {feedbackError && (
            <p role="alert">{feedbackError}</p>
          )}

          <small>
            Feedback is stored locally in this browser and is not
            submitted to the backend.
          </small>
        </section>
      )}

      {/* SAFETY BANNER */}
      <aside className="scanner-safety-banner">
        <img
          src={HOME_IMAGES.privacy}
          alt="Protecting private information"
        />

        <div>
          <strong>Remember: pause before you trust.</strong>
          <p>
            A low-risk result is not a guarantee of safety.
            Never share an OTP, password or UPI PIN in response
            to an unexpected request.
          </p>
        </div>
      </aside>

      <p className="scanner-disclaimer">
        Educational tool. Results are estimates, not a replacement
        for professional security verification.
      </p>
    </main>
  );
}
