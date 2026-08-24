import { askZentryAi } from './aiService';
import type { ScreenId } from '../types/zentry';

export interface AgentDecision {
  action: 'navigate' | 'answer' | 'clarify';
  targetScreen?: ScreenId;
  speechResponse: string;
  clarificationOptions?: { label: string; screen: ScreenId }[];
}

// Local fast-path intent matcher for instant 0ms latency on obvious commands
export function matchLocalVoiceCommand(transcript: string): AgentDecision | null {
  const q = transcript.toLowerCase().trim();

  // 1. Files / Archivos
  if (q.includes('archivo') || q.includes('mis documentos') || q.includes('mis tareas') || q.includes('descargas')) {
    return {
      action: 'navigate',
      targetScreen: 'files',
      speechResponse: 'Abriendo tus archivos escolares 📁'
    };
  }

  // 2. Exact Tutor Hub vs Study Assistant vs Redactor vs Research
  if (q.includes('asistente de estudio') || q.includes('asistente')) {
    return {
      action: 'navigate',
      targetScreen: 'study_assistant',
      speechResponse: 'Abriendo el Asistente de Estudio 🎓'
    };
  }

  if (q.includes('redactor') || q.includes('escribir ensayo') || q.includes('escribir cuento') || q.includes('redactar')) {
    return {
      action: 'navigate',
      targetScreen: 'redactor',
      speechResponse: 'Abriendo el Redactor Creativo ✍️'
    };
  }

  if (q.includes('investigador') || q.includes('investigar') || q.includes('ciencia profunda') || q.includes('curiosidades')) {
    return {
      action: 'navigate',
      targetScreen: 'deep_research',
      speechResponse: 'Abriendo el Investigador AI 🔍'
    };
  }

  if (q === 'tutor' || q.includes('sección de tutor') || q.includes('seccion de tutor') || q.includes('centro de tutor') || q.includes('tutor hub')) {
    return {
      action: 'navigate',
      targetScreen: 'tutor_hub',
      speechResponse: 'Abriendo el Centro de Tutoría con tus 4 herramientas 🧠'
    };
  }

  // 3. Camera / Calculator / Clock / Calendar
  if (q.includes('camara') || q.includes('cámara') || q.includes('foto')) {
    return {
      action: 'navigate',
      targetScreen: 'camera',
      speechResponse: 'Abriendo la Cámara 📸'
    };
  }

  if (q.includes('calculadora') || q.includes('calcular') || q.includes('matemática') || q.includes('cuenta')) {
    return {
      action: 'navigate',
      targetScreen: 'calculator',
      speechResponse: 'Abriendo la Calculadora 🔢'
    };
  }

  if (q.includes('reloj') || q.includes('alarma') || q.includes('temporizador') || q.includes('hora')) {
    return {
      action: 'navigate',
      targetScreen: 'reloj',
      speechResponse: 'Abriendo el Reloj y Alarmas ⏰'
    };
  }

  if (q.includes('calendario') || q.includes('fecha') || q.includes('horario')) {
    return {
      action: 'navigate',
      targetScreen: 'calendar',
      speechResponse: 'Abriendo tu Calendario Escolar 📅'
    };
  }

  // 4. Creative Studio / NeuroArt / World Generator
  if (q.includes('dibujo') || q.includes('dibujar') || q.includes('arte') || q.includes('art attack') || q.includes('neuro art')) {
    return {
      action: 'navigate',
      targetScreen: 'neuro_art',
      speechResponse: 'Abriendo el Estudio de Dibujo y Arte 🎨'
    };
  }

  if (q.includes('mundo') || q.includes('generador de mundos') || q.includes('aventura') || q.includes('mision') || q.includes('misión')) {
    return {
      action: 'navigate',
      targetScreen: 'world_generator',
      speechResponse: 'Abriendo el Generador de Aventuras 🪐'
    };
  }

  // 5. Settings / Phone
  if (q.includes('ajuste') || q.includes('configura') || q.includes('fondo') || q.includes('wallpaper')) {
    return {
      action: 'navigate',
      targetScreen: 'settings',
      speechResponse: 'Abriendo Ajustes de ZentryOS ⚙️'
    };
  }

  if (q.includes('telefono') || q.includes('teléfono') || q.includes('llamar') || q.includes('contacto')) {
    return {
      action: 'navigate',
      targetScreen: 'phone',
      speechResponse: 'Abriendo Teléfono y Contactos Seguros 📞'
    };
  }

  if (q.includes('zentry ai') || q.includes('charlar') || q.includes('conversar') || q.includes('inteligencia')) {
    return {
      action: 'navigate',
      targetScreen: 'ai',
      speechResponse: 'Abriendo Zentry AI ✨'
    };
  }

  if (q.includes('buscar') || q.includes('google') || q.includes('youtube') || q.includes('navegador')) {
    return {
      action: 'navigate',
      targetScreen: 'safe_search',
      speechResponse: 'Abriendo Búsqueda Segura 🛡️'
    };
  }

  return null;
}

// Fallback to Gemini 2.5 Flash for advanced understanding & clarification
export async function processVoiceAgentCommand(transcript: string): Promise<AgentDecision> {
  const localMatch = matchLocalVoiceCommand(transcript);
  if (localMatch) return localMatch;

  try {
    const prompt = `Analiza este comando de voz de un estudiante en ZentryOS: "${transcript}".
ZentryOS tiene estas pantallas:
- 'files' (Archivos y descargas)
- 'tutor_hub' (Centro general de tutoría con 4 microapps)
- 'study_assistant' (Asistente de estudio de materias)
- 'redactor' (Redactor de ensayos y cuentos)
- 'deep_research' (Investigador de curiosidades y ciencias)
- 'neuro_art' (Lienzo de dibujo y arte)
- 'world_generator' (Generador de aventuras y misiones)
- 'calculator' (Calculadora)
- 'camera' (Cámara)
- 'reloj' (Reloj y alarmas)
- 'calendar' (Calendario escolar)
- 'phone' (Teléfono y contactos seguros)
- 'settings' (Ajustes y fondos)
- 'ai' (Chat socrático Zentry AI)
- 'safe_search' (Búsqueda en internet)

Determina si debes:
1. 'navigate' a una pantalla específica con speechResponse corto.
2. 'clarify' si es ambiguo, proponiendo opciones.
3. 'answer' si es una pregunta de conocimiento general con una respuesta socrática en 1 frase.

Responde ÚNICAMENTE en este formato JSON:
{
  "action": "navigate" | "clarify" | "answer",
  "targetScreen": "study_assistant" (o null si es answer/clarify),
  "speechResponse": "Frase corta para el usuario",
  "clarificationOptions": [{"label": "Asistente de Estudio", "screen": "study_assistant"}] (opcional)
}`;

    const raw = await askZentryAi('general_ai', prompt);
    const clean = raw.trim().replace(/^```json/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(clean);
    return {
      action: parsed.action || 'answer',
      targetScreen: parsed.targetScreen,
      speechResponse: parsed.speechResponse || 'Comprendido.',
      clarificationOptions: parsed.clarificationOptions
    };
  } catch (err) {
    console.warn('Voice agent Gemini fallback error:', err);
    return {
      action: 'answer',
      speechResponse: `Escuché: "${transcript}". ¿Quieres que te ayude a buscarlo en Zentry AI?`
    };
  }
}
