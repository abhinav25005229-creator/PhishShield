
import { useEffect, useState } from "react";
import { HOME_IMAGES } from "./homeImages.js";
import "./about.css";

const API = import.meta.env.VITE_API || "http://localhost:8000";

const steps = [
  {
    number: "01",
    title: "Input to Analyze",
    description: "Paste a link, message, screenshot or QR code.",
    image: HOME_IMAGES.urlScanner,
    alt: "Suspicious link scanning",
    color: "blue",
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Models examine risk indicators and available threat data.",
    image: HOME_IMAGES.securityAnalysis,
    alt: "AI security analysis",
    color: "purple",
  },
  {
    number: "03",
    title: "Get Results",
    description: "Review the risk estimate, explanation and safety tips.",
    image: HOME_IMAGES.threatIntelligence,
    alt: "Cyber threat detection",
    color: "green",
  },
];

const features = [
  {
    icon: "↗",
    title: "URL Scanner",
    description: "Checks links for phishing indicators.",
    color: "blue",
  },
  {
    icon: "▤",
    title: "Message Analyzer",
    description: "Flags suspicious SMS, urgency and OTP requests.",
    color: "purple",
  },
  {
    icon: "▧",
    title: "Image & QR Check",
    description: "Analyzes supported screenshots, images and QR codes.",
    color: "green",
  },
  {
    icon: "◇",
    title: "Threat Protection",
    description: "Uses configured threat intelligence when available.",
    color: "orange",
  },
];

export default function About() {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(`${API}/stats`)
      .then((response) => {
        if (!response.ok) throw new Error("Stats unavailable");
        return response.json();
      })
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {
        if (active) setStatsError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const total = stats?.total ?? null;
  const highRisk = stats?.by_level?.high ?? null;
  const reports = stats?.reports ?? null;

  return (
    <main className="about-page">
      <section className="about-intro">
        <span className="about-badge">
          <span aria-hidden="true">⬡</span>
          ABOUT PHISHSHIELD
        </span>

        <h1>
          How <span>PhishShield</span> Works
        </h1>

        <p>
          AI-assisted scam detection for links, messages, images and more.
          <br className="about-desktop-break" />
          Get a risk estimate and make safer online decisions.
        </p>
      </section>

      <section className="about-steps" aria-label="How PhishShield works">
        {steps.map((step, index) => (
          <div className="about-step-wrap" key={step.number}>
            <article className={`about-step ${step.color}`}>
              <span className="about-step-number">{step.number}</span>

              <img
                src={step.image}
                alt={step.alt}
                loading={index === 0 ? "eager" : "lazy"}
              />

              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </article>

            {index < steps.length - 1 && (
              <span className="about-arrow" aria-hidden="true">
                →
              </span>
            )}
          </div>
        ))}
      </section>

      <section className="about-features" aria-label="PhishShield tools">
        {features.map((feature) => (
          <article
            className={`about-feature ${feature.color}`}
            key={feature.title}
          >
            <span className="about-feature-icon" aria-hidden="true">
              {feature.icon}
            </span>

            <div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="about-disclaimer">
        <span className="about-info-icon" aria-hidden="true">
          i
        </span>
        <div>
          <h2>Risk estimate, not a guarantee.</h2>
          <p>
            PhishShield cannot detect every threat. Verify important claims
            through official sources before clicking, paying or sharing data.
          </p>
        </div>
      </section>

      <section className="about-usage">
        <div className="about-section-heading">
          <span className="about-eyebrow">PROJECT OVERVIEW</span>
          <h2>PhishShield at a glance</h2>
          <p>Usage statistics reported by the connected backend.</p>
        </div>

        <div className="about-stats">
          <article>
            <span>Scans recorded</span>
            <strong>{total === null ? "—" : total}</strong>
          </article>

          <article>
            <span>High-risk results</span>
            <strong>{highRisk === null ? "—" : highRisk}</strong>
          </article>

          <article>
            <span>Reports submitted</span>
            <strong>{reports === null ? "—" : reports}</strong>
          </article>
        </div>

        {statsError && (
          <p className="about-stats-note">
            Live statistics are temporarily unavailable. Check that the
            backend is running.
          </p>
        )}
      </section>

      <section className="about-evaluation">
        <div className="about-section-heading">
          <span className="about-eyebrow">MODEL EVALUATION</span>
          <h2>Accuracy matters</h2>
          <p>
            Model performance should be assessed using a representative,
            held-out test dataset.
          </p>
        </div>

        <div className="about-evaluation-note">
          <span aria-hidden="true">ⓘ</span>
          <p>
            Check your latest training and evaluation report before publishing
            precision, recall, F1 score or false-positive counts. These values
            can change when the dataset or model changes.
          </p>
        </div>
      </section>
    </main>
  );
}
