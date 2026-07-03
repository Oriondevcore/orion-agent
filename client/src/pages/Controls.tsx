import { useState, useEffect } from "react";

export default function Controls() {
  const [state, setState] = useState<{
    systemPrompt: string;
    model: string;
    host: string;
    sopsLength: number;
    tools: Record<string, boolean>;
  }>({
    systemPrompt: "",
    model: "",
    host: "",
    sopsLength: 0,
    tools: { browser: true, sandbox: true, codeMode: false, search: true },
  });
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptDraft, setPromptDraft] = useState("");

  useEffect(() => {
    fetch("/api/context")
      .then((r) => r.json())
      .then((data) => {
        setState((prev) => ({
          ...prev,
          systemPrompt: data.systemPrompt || prev.systemPrompt,
          model: data.model || "",
          host: data.host || "",
          sopsLength: data.sopsLength || 0,
        }));
      })
      .catch(() => {});
  }, []);

  const toggleTool = (tool: string) => {
    setState((prev) => ({
      ...prev,
      tools: { ...prev.tools, [tool]: !prev.tools[tool] },
    }));
  };

  return (
    <div>
      <div className="page-header">
        <h2>Controls</h2>
        <p>System prompt, tools, and agent configuration</p>
      </div>

      <div className="controls-grid">
        <div className="card">
          <div className="card-title">System Prompt</div>
          {editingPrompt ? (
            <div className="control-field">
              <textarea
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
                style={{ minHeight: "200px" }}
              />
              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-primary">Save</button>
                <button className="btn" onClick={() => setEditingPrompt(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div
                className="markdown-viewer"
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  fontSize: "0.8rem",
                  background: "var(--bg)",
                  padding: "0.75rem",
                  borderRadius: "6px",
                }}
              >
                {state.systemPrompt.split("\n").map((line, i) => <p key={i} style={{ margin: "0.25rem 0" }}>{line}</p>)}
              </div>
              <button className="btn" style={{ marginTop: "0.5rem" }} onClick={() => { setPromptDraft(state.systemPrompt); setEditingPrompt(true); }}>
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Tools</div>
          {Object.entries(state.tools).map(([tool, enabled]) => (
            <div key={tool} className="toggle-row">
              <span style={{ textTransform: "capitalize" }}>{tool}</span>
              <button className={`toggle ${enabled ? "active" : ""}`} onClick={() => toggleTool(tool)} />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Agent Info</div>
          <div className="control-field">
            <label>Active Model</label>
            <input value={state.model} readOnly />
          </div>
          <div className="control-field">
            <label>Host</label>
            <input value={state.host} readOnly />
          </div>
          <div className="control-field">
            <label>SOPs Loaded</label>
            <input value={`${state.sopsLength > 0 ? "Yes" : "No"} (${state.sopsLength} chars)`} readOnly />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button className="btn" onClick={() => { localStorage.removeItem("orion-chat-history"); alert("Chat history cleared"); }}>
              Clear Conversation History
            </button>
            <button className="btn" onClick={() => window.location.reload()}>
              Reconnect WebSocket
            </button>
            <button className="btn" onClick={() => fetch("/api/sops/reset", { method: "POST" }).then(() => alert("SOPs reset"))}>
              Reset SOPs to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
