import ollama
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate(prompt: str):
    stream = ollama.chat(
        model="llama3.2:3b", messages=[{"role": "user", "content": prompt}], stream=True
    )

    for chunk in stream:
        content = chunk["message"]["content"]
        if content:
            yield content


@app.get("/chat")
def chat(prompt: str):
    return StreamingResponse(generate(prompt), media_type="text/plain")
