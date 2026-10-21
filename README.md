# 🛡️ PhishShield — AI-Assisted Scam Detection Platform

**Detect suspicious links. Analyze scam messages. Check QR codes and UPI payment signals. Stay safer online.**

PhishShield is an AI-assisted cybersecurity project designed to help students and everyday internet users identify potential phishing attempts, suspicious messages, and risky payment-related signals before taking action.

It combines machine-learning predictions, rule-based indicators, image analysis, and security recommendations in one web application.

> **Disclaimer:** PhishShield provides automated risk estimates for educational purposes. It cannot guarantee that a URL, message, QR code, or payment identifier is safe or fraudulent.

## ✨ Features

- 🔗 **URL & Phishing Detection** — Analyze website URLs for suspicious patterns and estimate phishing risk.
- 💬 **Message Scam Detection** — Examine messages for common scam language, urgency, suspicious requests, and risky links.
- 📱 **QR Code & UPI Analysis** — Inspect decoded QR payment information and identify relevant payment safety signals.
- 🖼️ **Image & Screenshot Analysis** — Analyze supported images and extracted text for potential scam indicators.
- 📄 **Offer Letter Analysis** — Use the image-analysis workflow to examine offer letters for potential warning signs.
- 🔐 **Authentication** — Register, log in, and access an account-specific dashboard.
- 📊 **Personal Scan History** — Review previous scans and their estimated risk scores.
- 🚨 **Risk Reports** — Submit suspicious findings for review through the reporting workflow.
- 📚 **Scam Awareness Library** — Explore educational content and practical prevention tips.
- 🌐 **Bilingual Guidance** — English and Hindi explanations are supported by the backend's detection rules.

## 🧰 Tech Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| Machine Learning | scikit-learn, TF-IDF, Logistic Regression |
| Data Processing | NumPy, pandas |
| Database | SQLite by default, PostgreSQL configurable |
| Authentication | Password hashing, signed bearer tokens |
| API Documentation | FastAPI Swagger UI |
| Model Persistence | Joblib |

## 🏗️ Architecture

```text
                ┌──────────────────────┐
                │   React + Vite UI    │
                └──────────┬───────────┘
                           │ HTTP / JSON
                ┌──────────▼───────────┐
                │    FastAPI Backend   │
                └──────────┬───────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼─────┐   ┌──────▼──────┐  ┌─────▼──────┐
   │ ML Models  │   │ Rule-Based  │  │ Image      │
   │ URL/Message│   │ Indicators  │  │ Analysis   │
   └────────────┘   └─────────────┘  └────────────┘
                           │
                ┌──────────▼───────────┐
                │ Database & History   │
                └──────────────────────┘
```

## 📂 Project Structure

```text
PhishShield/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── ai.py
│   │   └── features.py
│   ├── data/
│   ├── models/
│   │   ├── url.joblib
│   │   ├── msg.joblib
│   │   └── metrics.json
│   ├── .env.example
│   ├── requirements.txt
│   ├── train.py
│   └── prepare_data.py
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following:

- Python 3.10 or later
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/abhinav25005229-creator/PhishShield.git
cd PhishShield
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

Configure the required environment variables in `backend/.env`. Set a strong, random `AUTH_SECRET` before using authentication. Configure optional integrations only when you have the required credentials.

Start the API from the `backend` directory:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8010
```

API documentation:

- Swagger UI: http://127.0.0.1:8010/docs
- Health check: http://127.0.0.1:8010/health

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` with:

```env
VITE_API=http://localhost:8010
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, typically:

http://localhost:5173

**Note:** Restart the Vite server after changing environment variables. Keep local `.env` files private; never commit real API keys, passwords, tokens, or database files.

## 🧠 Machine Learning

PhishShield combines trained URL and message classification models with rule-based signals to estimate risk.

The backend loads its saved models from `backend/models/`. Training scripts and datasets are provided in the repository.

To retrain models, review the dataset format and configuration in `backend/train.py` before running:

```bash
python train.py
```

Run this command from the `backend` directory.

Model performance depends on dataset quality, training distribution, and the messages or URLs encountered in real-world use. Reported evaluation metrics should not be interpreted as guaranteed production performance.

## 🔌 API Endpoints

The following endpoints are implemented in the backend:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check API and database connectivity |
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Retrieve the current user's account |
| GET | `/history` | Retrieve account-specific scan history |
| POST | `/analyze/url` | Analyze a URL |
| POST | `/analyze/message` | Analyze a message |
| POST | `/analyze/qr` | Analyze decoded QR content |
| POST | `/analyze/image` | Analyze a supported image |
| POST | `/report` | Submit a suspicious-item report |
| GET | `/metrics` | Retrieve saved model metrics |
| GET | `/stats` | Retrieve aggregate scan statistics |
| GET | `/posts` | Retrieve educational posts |

Explore request schemas and responses at `/docs` while the backend is running. Administrative endpoints require a separately configured admin token.

## 🖥️ Screenshots

Screenshots of the application's main pages can be added here.

Recommended screenshots:

1. Home page and URL scanner
2. Message analysis results
3. QR & UPI payment checker
4. Personal dashboard and scan history
5. Screenshot or offer-letter analysis

Add screenshots under a folder such as `docs/screenshots/`, then embed them using relative Markdown paths.

Example:

```markdown
![PhishShield Dashboard](docs/screenshots/dashboard.png)
```

## 🔒 Security & Privacy

- Passwords are stored as hashes rather than plaintext.
- Authentication uses signed, expiring bearer tokens.
- Environment secrets should remain outside version control.
- Scan history is associated with authenticated user accounts.
- QR and UPI analysis cannot verify the real-world identity or ownership of a payment account.
- Optional external threat-intelligence integrations require their own configuration.

Never enter real payment credentials, UPI PINs, OTPs, or sensitive personal information into a testing environment.

## 🛣️ Future Improvements

- Improve QR image decoding reliability and error handling.
- Reduce false positives in UPI and QR risk scoring.
- Evaluate models against diverse, real-world phishing and scam datasets.
- Integrate and test live threat-intelligence services.
- Expand automated tests for API endpoints, authentication, and user isolation.
- Add deployment configuration, monitoring, and CI/CD.
- Improve accessibility and mobile responsiveness.

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Submit a pull request with a clear description.

## ⚠️ Disclaimer

PhishShield is an educational cybersecurity project, not a replacement for professional security tools or official verification channels. A low-risk score does not establish that content is safe, and a high-risk score does not independently prove fraud.

Before making a payment or sharing sensitive information, verify the recipient and request through trusted official channels.

If you suspect financial cyber fraud in India, contact the national cybercrime helpline at **1930** and report the incident through https://cybercrime.gov.in/.

---

**Built as a cybersecurity and machine-learning project to promote safer digital habits.**
