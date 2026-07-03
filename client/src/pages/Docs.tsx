import { useState, useEffect } from "react";

const DOCS_LIST = ["pricing", "onboarding", "terms", "privacy"];

export default function Docs() {
  const [selected, setSelected] = useState(DOCS_LIST[0]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const loadDoc = (name: string) => {
    setLoading(true);
    setEditing(false);
    fetch(`/api/docs/${name}`)
      .then((r) => r.text())
      .then((md) => {
        setContent(md);
        setEditContent(md);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => loadDoc(selected), [selected]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/docs/${selected}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      setContent(editContent);
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Docs</h2>
        <p>Centralised documentation</p>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {DOCS_LIST.map((d) => (
          <button key={d} className={`btn ${selected === d ? "btn-primary" : ""}`} onClick={() => setSelected(d)}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button className="btn" onClick={() => setEditing(!editing)}>
            {editing ? "Preview" : "Edit"}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="card">
          {editing ? (
            <div>
              <textarea
                className="sop-editor"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button className="btn" onClick={() => { setEditContent(content); setEditing(false); }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className="markdown-viewer"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^\d\. (.+)$/gm, "<li>$1</li>");
  const paragraphs = html.split("\n\n").filter(Boolean);
  return paragraphs.map((p) => {
    if (p.startsWith("<h") || p.startsWith("<ul") || p.startsWith("<li")) return p;
    return `<p>${p}</p>`;
  }).join("\n");
}
