
import { useEffect, useRef, useState } from "react";
import "./india-cyber-stats.css";

const stats = [
  {
    id: "daily",
    target: 7000,
    title: "Cyber Crimes Reported Daily",
    description: "Average complaints filed every day on the national portal",
    format: (n) => `${Math.round(n).toLocaleString("en-IN")}+`,
    tone: "blue",
  },
  {
    id: "total",
    target: 22.68,
    title: "Total Cyber Crimes",
    description: "Complaints filed across India in 2024",
    format: (n) => `${n.toFixed(2)} lakh`,
    tone: "blue",
  },
  {
    id: "loss",
    target: 22846,
    title: "Lost to Cyber Fraud",
    description: "Money reported lost across India in 2024",
    format: (n) => `₹${Math.round(n).toLocaleString("en-IN")} cr`,
    tone: "orange",
  },
];

function AnimatedNumber({ item, active }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let startTime;
    let frameId;
    const duration = 1500;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(item.target * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [active, item.target]);

  return <>{item.format(value)}</>;
}

export default function IndiaCyberStats() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="india-cyber-stats" ref={sectionRef}>
      <div className="india-stats-header">
        <span>THE SCALE OF IT — INDIA, 2024</span>
        <span className="india-stats-source-title">
          National Cyber Crime Reporting Portal
        </span>
      </div>

      <div className="india-stats-grid">
        {stats.map((item) => (
          <article
            className={`india-stat-card ${item.tone}`}
            key={item.id}
          >
            <div className="india-stat-value">
              <AnimatedNumber item={item} active={active} />
            </div>

            <span className="india-stat-accent" />

            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <footer className="india-stats-footnote">
        2024 figures reported by the Indian Cyber Crime Coordination Centre
        (I4C) and the Ministry of Home Affairs. Daily complaint volume as
        stated by I4C.
      </footer>
    </section>
  );
}
