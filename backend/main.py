import os
import time
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(
    title="CompassX Sample Test App",
    description="Sample enterprise analytics service with FastAPI & React",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthStatus(BaseModel):
    status: str
    version: str
    service: str
    uptime_seconds: float
    timestamp: str

class MetricItem(BaseModel):
    id: str
    name: str
    value: float
    change_pct: float
    category: str
    unit: str

class ForecastPoint(BaseModel):
    period: str
    actual: Optional[float] = None
    predicted: float
    lower_bound: float
    upper_bound: float

_start_time = time.time()

@app.get("/api/health", response_model=HealthStatus, tags=["Health"])
def health_check():
    return HealthStatus(
        status="healthy",
        version="1.0.0",
        service="compassx-test-app-backend",
        uptime_seconds=round(time.time() - _start_time, 2),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

@app.get("/api/metrics", response_model=List[MetricItem], tags=["Analytics"])
def get_metrics(category: Optional[str] = Query(None)):
    all_metrics = [
        MetricItem(
            id="m_1",
            name="Solar Output",
            value=284.5,
            change_pct=9.5,
            category="Renewable Generation",
            unit="MW",
        ),
        MetricItem(
            id="m_2",
            name="Wind Output",
            value=512.3,
            change_pct=-3.2,
            category="Renewable Generation",
            unit="MW",
        ),
        MetricItem(
            id="m_3",
            name="Battery Storage",
            value=96.2,
            change_pct=6.1,
            category="Energy Storage",
            unit="MWh",
        ),
        MetricItem(
            id="m_4",
            name="CO₂ Avoided",
            value=1240.0,
            change_pct=14.2,
            category="Sustainability",
            unit="tCO₂",
        ),
    ]
    if category:
        return [m for m in all_metrics if m.category.lower() == category.lower()]
    return all_metrics

@app.get("/api/forecast", response_model=List[ForecastPoint], tags=["Analytics"])
def get_forecast():
    return [
        ForecastPoint(period="Jan", actual=18200, predicted=17800, lower_bound=16900, upper_bound=18700),
        ForecastPoint(period="Feb", actual=20100, predicted=19600, lower_bound=18700, upper_bound=20500),
        ForecastPoint(period="Mar", actual=24800, predicted=24200, lower_bound=23200, upper_bound=25200),
        ForecastPoint(period="Apr", actual=27600, predicted=27100, lower_bound=26000, upper_bound=28200),
        ForecastPoint(period="May", actual=30100, predicted=29600, lower_bound=28500, upper_bound=30700),
        ForecastPoint(period="Jun", actual=None, predicted=31900, lower_bound=30500, upper_bound=33300),
        ForecastPoint(period="Jul", actual=None, predicted=33600, lower_bound=32000, upper_bound=35200),
    ]

@app.get("/api/analytics/summary", tags=["Analytics"])
def get_analytics_summary():
    return {
        "status": "ok",
        "total_energy_generated_mwh": 1240800,
        "active_generators": 48,
        "system_health": 99.98,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Serve static React frontend files if built (must be registered after all /api routes)
static_dirs = [
    os.path.join(os.path.dirname(__file__), "static"),
    os.path.join(os.path.dirname(__file__), "dist"),
    os.path.join(os.path.dirname(__file__), "../frontend/dist"),
]
dist_path = None
for s_dir in static_dirs:
    if os.path.exists(s_dir) and os.path.exists(os.path.join(s_dir, "index.html")):
        dist_path = s_dir
        break

if dist_path:
    assets_dir = os.path.join(dist_path, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend"])
    def serve_frontend(full_path: str):
        file_path = os.path.join(dist_path, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": "Welcome to CompassX Sample Test App API",
            "docs": "/docs",
            "health": "/api/health",
            "metrics": "/api/metrics",
            "forecast": "/api/forecast",
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8080"))
    dev_mode = os.getenv("DEV_MODE", "false").lower() == "true"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=dev_mode)

