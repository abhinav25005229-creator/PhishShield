const P = {
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM18 18h2v2h-2z",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4",
  camera: "M4 8h4l2-3h4l2 3h4v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  doc: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7",
  book: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM8 4v13",
};
export default function Icon({ n }) {
  return <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d={P[n]} /></svg>;
}
