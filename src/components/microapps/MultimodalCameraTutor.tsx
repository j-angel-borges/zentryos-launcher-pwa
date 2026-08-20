import React, { useState, useRef, useEffect } from 'react';
import { Camera, Sparkles, Scan, CheckCircle2, ArrowRight, Eye } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

export const MultimodalCameraTutor: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startWebcam = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        }
      } catch (err) {
        console.warn('Camera access fallback:', err);
      }
    };
    startWebcam();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleScan = () => {
    sounds.playTap();
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      sounds.playSuccess();
      setIsScanning(false);
      setScanResult({
        detectedType: 'Problema de Geometría & Triángulos Notables',
        confidence: '99.4%',
        problemText: 'Determinar la hipotenusa en un triángulo rectángulo con catetos a = 6 cm y b = 8 cm.',
        step1: 'Identificamos el Teorema de Pitágoras: c² = a² + b²',
        step2: 'Sustituimos catetos: c² = 6² + 8² = 36 + 64 = 100',
        solution: 'c = √100 = 10 cm'
      });
    }, 1800);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full space-y-5 text-white animate-in fade-in duration-300">
      <div className="liquid-glass rounded-3xl p-4 border border-purple-400/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Cámara Multimodal con IA Zentry</span>
              <span className="px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                Gemini 2.5 Vision
              </span>
            </h3>
            <p className="text-xs text-slate-300">Apunta a cualquier libro, cuaderno o dibujo para que la IA lo interprete en vivo.</p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-80 rounded-3xl overflow-hidden liquid-glass border border-white/20 shadow-2xl flex items-center justify-center bg-slate-950">
        {cameraActive ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 animate-pulse">
              <Eye className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-300 max-w-sm">
              Simulador de Visión Artificial ZentryOS activado. Apunta al ejercicio y presiona Escanear con IA.
            </p>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_20px_#a855f7] animate-pulse" />
        )}

        <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center">
          <div className="text-[11px] font-mono text-purple-300 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-purple-500/30">
            {isScanning ? 'Analizando imagen...' : 'Área de enfoque del problema'}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-500/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <Scan className="w-5 h-5" />
          <span>{isScanning ? 'Procesando con Gemini Vision...' : 'Escanear Problema con IA'}</span>
        </button>
      </div>

      {scanResult && (
        <div className="liquid-glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>{scanResult.detectedType} (Confianza {scanResult.confidence})</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">ID: ZENTRY-OCR-77</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 font-medium text-slate-200">
              📝 <span className="text-white font-semibold">Problema detectado:</span> {scanResult.problemText}
            </div>

            <div className="space-y-1.5 pt-1 text-slate-300">
              <div className="flex items-center gap-2 text-sky-300 font-medium">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{scanResult.step1}</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300 font-medium">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{scanResult.step2}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-between">
              <span>🎯 Respuesta Explicada:</span>
              <span className="font-mono text-white text-sm">{scanResult.solution}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
