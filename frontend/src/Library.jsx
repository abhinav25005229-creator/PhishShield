
import { useMemo, useState } from "react";
import { LIB } from "./data.js";
import { HOME_IMAGES } from "./homeImages.js";
import "./library.css";

const CATS = ["All", ...new Set(LIB.map((item) => item.cat))];


const CATEGORY_IMAGES = {
  Students: HOME_IMAGES.jobScanner,
  Banking: HOME_IMAGES.securityAnalysis,
  Payments: HOME_IMAGES.qrScanner,
  Delivery: HOME_IMAGES.reporting,
  Calls: HOME_IMAGES.scamAwareness,
};


export default function Library() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredScams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return LIB.filter((item) => {
      const matchesCategory =
        category === "All" || item.cat === category;

      const text = [
        item.t,
        item.cat,
        item.how,
        ...(item.flags || []),
        item.act,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!query || text.includes(query));
    });
  }, [category, search]);

  return (
    <main className="wide library-page">
      {/* HERO SECTION */}
      <section className="library-hero">
        <div className="library-hero-copy">
          <span className="library-eyebrow">
            PHISHSHIELD / THREAT INTELLIGENCE
          </span>

          <h1>
            Know the scam.
            <br />
            <span>Spot the warning signs.</span>
          </h1>

          <p>
            Discover common scams, understand their warning signs,
            and learn how to protect your money and personal information.
          </p>

          <div className="library-hero-points">
            <span>01 / RECOGNIZE</span>
            <span>02 / VERIFY</span>
            <span>03 / PROTECT</span>
          </div>
        </div>

        <div className="library-hero-visual">
          <img
            src={HOME_IMAGES.threatIntelligence}
            alt="Cybersecurity threat intelligence"
          />
          <span className="library-image-caption">
            THREAT INTELLIGENCE / ACTIVE
          </span>
        </div>
      </section>

      {/* EXPLORE SECTION */}
      <section className="library-explorer">
        <div className="library-section-heading">
          <div>
            <span className="library-eyebrow">THE SCAM DATABASE</span>
            <h2>Explore scam patterns</h2>
            <p>Search real-world scam patterns and learn what to watch for.</p>
          </div>

          <div className="library-total">
            <strong>{filteredScams.length}</strong>
            <span>RESULTS</span>
          </div>
        </div>

        <div className="library-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search scams, red flags, or advice..."
            aria-label="Search scam library"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              Clear
            </button>
          )}
        </div>

        <div className="library-categories" aria-label="Filter by category">
          {CATS.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>

        {/* SCAM CARDS WITH IMAGES */}
        <div className="library-card-grid">
          {filteredScams.map((item, index) => (
            <article className="library-scam-card" key={item.id}>
              <div className="library-card-image">
                <img
  src={CATEGORY_IMAGES[item.cat] || HOME_IMAGES.messageScanner}
  alt={`${item.cat} scam awareness`}
  loading="lazy"
/>

                <span className="library-category-tag">
                  {item.cat}
                </span>

                <span className="library-case-number">
                  CASE / {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="library-card-body">
                <h3>{item.t}</h3>

                <p className="library-card-description">
                  {item.how}
                </p>

                <details className="library-details">
                  <summary>View red flags and safety advice</summary>

                  <div className="library-detail-block">
                    <span className="library-detail-label">
                      <span className="library-warning-icon">!</span>
                      RED FLAGS
                    </span>

                    <ul>
                      {(item.flags || []).map((flag, flagIndex) => (
                        <li key={`${item.id}-${flagIndex}`}>{flag}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="library-advice">
                    <div className="library-advice-image">
                      <img
                        src={HOME_IMAGES.securityAnalysis}
                        alt="Digital safety guidance"
                        loading="lazy"
                      />
                    </div>

                    <div>
                      <span className="library-detail-label">
                        WHAT TO DO
                      </span>
                      <p>{item.act}</p>
                    </div>
                  </div>
                </details>
              </div>
            </article>
          ))}
        </div>

        {filteredScams.length === 0 && (
          <div className="library-empty">
            <img
              src={HOME_IMAGES.messageScanner}
              alt="Search the scam library"
            />
            <h3>No matching scams found</h3>
            <p>Try another search term or select a different category.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* SAFETY SECTION WITH IMAGE */}
      <section className="library-safety-note">
        <img
          src={HOME_IMAGES.privacy}
          alt="Protecting personal information online"
          loading="lazy"
        />

        <div>
          <span className="library-eyebrow">YOUR DIGITAL SAFETY</span>
          <h2>Pause. Verify. Then act.</h2>
          <p>
            Never share an OTP, UPI PIN, password, or remote-access
            permission because someone pressured you to. Verify requests
            through official apps, websites, or phone numbers.
          </p>
          <a href="#/check" className="library-safety-button">
            Check something suspicious ↗
          </a>
        </div>
      </section>
    </main>
  );
}
