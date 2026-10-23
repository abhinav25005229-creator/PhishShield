
import { useEffect, useState } from "react";
import { HOME_IMAGES } from "./homeImages.js";
import "./about.css";

const API = import.meta.env.VITE_API || "http://localhost:8010";

const steps = [
  {
    number: "01",
    title: "Submit suspicious content",
    description:
      "Paste a URL or message, or use a supported image, screenshot or QR scanning tool.",
    image: HOME_IMAGES.urlScanner,
    alt: "Suspicious URL scanning",
    color: "blue",
  },
  {
    number: "02",
    title: "Analyze risk indicators",
    description:
      "Configured models and available security checks examine signals that may indicate a scam.",
    image: HOME_IMAGES.securityAnalysis,
    alt: "Security analysis",
    color: "purple",
  },
  {
    number: "03",
    title: "Review the result",
    description:
      "Read the risk estimate, understand the available explanation and follow safety guidance.",
    image: HOME_IMAGES.threatIntelligence,
    alt: "Threat analysis results",
    color: "green",
  },
];

const features = [
  {
    icon: "URL",
    title: "URL Scanner",
    description: "Inspect suspicious links for potential phishing indicators.",
    color: "blue",
  },
  {
    icon: "SMS",
    title: "Message Analyzer",
    description: "Identify suspicious wording, urgency and requests for sensitive information.",
    color: "purple",
  },
  {
    icon: "QR",
    title: "QR & UPI Safety",
    description: "Use the QR analysis tool to investigate supported QR-code risks.",
    color: "green",
  },
  {
    icon: "IMG",
    title: "Image Analysis",
    description: "Analyze supported screenshots and images using available checks.",
    color: "orange",
  },
];

export default function About() {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API}/stats`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Statistics unavailable");
        return response.json();
      })
      .then((data) => setStats(data))
      .catch((error) => {
        if (error.name !== "AbortError") setStatsError(true);
      });

    return () => controller.abort();
  }, []);

  const total = stats?.total ?? null;
  const highRisk = stats?.by_level?.high ?? null;
  const reports = stats?.reports ?? null;

  return (
    <main className="about-page">
      <section className="about-intro">
        <span className="about-badge">
          <span aria-hidden="true">+</span>
          MEET PHISHSHIELD
        </span>

        <h1>
          Think before you <span>click.</span>
        </h1>

        <p>
          PhishShield is an AI-assisted scam-analysis project designed to help
          users investigate suspicious links, messages and supported media.
          Understand potential risks before you take action.
        </p>

        <div className="about-hero-actions">
          <a href="#/check" className="about-primary-link">
            Scan something
            <span aria-hidden="true"> {"->"}</span>
          </a>
          <a href="#/library" className="about-secondary-link">
            Explore scam library
          </a>
        </div>

        <div className="about-trust-line">
          <span>URL checks</span>
          <span>Message analysis</span>
          <span>Security awareness</span>
        </div>
      </section>

      <section className="about-mission">
        <div>
          <span className="about-eyebrow">OUR PURPOSE</span>
          <h2>Make suspicious digital activity easier to understand.</h2>
        </div>
        <p>
          Scam messages and deceptive links can pressure people into sharing
          personal information or sending money. PhishShield brings available
          analysis tools and explanations together to support more informed
          decisions. It is a helpful screening tool, not a replacement for
          independent verification.
        </p>
      </section>

      <section className="about-process-section" aria-label="How PhishShield works">
        <div className="about-section-heading">
          <span className="about-eyebrow">HOW IT WORKS</span>
          <h2>Three steps. A clearer picture.</h2>
          <p>Start with suspicious content and review the result before acting.</p>
        </div>

        <div className="about-steps">
          {steps.map((step, index) => (
            <article className={`about-step ${step.color}`} key={step.number}>
              <span className="about-step-number">{step.number}</span>
              <img
                src={step.image}
                alt={step.alt}
                loading={index === 0 ? "eager" : "lazy"}
              />
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-tools-section">
        <div className="about-section-heading">
          <span className="about-eyebrow">THE TOOLKIT</span>
          <h2>Security checks for everyday situations.</h2>
          <p>Available tools depend on the current application configuration.</p>
        </div>

        <div className="about-features">
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
        </div>
      </section>

      <section className="about-usage">
        <div className="about-section-heading">
          <span className="about-eyebrow">PROJECT ACTIVITY</span>
          <h2>PhishShield at a glance</h2>
          <p>Statistics returned by the connected backend, when available.</p>
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
            Live statistics are unavailable right now. Check the backend
            connection and its /stats endpoint.
          </p>
        )}
      </section>

      <section className="about-limits">
        <div className="about-limit-icon" aria-hidden="true">i</div>
        <div>
          <span className="about-eyebrow">IMPORTANT TO KNOW</span>
          <h2>A risk estimate is not a guarantee.</h2>
          <p>
            A low-risk result does not prove that a link, message, image or
            payment request is safe. Detection can miss new scams or flag
            legitimate content. Never share an OTP, UPI PIN or password to
            receive money. Verify payment requests through trusted channels
            and contact your bank immediately if you suspect fraud.
          </p>
        </div>
      </section>

      <section className="about-evaluation">
        <div className="about-section-heading">
          <span className="about-eyebrow">RESPONSIBLE ANALYSIS</span>
          <h2>Measure performance honestly.</h2>
          <p>
            Precision, recall, F1 score and false-positive rates should be
            reported only when supported by actual evaluation results.
          </p>
        </div>
        <div className="about-evaluation-note">
          <span aria-hidden="true">!</span>
          <p>
            Results depend on the models, datasets and external checks that
            are configured. PhishShield should not be treated as a guarantee
            against financial loss, phishing or fraud.
          </p>
        </div>
      </section>
    </main>
  );
}
