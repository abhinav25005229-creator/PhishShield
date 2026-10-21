import { useState } from "react";
const API = import.meta.env.VITE_API || "http://localhost:8000";

export default function Admin() {
  const [tok, setTok] = useState(""), [rows, setRows] = useState(null), [err, setErr] = useState("");
  async function load() {
    setErr("");
    try {
      const r = await fetch(`${API}/admin/reports`, { headers: { "x-admin-token": tok } });
      if (!r.ok) return setErr("Wrong token or API offline.");
      setRows(await r.json());
    } catch { setErr("API not reachable."); }
  }
  async function mark(id) {
    await fetch(`${API}/admin/reports/${id}`, { method: "PATCH", headers: { "x-admin-token": tok } });
    load();
  }
  const n = (f) => rows.filter(f).length;
  return (
    <main>
      <header><h1><span className="shield">&#9670;</span> PhishShield Admin</h1><a href="#" onClick={() => location.reload()}>Back to scanner</a></header>
      <section className="console" style={{ marginTop: 28 }}>
        <input type="password" value={tok} onChange={(e) => setTok(e.target.value)} placeholder="admin token" />
        <button className="scan" onClick={load}>Load reports</button>
        {err && <p className="err">{err}</p>}
      </section>
      {rows && (
        <section className="result" style={{ "--c": "#38e8ff" }}>
          <p>{rows.length} reports | {n((r) => r.level === "high")} high risk | {n((r) => !r.reviewed)} waiting for review</p>
          <div className="tbl"><table>
            <thead><tr><th>Time</th><th>Type</th><th>Content</th><th>Score</th><th></th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created).toLocaleString()}</td><td>{r.kind}</td>
                <td className="c">{r.content}</td><td>{r.score} ({r.level})</td>
                <td>{r.reviewed ? "Reviewed" : <button onClick={() => mark(r.id)}>Mark reviewed</button>}</td>
              </tr>))}
            </tbody>
          </table></div>
        </section>
      )}
    </main>
  );
}