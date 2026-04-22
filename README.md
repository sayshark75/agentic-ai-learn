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

## 🔥 Upcoming Improvements

✅ Chat history (multi-turn conversation)

> can continue the conversation with set of messages of user and assistant.
> provides continued support and follow up for you questions for one chat session.

✅ System prompts & role-based behavior

> we can define the role for the user, there is only one additional role than `user` and `assistant`, it is `system` role.
> I added dummy subscription based system role, so it modifies the model to behave as per the plans.
> Ofcourse, it is a basic one, in the real scenario, we use backend `user authentication`, `JWT token` based validation of the subscriptions, and then on that, we decide behaviour of the model.
> `System prompt` helps isolate the model into something specific, control its boundary towards some specific topic, skill, etc. for example `Senior frontend developer`, `Senior backend developer`, `Having all historical knowledge of Cricket`, etc.

✅ Tool calling (calculator, APIs, utilities)

> Added a cheap tool to calculate the math calculations.
> It is a very hectic process to handle the propmt.
> The major pain point to let your LLM understand the context and decide when to provide code json or the simple chats.
> I added calculator, but still sometimes it by himself calculates, and sometimes it provides me the json to call the tool
> I also modified the prompt for strictness, then it is only providing me json responses, for normal chats as well.

- Function execution layer (AI → real functions)
- File upload & document understanding (CSV, text, PDF)
- Persistent memory (DB / vector store)
- Embeddings + semantic search (RAG)
- Multi-step agent (plan → act → observe loop)
- Streaming with structured outputs (JSON mode)
- Model switching (multiple Ollama models)
- Error handling & retry logic for streams
- Token usage tracking & performance metrics
- Auto-scroll + typing indicator in UI
- Better chat UI (bubbles, timestamps, history panel)
- Code block enhancements (copy, themes)
- Authentication & user sessions
- Rate limiting & security improvements
- Deployment (Docker, VPS, local network access)
- Background jobs / task queue (long-running tasks)
- Plugin/tool ecosystem (extensible tools system)
- Voice input/output (speech-to-text, text-to-speech)
- Web scraping + live data tools
- Multi-agent workflows (agents collaborating)
- Observability (logs, tracing, debugging tools)
- Conversation Memory + Context Compression.

---

## 🧨 Goal

Build a **fully local, streaming, agentic AI system** step-by-step while understanding how real AI products work.

---
