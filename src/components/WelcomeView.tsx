import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Palette, Shirt } from 'lucide-react';

interface WelcomeViewProps {
  brandName?: string;
  onStart: () => void;
  onSelectPersona?: (personaId: string) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  brandName = 'MERIDIAN MART',
  onStart,
  onSelectPersona,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between p-6 animate-fadeIn">
      {/* Brand & Eyebrow */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 rounded-full">
            {brandName} • Stylist AI
          </span>
          <span className="text-xs text-[var(--ink-3)] font-medium">v1.0</span>
        </div>

        <h1 className="font-display text-4xl leading-[1.1] text-[var(--ink)] tracking-tight mb-3">
          Fashion tailored to your skin & tone.
        </h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed">
          One selfie. Zero generic recommendations. Our skin-aware stylist analyzes your natural complexion, undertones, and texture to curate virtually tried-on, shoppable looks.
        </p>
      </div>

      {/* Visual Showcase Card */}
      <div className="relative my-4 rounded-2xl overflow-hidden shadow-sm border border-[var(--hairline)] bg-[var(--surface)]">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80"
          alt="Style preview"
          className="w-full h-44 object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse" />
            <span className="text-xs font-medium tracking-wide uppercase text-white/90">
              Skin-Safe Palette Matching
            </span>
          </div>
          <div className="text-xs text-white/80">
            Harmonized with CIEDE2000 color delta & barrier-gentle fabrics.
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-3 gap-2 my-2 text-center">
        <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)]">
          <Palette className="w-4 h-4 mx-auto mb-1 text-[var(--accent)]" />
          <div className="text-[11px] font-semibold text-[var(--ink)]">Tone AI</div>
          <div className="text-[10px] text-[var(--ink-3)]">6-swatch palette</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)]">
          <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-[var(--accent)]" />
          <div className="text-[11px] font-semibold text-[var(--ink)]">Skin AI</div>
          <div className="text-[10px] text-[var(--ink-3)]">Pores & oil safe</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)]">
          <Shirt className="w-4 h-4 mx-auto mb-1 text-[var(--accent)]" />
          <div className="text-[11px] font-semibold text-[var(--ink)]">Photoreal VTO</div>
          <div className="text-[10px] text-[var(--ink-3)]">Cloth + Makeup</div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        <button
          onClick={onStart}
          className="w-full h-13 rounded-[14px] bg-[var(--accent)] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.98] transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start Styling</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>

        {/* Quick Demo Persona Shortcuts */}
        {onSelectPersona && (
          <div className="mt-3 text-center">
            <span className="text-[11px] text-[var(--ink-3)] block mb-1.5">or quick-test demo persona:</span>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onSelectPersona('persona-maya')}
                className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] text-[var(--ink-2)] transition border border-[var(--hairline)] cursor-pointer"
              >
                Maya (Warm/Oily)
              </button>
              <button
                onClick={() => onSelectPersona('persona-aisha')}
                className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] text-[var(--ink-2)] transition border border-[var(--hairline)] cursor-pointer"
              >
                Aisha (Deep/Dry)
              </button>
              <button
                onClick={() => onSelectPersona('persona-chloe')}
                className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] text-[var(--ink-2)] transition border border-[var(--hairline)] cursor-pointer"
              >
                Chloe (Fair/Redness)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
