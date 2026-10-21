import { useState, useEffect } from "react";
import { useLang } from "./lang.js";
import "./site.css";
import Home from "./Home.jsx"; import App from "./App.jsx"; import Admin from "./Admin.jsx"; import QrPage from "./QrPage.jsx";
import ImagePage from "./ImagePage.jsx"; import Blog from "./Blog.jsx"; import About from "./About.jsx"; import Library from "./Library.jsx"; import Auth from "./Auth.jsx"; import History from "./History.jsx";
import "./site.css";
const TOOLS = [["check", "Link and message"], ["qr", "QR and UPI"], ["screenshot", "Screenshot"], ["photo", "Photo"], ["offer", "Offer letter"]];

export default function Shell() {
  const [h, setH] = useState(location.hash), [lang, setLang] = useLang();
  const [authVersion, setAuthVersion] = useState(0);
  useEffect(() => { const f = () => setAuthVersion(v => v + 1); window.addEventListener("authchange", f); return () => window.removeEventListener("authchange", f); }, []);
  const user = (() => { try { return JSON.parse(localStorage.getItem("phishshield_user") || "null"); } catch { return null; } })();
  useEffect(() => {
    const f = () => { setH(location.hash); window.scrollTo(0, 0); document.querySelector("details.menu")?.removeAttribute("open"); };
    window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f);
  }, []);
  const r = h.replace(/^#\/?/, ""), root = r.split("/")[0];
  const img = (m) => <ImagePage key={m} mode={m} />;
  const page = { check: <App />, qr: <QrPage />, screenshot: img("screenshot"), photo: img("photo"), offer: img("offer"),
    library: <Library />, blog: <Blog slug={r.split("/")[1]} />, about: <About />, admin: <Admin />, login: <Auth mode="login" />, signup: <Auth mode="signup" />, history: <History /> }[root] || <Home />;
  const on = (k) => (root === k ? "on" : "");
  return (
    <>
      <div className="bar">
        <a className="brand" href="#/"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6z" fill="none" stroke="#38e8ff" strokeWidth="2" /><path d="M8 12l3 3 5-6" fill="none" stroke="#38e8ff" strokeWidth="2" /></svg> PhishShield</a>
        <div className="links">
          <a href="#/" className={root === "" ? "on" : ""}>Home</a>
          <details className="menu"><summary className={TOOLS.some(([k]) => k === root) ? "on" : ""}>Tools</summary>
            <div className="drop">{TOOLS.map(([k, t]) => <a key={k} href={`#/${k}`}>{t}</a>)}</div></details>
          <a href="#/library" className={on("library")}>Library</a><a href="#/history" className={on("history")}>History</a><a href="#/blog" className={on("blog")}>Blog</a><a href="#/about" className={on("about")}>About</a>
          {user ? <button className="account-chip" title={user.email} onClick={() => { localStorage.removeItem("phishshield_token"); localStorage.removeItem("phishshield_user"); window.dispatchEvent(new Event("authchange")); location.hash = "#/"; }}>Sign out</button> : <a href="#/login" className={on("login")}>Log in</a>}
        </div>
        <div className="lang">{["en", "hi"].map((l) => <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>{l === "en" ? "English" : "Hinglish"}</button>)}</div>
      </div>
      {page}
      <footer className="foot">
        <div><b>PhishShield</b><p>AI-assisted scam detection for students. An estimate, not a guarantee.</p></div>
        <div><b>Tools</b>{TOOLS.map(([k, t]) => <a key={k} href={`#/${k}`}>{t}</a>)}</div>
        <div><b>Learn</b><a href="#/library">Scam library</a><a href="#/blog">Blog</a><a href="#/about">How it works</a></div>
        <div><b>If you were scammed</b><p>Call 1930 and report at cybercrime.gov.in, then contact your bank and your college IT cell.</p></div>
      </footer>
    </>
  );
}
