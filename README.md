# PhishShield — AI-Based Scam Detection

PhishShield is a React + FastAPI application for assessing suspicious URLs, messages, UPI QR payloads, screenshots, photos, and job/scholarship offer letters. It provides risk estimates with English and Hinglish explanations. Results are advisory, not guarantees.

## Features

- URL scoring using the bundled trained model and 15 URL features.
- Message scoring using the bundled text model, scam-language rules, and extracted URLs.
- QR decoding in the browser, then URL/message/UPI payload analysis through the API.
- Screenshot, photo, and offer-letter analysis through Anthropic vision (requires an API key).
- SQLite by default, optional PostgreSQL via `DATABASE_URL`.
- Signup/login with salted PBKDF2 password hashes and signed, expiring bearer tokens.
- Per-account scan history for scans performed while signed in.
- User-submitted scam reports and token-protected admin report review.
- Scam library, blog, bilingual explanations, and model metrics.

## 1. Backend setup (Windows PowerShell)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `backend/.env` and set `AUTH_SECRET` and `ADMIN_TOKEN` to long, unique random strings. For example, generate one with:

```powershell
py -c "import secrets; print(secrets.token_urlsafe(48))"
```

Paste the generated value into `AUTH_SECRET`; generate a different value for `ADMIN_TOKEN`. Do not commit `.env` or share its contents.

SQLite is created automatically as `backend/phishshield.db` when the API is started from the backend folder. To use PostgreSQL instead, set `DATABASE_URL` in `.env`, for example:

```text
DATABASE_URL=postgresql+psycopg2://username:password@localhost:5432/phishshield
```

Start the API:

```powershell
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

### Image analysis

Image analysis requires an Anthropic API key. Set `ANTHROPIC_API_KEY` in `backend/.env`. Without it, image scans return HTTP 503 instead of inventing a result. URL, message, and QR analysis do not require this key.

### Admin reports

The admin page is `http://localhost:5173/#/admin`. Enter the value configured as `ADMIN_TOKEN` in `backend/.env`. Never deploy with a shared/default token.

## 2. Frontend setup (second PowerShell terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Set `VITE_API` in `frontend/.env` if the API is not at `http://localhost:8000`.

## Database behavior

- SQLite is the default, so a database works locally without installing a separate database server.
- PostgreSQL is optional and configured through `DATABASE_URL`.
- Accounts are stored with password hashes, not plaintext passwords.
- Scans are associated with the signed-in account only when the user is logged in during the scan. Anonymous scans still contribute to aggregate statistics.
- Scan history stores a short text summary and score, not uploaded image bytes.
- Reports are stored when the user explicitly presses the report button. Report contents may include personal information, so use the feature thoughtfully and restrict admin access.

## Model limitations

The models are estimates and can produce false positives or false negatives. The included training script may use synthetic data if no compatible labelled dataset is supplied; do not present synthetic-data metrics as real-world performance. Evaluate with held-out, labelled data before making claims about accuracy. External threat-intelligence checks are not implemented merely because they are described in the UI; only claim integrations that have been configured and tested.
