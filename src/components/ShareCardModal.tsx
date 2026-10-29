import React, { useState, useRef } from 'react';
import { X, Share2, Download, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { LookBlueprint } from '../data/demoPersonas';
import { ToneProfile } from '../utils/skinRules';

interface ShareCardModalProps {
  look: LookBlueprint;
  tone: ToneProfile;
  brandName?: string;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  look,
  tone,
  brandName = 'MERIDIAN MART',
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Render high-res PNG via Canvas
  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1620;

    // Draw background
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Header
    ctx.fillStyle = '#14110F';
    ctx.font = '600 36px sans-serif';
    ctx.fillText(brandName.toUpperCase(), 80, 100);

    ctx.fillStyle = '#6B655F';
    ctx.font = '400 28px sans-serif';
    ctx.fillText('STYLED WITH LOOKSMITH AI', 80, 145);

    // Load Image and draw
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = look.tryOnImageUrl;
    img.onload = () => {
      // Draw image with rounded clipping
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(80, 200, 920, 1100, 40);
      ctx.clip();
      ctx.drawImage(img, 80, 200, 920, 1100);
      ctx.restore();

      // Card Title & Style Vibe
      ctx.fillStyle = '#14110F';
      ctx.font = '600 52px serif';
      ctx.fillText(look.name, 80, 1380);

      ctx.fillStyle = '#1F3A34';
      ctx.font = '500 32px sans-serif';
      ctx.fillText(`Match Score: ${look.score} • ${look.skinSafeBadge}`, 80, 1440);

      // Draw Palette Swatches
      const swatches = tone.paletteHexes || ['#1F3A34', '#556B2F', '#D4AA7D'];
      swatches.forEach((hex, i) => {
        ctx.fillStyle = hex;
        ctx.beginPath();
        ctx.arc(80 + i * 70, 1510, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Export PNG
      const link = document.createElement('a');
      link.download = `LOOKSMITH-${look.name.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    };

    // If image fails to load or cross-origin blocks, still export basic poster
    img.onerror = () => {
      const link = document.createElement('a');
      link.download = `LOOKSMITH-${look.name.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloadSuccess(true);
    };
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${look.name} — Styled by LOOKSMITH`,
          text: `Check out my skin-harmonized look: ${look.name} (score ${look.score})!`,
          url: window.location.href,
        });
      } catch (e) {
        // user cancelled or share failed; fallback to download
        handleDownloadCard();
      }
    } else {
      handleDownloadCard();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-[var(--canvas)] rounded-[28px] p-5 shadow-2xl animate-scaleUp max-h-[92%] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[var(--accent)] tracking-wider uppercase">
            Shareable Look Card
          </span>
          <button
            onClick={onClose}
            aria-label="Close share modal"
            className="p-1.5 rounded-full text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poster Preview Card */}
        <div
          ref={cardRef}
          className="relative rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--hairline)] p-3 shadow-md"
        >
          {/* Brand & Watermark */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="font-serif text-sm font-semibold tracking-tight text-[var(--ink)]">
              {brandName}
            </span>
            <span className="text-[10px] text-[var(--ink-3)] font-mono">
              Styled with LOOKSMITH
            </span>
          </div>

          {/* Main Photo */}
          <div className="relative rounded-xl overflow-hidden aspect-[3/4] mb-3">
            <img
              src={look.tryOnImageUrl}
              alt={look.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-medium flex items-center gap-1 border border-white/20">
              <ShieldCheck className="w-3 h-3 text-[#E5BA82]" />
              <span>Score {look.score}</span>
            </div>
          </div>

          {/* Details */}
          <div className="px-1">
            <h4 className="font-display text-lg font-normal text-[var(--ink)] leading-tight mb-0.5">
              {look.name}
            </h4>
            <div className="text-[10px] text-[var(--ink-2)] mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--accent)]" />
              <span>{look.skinSafeBadge}</span>
            </div>

            {/* Palette Dots */}
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-[var(--hairline)]">
              <span className="text-[9px] text-[var(--ink-3)] uppercase font-semibold mr-1">
                Tone Palette
              </span>
              {tone.paletteHexes.map((hex, i) => (
                <span
                  key={i}
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Share & Download Actions */}
        <div className="pt-4 space-y-2">
          <button
            onClick={handleNativeShare}
            className="w-full h-12 rounded-xl bg-[var(--accent)] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs hover:opacity-95 active:scale-[0.98] transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Poster to Social / Story</span>
          </button>

          <button
            onClick={handleDownloadCard}
            className="w-full h-11 rounded-xl bg-[var(--surface-2)] text-[var(--ink-2)] text-xs font-medium flex items-center justify-center gap-2 hover:text-[var(--ink)] transition cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-[var(--success)]" />
                <span>Downloaded PNG!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
