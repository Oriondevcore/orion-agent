import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Chat from "./pages/Chat";
import Models from "./pages/Models";
import SOPs from "./pages/SOPs";
import KPIs from "./pages/KPIs";
import Docs from "./pages/Docs";
import Controls from "./pages/Controls";

const AUTH_KEY = "orion-auth-token";

function AuthGate({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_KEY) || "");
  const [checking, setChecking] = useState(true);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    fetch("/api/context", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (r.ok) setChecking(false);
        else { localStorage.removeItem(AUTH_KEY); setToken(""); setChecking(false); }
      })
      .catch(() => { setChecking(false); });
  }, [token]);

  const login = () => {
    if (!input.trim()) return;
    localStorage.setItem(AUTH_KEY, input);
    setToken(input);
  };

  if (checking) return <div className="spinner" />;
  if (!token) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>Orion Dashboard</h1>
          <p>Enter your access token to continue</p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Access token"
            autoFocus
          />
          <button className="btn btn-primary" onClick={login} style={{ width: "100%", marginTop: "0.75rem", justifyContent: "center" }}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<Chat />} />
          <Route path="models" element={<Models />} />
          <Route path="sops" element={<SOPs />} />
          <Route path="kpis" element={<KPIs />} />
          <Route path="docs" element={<Docs />} />
          <Route path="controls" element={<Controls />} />
        </Route>
      </Routes>
    </AuthGate>
  );
}
