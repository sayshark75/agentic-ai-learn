import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const [isSSE, setIsSSE] = useState(false);
  const [isNode, setIsNode] = useState(true);

  const getUrl = () => {
    if (isSSE) return "http://localhost:8001/chat-sse";
    return "http://localhost:8000/chat";
  };

  const handleFetchStream = async () => {
    try {
      setResponse("");

      const res = await fetch(`${getUrl()}?prompt=${encodeURIComponent(prompt)}`);

      if (!res.body) throw new Error("body not present");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResponse((prev) => prev + decoder.decode(value));
      }
    } catch (err) {
      console.log(err);
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

    if (isSSE) {
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

        {/* SWITCHES */}
        <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
          <label style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={isSSE} onChange={() => setIsSSE(!isSSE)} /> SSE Mode
          </label>

          <label style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={isNode} onChange={() => setIsNode(!isNode)} /> Node Backend
          </label>
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
              fontSize: 14,
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
            textAlign: "left",
            marginTop: 20,
            padding: 15,
            borderRadius: 15,
            background: "#020617",
            maxHeight: 400,
            overflowY: "auto",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({ children }) {
                return (
                  <pre
                    style={{
                      background: "#0f172a",
                      padding: 10,
                      borderRadius: 10,
                      overflowX: "auto",
                    }}
                  >
                    <code>{children}</code>
                  </pre>
                );
              },
            }}
          >
            {response || "💬 Ask something to start..."}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
