import os, re, json, datetime as dt, joblib, numpy as np, base64, hashlib, hmac, secrets, urllib.request, urllib.error
from dotenv import load_dotenv
load_dotenv()
import razorpay
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.features import *
from fastapi import Request
from pydantic import Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from urllib.parse import parse_qs
from sqlalchemy import func, inspect as sa_inspect, text
from app.ai import analyze_image
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "models")
if not os.path.exists(f"{M}/url.joblib"):
    import train; train.main()
URL_M, MSG_M = joblib.load(f"{M}/url.joblib"), joblib.load(f"{M}/msg.joblib")

# Set DATABASE_URL=postgresql://user:pass@host/db for PostgreSQL; SQLite fallback for quick demos.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///phishshield.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
Base = declarative_base(); Session = sessionmaker(bind=engine)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(254), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    created = Column(DateTime, default=dt.datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True)
    kind = Column(String(10))
    content = Column(Text)
    score = Column(Float)
    level = Column(String(10))
    note = Column(Text, default="")
    reviewed = Column(Integer, default=0)
    created = Column(DateTime, default=dt.datetime.utcnow)
class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True, index=True)
    level = Column(String(10))
    score = Column(Float)
    kind = Column(String(20), default="url")
    summary = Column(String(500), default="")
    created = Column(DateTime, default=dt.datetime.utcnow)

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True); slug = Column(String(100), unique=True)
    title = Column(String(200)); summary = Column(String(300)); body = Column(Text)
    created = Column(DateTime, default=dt.datetime.utcnow)

class SubscriptionOrder(Base):
    __tablename__ = "subscription_orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    razorpay_order_id = Column(String(100), unique=True, nullable=False, index=True)
    plan = Column(String(30), nullable=False)
    amount = Column(Integer, nullable=False)
    status = Column(String(20), default="created", nullable=False)
    razorpay_payment_id = Column(String(100), unique=True, nullable=True)
    created = Column(DateTime, default=dt.datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)


class UserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, unique=True, nullable=False, index=True)
    plan = Column(String(30), nullable=False)
    status = Column(String(20), default="active", nullable=False)
    started_at = Column(DateTime, default=dt.datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

Base.metadata.create_all(engine)   # create all new tables before routes are served
# Lightweight migration for databases created by earlier PhishShield versions.
# create_all does not add columns to an existing SQLite/PostgreSQL table.
with engine.begin() as conn:
    tables = set(sa_inspect(engine).get_table_names())
    if "scans" in tables:
        existing = {c["name"] for c in sa_inspect(engine).get_columns("scans")}
        for col, ddl in {
            "user_id": "INTEGER",
            "kind": "VARCHAR(20) DEFAULT 'url'",
            "summary": "VARCHAR(500) DEFAULT ''",
        }.items():
            if col not in existing:
                conn.execute(text(f"ALTER TABLE scans ADD COLUMN {col} {ddl}"))
bearer_scheme = HTTPBearer(auto_error=False)


def get_authorization(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if credentials is None:
        return ""

    return f"{credentials.scheme} {credentials.credentials}"

app = FastAPI(title="PhishShield API")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173"
    ).split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- RAZORPAY PAYMENT ----------------

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "").strip()
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "").strip()

razorpay_client = None

if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
    )


class CreateOrderRequest(BaseModel):
    plan: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# Amounts are in paise: ₹199 = 19900 paise.
# Keep these aligned with the prices displayed in Subscription.jsx.
RAZORPAY_PLANS = {
    "pro_monthly": 19900,
    "pro_yearly": 199000,
    "premium_monthly": 39900,
    "premium_yearly": 399000,
}


@app.post("/api/create-order")
def create_order(request: CreateOrderRequest):
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Razorpay is not configured on the server."
        )

    amount = RAZORPAY_PLANS.get(request.plan)

    if amount is None or amount < 100:
        raise HTTPException(
            status_code=400,
            detail="Invalid subscription plan."
        )

    try:
        order = razorpay_client.order.create({
            "amount": amount,
            "currency": "INR",
            "receipt": f"ps_{secrets.token_hex(8)}",
        })

        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": RAZORPAY_KEY_ID,
        }
    except Exception as e:
        print("Razorpay error type:", type(e).__name__)
        print("Razorpay error details:", repr(e))
        print("Razorpay error args:", repr(e.args))

        raise HTTPException(
            status_code=502,
            detail="Razorpay order creation failed. Check backend logs."
        )


@app.post("/api/verify-payment")
def verify_payment(request: VerifyPaymentRequest):
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Razorpay is not configured on the server."
        )

    if not all([
        request.razorpay_order_id,
        request.razorpay_payment_id,
        request.razorpay_signature,
    ]):
        raise HTTPException(
            status_code=400,
            detail="Payment verification fields are required."
        )

    message = (
        f"{request.razorpay_order_id}|"
        f"{request.razorpay_payment_id}"
    )

    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(
        expected_signature,
        request.razorpay_signature
    ):
        raise HTTPException(
            status_code=400,
            detail="Payment signature verification failed."
        )

    return {
        "verified": True,
        "message": "Payment signature verified successfully.",
    }

# ---------------- END RAZORPAY PAYMENT ----------------



@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected", "storage": "postgresql" if engine.dialect.name == "postgresql" else "sqlite"}
    except Exception:
        raise HTTPException(503, "Database connection is unavailable.")

# Signed, expiring bearer tokens using the Python standard library; no extra JWT package needed.
AUTH_SECRET = os.getenv("AUTH_SECRET", "")
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

def password_hash(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 240_000)
    return base64.urlsafe_b64encode(salt).decode().rstrip("=") + "$" + base64.urlsafe_b64encode(derived).decode().rstrip("=")

def verify_password(password: str, stored: str) -> bool:
    try:
        salt_part, digest_part = stored.split("$", 1)
        salt = base64.urlsafe_b64decode(salt_part + "=" * (-len(salt_part) % 4))
        expected = base64.urlsafe_b64decode(digest_part + "=" * (-len(digest_part) % 4))
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 240_000)
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False

def create_token(user_id: int, email: str) -> str:
    if not AUTH_SECRET:
        raise HTTPException(503, "Set AUTH_SECRET in backend/.env before using login.")
    payload = json.dumps({"sub": user_id, "email": email, "exp": int(dt.datetime.now(dt.timezone.utc).timestamp()) + TOKEN_TTL_SECONDS},
                         separators=(",", ":")).encode()
    body = base64.urlsafe_b64encode(payload).decode().rstrip("=")
    sig = hmac.new(AUTH_SECRET.encode(), body.encode(), hashlib.sha256).digest()
    return body + "." + base64.urlsafe_b64encode(sig).decode().rstrip("=")

def decode_token(token: str):
    try:
        body, signature = token.split(".", 1)
        expected = hmac.new(AUTH_SECRET.encode(), body.encode(), hashlib.sha256).digest()
        supplied = base64.urlsafe_b64decode(signature + "=" * (-len(signature) % 4))
        if not AUTH_SECRET or not hmac.compare_digest(expected, supplied):
            return None
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if payload["exp"] < int(dt.datetime.now(dt.timezone.utc).timestamp()):
            return None
        return payload
    except Exception:
        return None

def optional_user_id(authorization: str = ""):
    if not authorization.lower().startswith("bearer "):
        return None
    payload = decode_token(authorization[7:].strip())
    return int(payload["sub"]) if payload else None

def require_user_id(authorization: str = ""):
    uid = optional_user_id(authorization)
    if uid is None:
        raise HTTPException(401, "Please log in to view your scan history.")
    return uid

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)

class LoginIn(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)

@app.post("/auth/register")
def register(b: RegisterIn):
    email = b.email.strip().lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise HTTPException(400, "Enter a valid email address.")
    if not AUTH_SECRET:
        raise HTTPException(503, "Set AUTH_SECRET in backend/.env before using login.")
    with Session() as s:
        if s.query(User).filter_by(email=email).first():
            raise HTTPException(409, "An account with this email already exists.")
        user = User(name=b.name.strip(), email=email, password_hash=password_hash(b.password))
        s.add(user); s.commit(); s.refresh(user)
        return {"access_token": create_token(user.id, user.email), "token_type": "bearer",
                "user": {"id": user.id, "name": user.name, "email": user.email}}

@app.post("/auth/login")
def login(b: LoginIn):
    email = b.email.strip().lower()
    with Session() as s:
        user = s.query(User).filter_by(email=email).first()
        if not user or not verify_password(b.password, user.password_hash):
            raise HTTPException(401, "Email or password is incorrect.")
        return {"access_token": create_token(user.id, user.email), "token_type": "bearer",
                "user": {"id": user.id, "name": user.name, "email": user.email}}

@app.get("/auth/me")
@app.get("/auth/me")
def auth_me(authorization: str = Depends(get_authorization)):
    uid = require_user_id(authorization)
    with Session() as s:
        user = s.get(User, uid)
        if not user:
            raise HTTPException(401, "Account not found.")
        return {"id": user.id, "name": user.name, "email": user.email}

@app.get("/history")
def scan_history(authorization: str = Depends(get_authorization)):
    uid = require_user_id(authorization)
    with Session() as s:
        rows = s.query(Scan).filter_by(user_id=uid).order_by(Scan.id.desc()).limit(100).all()
        return [{"id": r.id, "kind": r.kind, "score": r.score, "level": r.level,
                 "summary": r.summary, "created": r.created.isoformat() if r.created else None}
                for r in rows]

def check_admin(tok: str):
    secret = os.getenv("ADMIN_TOKEN")
    if not secret or tok != secret: raise HTTPException(401, "Unauthorized")

def level(p): return "low" if p < .35 else "medium" if p < .65 else "high"
def pack(p, reasons, extra=None, user_id=None, kind="url", summary=""):
    lv = level(p)
    try:
        with Session() as s:
            s.add(Scan(user_id=user_id, level=lv, score=round(p*100), kind=kind, summary=summary[:500]))
            s.commit()
    except Exception:
        pass
    return {"score": round(p*100), "level": lv, "reasons": reasons, "advice": ADVICE[lv], "note": NOTE, **(extra or {})}

def google_safe_browsing(url: str):
    """Optional live lookup. Returns threat metadata only when an API key is configured."""
    key = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "").strip()
    if not key:
        return None
    endpoint = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + key
    body = {
        "client": {"clientId": "phishshield-student-project", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }
    req = urllib.request.Request(endpoint, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=4) as response:
            data = json.load(response)
        matches = data.get("matches", [])
        if matches:
            return {"matched": True, "threats": sorted({m.get("threatType", "UNKNOWN") for m in matches})}
        return {"matched": False, "threats": []}
    except Exception:
        # An unavailable threat-intelligence provider must not prevent the local ML scan.
        return {"matched": None, "threats": [], "unavailable": True}


def url_risk(url):
    d = extract(url)
    x = np.array([vector(d)])

    # ML prediction: useful as a signal, not a verified probability.
    model_p = float(URL_M.predict_proba(x)[0][1])
    p = max(0.0, min(1.0, model_p))

    active_features = []

    if d["url_length"] > 100:
        active_features.append("url_length")
    if d["host_length"] > 50:
        active_features.append("host_length")
    if d["dots"] >= 4:
        active_features.append("dots")
    if d["hyphens"] >= 3:
        active_features.append("hyphens")
    if d["digits"] >= 5:
        active_features.append("digits")
    if d["has_at"]:
        active_features.append("has_at")
    if d["is_ip"]:
        active_features.append("is_ip")
    if d["subdomains"] >= 3:
        active_features.append("subdomains")
    if d["sus_tld"]:
        active_features.append("sus_tld")
    if d["keyword_hits"] >= 2:
        active_features.append("keyword_hits")
    if d["entropy"] > 3.8:
        active_features.append("entropy")
    if d["no_https"]:
        active_features.append("no_https")
    if d["shortener"]:
        active_features.append("shortener")
    if d["punycode"]:
        active_features.append("punycode")
    if d["path_depth"] >= 5:
        active_features.append("path_depth")

    reasons = [
        {"en": REASONS[key][0], "hi": REASONS[key][1]}
        for key in active_features
    ]

    # Current model uses synthetic training data. Do not let its
    # prediction alone label a URL high risk without a matching signal.
    # This is a conservative demo safeguard, not proof of safety.
    if not active_features:
        p = min(p, 0.34)

    return p, reasons, d



class UrlIn(BaseModel): url: str = Field(max_length=2000)
class MsgIn(BaseModel): text: str = Field(max_length=3000)
class ReportIn(BaseModel):
    kind: str = Field(pattern="^(url|msg)$")
    content: str = Field(max_length=3000)
    score: float
    level: str = Field(pattern="^(low|medium|high)$")
    note: str = Field("", max_length=500)

@app.post("/analyze/url")
@limiter.limit("20/minute")
def analyze_url(
    request: Request,
    b: UrlIn,
    authorization: str = Depends(get_authorization)
):
    if not b.url.strip(): raise HTTPException(400, "Empty URL")
    normalized = normalize(b.url)
    parsed = urlparse(normalized)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise HTTPException(400, "Enter a valid website URL or domain name.")
    p, reasons, d = url_risk(b.url)
    intel = google_safe_browsing(b.url)
    if intel and intel.get("matched") is True:
        p = max(p, .98)
        threats = ", ".join(intel.get("threats", []))
        reasons.insert(0, {"en": f"Google Safe Browsing reported this URL: {threats}.", "hi": f"Google Safe Browsing ne is URL ko report kiya: {threats}."})
    if not reasons:
        reasons = [{"en": "No suspicious URL patterns detected.", "hi": "Koi shak wala URL pattern nahi mila."}]
    extra = {"features": d, "threat_intelligence": intel or {"configured": False, "provider": "Google Safe Browsing"}}
    return pack(p, reasons, extra, optional_user_id(authorization), "url", b.url)

@app.post("/analyze/message")
@limiter.limit("20/minute")
def analyze_message(
    request: Request,
    b: MsgIn,
    authorization: str = Depends(get_authorization)
):
    t = b.text.strip()
    if not t: raise HTTPException(400, "Empty message")
    hits = [{"en": e, "hi": h} for pat, e, h in MSG_RULES if re.search(pat, t, re.I)]
    p = .5 * float(MSG_M.predict_proba([t])[0][1]) + .5 * min(1, len(hits) * .34)
    links = []
    for u in find_urls(t):
        up, _, _ = url_risk(u); links.append({"url": u, "score": round(up*100)})
        if up > .5: hits.append({"en": f"Contains a risky link: {u}", "hi": f"Isme risky link hai: {u}"})
        p = max(p, .85 * up)
    if not hits: hits = [{"en": "No common scam wording detected.", "hi": "Koi aam scam wording nahi mili."}]
    return pack(p, hits, {"links": links}, optional_user_id(authorization), "message", t)
@app.post("/report")
@limiter.limit("5/minute")
def report(request: Request, b: ReportIn):
    with Session() as s:
        s.add(Report(**b.model_dump())); s.commit()
    return {"ok": True}
@app.get("/admin/reports")
def reports(x_admin_token: str = Header("")):
    check_admin(x_admin_token)
    with Session() as s:
        return [{"id": r.id, "kind": r.kind, "content": r.content, "score": r.score, "level": r.level,
                 "reviewed": r.reviewed, "created": r.created}
                for r in s.query(Report).order_by(Report.id.desc()).limit(200)]

@app.patch("/admin/reports/{rid}")
def review(rid: int, x_admin_token: str = Header("")):
    check_admin(x_admin_token)
    with Session() as s:
        r = s.get(Report, rid)
        if not r: raise HTTPException(404, "Not found")
        r.reviewed = 1; s.commit()
    return {"ok": True}
@app.get("/metrics")
def metrics(): return json.load(open(f"{M}/metrics.json"))
class PostIn(BaseModel):
    slug: str = Field(pattern="^[a-z0-9-]{3,100}$"); title: str = Field(max_length=200)
    summary: str = Field(max_length=300); body: str = Field(max_length=20000)

@app.get("/posts")
def posts():
    with Session() as s:
        return [{"slug": p.slug, "title": p.title, "summary": p.summary, "created": p.created}
                for p in s.query(Post).order_by(Post.id.desc())]

@app.get("/posts/{slug}")
def post(slug: str):
    with Session() as s:
        p = s.query(Post).filter_by(slug=slug).first()
        if not p: raise HTTPException(404, "Not found")
        return {"slug": p.slug, "title": p.title, "body": p.body, "created": p.created}

@app.post("/admin/posts")              # add posts from http://localhost:8000/docs
def new_post(b: PostIn, x_admin_token: str = Header("")):
    check_admin(x_admin_token)
    with Session() as s: s.add(Post(**b.model_dump())); s.commit()
    return {"ok": True}

@app.get("/stats")
def stats():
    with Session() as s:
        by = {k: v for k, v in s.query(Scan.level, func.count(Scan.id)).group_by(Scan.level).all()}
        return {"total": sum(by.values()), "by_level": by, "reports": s.query(Report).count()}
class QrIn(BaseModel): data: str = Field(max_length=2000)
class ImgIn(BaseModel):
    image: str = Field(max_length=7_000_000)
    media_type: str = Field(pattern="^image/(png|jpeg|webp|gif)$")
    mode: str = Field("screenshot", pattern="^(screenshot|photo|offer)$")
@app.post("/analyze/qr")
@limiter.limit("20/minute")
def analyze_qr(
    request: Request,
    b: QrIn,
    authorization: str = Depends(get_authorization)
):
    q = parse_qs(urlparse(b.data.strip()).query)
    pa, pn, am = (q.get(k, [""])[0] for k in ("pa", "pn", "am"))
    p = .5
    reasons = [
      {"en": f"This is a UPI payment QR for '{pn or 'unknown name'}' ({pa or 'no ID'}). Check that the name matches who you mean to pay.",
       "hi": f"Ye UPI payment QR hai: '{pn or 'naam nahi'}' ({pa or 'ID nahi'}). Dekhein ki naam sahi vyakti ka hai."},
      {"en": "Scanning a QR code only sends money. It never receives money. Anyone saying otherwise is scamming you.",
       "hi": "QR scan karne se sirf paise jaate hain, aate nahi. Jo kehta hai ki paise aayenge, wo scam hai."}]
    if am:
        p += .15; reasons.append({"en": f"It pre-fills an amount of Rs {am}.", "hi": f"Isme pehle se Rs {am} amount bhara hua hai."})
    if not pn: p += .1
    return pack(p, reasons, {"payee": pa, "name": pn, "amount": am}, optional_user_id(authorization), "qr", b.data)

def score_text(t):
    hits = [{"en": e, "hi": h} for pat, e, h in MSG_RULES if re.search(pat, t, re.I)]
    p = .5 * float(MSG_M.predict_proba([t])[0][1]) + .5 * min(1, len(hits) * .34)
    for u in find_urls(t):
        up, _, _ = url_risk(u); p = max(p, .85 * up)
        if up > .5: hits.append({"en": f"Contains a risky link: {u}", "hi": f"Isme risky link hai: {u}"})
    return p, hits

@app.post("/analyze/image")
@limiter.limit("6/minute")
def analyze_img(
    request: Request,
    b: ImgIn,
    authorization: str = Depends(get_authorization)
):
    ai = analyze_image(b.image, b.media_type, b.mode)
    if ai is None: raise HTTPException(503, "AI analysis unavailable")
    text = str(ai.get("text", ""))[:3000]
    mp, hits = score_text(text) if text.strip() else (0.0, [])
    risk = float(ai.get("risk", .5)) if isinstance(ai.get("risk"), (int, float)) else .5
    p = .65 * risk + .35 * mp
    if ai.get("verdict") == "scam": p = max(p, .8)
    en, hi = ai.get("reasons_en", []), ai.get("reasons_hi", [])
    reasons = [{"en": e, "hi": hi[i] if i < len(hi) else e} for i, e in enumerate(en)][:5] + hits[:3]
    if not reasons: reasons = [{"en": "No clear scam signals found in the image.", "hi": "Image mein koi saaf scam signal nahi mila."}]
    return pack(p, reasons, {"extracted_text": text}, optional_user_id(authorization), b.mode, text[:500])
SEED = [
 ("fake-scholarship-messages", "5 signs of a fake scholarship message",
  "Real scholarships never ask you to pay to receive money.",
  "Scammers love scholarship season. A message saying your scholarship is approved, but you must pay a registration or processing fee first, is almost always fake.\n\nWatch for five signs: an upfront fee, a deadline of a few hours, a link that is not an official .gov.in or .ac.in address, a request for your OTP or UPI PIN, and a scholarship you never applied for.\n\nWhen in doubt, open the official portal by typing its address yourself and check your application status there."),
 ("upi-qr-scams", "How UPI QR scams work",
  "Scanning a QR code can only send money, never receive it.",
  "In a common scam, a stranger says they will pay you and asks you to scan a QR code or enter your UPI PIN to receive the money. Receiving money never needs a PIN or a scan.\n\nOnly scan a QR code when you intend to pay, and check the payee name before you confirm. Never share your UPI PIN with anyone, including people who claim to be from a bank.\n\nIf a buyer on a resale site sends you a QR code to receive payment, stop. That is the scam."),
 ("if-you-were-scammed", "What to do if you were scammed",
  "Act fast: the first hour matters most.",
  "Call the national cybercrime helpline 1930 as soon as possible and report at cybercrime.gov.in. Quick reporting can help freeze the transferred money.\n\nContact your bank, block your cards or UPI if needed, change passwords on affected accounts, and keep screenshots of the messages, numbers and transaction IDs.\n\nTell your college IT cell too, so other students can be warned."),
]
def seed():
    with Session() as s:
        if s.query(Post).count() == 0:
            for sl, t, su, b in SEED: s.add(Post(slug=sl, title=t, summary=su, body=b))
            s.commit()
seed()
