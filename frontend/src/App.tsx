import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

type MessageType = { role: "user" | "assistant"; content: string };

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [mode, setMode] = useState("node-stream");
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

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

  const handleFetchStream = async (msgs: MessageType[]) => {
    setIsLoading(true);

    const res = await fetch(getUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs }),
    });

    if (!res.body) throw new Error("No body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let fullText = "";
    let assistantIndex = -1;

    setMessages((prev) => {
      assistantIndex = prev.length;
      return [...prev, { role: "assistant", content: "" }];
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      fullText += chunk;

      setMessages((prev) => {
        const updated = [...prev];
        if (assistantIndex !== -1) {
          updated[assistantIndex] = {
            role: "assistant",
            content: fullText,
          };
        }
        return updated;
      });
    }

    setIsLoading(false);
  };

  const handleSSE = (msgs: MessageType[]) => {
    setIsLoading(true);

    const es = new EventSource(`${getUrl()}?messages=${encodeURIComponent(JSON.stringify(msgs))}`);

    let fullText = "";

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    const assistantIndex = msgs.length;

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        setIsLoading(false);
        es.close();
        return;
      }

      const chunk = JSON.parse(e.data);
      fullText += chunk;

      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = { role: "assistant", content: fullText };
        return updated;
      });
    };

    es.onerror = () => {
      setIsLoading(false);
      es.close();
    };
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;

    const newMessage: MessageType = { role: "user", content: prompt };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setPrompt("");

    if (mode.includes("sse")) {
      handleSSE(updatedMessages);
    } else {
      handleFetchStream(updatedMessages);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setPrompt("");
  };

  return (
    <div className="min-h-screen mb-24 relative bg-[#0A0A0A] text-white flex flex-col font-sans">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/90 backdrop-blur-xl py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-linear-to-br from-violet-500 to-cyan-400 rounded-2xl flex items-center justify-center text-2xl font-bold">S</div>
          <div>
            <div className="text-2xl font-semibold tracking-tight">Syper</div>
            <div className="text-xs text-slate-500 -mt-0.5">Streaming AI Demo</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Backend Selector */}
          <div className="flex bg-zinc-900 rounded-3xl p-1 border border-white/10">
            {[
              { label: "Node Stream", value: "node-stream" },
              { label: "Node SSE", value: "node-sse" },
              { label: "Python Stream", value: "python-stream" },
              { label: "Python SSE", value: "python-sse" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                className={`px-5 py-2 text-sm font-medium rounded-3xl transition-all ${
                  mode === opt.value ? "bg-white text-black shadow" : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={startNewChat}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 rounded-3xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 mx-auto w-full px-4 py-8 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-28 h-28 bg-linear-to-br from-violet-500 via-fuchsia-500 to-cyan-400 rounded-3xl flex items-center justify-center text-7xl mb-10 shadow-2xl">
              ⚡
            </div>
            <h1 className="text-5xl font-bold tracking-tighter mb-4">Hello, I'm Syper</h1>
            <p className="text-slate-400 text-xl max-w-md">
              A beautiful real-time streaming chat interface.
              <br />
              Choose backend and start asking anything.
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-8 pb-32 pr-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] px-6 py-4 rounded-3xl ${
                    msg.role === "user" ? "bg-linear-to-r from-blue-600 to-indigo-600" : "bg-zinc-800 border border-white/10"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <span className="text-slate-400 text-sm">Syper is thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t fixed bottom-0 left-0 w-full border-white/10 bg-black/90 backdrop-blur-xl p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={isLoading}
              placeholder="Message Syper..."
              className="flex-1 bg-zinc-900 border border-white/10 focus:border-violet-500 rounded-3xl px-7 py-4 text-lg placeholder:text-slate-500 outline-none transition-all disabled:opacity-70"
            />

            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="bg-white hover:bg-slate-100 disabled:bg-zinc-700 disabled:text-slate-400 text-black font-semibold px-10 rounded-3xl transition-all flex items-center justify-center min-w-27.5"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">Real-time streaming demo • Choose your backend above</p>
        </div>
      </div>
    </div>
  );
}
