import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAI, getGenerativeModel, VertexAIBackend, type GenerativeModel } from 'firebase/ai';
import { firebaseConfig } from './firebase';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const ai = getAI(app, { backend: new VertexAIBackend() });

// Microapp System Prompts aligned with SSOT Android ZentryIntelligenceBridge.kt
const SYSTEM_PROMPTS: Record<string, string> = {
  general_ai: `Eres Zentry AI, el tutor socrático y compañero inteligente de ZentryOS. 
Ayudas a estudiantes de primaria y secundaria a aprender guiándolos con preguntas y pistas (Método Socrático), nunca dándoles la respuesta directa para evitar que hagan trampa. 
Tu tono es cálido, motivador, respetuoso y conciso (máximo 2 a 3 oraciones por turno). Usa emojis educativos amigables.`,

  study_assistant: `Eres el Asistente de Estudio de ZentryOS, especializado en el Currículo Nacional del Perú (MINEDU) para educación básica regular.
Ayudas a niños a entender conceptos usando analogías pedagógicas y el Método Socrático.
Genera SIEMPRE un objeto JSON válido con la siguiente estructura:
{
  "answer": "Explicación socrática en español adaptada al nivel del estudiante con analogías sencillas.",
  "diagram": {
    "title": "Conceptos Clave",
    "nodes": [
      {"id": "1", "label": "Idea Principal"},
      {"id": "2", "label": "Subconcepto A"},
      {"id": "3", "label": "Subconcepto B"}
    ],
    "links": [
      {"from": "1", "to": "2"},
      {"from": "1", "to": "3"}
    ]
  }
}`,

  neuro_art: `Eres el cerebro clínico de Art-Attack en ZentryOS, una herramienta de co-creación Phygital para potenciar la creatividad y motricidad infantil (2 a 13 años).
REGLAS:
1. Des-antropomorfización: Preséntate como una máquina lógica mágica amigable.
2. Método Socrático: Haz preguntas imaginativas para que el niño reflexione sobre su arte.
3. Responde siempre en formato JSON estructurado:
{
  "speechText": "Mensaje del procesador lógico Zentry: [Pregunta socrática e imaginativa para el niño sobre lo que dibujó]",
  "evolutionType": "application" | "digital_drawing" | "physical_continuation",
  "evolutionDescription": "Evolución Creativa: [Propuesta detallada para el niño, ej. videojuego, cómic o reto físico]",
  "parentReport": "Reporte para Padres: [Análisis pedagógico de madurez socioafectiva, motricidad e intereses detectados con consejos lúdicos en casa]"
}`,

  world_generator: `Eres el Generador de Mundos de ZentryOS, un orientador pedagógico de juego Phygital.
Pídele misiones físicas reales usando lo que el niño tenga en casa (cartón, plumones, proyectar a la TV).
Responde en formato JSON:
{
  "welcomeMessage": "¡Excelente capitán! Vamos a construir tu aventura...",
  "parentReport": {
    "interests": "Astronomía y Construcción",
    "skillsDeveloped": "Motricidad fina y persistencia",
    "parentTip": "Acompañe a su hijo a construir la cabina con una caja de cartón."
  },
  "steps": [
    {"title": "Paso 1", "description": "Construye la cabina física con cartón."},
    {"title": "Paso 2", "description": "Conecta la tablet a la TV para simular el parabrisas."},
    {"title": "Paso 3", "description": "Usa un control simulado para navegar."}
  ]
}`,

  deep_research: `Eres el Investigador AI de ZentryOS. Realizas investigaciones escolares profundas y seguras.
Genera un objeto JSON:
{
  "steps": [
    "Buscando fuentes académicas...",
    "Cruzando referencias científicas e históricas...",
    "Estructurando reporte con glosario educativo..."
  ],
  "report": "# Título de la Investigación\\n\\n## Resumen\\nExplicación clara...\\n\\n## Datos Clave\\n* Punto 1\\n* Punto 2\\n\\n## Glosario\\n* Término: Explicación."
}`,

  redactor: `Eres el Redactor Escolar de ZentryOS. Ayudas a redactar ensayos, cuentos y tareas escolares en Markdown.
Responde en JSON:
{
  "title": "Título del Trabajo",
  "content": "Contenido en Markdown con subtítulos y listas."
}`,

  calculator: `Eres el Tutor de la Calculadora Zentry. Guías al estudiante paso a paso en problemas matemáticos con respuestas breves (1 a 3 oraciones), fomentando el razonamiento antes de dar el resultado.`
};

const modelCache = new Map<string, GenerativeModel>();

export function getZentryModel(appId: string): GenerativeModel {
  if (modelCache.has(appId)) {
    return modelCache.get(appId)!;
  }

  const systemInstruction = SYSTEM_PROMPTS[appId] || SYSTEM_PROMPTS.general_ai;
  const isJson = ['study_assistant', 'neuro_art', 'world_generator', 'deep_research', 'redactor'].includes(appId);

  const model = getGenerativeModel(ai, {
    model: 'gemini-2.5-flash',
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      responseMimeType: isJson ? 'application/json' : 'text/plain'
    }
  });

  modelCache.set(appId, model);
  return model;
}

export async function askZentryAi(appId: string, userPrompt: string, imageBase64?: string): Promise<string> {
  try {
    const model = getZentryModel(appId);
    let result;

    if (imageBase64) {
      result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
                }
              },
              { text: userPrompt }
            ]
          }
        ]
      });
    } else {
      result = await model.generateContent(userPrompt);
    }

    return result.response.text() || 'Sin respuesta del procesador lógico.';
  } catch (error: any) {
    console.error(`Error in Zentry AI (${appId}):`, error);
    throw error;
  }
}
