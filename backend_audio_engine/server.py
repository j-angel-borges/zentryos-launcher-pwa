"""
ZentryOS — High-Performance Neural Voice Synthesis Microservice
Soporta: Hugging Face Inference Endpoints, Coqui XTTS v2, Kokoro-82M y Applio RVC Core
"""

import os
import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import httpx
from profiles import VOICE_PROFILES, VoiceProfile

app = FastAPI(
    title="ZentryOS AI Audio Engine",
    description="Microservicio de Síntesis Vocal Neuronal HD para la Isla Dinámica Zentry",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SynthesizeRequest(BaseModel):
    text: str
    persona_id: str = "female_jovial"
    engine: str = "auto" # "xtts_v2", "kokoro_82m", "hf_endpoint"
    speed_override: Optional[float] = None
    temperature_override: Optional[float] = None

HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
HF_XTTS_ENDPOINT = os.getenv("HF_XTTS_ENDPOINT", "https://api-inference.huggingface.co/models/coqui/XTTS-v2")
HF_KOKORO_ENDPOINT = os.getenv("HF_KOKORO_ENDPOINT", "https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M")

@app.get("/api/voices")
async def list_voices():
    """Devuelve las 5 personalidades vocales con sus metadatos e hiperparámetros."""
    return {
        "count": len(VOICE_PROFILES),
        "voices": [profile.dict() for profile in VOICE_PROFILES.values()]
    }

@app.post("/api/tts/synthesize")
async def synthesize_voice(req: SynthesizeRequest):
    """
    Sintetiza texto utilizando los hiperparámetros de prosodia específicos del personaje.
    """
    profile = VOICE_PROFILES.get(req.persona_id)
    if not profile:
        profile = VOICE_PROFILES["female_jovial"]

    temperature = req.temperature_override if req.temperature_override is not None else profile.temperature
    speed = req.speed_override if req.speed_override is not None else profile.speed

    headers = {}
    if HF_API_TOKEN:
        headers["Authorization"] = f"Bearer {HF_API_TOKEN}"

    payload = {
        "inputs": req.text,
        "parameters": {
            "temperature": temperature,
            "top_p": profile.top_p,
            "top_k": profile.top_k,
            "repetition_penalty": profile.repetition_penalty,
            "length_penalty": profile.length_penalty,
            "speed": speed,
            "style_prompt": profile.style_prompt,
            "language": "es"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            endpoint = HF_XTTS_ENDPOINT if req.engine == "xtts_v2" else HF_KOKORO_ENDPOINT
            response = await client.post(endpoint, json=payload, headers=headers)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Error en motor de inferencia: {response.text}"
                )
            
            audio_bytes = response.content
            return StreamingResponse(
                io.BytesIO(audio_bytes),
                media_type="audio/wav",
                headers={
                    "Content-Disposition": f"inline; filename={profile.id}.wav",
                    "X-Persona-ID": profile.id,
                    "X-Persona-Name": profile.name
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
