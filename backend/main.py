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
            name="Total Throughput",
            value=142850.0,
            change_pct=12.4,
            category="Operations",
            unit="req/sec",
        ),
        MetricItem(
            id="m_2",
            name="Prediction Accuracy",
            value=98.65,
            change_pct=1.8,
            category="Machine Learning",
            unit="%",
        ),
        MetricItem(
            id="m_3",
            name="Latency (P99)",
            value=24.5,
            change_pct=-8.2,
            category="Performance",
            unit="ms",
        ),
        MetricItem(
            id="m_4",
            name="Active Compute Nodes",
            value=32.0,
            change_pct=6.7,
            category="Infrastructure",
            unit="nodes",
        ),
    ]
    if category:
        return [m for m in all_metrics if m.category.lower() == category.lower()]
    return all_metrics

@app.get("/api/forecast", response_model=List[ForecastPoint], tags=["Analytics"])
def get_forecast():
    return [
        ForecastPoint(period="Jan", actual=12000, predicted=11800, lower_bound=11200, upper_bound=12400),
        ForecastPoint(period="Feb", actual=14500, predicted=14200, lower_bound=13600, upper_bound=14800),
        ForecastPoint(period="Mar", actual=16800, predicted=16500, lower_bound=15800, upper_bound=17200),
        ForecastPoint(period="Apr", actual=19200, predicted=19000, lower_bound=18200, upper_bound=19800),
        ForecastPoint(period="May", actual=22100, predicted=21900, lower_bound=21000, upper_bound=22800),
        ForecastPoint(period="Jun", actual=None, predicted=25400, lower_bound=24100, upper_bound=26700),
        ForecastPoint(period="Jul", actual=None, predicted=28900, lower_bound=27300, upper_bound=30500),
    ]

# Serve static React frontend files if built
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
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
