import { useState, useRef, useEffect, useCallback } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem("orion-chat-history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: Message[]) {
  try {
    localStorage.setItem("orion-chat-history", JSON.stringify(msgs.slice(-100)));
  } catch {}
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [wsStatus, setWsStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [voiceMode, setVoiceMode] = useState<"browser" | "workers-ai">(() => {
    return (localStorage.getItem("orion-voice-mode") as any) || "browser";
  });
  const ws = useRef<WebSocket | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const reconnectTimer = useRef<any>(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    setWsStatus("connecting");

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${location.host}/agents/OrionAgent/naledi`;
    const sock = new WebSocket(url);

    sock.onopen = () => {
      setWsStatus("connected");
      sock.send(JSON.stringify({ type: "cf_agent_chat_init", version: 1 }));
    };

    sock.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "cf_agent_chat_message") {
          setMessages((prev) => {
            const next = [...prev, {
              id: data.id || crypto.randomUUID(),
              role: data.role || "assistant",
              text: typeof data.text === "string" ? data.text : JSON.stringify(data.text),
              timestamp: Date.now(),
            }];
            saveMessages(next);
            return next;
          });
        }
      } catch {}
    };

    sock.onclose = () => {
      setWsStatus("disconnected");
      ws.current = null;
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.current = sock;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !ws.current) return;
    const id = crypto.randomUUID();
    setMessages((prev) => {
      const next = [...prev, { id, role: "user" as const, text: input, timestamp: Date.now() }];
      saveMessages(next);
      return next;
    });
    ws.current.send(JSON.stringify({
      type: "cf_agent_chat_message",
      id,
      role: "user",
      text: input,
    }));
    setInput("");
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("orion-chat-history");
  };

  // Voice input (browser SpeechRecognition)
  const startBrowserVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported"); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-ZA";
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + " " + transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  const toggleVoiceMode = () => {
    const next = voiceMode === "browser" ? "workers-ai" : "browser";
    setVoiceMode(next);
    localStorage.setItem("orion-voice-mode", next);
  };

  return (
    <div className="chat-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Chat</h2>
          <p>
            <span className={`status-dot ${wsStatus === "connected" ? "online" : "offline"}`} />
            {wsStatus}
            {wsStatus !== "connected" && (
              <button className="btn" style={{ marginLeft: "0.5rem" }} onClick={connect}>Retry</button>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Voice: {voiceMode}
          </span>
          <button className="btn" onClick={toggleVoiceMode} title="Toggle voice engine" style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem" }}>
            Switch
          </button>
          <button className="btn" onClick={clearHistory} title="Clear conversation" style={{ fontSize: "0.75rem", padding: "0.3rem 0.5rem" }}>
            Clear
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">No messages yet. Start a conversation.</div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            {msg.role === "assistant" && <div className="role">Naledi</div>}
            <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      <div className="chat-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          disabled={wsStatus !== "connected"}
        />
        <button
          className={`btn voice-btn ${listening ? "listening" : ""}`}
          onClick={startBrowserVoice}
          title={listening ? "Stop listening" : "Voice input (browser)"}
        >
          {listening ? "\u25A0" : "\u{1F3A4}"}
        </button>
        <button className="btn btn-primary" onClick={sendMessage} disabled={!input.trim() || wsStatus !== "connected"}>
          Send
        </button>
      </div>
    </div>
  );
}
