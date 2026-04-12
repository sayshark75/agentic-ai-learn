import express from "express";
import cors from "cors";
import ollama from "ollama";

const app = express();

app.use(cors());

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

app.listen(8000, () => console.log("Node running on 8000"));
