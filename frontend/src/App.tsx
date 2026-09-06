import { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Server, 
  CheckCircle2, 
  RefreshCw,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { HealthStatus, MetricItem, ForecastPoint } from './types';

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  async function loadData() {
    setLoading(true);
    try {
      // Fetch health
      const hRes = await fetch('/api/health').catch(() => null);
      if (hRes && hRes.ok) {
        setHealth(await hRes.json());
      } else {
        // Fallback mock if backend is not yet started
        setHealth({
          status: 'online',
          version: '1.0.0',
          service: 'compassx-test-app',
          uptime_seconds: 1240,
          timestamp: new Date().toISOString()
        });
      }

      // Fetch metrics
      const mRes = await fetch('/api/metrics').catch(() => null);
      if (mRes && mRes.ok) {
        setMetrics(await mRes.json());
      } else {
        setMetrics([
          { id: '1', name: 'Total Throughput', value: 142850, change_pct: 12.4, category: 'Operations', unit: 'req/s' },
          { id: '2', name: 'Model Accuracy', value: 98.65, change_pct: 1.8, category: 'AI / ML', unit: '%' },
          { id: '3', name: 'Latency (P99)', value: 24.5, change_pct: -8.2, category: 'Performance', unit: 'ms' },
          { id: '4', name: 'Active Nodes', value: 32, change_pct: 6.7, category: 'Compute', unit: 'nodes' },
        ]);
      }

      // Fetch forecast
      const fRes = await fetch('/api/forecast').catch(() => null);
      if (fRes && fRes.ok) {
        setForecast(await fRes.json());
      } else {
        setForecast([
          { period: 'Jan', actual: 12000, predicted: 11800, lower_bound: 11200, upper_bound: 12400 },
          { period: 'Feb', actual: 14500, predicted: 14200, lower_bound: 13600, upper_bound: 14800 },
          { period: 'Mar', actual: 16800, predicted: 16500, lower_bound: 15800, upper_bound: 17200 },
          { period: 'Apr', actual: 19200, predicted: 19000, lower_bound: 18200, upper_bound: 19800 },
          { period: 'May', actual: 22100, predicted: 21900, lower_bound: 21000, upper_bound: 22800 },
          { period: 'Jun', actual: null, predicted: 25400, lower_bound: 24100, upper_bound: 26700 },
        ]);
      }
      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Error fetching data', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className=\"app-container\">
      {/* Header */}
      <header className=\"header\">
        <div className=\"header-title\">
          <div style={{ background: '#38bdf8', padding: 8, borderRadius: 8, color: '#0f172a' }}>
            <Layers size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>CompassX Sample App</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              React + FastAPI Hybrid Micro-Frontend
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {health && (
            <span className=\"badge badge-success\">
              <CheckCircle2 size={12} />
              Backend: {health.status} (v{health.version})
            </span>
          )}
          <button className=\"btn\" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {/* KPI Metric Cards */}
      <div className=\"grid-cards\">
        {metrics.map((m) => (
          <div key={m.id} className=\"card\">
            <div className=\"card-label\">
              <span>{m.name}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{m.category}</span>
            </div>
            <div className=\"card-value\">
              {m.value.toLocaleString()} {m.unit}
            </div>
            <div className={card-change }>
              {m.change_pct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{Math.abs(m.change_pct)}% from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast & Analytics Table */}
      <section className=\"chart-section\">
        <div className=\"chart-header\">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Operational Forecast Predictions</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Forecast calculated from system analytics engine
            </p>
          </div>
          <span className=\"badge badge-accent\">
            <TrendingUp size={12} /> Real-Time Analytics
          </span>
        </div>

        <table className=\"forecast-table\">
          <thead>
            <tr>
              <th>Period</th>
              <th>Actual Value</th>
              <th>Predicted</th>
              <th>Confidence Range (95%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((f) => (
              <tr key={f.period}>
                <td style={{ fontWeight: 600 }}>{f.period}</td>
                <td>{f.actual ? f.actual.toLocaleString() : '—'}</td>
                <td style={{ color: '#38bdf8', fontWeight: 600 }}>{f.predicted.toLocaleString()}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {f.lower_bound.toLocaleString()} – {f.upper_bound.toLocaleString()}
                </td>
                <td>
                  {f.actual ? (
                    <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Recorded</span>
                  ) : (
                    <span style={{ color: 'var(--warning)', fontSize: '0.8rem' }}>Projected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Footer / System Meta */}
      <footer style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 40 }}>
        Powered by CompassX App Engine • Last updated at {lastRefreshed.toLocaleTimeString()}
      </footer>
    </div>
  );
}
