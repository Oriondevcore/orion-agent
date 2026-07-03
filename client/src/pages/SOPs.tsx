import { useState, useEffect, useRef } from "react";

export default function SOPs() {
  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadSOPs = () => {
    setLoading(true);
    fetch("/api/sops")
      .then((r) => r.text())
      .then((md) => {
        setContent(md);
        setOriginal(md);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(loadSOPs, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/sops", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setOriginal(content);
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {}
    setSaving(false);
  };

  const reset = async () => {
    if (!confirm("Reset SOPs to defaults?")) return;
    await fetch("/api/sops/reset", { method: "POST" });
    loadSOPs();
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>SOPs</h2>
          <p>Standard operating procedures the agent adheres to</p>
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button className="btn" onClick={() => setEditing(!editing)}>
            {editing ? "Preview" : "Edit"}
          </button>
          <button className="btn" onClick={reset}>Reset</button>
        </div>
      </div>
      <div className="card">
        {editing ? (
          <div>
            <textarea
              ref={textareaRef}
              className="sop-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
              <button className="btn" onClick={() => { setContent(original); setEditing(false); }}>
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
