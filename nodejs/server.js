import express from "express";
import cors from "cors";
import ollama from "ollama";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Health ok");
});

app.get("/chat", async (req, res) => {
  const prompt = req.query.prompt;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

  const stream = await ollama.chat({
    model: "llama3.2:3b",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.message.content;
    if (content) {
      res.write(content);
    }
  }

  res.end();
});

app.get("/chat-sse", async (req, res) => {
  const prompt = req.query.prompt;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const stream = await ollama.chat({
    model: "llama3.2:3b",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.message.content;
    if (content) {
      res.write(`data: ${JSON.stringify(content)}\n\n`);
    }
  }

  res.write("data: [DONE]\n\n");
  res.end();
});

app.listen(8000, () => console.log("Node running on 8000"));
