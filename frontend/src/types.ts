export interface HealthStatus {
  status: string;
  version: string;
  service: string;
  uptime_seconds: number;
  timestamp: string;
}

export interface MetricItem {
  id: string;
  name: string;
  value: number;
  change_pct: number;
  category: string;
  unit: string;
}

export interface ForecastPoint {
  period: string;
  actual?: number | null;
  predicted: number;
  lower_bound: number;
  upper_bound: number;
}
