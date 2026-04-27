# ⚡ Streaming AI Chat (Ollama + FastAPI + Node + React)

## 📌 Overview

A simple project to understand how **local AI models** work with **real-time streaming**.

Built using:

- Ollama (local LLM - `llama3.2:3b`)
- FastAPI (Python backend)
- Express (Node.js backend)
- React (frontend with streaming + markdown)

---

## 🚀 Features

- Token-by-token streaming (ChatGPT-like)
- Supports both backends (Python + Node)
- Supports Fetch streaming and SSE
- Markdown rendering with syntax highlighting

---

## ⚙️ Setup

### 1. Start Ollama

```bash
ollama pull llama3.2:3b
ollama serve
```

### 2. Run Node backend

```bash
node server.js
```

### 3. Run Python backend

```bash
uvicorn main:app --port 8001
```

### 4. Run frontend

```bash
npm install
npm run dev
```

---

## 🔌 API Endpoints

| Backend | Mode   | Endpoint    |
| ------- | ------ | ----------- |
| Node    | Stream | `/chat`     |
| Node    | SSE    | `/chat-sse` |
| Python  | Stream | `/chat`     |
| Python  | SSE    | `/chat-sse` |

---

## 🧠 What I Learned

- How LLM streaming works internally
- Fetch vs SSE streaming
- Handling streams in frontend (ReadableStream / EventSource)
- Managing SSE lifecycle properly

---

# 🔥 Upcoming Improvements (Refined & Clean)

---

## ✅ Chat history (multi-turn conversation)

> Maintain a structured list of `user` and `assistant` messages to preserve context across a session.
> Enables follow-up questions, context-aware answers, and conversational continuity.
> Needs optimization later (summarization / trimming) to avoid token overflow.

---

## ✅ System prompts & role-based behavior

> Use the `system` role to define behavior, tone, and constraints of the model.
> Current implementation uses subscription-based prompts (free/basic/premium).
> In real-world systems, this is controlled via backend authentication (JWT/session).
> Helps restrict or specialize the model (e.g., frontend expert, backend expert, domain-specific AI).

---

## ✅ Tool calling (calculator, APIs, utilities)

> Allows the LLM to delegate tasks instead of answering directly.
> Current challenge: inconsistent behavior (sometimes calculates itself, sometimes returns JSON).
> Prompt strictness helps, but is not fully reliable.
> Long-term solution: structured outputs + robust tool detection logic instead of relying only on prompts.

---

## ⚠️ Update

> Moving fully to Python for backend logic to avoid duplication and reduce maintenance overhead.
> Node.js support discontinued to focus on core system design and AI workflows.
> Server-Sent Events (SSE) removed, as it does not provide long-term benefits for this architecture.
>
> Initial tool integration (calculator) was tested, but the model produced inconsistent tool calls
> even for non-calculation queries.
>
> Controlling a small (~3B) model reliably for tool usage is challenging — prompt strictness alone is not sufficient.
> Lower parameter models tend to behave unpredictably in structured tasks.
>
> Decision: move forward with improved tool architecture and remove the calculator tool for now.

---

# 🚀 Core System Improvements

---

### 🔧 Function execution layer (AI → real functions)

> Create a centralized abstraction to execute tools instead of hardcoding logic in routes.
> Enables scalability (multiple tools) and cleaner architecture.

---

### 🔧 Tool registry system (missing earlier ⚠️)

> Maintain a dictionary-based registry:
> `{ "calculator": fn, "weather": fn }`
> Avoids multiple `if-else` blocks and makes system extensible.

---

### 📄 File upload & document understanding (CSV, text, PDF)

> Allow users to upload files and extract structured/unstructured data.
> Will later integrate with embeddings for search and analysis.

---

### 🧠 Persistent memory (DB / vector store)

> Store conversation or extracted data for reuse.
> Includes:
>
> - Short-term memory (chat history)
> - Long-term memory (database/vector store)

---

### 🔍 Embeddings + semantic search (RAG)

> Convert text into vectors and perform similarity search.
> Retrieve relevant context and pass it to LLM for grounded responses.
> Essential for “ChatGPT over your own data”.

---

### 🤖 Multi-step agent (plan → act → observe loop)

> Implement iterative loop:
> LLM → tool → result → LLM → repeat until final answer
> Enables reasoning, chaining tools, and solving complex queries.

---

### 📡 Streaming with structured outputs (JSON mode)

> Combine streaming with structured responses (like tool JSON).
> Needs careful handling to avoid breaking partial responses.

---

### 🔁 Error handling & retry logic

> Handle failures at:
>
> - LLM level (bad output)
> - Tool level (execution failure)
> - Network/stream level
>   Add retries and fallback mechanisms.

---

### 🔄 Model switching (multiple Ollama models)

> Use different models for different tasks:
>
> - cheap model → simple chat
> - strong model → reasoning / agent tasks
>   Improves cost and performance balance.

---

### 📊 Token usage tracking & performance metrics

> Track:
>
> - token usage
> - response time
> - tool latency
>   Helps optimize cost and system efficiency.

---

# 🎨 UI Improvements

---

### ✨ Better chat UI

> Add:
>
> - chat bubbles
> - timestamps
> - chat history panel
>   Improves usability and product feel.

---

### ✨ Auto-scroll + typing indicator

> Already implemented, but should be polished for edge cases (stream stop, errors).

---

### ✨ Code block enhancements

> Add:
>
> - copy button
> - syntax highlighting themes
>   Improves developer experience.

---

# 🔐 Backend & Security

---

### 🔐 Authentication & user sessions

> Implement login system with JWT/session handling.
> Required for user-specific memory, plans, and access control.

---

### 🔐 Rate limiting & security improvements

> Prevent abuse and overuse of APIs.
> Add request limits, validation, and sanitization.

---

# ⚙️ System & Infrastructure

---

### 🐳 Deployment (Docker, VPS, local network)

> Containerize and deploy backend for real-world usage.
> Ensure reproducibility and scalability.

---

### ⏳ Background jobs / task queue

> Handle long-running tasks (e.g., large file processing, embeddings generation) asynchronously.

---

### 📈 Observability (logs, tracing, debugging tools)

> Add logging, request tracing, and debugging tools to monitor system behavior.

---

# 🔌 Advanced Extensions

---

### 🔌 Plugin/tool ecosystem

> Design system where tools can be added dynamically without changing core logic.

---

### 🌐 Web scraping + live data tools

> Fetch real-time data from web or APIs when required.

---

### 🎤 Voice input/output (STT / TTS)

> Add speech-to-text and text-to-speech for voice-based interaction.

---

### 🤝 Multi-agent workflows

> Multiple agents collaborating on tasks (advanced use-case).
> Example: researcher agent + summarizer agent.

---

### 🧠 Conversation memory + context compression

> Summarize old messages to reduce token usage while preserving context.
> Critical for long conversations.

---

## 🧨 Goal

Build a **fully local, streaming, agentic AI system** step-by-step while understanding how real AI products work.

---
