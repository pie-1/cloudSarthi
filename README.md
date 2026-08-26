# ☁️ CloudSarthi

**AI-Powered Multi-Cloud Monitoring for Developers**

CloudSarthi connects AWS, Vercel, and Supabase monitoring into one unified dashboard. It detects incidents across all services simultaneously, explains the technical root cause AND cost impact, and delivers insights via WhatsApp.

## 🚀 Features

- 🔗 **Unified Monitoring** - AWS + Vercel + Supabase in one dashboard
- 🤖 **AI Root Cause Analysis** - Plain English explanations using LLM
- 💰 **Cost Correlation** - Connect performance incidents to billing spikes
- 📱 **WhatsApp Alerts** - Get notified instantly on your phone
- 📊 **Dashboard** - Modern, animated, dark/light mode
- 💸 **Completely Free** - Open source, no enterprise pricing

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS + Recharts |
| Backend | Node.js + Express + MongoDB |
| AI Service | Python + FastAPI + Scikit-learn |
| LLM | Groq API (Llama 3) |
| Alerts | Twilio WhatsApp |
| Monitoring | Prometheus + Node Exporter |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- MongoDB (local or Atlas)
- Groq API Key (free from groq.com)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/cloudSarthi
cd cloudSarthi
```

### 2️⃣ Setup Client

```bash
cd client
npm install
npm run dev
```

Client runs on: http://localhost:5173

### 3️⃣ Setup Server

```bash
cd server
npm install
npm run dev
```

Server runs on: http://localhost:5000

### 4️⃣ Setup Python Service

```bash
cd python

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run the service
uvicorn src.main:app --reload --port 8001
```

Python service runs on: http://localhost:8001

### 5️⃣ Environment Variables

**client/.env**
```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

**server/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cloudSarthi
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
VERCEL_TOKEN=your_token
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
AI_SERVICE_URL=http://localhost:8001
GROQ_API_KEY=your_groq_key
```

**python/.env**
```
GROQ_API_KEY=your_groq_key
PROMETHEUS_URL=http://prometheus:9090
```

## 🧪 Testing

### Test Server
```bash
curl http://localhost:5000/api/health
```

### Test Python Service
```bash
curl http://localhost:8001/health
```

### Test Client
Open browser: http://localhost:5173

## 📚 References

- [RCACopilot](https://yinfangchen.github.io/assets/pdf/rcacopilot_paper.pdf) - Microsoft's LLM-based RCA
- [Isolation Forest](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html) - Anomaly detection
- [Groq API](https://console.groq.com/docs) - Free LLM inference
- [Flexera State of Cloud Report 2025](https://flexera.com/blog/cloud/state-of-the-cloud-report)
