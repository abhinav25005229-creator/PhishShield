
import { useState } from "react";
import jsQR from "jsqr";
import Result from "./Result.jsx";
import { HOME_IMAGES } from "./homeImages.js";
import "./qr-page.css";

const API = import.meta.env.VITE_API || "http://localhost:8001";

async function post(path, body) {
  const token = localStorage.getItem("phishshield_token");

  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed (${response.status})`);
  }

  return response.json();
}

export default function QrPage() {
  const [res, setRes] = useState(null);
  const [data, setData] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [upi, setUpi] = useState("");
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");

  async function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMsg("Image is too large. Please choose an image under 10 MB.");
      return;
    }

    setRes(null);
    setData("");
    setMsg("");
    setBusy(true);
    setFileName(file.name);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const img = new Image();

    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(
          1,
          1600 / Math.max(img.width, img.height)
        );

        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not read this image.");
        }

        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pixels = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const qr = jsQR(pixels.data, canvas.width, canvas.height);

        if (!qr) {
          setMsg(
            "No QR code found. Try a sharper image with the full QR code visible."
          );
          return;
        }

        const decoded = qr.data.trim();
        setData(decoded);

        if (/^upi:\/\//i.test(decoded)) {
          setRes(await post("/analyze/qr", { data: decoded }));
        } else if (
          /^https?:\/\//i.test(decoded) ||
          /^[\w-]+(\.[\w-]+)+(\/|$)/.test(decoded)
        ) {
          setRes(await post("/analyze/url", { url: decoded }));
        } else {
          setRes(await post("/analyze/message", { text: decoded }));
        }
      } catch (error) {
        setMsg(
          error.message || "Could not analyze the QR code. Please try again."
        );
      } finally {
        URL.revokeObjectURL(objectUrl);
        setBusy(false);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setMsg("Could not open this image. Please choose another file.");
      setBusy(false);
    };

    img.src = objectUrl;
  }

  async function checkUpi(event) {
    event.preventDefault();

    setMsg("");
    setRes(null);
    setData("");
    setPreview("");
    setFileName("");

    const id = upi.trim();

    if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9.-]{2,64}$/.test(id)) {
      setMsg(
        "Enter a valid-looking UPI ID, for example name@bank. Format validation cannot confirm account ownership."
      );
      return;
    }

    const payload = `upi://pay?pa=${encodeURIComponent(id)}`;

    setBusy(true);

    try {
      setData(payload);
      setRes(await post("/analyze/qr", { data: payload }));
    } catch {
      setMsg("Could not reach the analysis backend. Check that the API is running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="qr-page">
      <section className="qr-hero">
        <div className="qr-hero-copy">
          <span className="qr-eyebrow">PHISHSHIELD / PAYMENT SECURITY</span>

          <h1>
            Scan smart.
            <br />
            <span>Pay safely.</span>
          </h1>

          <p>
            Inspect QR codes and check UPI payment identifiers for suspicious
            signals before sending money.
          </p>

          <div className="qr-trust-points">
            <span>01 / DECODE</span>
            <span>02 / ANALYZE</span>
            <span>03 / VERIFY</span>
          </div>
        </div>

        <div className="qr-hero-art">
          <img
            src={HOME_IMAGES.qrScanner}
            alt="Smartphone scanning a QR code"
          />
          <div className="qr-art-label">
            <span className="qr-live-dot" />
            QR THREAT ANALYSIS
          </div>
        </div>
      </section>

      <section className="qr-workspace">
        <div className="qr-section-heading">
          <div>
            <span className="qr-eyebrow">PAYMENT CHECKER</span>
            <h2>What would you like to check?</h2>
            <p>Upload a QR image or enter a UPI ID below.</p>
          </div>

          <span className="qr-status">
            <span className="qr-live-dot" />
            READY
          </span>
        </div>

        <div className="qr-tools-grid">
          <section className="qr-tool-card">
            <div className="qr-card-heading">
              <span className="qr-card-icon">▦</span>
              <div>
                <h3>Scan a QR code</h3>
                <p>Decode a payment QR or a link QR.</p>
              </div>
            </div>

            <label className="qr-upload">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFile}
                disabled={busy}
              />

              {preview ? (
                <img
                  className="qr-preview"
                  src={preview}
                  alt="Selected QR image preview"
                />
              ) : (
                <span className="qr-upload-content">
                  <span className="qr-upload-symbol">＋</span>
                  <strong>Choose QR image</strong>
                  <small>JPG, PNG or WEBP · Max 10 MB</small>
                </span>
              )}
            </label>

            {fileName && <p className="qr-file-name">{fileName}</p>}

            <p className="qr-helper">
              Keep the entire QR code visible and use a clear image.
            </p>
          </section>

          <section className="qr-tool-card">
            <div className="qr-card-heading">
              <span className="qr-card-icon">₹</span>
              <div>
                <h3>Check a UPI ID</h3>
                <p>Validate its format and inspect risk signals.</p>
              </div>
            </div>

            <form className="qr-upi-form" onSubmit={checkUpi}>
              <label htmlFor="qr-upi-input">UPI PAYMENT ID</label>

              <input
                id="qr-upi-input"
                value={upi}
                onChange={(event) => setUpi(event.target.value)}
                placeholder="name@bank"
                autoComplete="off"
                maxLength={320}
                disabled={busy}
              />

              <button className="qr-submit" type="submit" disabled={busy}>
                {busy ? "Analyzing..." : "Check UPI ID"}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="qr-safety-note">
              <strong>Important</strong>
              <p>
                A valid-looking UPI ID does not prove who owns the account.
                Verify the recipient before paying.
              </p>
            </div>
          </section>
        </div>

        {busy && (
          <div className="qr-progress" role="status">
            <span className="qr-spinner" />
            <div>
              <strong>Analyzing your input</strong>
              <p>Checking the available risk signals...</p>
            </div>
          </div>
        )}

        {msg && <p className="qr-error" role="alert">{msg}</p>}

        {data && !msg && !busy && (
          <details className="qr-decoded">
            <summary>View decoded QR payload</summary>
            <p>{data}</p>
          </details>
        )}
      </section>

      {res && <section className="qr-results"><Result res={res} /></section>}

      <section className="qr-safety-banner">
        <img
          src={HOME_IMAGES.privacy}
          alt="Digital security and online payment protection"
          loading="lazy"
        />
        <div>
          <span className="qr-eyebrow">BEFORE YOU PAY</span>
          <h2>Pause. Verify. Then act.</h2>
          <p>
            Never share your UPI PIN or OTP to receive money. A QR code or
            successful scan is not proof that a payment request is safe.
          </p>
        </div>
      </section>

      <p className="qr-disclaimer">
        Educational tool. Risk analysis is an estimate and cannot confirm
        account ownership or guarantee a payment is safe.
      </p>
    </main>
  );
}
