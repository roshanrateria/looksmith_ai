import React, { useState } from 'react';
import { Wifi, Battery, Sparkles, Terminal, Sliders, ExternalLink } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  brandName?: string;
  isWidgetMode?: boolean;
  onOpenConsole?: () => void;
  showInspector?: boolean;
  onToggleInspector?: () => void;
  inspectorNode?: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  brandName = 'MERIDIAN MART',
  isWidgetMode = false,
  onOpenConsole,
  showInspector = true,
  onToggleInspector,
  inspectorNode,
}) => {
  const [currentTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  // If in embedded widget mode or iframe, render cleanly without outer device frame
  if (isWidgetMode) {
    return <div className="w-full h-full min-h-screen bg-[var(--canvas)] flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen w-full bg-[#181614] text-[#FAF8F5] flex flex-col items-center justify-start p-2 sm:p-6 lg:p-10">
      {/* Top B2B Navigation Banner for Judges */}
      <header className="w-full max-w-6xl mb-6 flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1F3A34] text-white flex items-center justify-center font-serif text-lg font-bold border border-white/20">
            L
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl tracking-tight font-medium text-white">LOOKSMITH</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1F3A34] text-[#E5BA82] border border-[#E5BA82]/30">
                YouCam Hackathon Entry
              </span>
            </div>
            <p className="text-xs text-white/50 hidden sm:block">
              AI Skin & Tone Aware Fashion Stylist • YouCam Skin AI + eCommerce VTO + Gemini Agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {onOpenConsole && (
            <button
              onClick={onOpenConsole}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition border border-white/10"
              aria-label="Open B2B Retailer Console"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Retailer Console</span>
            </button>
          )}

          <a
            href="/demo-store.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition border border-white/10"
            aria-label="Open Demo Storefront with Widget"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3 h-3 text-white/60" />
          </a>

          {onToggleInspector && (
            <button
              onClick={onToggleInspector}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition border ${
                showInspector
                  ? 'bg-[#1F3A34] text-white border-[#E5BA82]/40'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
              }`}
              aria-label="Toggle Under The Hood Inspector"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Judge Inspector</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content: Split screen on wide viewports (Device on left, Inspector on right) */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        {/* Mobile Device Frame */}
        <div className="relative w-full max-w-[420px] rounded-[48px] bg-[#0A0908] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.6)] border-[6px] border-[#2C2926] shrink-0">
          {/* Dynamic Island / Speaker notch */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-3 w-32 h-6 bg-black rounded-full shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-white/10" />
            <div className="w-2 h-2 rounded-full bg-[#1F3A34]" />
          </div>

          {/* Internal Screen Container */}
          <div className="relative w-full h-[810px] overflow-hidden rounded-[40px] bg-[var(--canvas)] text-[var(--ink)] flex flex-col border border-black/10">
            {/* Status Bar */}
            <div className="w-full pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold text-[var(--ink-2)] z-40 select-none">
              <span>{currentTime}</span>
              <div className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* App Viewport */}
            <div className="flex-1 w-full overflow-y-auto relative flex flex-col">
              {children}
            </div>

            {/* Mobile Home Bar */}
            <div className="w-full py-2 flex justify-center items-center bg-[var(--canvas)]/80 backdrop-blur z-40">
              <div className="w-32 h-1 bg-black/20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Inspector Panel for Judges (Desktop view) */}
        {showInspector && inspectorNode && (
          <div className="w-full lg:flex-1 hidden lg:block">
            {inspectorNode}
          </div>
        )}
      </div>
    </div>
  );
};
