
import { useState } from "react";

const API = import.meta.env.VITE_API || "http://localhost:8000";

export default function Auth({ mode = "login" }) {
  const [kind, setKind] = useState(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setDone("");
    setBusy(true);

    try {
      const r = await fetch(
        `${API}/auth/${kind === "signup" ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            kind === "signup" ? { name, email, password } : { email, password }
          ),
        }
      );

      const data = await r.json();

      if (!r.ok) {
        throw new Error(data.detail || "Authentication failed.");
      }

      localStorage.setItem("phishshield_token", data.access_token);
      localStorage.setItem("phishshield_user", JSON.stringify(data.user));

      setDone(
        kind === "signup"
          ? "Account created. You're signed in."
          : "Login successful."
      );

      window.dispatchEvent(new Event("authchange"));
      setTimeout(() => {
        location.hash = "#/";
      }, 450);
    } catch (e) {
      setError(e.message || "Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-wrap">
      <div className="auth-art">
        <img src="/images/auth-shield.svg" alt="Shield illustration" />
        <p className="eyebrow">PHISHSHIELD IDENTITY GATE</p>
        <h1>Security starts with awareness.</h1>
        <p className="sub">
          Create an account to keep your own scan history and revisit risk assessments.
        </p>
        <div className="auth-points">
          <span>01 / Private scan history</span>
          <span>02 / Safer digital decisions</span>
          <span>03 / English + Hinglish</span>
        </div>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <p className="prompt">
          {kind === "signup" ? "$ create_account" : "$ authenticate"}
          <span className="cursor" />
        </p>

        <h2>{kind === "signup" ? "Create your account" : "Welcome back"}</h2>
        <p className="note">
          Your credentials are sent to your PhishShield backend over the configured API.
        </p>

        {kind === "signup" && (
          <label>
            Full name
            <input
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={100}
              required
              placeholder="Your name"
            />
          </label>
        )}

        <label>
          Email address
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete={kind === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={128}
            required
            placeholder="At least 8 characters"
          />
        </label>

        {error && <p className="err" role="alert">{error}</p>}
        {done && <p className="success" role="status">{done}</p>}

        <button className="scan" disabled={busy}>
          {busy
            ? "Please wait..."
            : kind === "signup"
              ? "Create account"
              : "Sign in"}
        </button>

        <p className="auth-switch">
          {kind === "signup" ? "Already have an account?" : "New to PhishShield?"}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setKind(kind === "signup" ? "login" : "signup");
              setError("");
              setDone("");
            }}
          >
            {kind === "signup" ? "Sign in" : "Create account"}
          </button>
        </p>
      </form>
    </main>
  );
}
