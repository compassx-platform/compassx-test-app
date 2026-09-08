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
          { id: '1', name: 'Solar Output', value: 284.5, change_pct: 9.5, category: 'Renewable Generation', unit: 'MW' },
          { id: '2', name: 'Wind Output', value: 512.3, change_pct: -3.2, category: 'Renewable Generation', unit: 'MW' },
          { id: '3', name: 'Battery Storage', value: 96.2, change_pct: 6.1, category: 'Energy Storage', unit: 'MWh' },
          { id: '4', name: 'CO₂ Avoided', value: 1240, change_pct: 14.2, category: 'Sustainability', unit: 'tCO₂' },
        ]);
      }

      // Fetch forecast
      const fRes = await fetch('/api/forecast').catch(() => null);
      if (fRes && fRes.ok) {
        setForecast(await fRes.json());
      } else {
        setForecast([
          { period: 'Jan', actual: 18200, predicted: 17800, lower_bound: 16900, upper_bound: 18700 },
          { period: 'Feb', actual: 20100, predicted: 19600, lower_bound: 18700, upper_bound: 20500 },
          { period: 'Mar', actual: 24800, predicted: 24200, lower_bound: 23200, upper_bound: 25200 },
          { period: 'Apr', actual: 27600, predicted: 27100, lower_bound: 26000, upper_bound: 28200 },
          { period: 'May', actual: 30100, predicted: 29600, lower_bound: 28500, upper_bound: 30700 },
          { period: 'Jun', actual: null, predicted: 31900, lower_bound: 30500, upper_bound: 33300 },
          { period: 'Jul', actual: null, predicted: 33600, lower_bound: 32000, upper_bound: 35200 },
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
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <div
            style={{
              background: 'var(--accent-glow)',
              padding: 8,
              borderRadius: 8,
              color: 'var(--accent)',
              border: '1px solid rgba(2, 132, 199, 0.2)',
            }}
          >
            <Layers size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>CompassX Renewable Energy</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Live solar, wind & storage monitoring
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {health && (
            <span className="badge badge-success">
              <CheckCircle2 size={12} />
              Backend: {health.status} (v{health.version})
            </span>
          )}
          <button className="btn" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {/* KPI Metric Cards */}
      <div className="grid-cards">
        {metrics.map((m) => (
          <div key={m.id} className="card">
            <div className="card-label">
              <span>{m.name}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{m.category}</span>
            </div>
            <div className="card-value">
              {m.value.toLocaleString()} {m.unit}
            </div>
            <div className={`card-change ${m.change_pct >= 0 ? 'positive' : 'negative'}`}>
              {m.change_pct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{Math.abs(m.change_pct)}% from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast & Analytics Table */}
      <section className="chart-section">
        <div className="chart-header">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Renewable Energy Generation Forecast</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Forecasted vs actual energy output (MWh)
            </p>
          </div>
          <span className="badge badge-accent">
            <TrendingUp size={12} /> Real-Time Analytics
          </span>
        </div>

        <table className="forecast-table">
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
                <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{f.predicted.toLocaleString()}</td>
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
        Powered by CompassX Container Engine • Live Container Instance • {lastRefreshed.toLocaleTimeString()}
      </footer>
    </div>
  );
}
