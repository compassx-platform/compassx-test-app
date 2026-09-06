# CompassX Sample Test App

A sample enterprise full-stack application built with **React** (Frontend) and **Python FastAPI** (Backend), designed to be deployed and managed via the **CompassX Apps Platform**.

---

## 🏗️ Project Architecture

```
compassx-test-app/
├── frontend/             # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── App.tsx       # Live KPI Cards & Forecast Dashboard
│   │   ├── main.tsx
│   │   ├── types.ts
│   │   └── index.css     # Modern styling matching CompassX design
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/              # Python FastAPI Backend
│   ├── main.py           # FastAPI endpoints (/api/health, /api/metrics, /api/forecast)
│   └── requirements.txt
└── README.md
```

---

## 🚀 Running Locally

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```
Backend API will be running on `http://localhost:8080` (Interactive Swagger docs at `http://localhost:8080/docs`).

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running on `http://localhost:3000` and proxied to the backend.

---

## 🔗 CompassX App Configuration
- **Repository URL**: `https://github.com/compassx-platform/compassx-test-app.git`
- **Default Branch**: `main`
- **Frontend Path**: `frontend`
- **Backend Entrypoint**: `backend/main.py`
- **Type**: `Web Application (React / Vite)`
