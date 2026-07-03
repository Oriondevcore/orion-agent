import { useState, useEffect } from "react";

const ROLES = ["chat", "vision", "embedding", "tools", "classifier"] as const;

type ModelCard = {
  name: string;
  task: string;
  properties?: Record<string, string>;
};

export default function Models() {
  const [models, setModels] = useState<ModelCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/models").then((r) => r.json()),
      fetch("/api/models/assignments").then((r) => r.json()),
    ])
      .then(([modelsData, assignmentsData]) => {
        setModels(modelsData.models || []);
        setAssignments(assignmentsData || {});
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const assign = (role: string, model: string) => {
    setAssignments((prev) => ({ ...prev, [role]: model }));
  };

  const saveAssignments = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/models/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignments),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="spinner" />;
  if (error) return <div className="empty-state">Error: {error}</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Models</h2>
        <p>Browse Cloudflare Workers AI models and assign them to roles</p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title">Role Assignments</div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {ROLES.map((role) => (
            <div key={role} className="model-card" style={{ flex: "1", minWidth: "180px" }}>
              <div className="name" style={{ textTransform: "capitalize" }}>{role}</div>
              <div className="assign">
                <select value={assignments[role] || ""} onChange={(e) => assign(role, e.target.value)}>
                  <option value="">-- none --</option>
                  {models.map((m) => (
                    <option key={m.name} value={m.name}>{m.name.split("/").pop()}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <button className="btn btn-primary" onClick={saveAssignments} disabled={saving}>
            {saving ? "Saving..." : saved ? "Saved!" : "Save Assignments"}
          </button>
        </div>
      </div>

      <div className="models-grid">
        {models.map((m) => (
          <div key={m.name} className="model-card">
            <div className="name" style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>{m.name}</div>
            <div className="task">{m.task}</div>
            {m.properties?.description && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {m.properties.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
