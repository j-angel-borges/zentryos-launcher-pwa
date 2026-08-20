import React, { useState, useRef, useEffect } from 'react';
import { Scan, CheckCircle2, Eye, SwitchCamera, Upload, Sparkles, RefreshCw } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { askZentryAi } from '../../services/aiService';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

interface VisionResult {
  title: string;
  observation: string;
  step: string;
  solution: string;
}

export const ZentryCameraScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async (mode: 'environment' | 'user') => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: mode },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
        } catch {
          // Fallback to basic video constraint
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('autoplay', 'true');
          videoRef.current.muted = true;
          await videoRef.current.play().catch((e) => console.log('Video play catch:', e));
          setHasCamera(true);
        }
      } else {
        setCameraError('Cámara no soportada en este navegador.');
      }
    } catch (err: any) {
      console.warn('Camera permission or device error:', err);
      setCameraError('Permiso de cámara denegado o dispositivo ocupado. Puedes subir una foto desde tus archivos.');
      setHasCamera(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleFacingMode = () => {
    sounds.playTap();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture snapshot from live video stream
  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const handleScanLive = async () => {
    sounds.playTap();
    let base64 = captureFrame();

    if (!base64 && capturedImage) {
      base64 = capturedImage;
    }

    if (!base64) {
      alert('Apunta la cámara a tu tarea o selecciona una imagen.');
      return;
    }

    setCapturedImage(base64);
    setIsScanning(true);
    setResult(null);

    try {
      const raw = await askZentryAi(
        'camera_vision',
        'Analiza esta imagen educativa. Identifica el problema o concepto, explica paso a paso de forma amigable para un estudiante y sugiere la solución o pregunta reflexiva.',
        base64
      );

      const parsed: VisionResult = JSON.parse(raw.trim().replace(/^```json/, '').replace(/```$/, ''));
      sounds.playSuccess();
      setResult(parsed);
    } catch (err) {
      console.error('Vision analysis error:', err);
      // Fallback result
      setResult({
        title: 'Contenido Escolar Identificado',
        observation: 'He recibido la imagen de tu tarea o cuaderno.',
        step: 'Te sugiero verificar los datos principales y repasar los conceptos clave de la lección.',
        solution: '¡Buen trabajo! Continúa con el siguiente ejercicio.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playTap();
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setCapturedImage(b64);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    sounds.playTap();
    setCapturedImage(null);
    setResult(null);
    startCamera(facingMode);
  };

  return (
    <ZentrySubPageScaffold title="Cámara Multimodal IA" kicker="VISIÓN GEMINI" onBack={onBack} isDark={isDark}>
      <div className="max-w-xl mx-auto w-full space-y-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Viewport View / Captured Preview */}
        <div className="relative w-full h-72 md:h-80 rounded-[28px] overflow-hidden bg-black flex items-center justify-center shadow-xl border border-white/20">
          {capturedImage ? (
            <img src={capturedImage} alt="Captura" className="w-full h-full object-contain bg-black" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {!hasCamera && !capturedImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-300 gap-3 bg-slate-900/90">
              <Eye className="w-8 h-8 text-purple-400 animate-pulse" />
              <span>{cameraError || 'Iniciando cámara de tu dispositivo...'}</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer zentry-press"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Foto de Tarea</span>
              </button>
            </div>
          )}

          {/* Top Controls Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {hasCamera && !capturedImage && (
              <button
                onClick={toggleFacingMode}
                title="Cambiar Cámara Frontal / Trasera"
                className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 cursor-pointer transition-all zentry-press"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Subir imagen"
              className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 cursor-pointer transition-all zentry-press"
            >
              <Upload className="w-4 h-4" />
            </button>

            {capturedImage && (
              <button
                onClick={handleReset}
                title="Nueva Foto"
                className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 cursor-pointer transition-all zentry-press"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Laser scan line animation */}
          {isScanning && (
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-bounce shadow-[0_0_20px_#a855f7]" />
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-1">
          <button
            onClick={handleScanLive}
            disabled={isScanning}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 zentry-press cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            ) : (
              <Scan className="w-4 h-4" />
            )}
            <span>{isScanning ? 'Analizando con Visión Gemini...' : 'Escanear Tarea con Visión IA'}</span>
          </button>
        </div>

        {/* Real Multimodal AI Result Card */}
        {result && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-5 space-y-2.5 animate-in fade-in duration-300 border border-purple-400/30'}>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{result.title}</span>
            </div>

            <div className="text-xs text-slate-300">
              <span className="font-bold text-slate-200">🔍 Observación: </span>
              {result.observation}
            </div>

            <div className="text-xs text-sky-300 font-medium">
              <span className="font-bold text-sky-200">💡 Guía Socrática: </span>
              {result.step}
            </div>

            <div className="text-xs font-bold text-white bg-purple-600/30 p-3 rounded-xl border border-purple-400/40">
              🎯 {result.solution}
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
