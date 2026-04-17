import json

import ollama
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate(messages):
    stream = ollama.chat(
        model="llama3.2:3b",
        messages=messages,
        stream=True,
    )

    for chunk in stream:
        content = chunk["message"]["content"]
        if content:
            yield content


@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    messages = body.get("messages", [])

    return StreamingResponse(
        generate(messages),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


def generate_sse(messages):
    stream = ollama.chat(
        model="llama3.2:3b",
        messages=messages,
        stream=True,
    )

    for chunk in stream:
        content = chunk["message"]["content"]
        if content:
            yield f"data: {json.dumps(content)}\n\n"

    yield "data: [DONE]\n\n"


@app.get("/chat-sse")
def chat_sse(messages: str):
    parsed_messages = json.loads(messages) if messages else []

    return StreamingResponse(
        generate_sse(parsed_messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
