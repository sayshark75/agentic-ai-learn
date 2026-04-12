# 🚀 Local AI Chatbot with Streaming (Ollama + FastAPI + Node + React)

## 📌 Overview

Today I learned how to build a **ChatGPT-like streaming chatbot** using **local AI models (Ollama)**.

This project covers:

* Running LLMs locally using Ollama
* Building backends using FastAPI (Python) and Express (Node.js)
* Streaming responses token-by-token
* Rendering live responses in a React frontend
* Understanding and implementing SSE (Server-Sent Events)

---

# 🧠 What I Learned

## 1. Local AI Models with Ollama

Ollama allows running powerful language models locally on your machine.

### ✅ Setup

```bash
ollama pull llama3.2:3b
ollama run llama3.2:3b
```

### ✅ Basic Chat

```python
ollama.chat(
  model="llama3.2:3b",
  messages=[{"role": "user", "content": "Hello"}]
)
```

---

## 2. Streaming Concept (Core Idea 🔥)

### ❌ Traditional API

```text
User → Request → Wait → Full Response
```

### ✅ Streaming API

```text
User → Request → Token → Token → Token → Live Response
```

👉 Response is sent in small chunks instead of all at once
👉 UI updates in real-time (like ChatGPT)

---

## 3. FastAPI Streaming (Python)

```python
from fastapi.responses import StreamingResponse

def generate(prompt):
    stream = ollama.chat(..., stream=True)

    for chunk in stream:
        yield chunk["message"]["content"]

@app.get("/chat")
def chat(prompt: str):
    return StreamingResponse(generate(prompt))
```

👉 `yield` enables streaming

---

## 4. Node.js Streaming (Express)

```js
app.get("/chat", async (req, res) => {
  const stream = await ollama.chat({ stream: true });

  for await (const chunk of stream) {
    res.write(chunk.message.content);
  }

  res.end();
});
```

👉 `res.write()` sends data in chunks

---

## 5. React Frontend Streaming

```js
const reader = res.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  setResponse(prev => prev + decoder.decode(value));
}
```

👉 Browser reads stream
👉 UI updates continuously

---

# ⚡ SSE (Server-Sent Events)

## 🤔 What is SSE?

SSE (Server-Sent Events) is a **one-way streaming protocol** where the server continuously sends updates to the client over HTTP.

---

## 📦 SSE Format

```text
data: Hello

data: World

data: [DONE]
```

👉 Each message must start with `data:`
👉 Double newline (`\n\n`) is required
👉 `[DONE]` indicates stream end

---

## 🔥 SSE Backend (Node.js)

```js
app.get("/chat-sse", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const stream = await ollama.chat({ stream: true });

  for await (const chunk of stream) {
    res.write(`data: ${chunk.message.content}\n\n`);
  }

  res.write("data: [DONE]\n\n");
  res.end();
});
```

---

## 🔥 SSE Frontend

```js
const es = new EventSource("/chat-sse");

es.onmessage = (event) => {
  if (event.data === "[DONE]") {
    es.close();
  } else {
    setResponse(prev => prev + event.data);
  }
};
```

---

## 🧠 When to Use SSE?

Use SSE when:

* You want ChatGPT-like streaming
* Server pushes updates continuously
* No need for client → server real-time messages

---

## ⚖️ SSE vs Fetch Streaming

| Feature   | Fetch Streaming | SSE                     |
| --------- | --------------- | ----------------------- |
| Setup     | Simple          | Slightly structured     |
| Format    | Raw text        | `data:` format          |
| Use case  | Basic streaming | Chat apps (recommended) |
| Direction | Request-based   | Server push             |

---

# 🔥 Key Takeaways

* Streaming makes AI responses feel real-time
* Backend sends data in chunks (tokens)
* Frontend reads and renders incrementally
* SSE provides structured streaming (ChatGPT-style)
* Same concept works across Python and Node

---

# 🚀 Future Improvements

* Add chat history (multi-turn conversation)
* Markdown streaming with proper formatting
* Typing cursor animation
* Code block enhancements (copy button, syntax themes)
* Switch between multiple models dynamically

---

# 🧨 Final Thoughts

This project helped me understand:

* How LLMs stream responses internally
* How real-time UI updates work
* How to build AI-powered apps from scratch
---
