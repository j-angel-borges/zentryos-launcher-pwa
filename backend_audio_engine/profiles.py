"""
ZentryOS — AI Audio Engine Voice Profiles & Hyperparameters Matrix
Bases de conocimiento: XTTS v2, Applio Core RVC v2, Kokoro-82M, SayanoAI RVC-Studio
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field

class VoiceProfile(BaseModel):
    id: str
    genero: str = Field(..., description="femenino | masculino")
    perfil: str = Field(..., description="Descripción del arquetipo vocal")
    speaker_wav: str = Field(..., description="Ruta al audio de referencia 24kHz mono seco")
    temperature: float = Field(..., description="Control de estabilidad/expresividad vocal")
    length_penalty: float = Field(..., description="Control de longitud y pausas de locución")
    f0_pitch_shift: int = Field(0, description="Desplazamiento de tono en semitonos (RVC)")
    
    # Parámetros avanzados de XTTS v2 & Applio
    top_p: float = Field(0.85, description="Muestreo por núcleo")
    top_k: int = Field(50, description="Límite tokens latentes")
    repetition_penalty: float = Field(2.0, description="Penalización de bucles")
    speed: float = Field(1.0, description="Velocidad relativa")
    rvc_pitch_extractor: str = Field("rmvpe", description="Algoritmo de extracción F0")
    rvc_index_rate: float = Field(0.75, description="Fuerza del índice FAISS")
    rvc_protect_voiceless: float = Field(0.33, description="Protección de consonantes sordas")
    style_prompt: str = Field("", description="Prompt descriptivo para conditioning latents")

# ==========================================
# CATÁLOGO ESTRICTO DE VOCES ZENTRY (GÉNEROS SEPARADOS)
# ==========================================
CATALOGO_VOCES_ZENTRY: Dict[str, VoiceProfile] = {
    # --- BLOQUE FEMENINO ---
    "sofia_urbana": VoiceProfile(
        id="sofia_urbana",
        genero="femenino",
        perfil="Voz femenina juvenil, fresca, luminosa.",
        speaker_wav="./assets/speakers/female_sofia_juvenil.wav",
        temperature=0.85,  # Alta expresividad juvenil
        length_penalty=1.0,
        f0_pitch_shift=0,
        top_p=0.88,
        top_k=50,
        repetition_penalty=2.0,
        speed=1.08,
        rvc_pitch_extractor="rmvpe",
        rvc_index_rate=0.75,
        rvc_protect_voiceless=0.33,
        style_prompt="[cheerful, smiling, energetic, modern urban youth, crisp Spanish diction, sparkling]"
    ),
    "elena_valdes": VoiceProfile(
        id="elena_valdes",
        genero="femenino",
        perfil="Voz femenina madura, profesional, cálida.",
        speaker_wav="./assets/speakers/female_elena_madura.wav",
        temperature=0.60,  # Mayor estabilidad institucional
        length_penalty=1.1,  # Habla más pausada
        f0_pitch_shift=0,
        top_p=0.82,
        top_k=40,
        repetition_penalty=2.2,
        speed=0.98,
        rvc_pitch_extractor="rmvpe",
        rvc_index_rate=0.80,
        rvc_protect_voiceless=0.45,
        style_prompt="[warm, articulate, empathetic, teacher cadence, gentle intonation, comforting]"
    ),

    # --- BLOQUE MASCULINO ---
    "lucas_vega": VoiceProfile(
        id="lucas_vega",
        genero="masculino",
        perfil="Voz masculina joven, enérgica, cercana.",
        speaker_wav="./assets/speakers/male_lucas_juvenil.wav",
        temperature=0.75,
        length_penalty=0.9,  # Habla ligeramente más rápida
        f0_pitch_shift=0,
        top_p=0.90,
        top_k=50,
        repetition_penalty=1.9,
        speed=1.06,
        rvc_pitch_extractor="rmvpe",
        rvc_index_rate=0.70,
        rvc_protect_voiceless=0.35,
        style_prompt="[excited, adventurous, optimistic, bright male voice, dynamic rhythm]"
    ),
    "carlos_mendoza": VoiceProfile(
        id="carlos_mendoza",
        genero="masculino",
        perfil="Voz masculina madura, sobria, natural, graves ricos.",
        speaker_wav="./assets/speakers/male_carlos_maduro.wav",
        temperature=0.50,  # Muy baja para evitar agudos artificiales o robóticos
        length_penalty=1.0,
        f0_pitch_shift=-5,  # Forzar tonos más graves si se usa RVC
        top_p=0.78,
        top_k=35,
        repetition_penalty=2.4,
        speed=0.96,
        rvc_pitch_extractor="rmvpe",
        rvc_index_rate=0.85,
        rvc_protect_voiceless=0.50,
        style_prompt="[steady, grounded baritone, confident, clear, sober, professional]"
    ),
    "maestro_aurelius": VoiceProfile(
        id="maestro_aurelius",
        genero="masculino",
        perfil="Voz sabia, reflexiva, inspiradora, filosófica.",
        speaker_wav="./assets/speakers/male_aurelius_anciano.wav",
        temperature=0.55,  # Consistencia mística
        length_penalty=1.4,  # Pausas muy marcadas y lentas
        f0_pitch_shift=-3,
        top_p=0.75,
        top_k=30,
        repetition_penalty=2.5,
        speed=0.92,
        rvc_pitch_extractor="rmvpe",
        rvc_index_rate=0.85,
        rvc_protect_voiceless=0.50,
        style_prompt="[philosophical, wise, slow-paced, breathy, contemplative, inspiring teacher]"
    )
}

# Aliases de compatibilidad cruzada con UI
CATALOGO_VOCES_ZENTRY["female_jovial"] = CATALOGO_VOCES_ZENTRY["sofia_urbana"]
CATALOGO_VOCES_ZENTRY["female_adult"] = CATALOGO_VOCES_ZENTRY["elena_valdes"]
CATALOGO_VOCES_ZENTRY["male_jovial"] = CATALOGO_VOCES_ZENTRY["lucas_vega"]
CATALOGO_VOCES_ZENTRY["male_adult"] = CATALOGO_VOCES_ZENTRY["carlos_mendoza"]
CATALOGO_VOCES_ZENTRY["socratic_mentor"] = CATALOGO_VOCES_ZENTRY["maestro_aurelius"]

VOICE_PROFILES = CATALOGO_VOCES_ZENTRY
