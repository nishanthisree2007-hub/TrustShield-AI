# TrustShield AI 🛡️

**Detect the Fake. Protect the Brand. Stop the Threat.**

*Built for the Kampus.vc Digital Risk Protection Platform Hackathon.*

---

## 🌟 Executive Summary

**TrustShield AI** is an enterprise-grade, AI-assisted Digital Risk Protection (DRP) cybersecurity platform. It empowers enterprises and security operations centers (SOCs) to identify, analyze, and neutralize brand impersonation attacks, rogue social media handles, phishing/scam message campaigns (in both English and regional Tamil dialects), and trojanized mobile applications.

The platform couples a **deterministic, explainable risk scoring engine** with an **interactive Cytoscape.js threat topology graph**, a **defensive Digital Twin simulator**, and an **AI Investigation Copilot** with automated human-in-the-loop guardrails.

---

## ⚡ Core Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Cytoscape.js, Recharts, Lucide React, Axios |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite |
| **Security & Cryptography** | JWT Bearer Authentication, Salted SHA-256 Perceptual & Text Hashing, Safe Evidence Archival |
| **AI & NLP Analysis** | Levenshtein & Jaro-Winkler string metrics, Homoglyph normalization, Regex phrase matching (English & Tamil), Jaccard text-shingling campaign clustering, Optional LLM synthesis (Gemini / OpenAI / Groq) with deterministic rule fallback |
| **Testing** | Pytest, FastAPI TestClient, 100% automated test suite |

---

## 🚀 Unique Platform Capabilities

### 1. Brand DNA Fingerprint
* **Profile Whitelisting:** Register official brand names, alias variations, official domains, whitelisted social handles (`@kampus_vc`, `@apexpay`), official logos, and support channels.
* **Lexical & Visual Comparison:** Real-time distance evaluation matching candidates against registered trademarks to expose subtle typosquatting and character substitutions.

### 2. Impersonation Radar
* **Profile Ingestion:** Accepts handle, display name, bio, destination URL, and optional logo image.
* **Deterministic Risk Scoring:** Produces a normalized score (0–100) and risk tier (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
* **Explainable Evidence:** Enumerates exact triggers (e.g. handle appends `_support_24x7`, destination links to high-risk `.top` TLD).
* **Ethical Guardrail:** Never assumes similarity alone proves malicious intent without human review.

### 3. Scam DNA Analyzer (English & Tamil Dialects)
* **Bilingual Scam Detection:** Deep linguistic scanning for fraudulent patterns across English and common Tamil scam phrase structures.
* **8 Core Threat Vectors:**
  1. *Fake Giveaways* (`பரிசு வென்றீர்கள்`, `lucky draw`)
  2. *Phishing Alerts* (`உங்கள் கணக்கை உடனே சரிபார்க்கவும்`)
  3. *Urgent Payment Demands* (`உடனே பணம் செலுத்துங்கள்`, UPI extortion)
  4. *Fake Customer Support* (`வாடிக்கையாளர் சேவை`, unofficial Telegram bots)
  5. *Password & OTP Theft* (`OTP பகிருங்கள்`, `share 6-digit code`)
  6. *Fake Job Recruitment* (`வேலை வாய்ப்பு வீட்டில் இருந்தே சம்பாதிக்க`)
  7. *Account Suspension Scams* (`வங்கி கணக்கு முடக்கப்படும்`)
  8. *Crypto Doubler Promises* (`முதலீடு இரட்டிப்பு`, `300% return guaranteed`)
* **Linguistic Highlighting:** Pinpoints exact character offsets with interactive badges for threat analysts.

### 4. Interactive Threat Relationship Graph
* **Cytoscape.js Topology:** Visualizes connections between brands, lookalike handles, scam messages, APKs, and shared destination URLs.
* **Evidence-Driven Edges:** Edges are only generated when verifiable relationship evidence exists (`IMPERSONATES`, `HOSTS_DECEPTIVE_LINK`, `TARGETS_CUSTOMERS_OF`).
* **Analyst Controls:** Supports force-directed (Cose), circular, concentric, and grid layouts with entity-type filtering.

### 5. Mobile App Trust Inspector
* **Metadata Analysis:** Inspects reverse DNS package identifiers (e.g. `com.apexpay.quickwallet.mod`), developer contact reputation (unverified disposable emails), and claimed permissions.
* **Dangerous Permissions Detection:** Flags critical combinations (`RECEIVE_SMS`, `READ_SMS`, `BIND_ACCESSIBILITY_SERVICE`, `SYSTEM_ALERT_WINDOW`).
* **Explicit Boundary Disclaimer:** Clearly discloses that inspection is metadata-based without pretending to execute dynamic binary sandboxing.

### 6. Explainable Risk Engine
* **Deterministic Weight Calibration:**
  * Brand / Username Similarity: 20%
  * Logo Perceptual Similarity: 20%
  * Suspicious URL Indicators: 25%
  * Scam Content Indicators: 20%
  * Account & Developer Metadata: 15%
* **Dynamic Normalization:** Automatically re-normalizes available weights when specific telemetry vectors are absent, ensuring missing data is never counted as confirmed threat.

### 7. AI Investigation Copilot
* **Threat Synthesis:** Explains risk drivers, identifies missing telemetry vectors, and recommends next investigative steps.
* **Takedown & Advisory Drafting:** Automatically drafts formal abuse reports for domain registrars / hosting providers and customer-facing warning advisories.
* **Human Approval Guardrail:** Mandates human analyst verification before taking external actions.

### 8. Scam Campaign Clustering
* **Text Shingling & Fingerprinting:** Employs Jaccard n-gram token overlap to group incoming scam reports into campaign clusters.
* **Infrastructure Discovery:** Identifies shared deceptive phrases and overlapping destination URLs.
* **Labeling Guardrail:** Labels clusters as *potential relationships* rather than confirmed coordinated attacks.

### 9. Brand Risk Digital Twin
* **Defensive Threat Modeling:** Generates synthetic attack vectors across typosquatted domains, lookalike handles, fake promos, and rogue companion apps.
* **Live Engine Stress-Testing:** Passes synthetic scenarios through the live detection engine and computes empirical Resilience Scores, Precision, Recall, and F1.

### 10. Evidence Vault
* **Cryptographic Preservation:** Archives screenshots, raw text, and logs with computed SHA-256 integrity hashes.
* **Safe Storage:** Restricts uploads to static images and text logs with file size caps; zero binary execution.

### 11. Detection Quality Lab
* **Empirical Benchmarking:** Calculates Precision, Recall, F1 score, Accuracy, False Positive Rate (FPR), False Negative Rate (FNR), and an interactive 2x2 Confusion Matrix against a labeled 20-sample ground-truth test suite.

---

## 🛠️ Installation & Execution Guide

### Prerequisites
* **Python:** 3.11+
* **Node.js:** 18+ & npm

---

### Step 1: Backend Setup & Automated Tests

1. Open PowerShell / Terminal in the project root:
   ```powershell
   cd c:\Users\Admin\Downloads\AXIONIX
   ```

2. Install Python dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```

3. Run the automated Pytest test suite:
   ```powershell
   $env:PYTHONPATH = "backend"
   python -m pytest backend/tests -v
   ```
   *(Result: 20 passed in ~1.2s)*

4. Start the FastAPI backend server:
   ```powershell
   $env:PYTHONPATH = "backend"
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
   * ReDoc Reference: `http://127.0.0.1:8000/redoc`

---

### Step 2: Frontend Setup & Build

1. In a second terminal window, navigate to the `frontend` folder:
   ```powershell
   cd c:\Users\Admin\Downloads\AXIONIX\frontend
   ```

2. Install dependencies (if not already installed):
   ```powershell
   npm install --legacy-peer-deps
   ```

3. Build the production bundle:
   ```powershell
   npm run build
   ```

4. Launch the Vite development server:
   ```powershell
   npm run dev
   ```
   * Open Dashboard: `http://localhost:5173`

---

### 🔑 Demo Credentials

* **Username:** `demo_analyst`
* **Password:** `trustshield2026`
* *Tip:* Click the **"One-Click Demo Access"** button on the login screen for instant authenticated entry.

---

## 🐳 Docker Deployment

To launch the complete unified application container:

```bash
docker-compose up --build
```
Access the application at `http://localhost:8000`.

---

## 🔒 Security Best Practices & Ethical Disclaimers
* **Zero Secret Leakage:** No private API keys are bundled into frontend assets.
* **No Autonomous External Actions:** TrustShield AI does not automatically issue public reports or execute takedowns; all actions require human analyst review.
* **Metadata-Only Mobile Analysis:** Mobile app inspection analyzes manifest permissions and package identifiers without pretending to decompile binaries.
* **Synthetic Twin Labeling:** All defensive simulation scenarios are clearly labeled with `SYNTHETIC` tags.
