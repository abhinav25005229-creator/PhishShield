
import { useState, useEffect } from "react";
import { TOOLS, STEPS, SIGNALS, FAQ, LIB } from "./data.js";
import Icon from "./Icon.jsx";
import { HOME_IMAGES } from "./homeImages.js";
import GlobalThreatMap from "./GlobalThreatMap.jsx";
import IndiaCyberStats from "./IndiaCyberStats.jsx";
import ScamQuiz from "./ScamQuiz.jsx";
const API = import.meta.env.VITE_API || "http://localhost:8000";

const TOOL_IMAGES = {
  check: HOME_IMAGES.urlScanner,
  qr: HOME_IMAGES.qrScanner,
  screenshot: HOME_IMAGES.screenshotScanner,
  photo: HOME_IMAGES.photoScanner,
  offer: HOME_IMAGES.jobScanner,
  library: HOME_IMAGES.messageScanner,
};

const STEP_IMAGES = [
  HOME_IMAGES.urlScanner,
  HOME_IMAGES.qrScanner,
  HOME_IMAGES.messageScanner,
  HOME_IMAGES.securityAnalysis,
];

const SIGNAL_IMAGES = [
  HOME_IMAGES.urlScanner,
  HOME_IMAGES.threatIntelligence,
  HOME_IMAGES.messageScanner,
  HOME_IMAGES.securityAnalysis,
];

export default function Home() {
  const [s, setS] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API}/stats`)
      .then((r) => {
        if (!r.ok) throw new Error("Stats unavailable");
        return r.json();
      })
      .then(setS)
      .catch(() => {});

    fetch(`${API}/posts`)
      .then((r) => {
        if (!r.ok) throw new Error("Posts unavailable");
        return r.json();
      })
      .then((data) => setPosts(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => {});
  }, []);

  const stat = (value, label) => (
    <div className="stat" key={label}>
      <b>{value ?? "—"}</b>
      <span>{label}</span>
    </div>
  );

  return (
    <main className="wide home-page">
      {/* HERO */}
      <section className="hero2">
        <div className="hero-copy">
          <p className="prompt">
            <span className="status-dot" />
            PHISHSHIELD / THREAT DETECTION
            <span className="cursor" />
          </p>

          <h1 className="big">
            Know what a link, message or QR really is before you act on it.
          </h1>

          <p className="sub">
            Built for students. Analyze suspicious links, messages and
            payment signals with understandable risk explanations.
          </p>

          <div className="cta">
            <a className="btn" href="#/check">
              Analyze a threat ↗
            </a>
            <a className="btn ghosty" href="#/library">
              Explore scam library
            </a>
          </div>

          <div className="home-trust-points">
            <span>01 / URL ANALYSIS</span>
            <span>02 / MESSAGE CHECKS</span>
            <span>03 / SAFETY GUIDANCE</span>
          </div>
        </div>

        <div className="hero-visual">
          <img
  src="/cyber-shield.png"
  alt="PhishShield cybersecurity threat detection visualization"
  className="hero-security-image"
/>

          <div className="hero-image-caption">
            <span className="status-dot" />
            THREAT ANALYSIS / SECURITY CONSOLE
          </div>

          <pre className="term" aria-label="Illustrative sample scan output">
            <i>ILLUSTRATIVE SCAN OUTPUT</i>
{`$ phishshield scan suspicious-link
> extracting URL features...
> evaluating risk indicators...
> preparing safety guidance...

STATUS    ANALYSIS READY
ACTION    VERIFY BEFORE CLICKING`}
          </pre>
        </div>
      </section>


      {/* LIVE STATISTICS */}
      <section className="stats" aria-label="Application scan statistics">
        {stat(s?.total, "Scans recorded")}
        {stat(s?.by_level?.high ?? (s ? 0 : null), "High-risk results")}
        {stat(s?.reports, "Reports submitted")}
      </section>



      {/* GLOBAL THREAT MAP */}
      <GlobalThreatMap />
      {/* INDIA CYBER CRIME STATISTICS */}
      <IndiaCyberStats />





      {/* SCANNER TOOLS */}
      <section className="home-section">
        <div className="home-section-heading">
          <p className="eyebrow">YOUR SECURITY TOOLKIT / 02</p>
          <h2 className="sec">Choose a tool</h2>
          <p>Start with the type of suspicious content you received.</p>
        </div>

        <div className="tools">
          {TOOLS.map((tool) => (
            <a
              key={tool.k}
              className="tool"
              href={`#/${tool.k}`}
            >
              <img
                className="tool-image"
                src={TOOL_IMAGES[tool.k] || HOME_IMAGES.securityAnalysis}
                alt=""
                loading="lazy"
              />

              <div className="tool-title">
                <Icon n={tool.i} />
                <h3>{tool.t}</h3>
              </div>

              <p>{tool.d}</p>
              <span className="home-card-link">Open tool ↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-section">
        <div className="home-section-heading">
          <p className="eyebrow">SIMPLE PROCESS / 03</p>
          <h2 className="sec">How a check works</h2>
          <p>From suspicious content to a more informed decision.</p>
        </div>

        <ol className="steps">
          {STEPS.map(([heading, description], index) => (
            <li key={heading}>
              <img
                src={STEP_IMAGES[index] || HOME_IMAGES.securityAnalysis}
                alt=""
                loading="lazy"
              />
              <span className="home-step-number">
                STEP {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{heading}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

     {/* INTERACTIVE SCAM QUIZ */}
<ScamQuiz />

{/* SCAM LIBRARY */}
<section className="home-section">

        <div className="home-section-heading">
          <p className="eyebrow">LEARN THE WARNING SIGNS / 05</p>
          <h2 className="sec">Scams to know</h2>
          <p>Explore common scam patterns and practical precautions.</p>
        </div>

        <div className="grid3">
          {LIB.slice(0, 3).map((item, index) => (
            <a
              key={item.id}
              className="panel link story-card"
              href="#/library"
            >
              <img
                src={
                  [
                    HOME_IMAGES.messageScanner,
                    HOME_IMAGES.privacy,
                    HOME_IMAGES.reporting,
                  ][index]
                }
                alt=""
                loading="lazy"
              />
              <span className="tag">{item.cat}</span>
              <h3>{item.t}</h3>
              <p>{item.how}</p>
              <span className="home-card-link">Learn more ↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* BLOG */}
      {posts.length > 0 && (
        <section className="home-section">
          <div className="home-section-heading">
            <p className="eyebrow">SECURITY KNOWLEDGE / 06</p>
            <h2 className="sec">From the blog</h2>
            <p>Practical guides for safer digital decisions.</p>
          </div>

          <div className="grid3">
            {posts.map((post, index) => (
              <a
                key={post.slug}
                className="panel link story-card"
                href={`#/blog/${post.slug}`}
              >
                <img
                  src={
                    [
                      HOME_IMAGES.scamAwareness,
                      HOME_IMAGES.urlScanner,
                      HOME_IMAGES.securityAnalysis,
                    ][index % 3]
                  }
                  alt=""
                  loading="lazy"
                />
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <span className="home-card-link">Read article ↗</span>
              </a>
            ))}
          </div>

          <a className="btn ghosty home-blog-button" href="#/blog">
            Browse all security guides ↗
          </a>
        </section>
      )}

      {/* FAQ */}
      <section className="home-section faq-section">
        <div className="home-section-heading faq-heading">
          <p className="eyebrow">PHISHSHIELD / HELP CENTER</p>
          <h2 className="sec">
            Frequently asked <span>questions.</span>
          </h2>
          <p>Quick answers to help you scan smarter and stay safer online.</p>
        </div>

        <div className="faq-list">
          {FAQ.map(([question, answer], index) => (
            <details className="faq-card" key={question}>
              <summary>
                <span className="faq-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="faq-question">{question}</span>
                <span className="faq-toggle">+</span>
              </summary>
              <div className="faq-answer">{answer}</div>
            </details>
          ))}
        </div>

        <div className="faq-bottom-note">
          <span className="faq-note-icon">!</span>
          <p>
            <strong>Stay alert.</strong> Never share your OTP, UPI PIN or
            password with anyone.
          </p>
        </div>
      </section>
    </main>
  );
}
