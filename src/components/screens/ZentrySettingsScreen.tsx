import React, { useState } from 'react';
import {
  Sliders,
  Wallpaper,
  Lock,
  Shield,
  Check,
  Volume2,
  Play,
  GraduationCap,
  Baby,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  ExternalLink,
  Copy,
  Sparkles,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import type { WallpaperId, AgeTier } from '../../types/zentry';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { voiceService, type AgeCohort, type VoicePersona, VOICE_PERSONAS } from '../../services/voiceSpeech';
import { getStoredDeviceId, setStoredDeviceId, syncRealDeviceTelemetry } from '../../services/firebase';

interface Props {
  onBack: () => void;
  currentWallpaper: WallpaperId;
  onSelectWallpaper: (id: WallpaperId) => void;
  ageTier?: AgeTier;
  onSelectAgeTier?: (tier: AgeTier) => void;
  isDark: boolean;
}

export const ZentrySettingsScreen: React.FC<Props> = ({
  onBack,
  currentWallpaper,
  onSelectWallpaper,
  ageTier = 'toddler',
  onSelectAgeTier,
  isDark
}) => {
  const [deviceId, setDeviceId] = useState(getStoredDeviceId);
  const [isEditingId, setIsEditingId] = useState(false);
  const [tempId, setTempId] = useState(deviceId);
  const [copied, setCopied] = useState(false);

  const [brightness, setBrightness] = useState(80);
  const [pin, setPin] = useState('1234');
  
  // Voice & Persona States
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(() => voiceService.getPersona());
  const [pitchOffset, setPitchOffset] = useState<number>(() => voiceService.getCustomSettings().pitchOffset ?? 0);
  const [rateMultiplier, setRateMultiplier] = useState<number>(() => voiceService.getCustomSettings().rateMultiplier ?? 1.0);
  const [volumeGain, setVolumeGain] = useState<number>(() => voiceService.getCustomSettings().volumeGainDb ?? 1.5);

  const [testPhrase, setTestPhrase] = useState('¡Hola! Soy Zentry, qué alegría saludarte. ¿Lista para descubrir cosas increíbles hoy?');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => {
    return localStorage.getItem('zentry_tts_api_key') || '';
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveApiKey = (val: string) => {
    const trimmed = val.trim();
    setApiKeyInput(trimmed);
    if (trimmed) {
      localStorage.setItem('zentry_tts_api_key', trimmed);
      setCacheStatus('API Key guardada localmente.');
    } else {
      localStorage.removeItem('zentry_tts_api_key');
      setCacheStatus('API Key eliminada (usando fallback offline).');
    }
  };

  const handleSaveDeviceId = () => {
    if (!tempId.trim()) return;
    sounds.playSuccess();
    setStoredDeviceId(tempId.trim());
    setDeviceId(tempId.trim());
    setIsEditingId(false);
    syncRealDeviceTelemetry(tempId.trim());
  };

  const handleCopy = () => {
    sounds.playTap();
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wallpapers: { id: WallpaperId; name: string; color: string }[] = [
    { id: 'Glacial', name: 'Glacial', color: '#F1F5F9' },
    { id: 'Lila', name: 'Lila', color: '#E9E3FF' },
    { id: 'Aura', name: 'Aura', color: '#FFE8E8' },
    { id: 'Brisa', name: 'Brisa', color: '#E3F2FD' },
    { id: 'Espacio', name: 'Espacio', color: '#26262B' }
  ];

  const handleSelectPersona = (personaId: VoicePersona) => {
    sounds.playTap();
    setSelectedPersona(personaId);
    voiceService.setPersona(personaId);
    const persona = VOICE_PERSONAS[personaId];
    if (onSelectAgeTier) {
      onSelectAgeTier(persona.cohort);
    }
    if (personaId === 'zentry_jovial') {
      setTestPhrase('¡Hola! Soy Zentry, qué alegría saludarte. ¿Lista para descubrir cosas increíbles hoy?');
    } else if (personaId === 'toddler_sweet') {
      setTestPhrase('¡Hola amiguito! ¿Quieres que dibujemos y cantemos cosas hermosas juntos?');
    } else if (personaId === 'socratic_mentor') {
      setTestPhrase('¡Hola! Soy tu mentora socrática. ¿Qué reto o curiosidad exploraremos paso a paso?');
    } else {
      setTestPhrase('¡Hola! ¡Vamos a divertirnos creando y superando misiones científicas geniales!');
    }
  };

  const handlePitchChange = (val: number) => {
    setPitchOffset(val);
    voiceService.saveCustomSettings({ pitchOffset: val });
  };

  const handleRateChange = (val: number) => {
    setRateMultiplier(val);
    voiceService.saveCustomSettings({ rateMultiplier: val });
  };

  const handleVolumeGainChange = (val: number) => {
    setVolumeGain(val);
    voiceService.saveCustomSettings({ volumeGainDb: val });
  };

  const handleResetVoiceDefaults = () => {
    sounds.playTap();
    setPitchOffset(0);
    setRateMultiplier(1.0);
    setVolumeGain(1.6);
    voiceService.saveCustomSettings({ pitchOffset: 0, rateMultiplier: 1.0, volumeGainDb: 1.6 });
    setCacheStatus('Valores acústicos restaurados a la calibración jovial y femenina.');
  };

  const handleSpeakTest = async () => {
    sounds.playTap();
    voiceService.unlockAudioContext();
    setIsSpeaking(true);
    setCacheStatus('Sintetizando con Google Cloud TTS...');

    try {
      await voiceService.speakFeedback(testPhrase, {
        personaId: selectedPersona,
        pitch: Number((VOICE_PERSONAS[selectedPersona].defaultPitch + pitchOffset).toFixed(2)),
        speakingRate: Number((VOICE_PERSONAS[selectedPersona].defaultRate * rateMultiplier).toFixed(2)),
        volumeGainDb: volumeGain,
        onStart: () => {
          setIsSpeaking(true);
          setCacheStatus('Reproduciendo audio HD...');
        },
        onEnd: () => {
          setIsSpeaking(false);
          setCacheStatus('Audio completado (Guardado en IndexedDB con 0 ms de latencia)');
        },
        onError: () => {
          setIsSpeaking(false);
          setCacheStatus('Completado vía motor natural offline');
        }
      });
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleClearCache = async () => {
    sounds.playTap();
    await voiceService.clearAudioCache();
    setCacheStatus('Caché de audio limpiada.');
  };

  return (
    <ZentrySubPageScaffold title="Configuración" kicker="SISTEMA" onBack={onBack} isDark={isDark}>
      <div className="max-w-lg mx-auto w-full space-y-4 pb-4">
        {/* 1. PARENT DASHBOARD & FIRESTORE PAIRING CARD */}
        <div className={(isDark ? 'zentry-veil-dark border-indigo-500/30 ' : 'zentry-veil-light border-indigo-400/50 ') + 'rounded-[24px] p-4 space-y-3 border shadow-sm'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <Smartphone className="w-4 h-4" />
              <span>Vinculación con Dashboard de Padres</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>En Vivo</span>
            </div>
          </div>

          <div className="p-3 rounded-[18px] bg-black/20 space-y-2 border border-white/10">
            <div className="text-[11px] text-slate-300">
              Identificador único de este dispositivo en Firestore:
            </div>

            {isEditingId ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempId}
                  onChange={(e) => setTempId(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-mono font-bold text-white border border-indigo-400 focus:outline-none"
                  placeholder="ID del dispositivo..."
                />
                <button
                  onClick={handleSaveDeviceId}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer zentry-press"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-amber-300 bg-white/10 px-2.5 py-1 rounded-lg">
                  {deviceId}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setTempId(deviceId);
                      setIsEditingId(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Abre el portal de supervisión para padres:
            </span>
            <button
              onClick={() => {
                sounds.playTap();
                window.open('https://zentry-parent-dashboard.vercel.app/', '_blank');
              }}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-bold shadow-md flex items-center gap-1.5 cursor-pointer zentry-press"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Dashboard</span>
            </button>
          </div>
        </div>

        {/* 2. SÍNTESIS VOCAL NEURONAL GCP & CALIBRACIÓN ACÚSTICA */}
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-3.5'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Volume2 className="w-4 h-4 text-[#8B5CF6]" />
              <span>Síntesis Vocal Neuronal GCP & Personas</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>HD 24kHz • 0 ms</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Selecciona la persona de voz para la guía proactiva y respuestas socráticas:
          </div>

          {/* 4 Voice Personas Selector Grid */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(VOICE_PERSONAS) as VoicePersona[]).map((pKey) => {
              const persona = VOICE_PERSONAS[pKey];
              const isSelected = selectedPersona === pKey;
              return (
                <button
                  key={pKey}
                  onClick={() => handleSelectPersona(pKey)}
                  className={
                    'p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ' +
                    (isSelected
                      ? 'bg-purple-500/25 border-purple-400 shadow-md ring-1 ring-purple-400/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10')
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {persona.cohort === 'toddler' ? (
                        <Baby className="w-3.5 h-3.5 text-pink-400" />
                      ) : (
                        <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>{persona.name}</span>
                    </div>
                    {isSelected && <Check className="w-3 h-3 text-purple-300" />}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                    {persona.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calibradores Acústicos en Tiempo Real */}
          <div className="p-3 rounded-2xl bg-black/20 border border-white/10 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Calibración de Tono, Ritmo y Ganancia:</span>
              </div>
              <button
                onClick={handleResetVoiceDefaults}
                className="text-[10px] text-slate-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                title="Restaurar valores recomendados"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </button>
            </div>

            {/* Slider 1: Pitch Offset */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Tono / Timbre (Pitch):</span>
                <span className="font-mono text-purple-300 font-bold">
                  {pitchOffset > 0 ? `+${pitchOffset}` : pitchOffset} semitonos
                </span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={pitchOffset}
                onChange={(e) => handlePitchChange(Number(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-white/15 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Rate Multiplier */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Velocidad de Habla (Rate):</span>
                <span className="font-mono text-purple-300 font-bold">
                  {rateMultiplier.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.20"
                step="0.02"
                value={rateMultiplier}
                onChange={(e) => handleRateChange(Number(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-white/15 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 3: Volume Gain */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Ganancia y Presencia Acústica (Volume):</span>
                <span className="font-mono text-purple-300 font-bold">
                  +{volumeGain.toFixed(1)} dB
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={volumeGain}
                onChange={(e) => handleVolumeGainChange(Number(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-white/15 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Test Phrase Input & Trigger */}
          <div className="space-y-2 pt-1">
            <div className="relative">
              <input
                type="text"
                value={testPhrase}
                onChange={(e) => setTestPhrase(e.target.value)}
                placeholder="Escribe una frase para probar la voz..."
                className="w-full pl-3 pr-20 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={handleSpeakTest}
                disabled={isSpeaking}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer flex items-center gap-1 shadow"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isSpeaking ? 'Hablando' : 'Probar'}</span>
              </button>
            </div>

            {/* Google Cloud API Key input */}
            <div className="bg-black/20 border border-white/10 rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Cloud TTS API Key:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="text-slate-400 hover:text-white text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showApiKey ? 'Ocultar' : 'Ver'}</span>
                </button>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                placeholder="Pega tu API Key (AIzaSy...) o usa .env.local"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <div className="text-[10px] text-slate-400">
                {apiKeyInput.trim()
                  ? '🟢 Clave configurada: Generando voz neuronal de estudio GCP en tiempo real.'
                  : '🟡 Sin clave: Operando en fallback offline inteligente con voces naturales de tu navegador.'}
              </div>
            </div>

            {cacheStatus && (
              <div className="text-[10px] text-purple-300 font-medium flex items-center justify-between">
                <span>{cacheStatus}</span>
                <button
                  onClick={handleClearCache}
                  className="text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                  title="Limpiar caché IndexedDB"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpiar caché</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Brillo de Pantalla */}
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-2'}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Sliders className="w-4 h-4 text-[#8B5CF6]" />
            <span>Brillo de Pantalla</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-[#8B5CF6] h-2 bg-white/20 rounded-lg cursor-pointer"
          />
        </div>

        {/* 3. Lienzo Vivo (Wallpaper) */}
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-3'}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Wallpaper className="w-4 h-4 text-[#8B5CF6]" />
            <span>Lienzo Vivo (Wallpaper Circadiano)</span>
          </div>
          <div className="flex items-center gap-3">
            {wallpapers.map((wp) => {
              const active = currentWallpaper === wp.id;
              return (
                <button
                  key={wp.id}
                  onClick={() => {
                    sounds.playTap();
                    onSelectWallpaper(wp.id);
                  }}
                  style={{ backgroundColor: wp.color }}
                  className={'w-9 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ' + (active ? 'border-[#8B5CF6] scale-110 shadow-lg' : 'border-white/40')}
                  title={wp.name}
                >
                  {active && <Check className="w-4 h-4 text-[#4A306D]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Seguridad y PIN */}
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-2'}>
          <div className="flex items-center gap-2 text-xs font-bold">
            <Lock className="w-4 h-4 text-[#8B5CF6]" />
            <span>Seguridad y PIN de Acceso</span>
          </div>
          <div className="text-xs text-slate-400">Código PIN actual: {pin}</div>
        </div>

        {/* 5. Kiosco */}
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[22px] p-4 space-y-1'}>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Administrador de Dispositivo Kiosco</span>
          </div>
          <div className="text-[11px] text-slate-400">
            El dispositivo está bajo el control Kiosco de ZentryOS.
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-500 pt-2">
          ZentryOS 2026 • v1.2.0 - liquid
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};

