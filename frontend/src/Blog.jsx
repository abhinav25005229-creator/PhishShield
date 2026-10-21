
import { useMemo, useState } from "react";
import { BLOG_POSTS } from "./blogData.js";

const CATEGORIES = [
  "All articles",
  ...new Set(BLOG_POSTS.map((post) => post.category)),
];

function PostCard({ post }) {
  return (
    <a className="blog-card" href={`#/blog/${post.slug}`}>
      <div className="blog-card-art">
        <img src={post.image} alt="" loading="lazy" />
        <span>{post.category}</span>
      </div>

      <div className="blog-card-copy">
        <div className="blog-meta">
          PhishShield Security Desk · {post.readTime}
        </div>
        <h2>{post.title}</h2>
        <p>{post.summary}</p>
        <span className="blog-read">Read guide ↗</span>
      </div>
    </a>
  );
}

function Article({ post }) {
  return (
    <main className="blog-page blog-article-page">
      <a className="blog-back" href="#/blog">
        ← All articles
      </a>

      <header className="article-hero">
        <div>
          <span className="blog-kicker">
            PHISHSHIELD / FIELD GUIDE
          </span>
          <p className="blog-category">
            {post.category} · {post.readTime}
          </p>
          <h1>{post.title}</h1>
          <p className="article-deck">{post.summary}</p>
        </div>
        <img src={post.image} alt="Cybersecurity illustration" />
      </header>

      <article className="article-body">
        <p className="article-intro">{post.intro}</p>

        {post.sections.map((section, index) => (
          <section
            className="article-section"
            key={section.heading}
          >
            <span className="article-index">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div>
              <h2>{section.heading}</h2>

              {Array.isArray(section.body) ? (
                <ul>
                  {section.body.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{section.body}</p>
              )}
            </div>
          </section>
        ))}

        <aside className="article-action">
          <span className="blog-kicker">STAY ONE STEP AHEAD</span>
          <h2>Verify before you trust.</h2>
          <p>
            Check suspicious links and messages before you click,
            pay, or share personal information.
          </p>
          <a className="blog-cta" href="#/check">
            Open scanner ↗
          </a>
        </aside>

        <p className="article-disclaimer">
          Educational information only. Automated checks can be
          wrong and are not a guarantee of safety. Verify important
          information with the relevant official organisation.
        </p>
      </article>
    </main>
  );
}

export default function Blog({ slug }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All articles");
  const [page, setPage] = useState(1);

  const selected = slug
    ? BLOG_POSTS.find((post) => post.slug === slug)
    : null;

  const posts = useMemo(() => {
    const q = query.toLowerCase().trim();

    return BLOG_POSTS.filter((post) => {
      const categoryMatch =
        category === "All articles" ||
        post.category === category;

      const searchMatch =
        !q ||
        `${post.title} ${post.summary} ${post.category}`
          .toLowerCase()
          .includes(q);

      return categoryMatch && searchMatch;
    });
  }, [query, category]);

  if (slug) {
    return selected ? (
      <Article post={selected} />
    ) : (
      <main className="blog-page">
        <h1>Article not found</h1>
        <a href="#/blog">Return to all articles</a>
      </main>
    );
  }

  const visible = posts.slice(0, page * 12);

  return (
    <main className="blog-page">
      <section className="blog-masthead">
        <div className="blog-mast-copy">
          <span className="blog-kicker">
            PHISHSHIELD INTELLIGENCE / BLOG
          </span>
          <h1>
            Know the <em>signals.</em>
            <br />
            Avoid the scam.
          </h1>
          <p>
            Practical, India-focused guides to suspicious links,
            payment fraud, fake jobs and digital safety.
          </p>
          <div className="blog-mast-stats">
            <span>
              <b>{BLOG_POSTS.length}</b> security guides
            </span>
            <span>
              <b>{CATEGORIES.length - 1}</b> collections
            </span>
          </div>
        </div>

        <div className="blog-mast-art">
          <img
            src="/images/threat-globe.svg"
            alt="Cyber threat intelligence"
          />
        </div>
      </section>

      <section className="blog-library-head">
        <div>
          <span className="blog-kicker">THE KNOWLEDGE BASE</span>
          <h2>Scam awareness articles</h2>
          <p>
            Search a topic or select a category to find a practical guide.
          </p>
        </div>

        <label className="blog-search">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search scams, UPI, jobs, links..."
            aria-label="Search blog articles"
          />
        </label>
      </section>

      <nav className="blog-filters" aria-label="Article categories">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            onClick={() => {
              setCategory(item);
              setPage(1);
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="blog-results-line">
        Showing {visible.length} of {posts.length} guides
      </div>

      {visible.length ? (
        <div className="blog-grid">
          {visible.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="blog-empty">
          <h2>No guides found</h2>
          <p>Try another search term.</p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("All articles");
              setPage(1);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {visible.length < posts.length && (
        <div className="blog-load-wrap">
          <button
            className="blog-load"
            onClick={() => setPage((current) => current + 1)}
          >
            Load more guides ↓
          </button>
        </div>
      )}

      <section className="blog-bottom-cta">
        <div>
          <span className="blog-kicker">DON'T GUESS. CHECK.</span>
          <h2>Received a suspicious message?</h2>
          <p>Analyze it before taking action.</p>
        </div>
        <a className="blog-cta" href="#/check">
          Analyze now ↗
        </a>
      </section>
    </main>
  );
}
