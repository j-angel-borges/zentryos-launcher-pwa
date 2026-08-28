"""
ZentryOS — AI Audio Engine Voice Profiles & Hyperparameters Matrix
Bases de conocimiento: XTTS v2, Applio Core RVC v2, Kokoro-82M, SayanoAI RVC-Studio
"""

from typing import Dict, Any
from pydantic import BaseModel, Field

class VoiceProfile(BaseModel):
    id: str
    name: str
    archetype: str
    gender: str
    description: str
    
    # Parámetros de Generación Base (XTTS v2 / Kokoro)
    temperature: float = Field(..., description="Control de variabilidad y expresividad vocal")
    top_p: float = Field(..., description="Muestreo por núcleo (Nucleus Sampling)")
    top_k: int = Field(50, description="Límite de tokens en espacio latente")
    repetition_penalty: float = Field(2.0, description="Penalización de bucles o tartamudeo")
    length_penalty: float = Field(1.0, description="Control de longitud de frases")
    speed: float = Field(1.0, description="Velocidad relativa de locución")
    
    # Parámetros de Transformación Timbral (Applio RVC v2)
    rvc_pitch_shift: int = Field(0, description="Desplazamiento de tono en semitonos")
    rvc_pitch_extractor: str = Field("rmvpe", description="Algoritmo de extracción de F0 (rmvpe o crepe)")
    rvc_index_rate: float = Field(0.75, description="Fuerza del índice FAISS para clonación")
    rvc_protect_voiceless: float = Field(0.33, description="Protección de consonantes sordas (0.0 a 0.5)")
    rvc_filter_radius: int = Field(3, description="Filtrado de mediana para tono F0 suave")
    
    # Prompt de Estilo Latente & Directiva Emocional
    style_prompt: str = Field(..., description="Prompt descriptivo para conditioning latents")
    clean_audio_ref: str = Field(..., description="Archivo de referencia 24kHz mono seco")

VOICE_PROFILES: Dict[str, VoiceProfile] = {
    # 1. SOFÍA URBANA — Femenina Juvenil
    "female_jovial": VoiceProfile(
        id="female_jovial",
        name="Sofía Urbana",
        archetype="Femenina - Juvenil / Dinámica",
        gender="FEMALE",
        description="Fresca, luminosa, enérgica y muy cercana. Tono medio-alto y curvas ascendentes.",
        temperature=0.78,
        top_p=0.88,
        top_k=50,
        repetition_penalty=2.0,
        length_penalty=1.00,
        speed=1.08,
        rvc_pitch_shift=2,
        rvc_pitch_extractor="rmvpe",
        rvc_index_rate=0.75,
        rvc_protect_voiceless=0.33,
        rvc_filter_radius=3,
        style_prompt="[cheerful, smiling, energetic, modern urban youth, crisp Spanish diction, sparkling]",
        clean_audio_ref="voices/sofia_urbana_ref.wav"
    ),

    # 2. ELENA VALDÉS — Femenina Madura / Pedagógica
    "female_adult": VoiceProfile(
        id="female_adult",
        name="Elena Valdés",
        archetype="Femenina - Madura / Profesional / Maternal",
        gender="FEMALE",
        description="Profesional, cálida, pedagógica y segura. Tono medio, ritmo pausado y empatía profunda.",
        temperature=0.62,
        top_p=0.82,
        top_k=40,
        repetition_penalty=2.2,
        length_penalty=1.05,
        speed=0.98,
        rvc_pitch_shift=0,
        rvc_pitch_extractor="rmvpe",
        rvc_index_rate=0.80,
        rvc_protect_voiceless=0.45,
        rvc_filter_radius=3,
        style_prompt="[warm, articulate, empathetic, teacher cadence, gentle intonation, comforting]",
        clean_audio_ref="voices/elena_valdes_ref.wav"
    ),

    # 3. LUCAS VEGA — Masculino Joven
    "male_jovial": VoiceProfile(
        id="male_jovial",
        name="Lucas Vega",
        archetype="Masculino - Joven / Aventurero",
        gender="MALE",
        description="Joven, enérgico, entusiasta y curioso. Tono medio-agudo con ráfagas de celebración.",
        temperature=0.82,
        top_p=0.90,
        top_k=50,
        repetition_penalty=1.9,
        length_penalty=0.98,
        speed=1.06,
        rvc_pitch_shift=1,
        rvc_pitch_extractor="rmvpe",
        rvc_index_rate=0.70,
        rvc_protect_voiceless=0.35,
        rvc_filter_radius=3,
        style_prompt="[excited, adventurous, optimistic, bright male voice, dynamic rhythm]",
        clean_audio_ref="voices/lucas_vega_ref.wav"
    ),

    # 4. CARLOS MENDOZA — Masculino Maduro
    "male_adult": VoiceProfile(
        id="male_adult",
        name="Carlos Mendoza",
        archetype="Masculino - Maduro / Sobrio",
        gender="MALE",
        description="Maduro, sobrio, equilibrado y seguro. Tono bajo/barítono, ritmo constante y directo.",
        temperature=0.55,
        top_p=0.78,
        top_k=35,
        repetition_penalty=2.4,
        length_penalty=1.10,
        speed=0.96,
        rvc_pitch_shift=-2,
        rvc_pitch_extractor="rmvpe",
        rvc_index_rate=0.85,
        rvc_protect_voiceless=0.50,
        rvc_filter_radius=4,
        style_prompt="[steady, grounded baritone, confident, clear, sober, professional]",
        clean_audio_ref="voices/carlos_mendoza_ref.wav"
    ),

    # 5. MAESTRO AURELIUS — Masculino Sabio / Socrático
    "socratic_mentor": VoiceProfile(
        id="socratic_mentor",
        name="Maestro Aurelius",
        archetype="Masculino - Sabio / Socrático",
        gender="MALE",
        description="Sabio, reflexivo, inspirador y pausado. Tono bajo con pausas marcadas y voz soplada.",
        temperature=0.50,
        top_p=0.75,
        top_k=30,
        repetition_penalty=2.5,
        length_penalty=1.20,
        speed=0.92,
        rvc_pitch_shift=-1,
        rvc_pitch_extractor="rmvpe",
        rvc_index_rate=0.85,
        rvc_protect_voiceless=0.50,
        rvc_filter_radius=4,
        style_prompt="[philosophical, wise, slow-paced, breathy, contemplative, inspiring teacher]",
        clean_audio_ref="voices/maestro_aurelius_ref.wav"
    )
}
