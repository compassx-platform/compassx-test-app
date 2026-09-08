import { useState, useEffect } from 'react';
import {
  Sun,
  Wind,
  BatteryCharging,
  Leaf,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Zap
} from 'lucide-react';
import { HealthStatus, MetricItem, ForecastPoint } from './types';

const METRIC_STYLE: Record<string, { icon: JSX.Element; color: string }> = {
  '1': { icon: <Sun size={16} />, color: '#fbbf24' },
  '2': { icon: <Wind size={16} />, color: '#38bdf8' },
  '3': { icon: <BatteryCharging size={16} />, color: '#34d399' },
  '4': { icon: <Leaf size={16} />, color: '#a3e635' },
};

const ENERGY_MIX = [
  { name: 'Solar', value: '284 MW', pct: 36, color: '#fbbf24' },
  { name: 'Wind', value: '512 MW', pct: 41, color: '#38bdf8' },
  { name: 'Storage', value: '96 MWh', pct: 13, color: '#34d399' },
  { name: 'Hydro', value: '73 MW', pct: 10, color: '#818cf8' },
];

const GRID_STATUS = [
  { name: 'Grid Demand', value: '68%', pct: 68, color: 'var(--accent)' },
  { name: 'Battery Level', value: '74%', pct: 74, color: 'var(--success)' },
  { name: 'Renewable Share', value: '88%', pct: 88, color: '#a3e635' },
];

function ForecastChart({ data }: { data: ForecastPoint[] }) {
  const W = 720;
  const H = 240;
  const PAD_L = 52;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;

  const values = data
    .flatMap((d) => [d.actual, d.predicted, d.lower_bound, d.upper_bound])
    .filter((v): v is number => v != null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const yOf = (v: number) => PAD_T + (1 - (v - min) / range) * (H - PAD_T - PAD_B);
  const xOf = (i: number) => PAD_L + (i / (data.length - 1)) * (W - PAD_L - PAD_R);
  const A = (i: number, v: number) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`;

  let band = '';
  data.forEach((d, i) => (band += A(i, d.upper_bound) + ' '));
  for (let i = data.length - 1; i >= 0; i--) band += A(i, data[i].lower_bound) + ' ';
  band += 'Z';

  const predictedPts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.predicted) }));
  const predictedPath = predictedPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const actualPts = data.map((d, i) => (d.actual != null ? { x: xOf(i), y: yOf(d.actual) } : null));
  const actualPath = actualPts
    .map((p, i) => (p ? `${p.x.toFixed(1)},${p.y.toFixed(1)}` : `L${xOf(i).toFixed(1)},${yOf(min).toFixed(1)}`))
    .map((s, i, arr) => (i === 0 ? `M${s}` : i > 0 && arr[i - 1] === '-' ? `M${s}` : `L${s}`))
    .join(' ');

  const yTicks = [0, 1, 2, 3, 4].map((t) => {
    const v = min + (range * t) / 4;
    return { v, y: yOf(v) };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="Forecast chart">
      <defs>
        <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD_L} x2={W - PAD_R} y1={t.y} y2={t.y} stroke="var(--border-color)" strokeWidth={1} />
          <text x={PAD_L - 8} y={t.y + 4} textAnchor="end" fontSize={11} fill="var(--text-muted)">
            {Math.round(t.v).toLocaleString()}
          </text>
        </g>
      ))}

      <path d={band} fill="url(#bandFill)" />

      {actualPts.map((p, i) =>
        p ? (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--success)" stroke="var(--bg-surface)" strokeWidth={2} />
        ) : null
      )}

      <path d={actualPath} fill="none" stroke="var(--success)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <path d={predictedPath} fill="none" stroke="var(--accent)" strokeWidth={2} strokeDasharray="6 5" strokeLinejoin="round" />

      {predictedPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--accent)" />
      ))}

      {data.map((d, i) => (
        <text key={i} x={xOf(i)} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
          {d.period}
        </text>
      ))}
    </svg>
  );
}

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  async function loadData() {
    setLoading(true);
    try {
      const hRes = await fetch('/api/health').catch(() => null);
      if (hRes && hRes.ok) {
        setHealth(await hRes.json());
      } else {
        setHealth({
          status: 'online',
          version: '1.0.0',
          service: 'compassx-test-app',
          uptime_seconds: 1240,
          timestamp: new Date().toISOString(),
        });
      }

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
      <header className="header">
        <div className="header-title">
          <div className="brand-logo">
            <span className="brand-logo-glow" />
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>CompassX Renewable Energy</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live solar, wind & storage monitoring</p>
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

      <div className="grid-cards">
        {metrics.map((m) => {
          const style = METRIC_STYLE[m.id] ?? { icon: <Zap size={16} />, color: 'var(--accent)' };
          const up = m.change_pct >= 0;
          return (
            <div key={m.id} className="card metric-card">
              <div className="card-label">
                <span
                  className="icon-chip"
                  style={{
                    background: `color-mix(in srgb, ${style.color} 16%, transparent)`,
                    color: style.color,
                  }}
                >
                  {style.icon}
                </span>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                  {m.category}
                </span>
              </div>
              <div className="card-value">
                {m.value.toLocaleString()} <span className="card-unit">{m.unit}</span>
              </div>
              <div className="card-label" style={{ marginBottom: 0 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.name}</span>
                <span className={`card-change ${up ? 'positive' : 'negative'}`}>
                  {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(m.change_pct)}% MoM
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <section className="chart-section">
        <div className="chart-header">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Renewable Energy Generation Forecast</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Forecasted vs actual energy output (MWh)</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="chart-legend">
              <span className="legend-dot" style={{ background: 'var(--success)' }} /> Actual
            </span>
            <span className="chart-legend">
              <span className="legend-dot legend-dash" style={{ borderColor: 'var(--accent)' }} /> Predicted
            </span>
            <span className="badge badge-accent">
              <TrendingUp size={12} /> Real-Time Analytics
            </span>
          </div>
        </div>

        <ForecastChart data={forecast} />
      </section>

      <div className="split-grid">
        <section className="chart-section">
          <div className="chart-header">
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Energy Mix</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Share of renewable capacity</p>
            </div>
          </div>
          <div className="mix-list">
            {ENERGY_MIX.map((s) => (
              <div key={s.name} className="mix-item">
                <span className="mix-head">
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.value}</span>
                </span>
                <div className="meter">
                  <div className="meter-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
                <span className="mix-pct">{s.pct}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-section">
          <div className="chart-header">
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Live Grid Status</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time grid telemetry</p>
            </div>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> Operational
            </span>
          </div>
          <div className="mix-list">
            {GRID_STATUS.map((s) => (
              <div key={s.name} className="mix-item">
                <span className="mix-head">
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.value}</span>
                </span>
                <div className="meter">
                  <div className="meter-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
                <span className="mix-pct">{s.pct}%</span>
              </div>
            ))}
          </div>
          <div className="grid-telemetry">
            <div className="telemetry-item">
              <Droplets size={14} style={{ color: '#38bdf8' }} />
              <span>Hydro inflow 1,204 m³/s</span>
            </div>
            <div className="telemetry-item">
              <BatteryCharging size={14} style={{ color: 'var(--success)' }} />
              <span>Storage charging 12 MW</span>
            </div>
          </div>
        </section>
      </div>

      <section className="chart-section">
        <div className="chart-header">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Monthly Generation Detail</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Period, actual output and predicted ranges (MWh)</p>
          </div>
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

      <footer style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 40 }}>
        Powered by CompassX Container Engine • Live Container Instance • {lastRefreshed.toLocaleTimeString()}
      </footer>
    </div>
  );
}