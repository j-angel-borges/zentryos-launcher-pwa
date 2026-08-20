import React, { useState, useRef, useEffect } from 'react';
import { Scan, CheckCircle2, Eye } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryCameraScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCam = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasCamera(true);
          }
        }
      } catch (err) {
        console.warn('Camera fallback simulation active:', err);
      }
    };
    startCam();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleScan = () => {
    sounds.playTap();
    setIsScanning(true);
    setResult(null);

    setTimeout(() => {
      sounds.playSuccess();
      setIsScanning(false);
      setResult({
        title: 'Geometría: Teorema de Pitágoras Detectado',
        problem: 'Catetos a = 6 cm, b = 8 cm. Calcular hipotenusa c.',
        step: 'c² = 6² + 8² = 36 + 64 = 100',
        solution: 'c = 10 cm'
      });
    }, 1500);
  };

  return (
    <ZentrySubPageScaffold title="Cámara Multimodal IA" kicker="VISIÓN GEMINI" onBack={onBack} isDark={isDark}>
      <div className="max-w-xl mx-auto w-full space-y-4">
        <div className="relative w-full h-64 rounded-[28px] overflow-hidden bg-black flex items-center justify-center shadow-xl">
          {hasCamera ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 text-xs p-6 text-center">
              <Eye className="w-8 h-8 text-purple-400 animate-pulse" />
              <span>Visión Artificial lista. Apunta al libro o cuaderno.</span>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse shadow-[0_0_15px_#a855f7]" />
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 zentry-press cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>{isScanning ? 'Analizando con Gemini...' : 'Escanear Tarea con IA'}</span>
          </button>
        </div>

        {result && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-4 space-y-2 animate-in fade-in duration-300'}>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{result.title}</span>
            </div>
            <div className="text-xs text-slate-300 font-medium">📝 {result.problem}</div>
            <div className="text-xs text-sky-300 font-mono">💡 {result.step}</div>
            <div className="text-xs font-bold text-white bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
              🎯 Respuesta: {result.solution}
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
