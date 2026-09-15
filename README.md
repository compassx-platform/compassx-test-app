# 📊 CompassX Sample Test App

A sample enterprise full-stack application built with **React** (Frontend) and **Python FastAPI** (Backend), designed to be deployed and managed via the **CompassX Apps Platform**. It demonstrates a live KPI dashboard with forecast charting and a real-time analytics API.

---

## ✨ Features

- **Live KPI Dashboard** — React + Vite + TypeScript frontend with KPI cards and a forecast chart
- **REST Analytics API** — FastAPI backend exposing health, metrics, forecast, and summary endpoints
- **Dark Mode UI** — Modern styling consistent with the CompassX design language
- **Single-Service Deployment** — The prebuilt frontend `dist` is served directly by the backend
- **CORS Enabled** — Backend API callable from any frontend origin

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
│   ├── dist/             # Prebuilt production bundle (served by backend)
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/              # Python FastAPI Backend
│   ├── main.py           # FastAPI app + endpoints
│   └── requirements.txt
└── README.md
```

---

## 🔌 API Endpoints

| Method | Path                       | Description                                    |
| ------ | -------------------------- | ---------------------------------------------- |
| GET    | `/api/health`              | Service health, version, uptime & timestamp    |
| GET    | `/api/metrics`             | List of analytics KPI metrics                  |
| GET    | `/api/forecast`            | Forecast data points for the dashboard chart   |
| GET    | `/api/analytics/summary`   | Aggregated analytics summary                   |

Interactive Swagger docs are available at `http://localhost:8080/docs`.

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
Backend API will be running on `http://localhost:8080` (Interactive Swagger docs at `http://localhost:8080/docs`). The backend also serves the prebuilt frontend from `frontend/dist`.

### 2. Frontend (React + Vite) — development mode
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

---

## 📄 License

This project is provided as a sample application for demonstration purposes.