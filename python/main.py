from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from utils.utils import agent_loop_stream, get_system_prompt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
async def chat(req: Request):
    body = await req.json()

    messages = body.get("messages", [])
    plan = body.get("plan", "free")

    system_prompt = {
        "role": "system",
        "content": get_system_prompt(plan),
    }

    final_messages = [system_prompt, *messages]

    return StreamingResponse(
        agent_loop_stream(final_messages),
        media_type="text/plain",
    )
