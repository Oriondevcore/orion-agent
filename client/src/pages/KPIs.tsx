import { useState, useEffect } from "react";

type KPIData = {
  label: string;
  value: string;
};

export default function KPIs() {
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/kpis")
      .then((r) => r.json())
      .then((data) => {
        setKpis(data.kpis || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>KPIs</h2>
          <p>Key metrics and performance indicators</p>
        </div>
        <button className="btn" onClick={load}>Refresh</button>
      </div>
      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="kpi-grid">
          {kpis.map((k, i) => (
            <div key={i} className="kpi-card">
              <div className="value">{k.value}</div>
              <div className="label">{k.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
