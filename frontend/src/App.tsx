import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  // single source of truth
  const [mode, setMode] = useState("node-stream");

  const getUrl = () => {
    switch (mode) {
      case "node-stream":
        return "http://localhost:8000/chat";
      case "node-sse":
        return "http://localhost:8000/chat-sse";
      case "python-stream":
        return "http://localhost:8001/chat";
      case "python-sse":
        return "http://localhost:8001/chat-sse";
      default:
        return "";
    }
  };

  const handleFetchStream = async () => {
    setResponse("");

    const res = await fetch(`${getUrl()}?prompt=${encodeURIComponent(prompt)}`);

    if (!res.body) throw new Error("No body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      setResponse((prev) => prev + decoder.decode(value));
    }
  };

  const handleSSE = () => {
    setResponse("");

    const es = new EventSource(`${getUrl()}?prompt=${encodeURIComponent(prompt)}`);

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        es.close();
      } else {
        setResponse((prev) => prev + e.data);
      }
    };
  };

  const handleSubmit = () => {
    if (!prompt.trim()) return;

    if (mode.includes("sse")) {
      handleSSE();
    } else {
      handleFetchStream();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        fontFamily: "system-ui",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 800,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          borderRadius: 20,
          padding: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <h2 style={{ marginBottom: 20 }}>⚡ Streaming AI Chat</h2>

        {/* RADIO BUTTONS */}
        <div style={{ marginBottom: 15, display: "flex", alignItems: "center", justifyContent: "left" }}>
          {[
            { label: "Node Stream", value: "node-stream" },
            { label: "Node SSE", value: "node-sse" },
            { label: "Python Stream", value: "python-stream" },
            { label: "Python SSE", value: "python-sse" },
          ].map((opt) => (
            <label key={opt.value} style={{ display: "block", marginBottom: 5 }}>
              <input type="radio" name="mode" value={opt.value} checked={mode === opt.value} onChange={(e) => setMode(e.target.value)} /> {opt.label}
            </label>
          ))}
        </div>

        {/* INPUT */}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything..."
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              border: "none",
              outline: "none",
              background: "#1e293b",
              color: "#fff",
            }}
          />

          <button
            onClick={handleSubmit}
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              border: "none",
              background: "#3b82f6",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Send
          </button>
        </div>

        {/* RESPONSE */}
        <div
          style={{
            marginTop: 20,
            padding: 15,
            borderRadius: 15,
            background: "#020617",
            maxHeight: 400,
            overflowY: "auto",
            textAlign: "left",
            textWrap: "pre-wrap",
            lineHeight: "180%",
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {response || "💬 Ask something to start..."}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
