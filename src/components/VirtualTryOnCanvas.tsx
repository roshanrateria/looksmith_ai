import React, { useState, useEffect } from 'react';
import { Eye, Sparkles, Shirt, Palette, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Product } from '../utils/catalogAdapter';
import { ToneProfile } from '../utils/skinRules';

interface VirtualTryOnCanvasProps {
  userImage: string;
  garment: Product;
  lipColor: string;
  makeupIntensity: number;
  tone: ToneProfile;
  isPeekingOriginal: boolean;
  onTogglePeek: (peeking: boolean) => void;
  vtoMode?: 'full' | 'clothes' | 'makeup';
  onChangeVtoMode?: (mode: 'full' | 'clothes' | 'makeup') => void;
}

export const VirtualTryOnCanvas: React.FC<VirtualTryOnCanvasProps> = ({
  userImage,
  garment,
  lipColor,
  makeupIntensity,
  tone,
  isPeekingOriginal,
  onTogglePeek,
  vtoMode = 'full',
  onChangeVtoMode,
}) => {
  const [internalMode, setInternalMode] = useState<'full' | 'clothes' | 'makeup'>(vtoMode);
  const activeMode = onChangeVtoMode ? vtoMode : internalMode;

  const handleModeChange = (mode: 'full' | 'clothes' | 'makeup') => {
    if (onChangeVtoMode) {
      onChangeVtoMode(mode);
    } else {
      setInternalMode(mode);
    }
  };

  // Garment styling characteristics
  const garmentColor = garment.colorHex || '#1F3A34';
  const isDress = garment.category === 'dress' || garment.title.toLowerCase().includes('dress');
  const isTop = garment.category === 'top' || garment.title.toLowerCase().includes('shirt') || garment.title.toLowerCase().includes('blouse');
  const isEthnic = garment.category === 'ethnic' || garment.title.toLowerCase().includes('kurta') || garment.title.toLowerCase().includes('sari');

  // Makeup intensity normalization (0.2 to 0.9)
  const lipOpacity = isPeekingOriginal || activeMode === 'clothes' ? 0 : Math.min(0.85, (makeupIntensity / 100) * 0.9);
  const skinSmoothOpacity = isPeekingOriginal || activeMode === 'clothes' ? 0 : Math.min(0.65, (makeupIntensity / 100) * 0.7);
  const showClothes = !isPeekingOriginal && (activeMode === 'full' || activeMode === 'clothes');

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#0A0908]">
      {/* 1. Base User Image (Official Sample Selfie) */}
      <img
        src={userImage}
        alt="Shopper Portrait"
        className={`w-full h-full object-cover transition-transform duration-500 ${
          activeMode === 'makeup' ? 'scale-115 -translate-y-2' : 'scale-100'
        }`}
      />

      {/* 2. YouCam Makeup VTO - Skin Smoothing & Satin Finish Filter */}
      {skinSmoothOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-soft-light"
          style={{
            opacity: skinSmoothOpacity,
            background: `radial-gradient(ellipse 48% 50% at 50% 52%, ${tone.skinToneHex}88 0%, ${tone.skinToneHex}22 55%, transparent 75%)`,
            filter: 'blur(3px)',
          }}
        />
      )}

      {/* 3. YouCam Makeup VTO - Harmonized Lip Color Satin Synthesis */}
      {lipOpacity > 0 && (
        <svg
          viewBox="0 0 375 500"
          className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
          style={{ opacity: lipOpacity }}
        >
          <defs>
            {/* Satin Lip Specular Highlights */}
            <linearGradient id="lipGlossSheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="40%" stopColor={lipColor} stopOpacity="0.85" />
              <stop offset="100%" stopColor={lipColor} stopOpacity="0.95" />
            </linearGradient>
            <filter id="lipSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.8" />
            </filter>
          </defs>

          {/* Upper Lip Contour */}
          <path
            d="M 160 338 C 170 334 182 332 188 335 C 194 332 206 334 216 338 C 210 344 198 346 188 346 C 178 346 166 344 160 338 Z"
            fill="url(#lipGlossSheen)"
            filter="url(#lipSoftGlow)"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* Lower Lip Fullness Contour */}
          <path
            d="M 162 342 C 174 344 184 345 188 345 C 192 345 202 344 214 342 C 208 356 198 361 188 361 C 178 361 168 356 162 342 Z"
            fill="url(#lipGlossSheen)"
            filter="url(#lipSoftGlow)"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* Specular Satin Center Gloss Highlight */}
          <ellipse
            cx="188"
            cy="349"
            rx="11"
            ry="3.5"
            fill="#FFFFFF"
            opacity="0.32"
            filter="url(#lipSoftGlow)"
            style={{ mixBlendMode: 'screen' }}
          />
        </svg>
      )}

      {/* 4. YouCam Clothes VTO - Seamless Garment Drape Layer */}
      {showClothes && (
        <svg
          viewBox="0 0 375 500"
          className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-500 animate-fadeIn"
        >
          <defs>
            {/* Fabric Material Gradient & Sheen */}
            <linearGradient id="garmentSilkLuster" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor={garmentColor} stopOpacity="0.96" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.22" />
              <stop offset="60%" stopColor={garmentColor} stopOpacity="0.98" />
              <stop offset="100%" stopColor="#0B1310" stopOpacity="0.88" />
            </linearGradient>

            {/* Neckline Shadow for Seamless Depth */}
            <radialGradient id="neckShadow" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Subtle Fabric Fold Shadow Filter */}
            <filter id="drapeShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Torso & Shoulder Draped Garment Body */}
          <g filter="url(#drapeShadow)">
            {/* Clavicle & Neck Under-shadow */}
            <path
              d="M 125 396 C 150 410 225 410 250 396 L 260 412 C 220 426 155 426 115 412 Z"
              fill="url(#neckShadow)"
            />

            {/* Main Garment Cut tailored to category */}
            {isDress ? (
              // Fluid Bias-Cut Cowl / Slip Dress Silhouette
              <path
                d="M 104 402
                   C 135 390, 160 394, 188 406
                   C 216 394, 241 390, 272 402
                   C 305 414, 345 440, 368 472
                   L 375 500
                   L 0 500
                   L 7 472
                   C 30 440, 70 414, 104 402 Z"
                fill="url(#garmentSilkLuster)"
              />
            ) : isEthnic ? (
              // Structured Kurta / Ethnic Mandarin Cut
              <path
                d="M 120 394
                   C 150 404, 225 404, 255 394
                   C 295 406, 340 435, 365 470
                   L 375 500
                   L 0 500
                   L 10 470
                   C 35 435, 80 406, 120 394 Z"
                fill="url(#garmentSilkLuster)"
              />
            ) : (
              // Relaxed Crisp Linen / Shirt Cut
              <path
                d="M 112 396
                   C 145 392, 175 400, 188 412
                   C 201 400, 231 392, 264 396
                   C 300 410, 345 438, 368 470
                   L 375 500
                   L 0 500
                   L 7 470
                   C 30 438, 75 410, 112 396 Z"
                fill="url(#garmentSilkLuster)"
              />
            )}

            {/* Delicate Silk Neckline Seam Hem */}
            <path
              d="M 104 402 C 145 390, 175 402, 188 406 C 201 402, 231 390, 272 402"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />

            {/* Center Draping Fold Highlights */}
            <path
              d="M 188 406 C 187 440, 185 470, 188 500"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeOpacity="0.18"
            />
            <path
              d="M 150 418 C 146 450, 142 475, 138 500"
              fill="none"
              stroke="#000000"
              strokeWidth="2.5"
              strokeOpacity="0.3"
            />
            <path
              d="M 226 418 C 230 450, 234 475, 238 500"
              fill="none"
              stroke="#000000"
              strokeWidth="2.5"
              strokeOpacity="0.3"
            />
          </g>
        </svg>
      )}

      {/* 5. Top Bar: Press-and-Hold Peek & Active Mode Tabs */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-auto">
        {/* Hold to Peek Before Button */}
        <button
          onMouseDown={() => onTogglePeek(true)}
          onMouseUp={() => onTogglePeek(false)}
          onTouchStart={() => onTogglePeek(true)}
          onTouchEnd={() => onTogglePeek(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur transition cursor-pointer shadow-md border ${
            isPeekingOriginal
              ? 'bg-amber-400 text-black border-amber-300 scale-95 ring-2 ring-amber-400/50'
              : 'bg-black/65 text-white border-white/20 hover:bg-black/80'
          }`}
          aria-label="Hold to Peek Untouched Selfie"
        >
          <Eye className="w-3.5 h-3.5 text-[#E5BA82]" />
          <span>{isPeekingOriginal ? 'Original Raw Face' : 'Hold to Peek Before'}</span>
        </button>

        {/* VTO Feature Mode Selector: Full / Clothes / Makeup */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-black/60 backdrop-blur border border-white/20 text-[10px]">
          <button
            onClick={() => handleModeChange('full')}
            className={`px-2 py-1 rounded-full transition font-medium cursor-pointer ${
              activeMode === 'full' && !isPeekingOriginal
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Ensemble
          </button>
          <button
            onClick={() => handleModeChange('clothes')}
            className={`px-2 py-1 rounded-full transition font-medium cursor-pointer ${
              activeMode === 'clothes' && !isPeekingOriginal
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Clothes
          </button>
          <button
            onClick={() => handleModeChange('makeup')}
            className={`px-2 py-1 rounded-full transition font-medium cursor-pointer ${
              activeMode === 'makeup' && !isPeekingOriginal
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Makeup
          </button>
        </div>
      </div>

      {/* 6. Active Live VTO Floating Watermark / Telemetry Badges */}
      <div className="absolute bottom-20 left-3 z-20 flex flex-col gap-1 pointer-events-none">
        {isPeekingOriginal ? (
          <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur text-amber-300 border border-amber-300/30 text-[10px] font-mono flex items-center gap-1.5 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Raw Captured Selfie (No Try-On)</span>
          </div>
        ) : (
          <>
            {(activeMode === 'full' || activeMode === 'clothes') && (
              <div className="px-2.5 py-0.5 rounded-lg bg-black/75 backdrop-blur text-emerald-400 border border-emerald-400/30 text-[10px] font-mono flex items-center gap-1.5 shadow-xs">
                <Shirt className="w-3 h-3 text-emerald-400" />
                <span>YouCam AI Clothes VTO: {garment.title.split(' ')[0]} {garment.colorName}</span>
              </div>
            )}
            {(activeMode === 'full' || activeMode === 'makeup') && (
              <div className="px-2.5 py-0.5 rounded-lg bg-black/75 backdrop-blur text-[#E5BA82] border border-[#E5BA82]/30 text-[10px] font-mono flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3 h-3 text-[#E5BA82]" />
                <span>YouCam AI Makeup VTO: Velvet Satin {makeupIntensity}%</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
