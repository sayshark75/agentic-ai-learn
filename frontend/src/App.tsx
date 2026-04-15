import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

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

    let buffer = "";

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        setResponse(buffer);
        es.close();
        return;
      }

      const parsed = JSON.parse(e.data);
      buffer += parsed;

      setResponse(buffer);
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
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex flex-col">
      {/* Top Bar - Grok Style Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-purple-500 via-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-xl font-bold">
            S
          </div>
          <div>
            <div className="text-left font-semibold text-xl tracking-tight">Syper</div>
            <div className="text-[10px] text-slate-500 -mt-1">by a dev to a dev</div>
          </div>
        </div>

        {/* Server Route Selector */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">Backend:</span>
          <div className="flex gap-1 bg-zinc-900 rounded-full p-1 border border-white/5">
            {[
              { label: "Node Stream", value: "node-stream" },
              { label: "Node SSE", value: "node-sse" },
              { label: "Python Stream", value: "python-stream" },
              { label: "Python SSE", value: "python-sse" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                className={`px-4 py-1.5 rounded-full transition-all text-xs font-medium ${
                  mode === opt.value ? "bg-white text-black shadow" : "text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-8">
        {/* Welcome / Empty State */}
        {!response && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 bg-linear-to-br from-purple-500 via-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-xl">
              ⚡
            </div>
            <h1 className="text-4xl font-semibold mb-3 tracking-tighter">Hello, I'm Syper</h1>
            <p className="text-slate-400 max-w-md">Ask me anything. I'm powered by different streaming backends for testing.</p>
          </div>
        )}

        {/* Response Area - Grok-like Chat Bubble */}
        {response && (
          <div className="bg-zinc-900/70 border text-left leading-[180%] border-white/10 rounded-3xl p-8 max-h-[65vh] overflow-y-auto prose prose-invert prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {response}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Bottom Input Bar - Fixed like Grok */}
      <div className="border-t border-white/10 bg-black/80 backdrop-blur-md p-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex gap-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Ask syper anything..."
              className="flex-1 bg-zinc-900 border border-white/10 focus:border-purple-500 rounded-3xl px-7 py-4 text-lg placeholder:text-slate-500 outline-none transition-all"
            />

            <button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="bg-white hover:bg-slate-200 disabled:bg-zinc-700 disabled:text-slate-500 text-black font-semibold px-8 rounded-3xl transition-all flex items-center justify-center"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
