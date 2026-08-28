"""
ZentryOS — High-Performance Neural Voice Synthesis Microservice
Soporta: Hugging Face Inference API / Endpoints (coqui/XTTS-v2), Kokoro-82M y Applio RVC Core
Garantiza separación estricta entre bloques de género (Femenino / Masculino).
"""

import os
import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import httpx
from profiles import CATALOGO_VOCES_ZENTRY, VoiceProfile

app = FastAPI(
    title="ZentryOS AI Audio Engine",
    description="Microservicio de Síntesis Vocal Neuronal HD con Separación Estricta de Género",
    version="2.1.0"
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
    persona_id: str = "sofia_urbana"
    engine: str = "auto"  # "xtts_v2", "kokoro_82m", "hf_endpoint"
    source_gender: Optional[str] = None  # "femenino" o "masculino" (para RVC pitch key matching)

HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
HF_XTTS_ENDPOINT = os.getenv("HF_XTTS_ENDPOINT", "https://api-inference.huggingface.co/models/coqui/XTTS-v2")
HF_KOKORO_ENDPOINT = os.getenv("HF_KOKORO_ENDPOINT", "https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M")

@app.get("/api/voices")
async def list_voices():
    """Devuelve el catálogo estructurado de voces separadas por género."""
    female_voices = {k: v.dict() for k, v in CATALOGO_VOCES_ZENTRY.items() if v.genero == "femenino" and not k.startswith("female_")}
    male_voices = {k: v.dict() for k, v in CATALOGO_VOCES_ZENTRY.items() if v.genero == "masculino" and not (k.startswith("male_") or k.startswith("socratic_"))}
    return {
        "bloque_femenino": female_voices,
        "bloque_masculino": male_voices
    }

@app.post("/api/tts/synthesize")
async def synthesize_voice(req: SynthesizeRequest):
    """
    Sintetiza audio con validación estricta de género y envío obligatorio de 'language: es' y 'speaker_wav'.
    """
    profile: VoiceProfile = CATALOGO_VOCES_ZENTRY.get(req.persona_id, CATALOGO_VOCES_ZENTRY["sofia_urbana"])
    
    # 1. Cálculo de f0_pitch_shift adaptativo para RVC si cambia de género de origen
    effective_f0_pitch = profile.f0_pitch_shift
    if req.source_gender:
        if req.source_gender == "masculino" and profile.genero == "femenino":
            # De voz de hombre a voz de mujer: sumar semitonos (+8 a +12)
            effective_f0_pitch = +10
        elif req.source_gender == "femenino" and profile.genero == "masculino":
            # De voz de mujer a voz de hombre: restar semitonos (-12 a -8)
            effective_f0_pitch = -10

    # 2. Construcción de payload estricto XTTS-v2 / Hugging Face
    payload = {
        "inputs": req.text,
        "parameters": {
            "speaker_wav": profile.speaker_wav,
            "language": "es",  # Obligatorio para Coqui XTTS v2 en español
            "temperature": profile.temperature,  # Alta en femenino/juvenil (0.85), baja en masculino/maduro (0.50)
            "length_penalty": profile.length_penalty,
            "top_p": profile.top_p,
            "top_k": profile.top_k,
            "repetition_penalty": profile.repetition_penalty,
            "speed": profile.speed,
            "style_prompt": profile.style_prompt,
            "f0_up_key": effective_f0_pitch
        }
    }

    headers = {}
    if HF_API_TOKEN:
        headers["Authorization"] = f"Bearer {HF_API_TOKEN}"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            endpoint = HF_XTTS_ENDPOINT if req.engine == "xtts_v2" else HF_KOKORO_ENDPOINT
            response = await client.post(endpoint, json=payload, headers=headers)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Error en motor de inferencia ({profile.genero} - {profile.id}): {response.text}"
                )
            
            audio_bytes = response.content
            return StreamingResponse(
                io.BytesIO(audio_bytes),
                media_type="audio/wav",
                headers={
                    "Content-Disposition": f"inline; filename={profile.id}.wav",
                    "X-Persona-ID": profile.id,
                    "X-Persona-Gender": profile.genero,
                    "X-Persona-Name": profile.id
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
