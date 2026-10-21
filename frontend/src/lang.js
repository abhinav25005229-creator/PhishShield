import { useState, useEffect } from "react";
export function useLang() {
  const get = () => localStorage.getItem("lang") || "en";
  const [lang, setL] = useState(get);
  useEffect(() => { const f = () => setL(get()); window.addEventListener("langchange", f); return () => window.removeEventListener("langchange", f); }, []);
  const set = (l) => { localStorage.setItem("lang", l); window.dispatchEvent(new Event("langchange")); };
  return [lang, set];
}