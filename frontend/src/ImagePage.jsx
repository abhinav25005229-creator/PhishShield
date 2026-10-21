
import { useState } from "react";
import Result from "./Result.jsx";
import { HOME_IMAGES } from "./homeImages.js";
import "./image-page.css";

const API = import.meta.env.VITE_API || "http://localhost:8001";

const COPY = {
  screenshot: {
    command: "$ scan --screenshot",
    eyebrow: "MESSAGE & SCREENSHOT INTELLIGENCE",
    title: "See the warning signs.",
    accent: "Before you trust the message.",
    description:
      "Analyze screenshots of chats, SMS, emails and payment confirmations for suspicious patterns.",
    image: HOME_IMAGES.messageScanner,
    imageAlt: "Digital communication and message analysis",
    button: "Analyze screenshot",
    heading: "Inspect a screenshot",
    hint: "Upload a screenshot of a suspicious chat, SMS, email or payment confirmation.",
  },
  photo: {
    command: "$ scan --photo",
    eyebrow: "VISUAL THREAT INTELLIGENCE",
    title: "Look closer.",
    accent: "Spot suspicious details.",
    description:
      "Check photos of posters, notices and documents for possible scam indicators.",
    image: HOME_IMAGES.securityAnalysis,
    imageAlt: "Cybersecurity analysis environment",
    button: "Analyze photo",
    heading: "Inspect an image",
    hint: "Upload a clear photo of a poster, notice, document or suspicious offer.",
  },
  offer: {
    command: "$ scan --offer-letter",
    eyebrow: "DOCUMENT & OFFER VERIFICATION",
    title: "An offer looks real.",
    accent: "But is it trustworthy?",
    description:
      "Review job, internship and scholarship letters for suspicious fees, sender details and other warning signs.",
    image: HOME_IMAGES.jobScanner,
    imageAlt: "Professional document review and analysis",
    button: "Analyze offer letter",
    heading: "Review an offer letter",
    hint: "Upload a job, internship or scholarship letter that you want to check.",
  },
};

export default function ImagePage({ mode = "photo" }) {
  const config = COPY[mode] || COPY.photo;

  const [res, setRes] = useState(null);
  const [prev, setPrev] = useState("");
  const [fileName, setFileName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setRes(null);
    setMsg("");
    setPrev("");
    setFileName("");

    if (!file.type.startsWith("image/")) {
      setMsg("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMsg("Image is too large. Please choose an image under 10 MB.");
      return;
    }

    setBusy(true);
    setFileName(file.name);

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(
          1,
          1280 / Math.max(image.width, image.height)
        );

        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not read the selected image.");
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPrev(dataUrl);

        const token = localStorage.getItem("phishshield_token");

        const response = await fetch(`${API}/analyze/image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            image: dataUrl.split(",")[1],
            media_type: "image/jpeg",
            mode,
          }),
        });

        if (response.status === 503) {
          throw new Error(
            "AI analysis is not configured on the server yet."
          );
        }

        if (response.status === 429) {
          throw new Error("Too many scans. Wait a minute and try again.");
        }

        const contentType = response.headers.get("content-type") || "";

        if (!response.ok) {
          let detail = "Analysis failed. Please try again.";

          if (contentType.includes("application/json")) {
            const errorData = await response.json();
            if (typeof errorData.detail === "string") {
              detail = errorData.detail;
            }
          }

          throw new Error(detail);
        }

        setRes(await response.json());
      } catch (error) {
        setMsg(error.message || "Could not connect to the analysis backend.");
      } finally {
        URL.revokeObjectURL(objectUrl);
        setBusy(false);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setMsg("Could not open this image. Please choose another file.");
      setBusy(false);
    };

    image.src = objectUrl;
  }

  return (
    <main className="image-page">
      <section className="image-hero">
        <div className="image-hero-copy">
          <span className="image-eyebrow">{config.eyebrow}</span>

          <p className="image-command">{config.command}</p>

          <h1>
            {config.title}
            <br />
            <span>{config.accent}</span>
          </h1>

          <p className="image-hero-description">{config.description}</p>

          <div className="image-trust-points">
            <span>01 / UPLOAD</span>
            <span>02 / ANALYZE</span>
            <span>03 / REVIEW</span>
          </div>
        </div>

        <div className="image-hero-art">
          <img src={config.image} alt={config.imageAlt} />

          <div className="image-art-label">
            <span className="image-live-dot" />
            VISUAL THREAT ANALYSIS
          </div>
        </div>
      </section>

      <section className="image-workspace">
        <div className="image-section-heading">
          <div>
            <span className="image-eyebrow">ANALYSIS WORKSPACE</span>
            <h2>{config.heading}</h2>
            <p>{config.hint}</p>
          </div>

          <span className="image-status">
            <span className="image-live-dot" />
            {busy ? "ANALYZING" : "READY"}
          </span>
        </div>

        <label className="image-upload">
          <input
            type="file"
            accept="image/*"
            onChange={onFile}
            disabled={busy}
          />

          {prev ? (
            <img
              className="image-preview"
              src={prev}
              alt="Preview of the selected image"
            />
          ) : (
            <span className="image-upload-content">
              <span className="image-upload-icon">↑</span>
              <strong>Choose an image to analyze</strong>
              <span>Click here to browse your files</span>
              <small>JPG, PNG, WEBP · Maximum 10 MB</small>
            </span>
          )}
        </label>

        {fileName && (
          <div className="image-file-info">
            <span className="image-file-icon">▧</span>
            <div>
              <strong>{fileName}</strong>
              <small>Image selected for {mode === "offer" ? "offer review" : "analysis"}</small>
            </div>
            {prev && <span className="image-file-check">✓</span>}
          </div>
        )}

        {busy && (
          <div className="image-progress" role="status">
            <span className="image-spinner" />
            <div>
              <strong>Analyzing your image</strong>
              <p>Reading visual information and checking available risk signals...</p>
            </div>
          </div>
        )}

        {msg && (
          <div className="image-error" role="alert">
            <strong>Analysis needs attention</strong>
            <p>{msg}</p>
          </div>
        )}

        <div className="image-privacy-note">
          <span className="image-privacy-icon">◇</span>
          <p>
            <strong>Your privacy matters.</strong> The selected image is sent
            to the configured AI service for analysis. Avoid uploading images
            containing passwords, OTPs or unnecessary personal information.
          </p>
        </div>
      </section>

      {res && (
        <section className="image-results">
          <div className="image-results-heading">
            <span className="image-eyebrow">ANALYSIS COMPLETE</span>
            <h2>Your scan results</h2>
          </div>
          <Result res={res} />
        </section>
      )}

      <section className="image-safety-banner">
        <img
          src={HOME_IMAGES.privacy}
          alt="Digital privacy and security"
          loading="lazy"
        />
        <div>
          <span className="image-eyebrow">STAY ALERT</span>
          <h2>Pause. Verify. Then act.</h2>
          <p>
            AI can miss suspicious details or flag legitimate content.
            Independently verify important offers, payment requests and
            official communications before acting.
          </p>
        </div>
      </section>

      <p className="image-disclaimer">
        Educational tool. An AI result is an estimate, not a guarantee of
        authenticity or safety.
      </p>
    </main>
  );
}
