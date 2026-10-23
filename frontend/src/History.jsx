import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API || "http://localhost:8010";

export default function History() {
const [rows, setRows] = useState([]);
const [error, setError] = useState("");
const [busy, setBusy] = useState(true);
const [search, setSearch] = useState("");
const [risk, setRisk] = useState("all");
const [kind, setKind] = useState("all");

useEffect(() => {
let active = true;

async function loadHistory() {
  const token = localStorage.getItem("phishshield_token");

  if (!token) {
    setError("Sign in to view scans saved to your account.");
    setBusy(false);
    return;
  }

  try {
    const response = await fetch(`${API}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "Could not load scan history."
      );
    }

    if (active) setRows(Array.isArray(data) ? data : []);
  } catch (err) {
    if (active) setError(err.message || "Could not connect to the server.");
  } finally {
    if (active) setBusy(false);
  }
}

loadHistory();

return () => {
  active = false;
};

}, []);

const stats = useMemo(() => ({
total: rows.length,
high: rows.filter(r => r.level?.toLowerCase() === "high").length,
medium: rows.filter(r => r.level?.toLowerCase() === "medium").length,
low: rows.filter(r => r.level?.toLowerCase() === "low").length,
}), [rows]);

const filteredRows = useMemo(() => {
const query = search.trim().toLowerCase();

return rows.filter(row => {
  const level = (row.level || "").toLowerCase();
  const type = (row.kind || "").toLowerCase();
  const text = `${row.kind || ""} ${row.summary || ""} ${row.level || ""}`.toLowerCase();

  return (
    (!query || text.includes(query)) &&
    (risk === "all" || level === risk) &&
    (kind === "all" || type === kind)
  );
});

}, [rows, search, risk, kind]);

function formatDate(value) {
if (!value) return "Date unavailable";

const date = new Date(value);

return Number.isNaN(date.getTime())
  ? "Date unavailable"
  : date.toLocaleString();

}

function resetFilters() {
setSearch("");
setRisk("all");
setKind("all");
}

return (
<main className="wide history-page">
<section className="history-hero">
<span className="history-eyebrow">PHISHSHIELD / PERSONAL DASHBOARD</span>
<h1>Your scan history<span>.</span></h1>
<p>
Every saved check in one place. Review past risk assessments,
search results, and revisit suspicious messages.
</p>
<a className="history-primary" href="#/check">＋ Start a new scan</a>
</section>

  {busy && (
    <section className="history-state">
      <span className="history-spinner" />
      <h2>Loading your scans</h2>
      <p>Fetching your saved results securely...</p>
    </section>
  )}

  {!busy && error && (
    <section className="history-state">
      <div className="history-state-icon">↗</div>
      <h2>Sign in to see your history</h2>
      <p>{error}</p>
      <a className="history-primary" href="#/login">Sign in to continue</a>
    </section>
  )}

  {!busy && !error && (
    <>
      <section className="history-stats">
        <article className="history-stat">
          <span className="stat-icon">▤</span>
          <p>Total scans</p>
          <strong>{stats.total}</strong>
          <small>Saved to your account</small>
        </article>

        <article className="history-stat stat-high">
          <span className="stat-icon">!</span>
          <p>High risk</p>
          <strong>{stats.high}</strong>
          <small>Needs extra caution</small>
        </article>

        <article className="history-stat stat-medium">
          <span className="stat-icon">◈</span>
          <p>Medium risk</p>
          <strong>{stats.medium}</strong>
          <small>Review before acting</small>
        </article>

        <article className="history-stat stat-low">
          <span className="stat-icon">✓</span>
          <p>Low risk</p>
          <strong>{stats.low}</strong>
          <small>Still verify independently</small>
        </article>
      </section>

      <section className="history-content">
        <div className="history-heading">
          <div>
            <span className="history-eyebrow">YOUR ACTIVITY</span>
            <h2>Previous checks</h2>
          </div>
          <span className="history-count">
            {filteredRows.length} result{filteredRows.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="history-filters">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search scans or summaries..."
            aria-label="Search scan history"
          />

          <select value={risk} onChange={e => setRisk(e.target.value)} aria-label="Filter by risk">
            <option value="all">All risk levels</option>
            <option value="high">High risk</option>
            <option value="medium">Medium risk</option>
            <option value="low">Low risk</option>
          </select>

          <select value={kind} onChange={e => setKind(e.target.value)} aria-label="Filter by scan type">
            <option value="all">All scan types</option>
            {[...new Set(rows.map(r => (r.kind || "").toLowerCase()).filter(Boolean))].map(type => (
              <option value={type} key={type}>{type.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {rows.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">⌕</div>
            <h3>No scans saved yet</h3>
            <p>Sign in and run a URL, message, QR code, or image check to start building your history.</p>
            <a className="history-primary" href="#/check">Run your first scan</a>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">⌕</div>
            <h3>No matching scans</h3>
            <p>Try changing your search or filters.</p>
            <button className="history-secondary" onClick={resetFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="history-list">
            {filteredRows.map(row => {
              const level = ["high", "medium", "low"].includes((row.level || "").toLowerCase())
                ? row.level.toLowerCase()
                : "unknown";

              return (
                <article className="history-row" key={row.id}>
                  <div className="history-row-main">
                    <div className="history-row-top">
                      <span className={`history-type type-${level}`}>
                        {row.kind || "SCAN"}
                      </span>
                      <span className={`history-risk risk-${level}`}>
                        <span className="history-risk-dot" />
                        {level === "unknown" ? "Unknown risk" : `${level} risk`}
                      </span>
                    </div>

                    <p className="history-summary">
                      {row.summary || "No additional summary available."}
                    </p>

                    <time className="history-date" dateTime={row.created || undefined}>
                      ◷ {formatDate(row.created)}
                    </time>
                  </div>

                  <div className="history-score">
                    <strong>{Number.isFinite(Number(row.score)) ? row.score : "—"}</strong>
                    <span>/ 100</span>
                    <small>Risk score</small>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="history-footnote">
          Security note: a low-risk result is not a guarantee that a link or message is safe.
          Verify important requests using official sources.
        </p>
      </section>
    </>
  )}
</main>

);
}