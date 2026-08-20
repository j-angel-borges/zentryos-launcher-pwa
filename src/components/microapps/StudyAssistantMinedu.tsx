import React, { useState } from 'react';
import { 
  GraduationCap, 
  Send, 
  Sparkles, 
  Brain, 
  Bot,
  HelpCircle
} from 'lucide-react';
import type { SocraticMessage } from '../../types/zentry';
import { sounds } from '../../services/soundEffects';

export const StudyAssistantMinedu: React.FC = () => {
  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: '1',
      sender: 'tutor',
      text: '¡Hola Mateo! Soy tu Tutor Socrático Zentry. Estoy aquí para acompañarte en tus tareas de ciencias, matemáticas y letras según tu grado escolar. ¿Qué tema o duda quieres que analicemos hoy?',
      timestamp: 'Ahora',
      subject: 'math'
    },
    {
      id: '2',
      sender: 'student',
      text: '¿Cómo calculo el área de un círculo si solo me dieron el diámetro de 10 cm?',
      timestamp: 'Ahora'
    },
    {
      id: '3',
      sender: 'tutor',
      text: '¡Excelente pregunta! En lugar de darte la fórmula de memoria, pensemos juntos: Si el diámetro es la distancia de extremo a extremo pasando por el centro (10 cm), ¿cuál sería la medida del radio?',
      timestamp: 'Ahora',
      interactiveChoices: ['5 cm (la mitad)', '20 cm (el doble)', '10 cm (igual)'],
      solved: false
    }
  ]);

  const [input, setInput] = useState('');

  const handleChoice = (choice: string) => {
    sounds.playSuccess();
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'student',
        text: choice,
        timestamp: 'Ahora'
      },
      {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: '¡Exacto! El radio es 5 cm (r = d / 2). Ahora aplicamos la fórmula fundamental: Área = π × r². Como r² es 5 × 5 = 25, el área exacta es 25π cm² (aproximadamente 78.54 cm²). ¿Te gustaría probar con otro ejercicio?',
        timestamp: 'Ahora',
        solved: true
      }
    ]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sounds.playTap();
    const userMsg = input.trim();
    setInput('');

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'student',
        text: userMsg,
        timestamp: 'Ahora'
      }
    ]);

    setTimeout(() => {
      sounds.playSuccess();
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'tutor',
          text: `He analizado tu consulta sobre: "${userMsg}". Vamos a desglosarlo en 2 pasos lógicos para que lo domines por completo. ¿Empezamos con el primer concepto clave?`,
          timestamp: 'Ahora'
        }
      ]);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-6 text-white h-full overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="liquid-glass rounded-3xl p-4 border border-sky-400/30 flex items-center justify-between mb-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Tutor Socrático Zentry</h3>
              <span className="px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-semibold border border-sky-500/30">
                MINEDU Aligned
              </span>
            </div>
            <p className="text-xs text-slate-300">Guía pedagógica interactiva que no regala respuestas, sino que enseña a pensar.</p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'student' ? 'flex-row-reverse' : ''
            }`}
          >
            {msg.sender === 'tutor' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-3xl p-4 space-y-3 ${
                msg.sender === 'student'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none shadow-lg'
                  : 'liquid-glass border border-white/15 text-slate-100 rounded-tl-none shadow-xl'
              }`}
            >
              <p className="text-xs md:text-sm leading-relaxed whitespace-pre-line">
                {msg.text}
              </p>

              {msg.interactiveChoices && !msg.solved && (
                <div className="pt-2 space-y-2">
                  <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Selecciona tu razonamiento:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.interactiveChoices.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => handleChoice(choice)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-sky-500/30 hover:border-sky-400 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95"
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="relative pt-2">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Escribe tu pregunta o duda de estudio..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 backdrop-blur-xl shadow-lg transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition-colors cursor-pointer active:scale-90 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
