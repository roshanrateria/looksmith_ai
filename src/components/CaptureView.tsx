import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Sparkles, SwitchCamera, Scan } from 'lucide-react';
import { DEMO_PERSONAS } from '../data/demoPersonas';

const SAMPLE_FULL_BODY_URL = 'https://plugins-media.makeupar.com/strapi/assets/small_clothes_09_908428b0fe.jpg';

interface CaptureViewProps {
  onPhotoCaptured: (
    fullBodyImageUrl: string,
    selectedPersonaId?: string,
    croppedFaceDataUrl?: string
  ) => void;
  onSelectPersona: (personaId: string) => void;
}

export const CaptureView: React.FC<CaptureViewProps> = ({
  onPhotoCaptured,
  onSelectPersona,
}) => {
  const [streamActive, setStreamActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hintIndex, setHintIndex] = useState(0);
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [isCroppingFace, setIsCroppingFace] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hints = [
    'Stand full-body in frame for Clothes VTO',
    'AI auto-crops your face for Skin & Tone scan',
    'Even studio lighting for accurate tone extraction',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % hints.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [hints.length]);

  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  }, []);

  const startCamera = useCallback(
    async (mode: 'user' | 'environment' = facingMode) => {
      stopCurrentStream();
      setCapturedPreview(null);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1024, min: 512 },
            height: { ideal: 1024, min: 512 },
          },
          audio: false,
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setStreamActive(true);
        }
      } catch {
        setStreamActive(false);
      }
    },
    [facingMode, stopCurrentStream]
  );

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCurrentStream();
    };
  }, [facingMode, startCamera, stopCurrentStream]);

  const handleToggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const cropAndProceed = async (fullBodyImg: string) => {
    setIsCroppingFace(true);
    try {
      const payload = fullBodyImg.startsWith('data:image/')
        ? { imageBase64: fullBodyImg }
        : { imageUrl: fullBodyImg };

      const res = await fetch('/api/crop-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 'success' && data.croppedFaceUrl) {
        onPhotoCaptured(fullBodyImg, undefined, data.croppedFaceUrl);
        return;
      }
    } catch (err) {
      console.warn('AI face crop request fallback:', err);
    } finally {
      setIsCroppingFace(false);
    }
    onPhotoCaptured(fullBodyImg);
  };

  const handleCapture = async () => {
    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    const video = videoRef.current;
    if (streamActive && video && video.videoWidth > 0 && video.videoHeight > 0) {
      const width = video.videoWidth;
      const height = video.videoHeight;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        if (facingMode === 'user') {
          ctx.save();
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, width, height);
          ctx.restore();
        } else {
          ctx.drawImage(video, 0, 0, width, height);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedPreview(dataUrl);
        stopCurrentStream();
        await cropAndProceed(dataUrl);
        return;
      }
    }

    // Use official YouCam full-body sample photo
    setCapturedPreview(SAMPLE_FULL_BODY_URL);
    stopCurrentStream();
    await cropAndProceed(SAMPLE_FULL_BODY_URL);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCurrentStream();
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          setCapturedPreview(reader.result);
          await cropAndProceed(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectDemo = (personaId: string) => {
    stopCurrentStream();
    onSelectPersona(personaId);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-[#14110F] text-white animate-fadeIn relative overflow-hidden select-none">
      {/* Shutter flash overlay */}
      {isShutterActive && (
        <div className="absolute inset-0 bg-white z-50 animate-fadeOut pointer-events-none" />
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 pt-2 px-2">
        <span className="text-xs font-medium tracking-wide text-white/70">
          Step 1 of 3 • Full-Body VTO + Face Scan
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] text-white/90">
          <Sparkles className="w-3 h-3 text-[#E5BA82]" />
          <span>AI Face Auto-Crop</span>
        </div>
      </div>

      {/* Viewfinder Canvas Area — Full-Body Standing Frame */}
      <div className="relative my-auto flex flex-col items-center justify-center">
        <div className="relative w-64 h-80 rounded-3xl overflow-hidden border-2 border-white/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] bg-[#E8EAEE] transition-all duration-300">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(() => {});
              }
            }}
            onPlay={() => {
              setStreamActive(true);
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            } ${streamActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          />

          {capturedPreview && (
            <img
              src={capturedPreview}
              alt="Captured full-body photo"
              className="absolute inset-0 w-full h-full object-contain bg-[#E5E7EB] z-20"
            />
          )}

          {/* Live stream & pose active indicator */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur text-[9px] text-emerald-400 font-mono tracking-wide border border-emerald-500/40 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{isCroppingFace ? 'CROPPING FACE (SHARP AI)...' : 'FULL-BODY + FACE LOCK'}</span>
          </div>

          {/* Sample full-body camera feed */}
          {!streamActive && !capturedPreview && (
            <div className="absolute inset-0 bg-[#E5E7EB] flex items-center justify-center z-10">
              <img
                src={SAMPLE_FULL_BODY_URL}
                alt="Full-body camera feed"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* AI Face Detection Target Box Overlay */}
          <div className="absolute top-[11%] left-1/2 -translate-x-1/2 w-14 h-16 border-2 border-emerald-400/90 rounded-lg z-30 pointer-events-none shadow-[0_0_12px_rgba(52,211,153,0.4)]">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-emerald-500/90 text-black text-[7px] font-bold tracking-wider rounded uppercase whitespace-nowrap">
              Face Crop
            </div>
          </div>

          {/* Full-Body Pose Frame Corners */}
          <div className="absolute inset-2.5 border border-dashed border-black/20 rounded-2xl pointer-events-none z-20" />
        </div>

        {/* Live Hint Message */}
        <div className="mt-3 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] text-white/85 flex items-center gap-1.5">
          <Scan className="w-3.5 h-3.5 text-emerald-400" />
          <span>{hints[hintIndex]}</span>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="z-10 pb-2">
        <div className="flex items-center justify-center gap-6 mb-4">
          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition cursor-pointer"
            aria-label="Upload photo from device"
            title="Upload full-body photo from device"
          >
            <Upload className="w-5 h-5" />
          </button>

          {/* Shutter Release Button */}
          <button
            onClick={handleCapture}
            disabled={isCroppingFace}
            className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center bg-transparent hover:scale-105 active:scale-95 transition cursor-pointer p-1 group"
            aria-label="Take selfie photo"
            title="Capture full-body photo & auto-crop face"
          >
            <div className="w-14 h-14 rounded-full bg-white group-hover:bg-[#FAF8F5] active:bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.4)] transition" />
          </button>

          {/* Flip / Switch Camera Button */}
          <button
            onClick={handleToggleCamera}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition cursor-pointer"
            aria-label="Switch camera"
            title="Switch front/back camera"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Persona Pickers */}
        <div className="text-center pt-2 border-t border-white/10">
          <div className="text-[11px] text-white/50 mb-2">Or select a test persona:</div>
          <div className="flex items-center justify-center gap-2">
            {DEMO_PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectDemo(p.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#1F3A34] text-xs text-white/90 border border-white/15 transition cursor-pointer"
              >
                <img
                  src={p.avatarUrl}
                  alt={p.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
