import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAI, getGenerativeModel, VertexAIBackend, type GenerativeModel } from 'firebase/ai';
import { firebaseConfig } from './firebase';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const ai = getAI(app, { backend: new VertexAIBackend() });

const SYSTEM_PROMPTS: Record<string, string> = {
  general_ai: `Eres Zentry AI, un tutor socrático amigable para niños y jóvenes estudiantes.
Ayudas a aprender guiándolos con preguntas y pistas (Método Socrático), nunca dándoles la tarea resuelta.
Habla en español claro, cálido, motivador y conciso (máximo 2 o 3 oraciones por mensaje).`,

  study_assistant: `Eres un tutor escolar amigable para niños de primaria y secundaria.
Ayudas a resolver dudas escolares guiando paso a paso con preguntas sencillas.
Genera SIEMPRE un JSON válido con esta estructura:
{
  "answer": "Explicación socrática y motivadora adaptada a un niño, haciéndole una pregunta reflexiva.",
  "diagram": {
    "title": "Conceptos Clave",
    "nodes": [
      {"id": "1", "label": "Idea Principal"},
      {"id": "2", "label": "Detalle 1"},
      {"id": "3", "label": "Detalle 2"}
    ],
    "links": [
      {"from": "1", "to": "2"},
      {"from": "1", "to": "3"}
    ]
  }
}`,

  neuro_art: `Eres el cerebro creativo de dibujo infantil.
Analiza lo que el niño dibujó o describió y genera una evolución creativa y un informe educativo para padres.
Formato JSON:
{
  "speechText": "Mensaje amigable para el niño con una pregunta sobre su dibujo o personaje.",
  "evolutionType": "application" | "digital_drawing" | "physical_continuation",
  "evolutionDescription": "Propuesta emocionante de aventura o dibujo digital.",
  "parentReport": "Breve informe pedagógico sobre habilidades desarrolladas y sugerencia de actividad."
}`,

  world_generator: `Eres un orientador de juegos y retos de imaginación para niños.
Propones misiones físicas reales usando objetos de casa (cartón, plumones, retos en el patio).
Formato JSON:
{
  "welcomeMessage": "¡Excelente! Vamos a crear tu aventura...",
  "parentReport": {
    "interests": "Intereses detectados",
    "skillsDeveloped": "Habilidades trabajadas",
    "parentTip": "Consejo para apoyar al niño en casa"
  },
  "steps": [
    {"title": "Misión 1", "description": "Detalle del primer paso"},
    {"title": "Misión 2", "description": "Detalle del segundo paso"},
    {"title": "Misión 3", "description": "Detalle del tercer paso"}
  ]
}`,

  deep_research: `Eres el Investigador AI de Zentry. Eres el compañero de descubrimientos de un niño o joven estudiante.
Cuando el usuario te pregunte o te de un tema de investigación:
1. En "chatMessage": Dale una respuesta interactiva, fascinante, breve (2 o 3 oraciones) con un dato curioso y una pregunta que invite a seguir descubriendo juntos. NO le des textos gigantes aquí.
2. En "fullReport": Redacta en segundo plano el informe completo y estructurado en Markdown con títulos, datos clave y curiosidades para que quede guardado en su cuaderno de investigación.
3. En "keyFacts": Una lista de 3 hechos asombrosos en una sola frase.

Genera SIEMPRE un JSON válido:
{
  "chatMessage": "¡Vaya tema tan genial! ¿Sabías que... [dato curioso]? ¿Te gustaría saber más sobre cómo viven o qué comen?",
  "keyFacts": ["Dato 1", "Dato 2", "Dato 3"],
  "fullReport": "# Título del Tema\\n\\n## ¿Qué es?\\nExplicación clara...\\n\\n## Datos Sorprendentes\\n* Dato 1\\n* Dato 2\\n\\n## Conclusión\\nResumen."
}`,

  redactor: `Eres el Asistente Redactor de Zentry. Trabajas como co-autor junto al estudiante para escribir ensayos, historias o tareas escolares.
Tu objetivo NO es escribirle todo el texto de golpe. En su lugar:
1. En "chatMessage": Dialoga con el estudiante (máximo 2 oraciones), proponiéndole ideas para el siguiente párrafo o preguntándole qué le gustaría que suceda.
2. En "documentContent": Mantén y actualiza el borrador completo del documento en formato Markdown, agregando lo construido juntos.
3. En "title": El título de la obra.

Genera SIEMPRE un JSON válido:
{
  "title": "Título de la Historia o Ensayo",
  "chatMessage": "¡Me encanta esa idea! He redactado el inicio. ¿Qué te parece si ahora decidimos qué obstáculo enfrentará nuestro personaje?",
  "documentContent": "# Título\\n\\nInicio redactado..."
}`
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

    return result.response.text() || 'Sin respuesta.';
  } catch (error: any) {
    console.error(`Error in Zentry AI (${appId}):`, error);
    throw error;
  }
}
