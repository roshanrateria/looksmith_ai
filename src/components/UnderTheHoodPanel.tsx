import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, Sparkles, RefreshCw, Layers, CheckCircle2, Zap, Brain, Heart, ThumbsDown } from 'lucide-react';
import { TasteMemory, getTasteLearningSummary } from '../utils/tasteMemory';

interface UnderTheHoodPanelProps {
  tasteMemory?: TasteMemory;
}

export const UnderTheHoodPanel: React.FC<UnderTheHoodPanelProps> = ({ tasteMemory }) => {
  const [telemetry, setTelemetry] = useState<{
    youcamCallsUsed: number;
    youcamCallCap: number;
    cacheHits: number;
    geminiCalls: number;
    tasteInteractions?: number;
    lastTasteSummary?: string;
    activeMode: string;
    hasYouCamKey: boolean;
    hasGeminiKey: boolean;
    geminiModel: string;
    catalogCount: number;
    recentTasks?: Array<{ id: string; endpoint: string; status: string; timestamp: string }>;
  }>({
    youcamCallsUsed: 0,
    youcamCallCap: 14,
    cacheHits: 4,
    geminiCalls: 1,
    tasteInteractions: 0,
    lastTasteSummary: 'No feedback recorded yet',
    activeMode: 'cached',
    hasYouCamKey: false,
    hasGeminiKey: true,
    geminiModel: 'gemini-3.5-flash-lite',
    catalogCount: 20,
  });

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {
      // offline fallback
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalInteractions = (tasteMemory?.likedLookCount || 0) + (tasteMemory?.dislikedLookCount || 0);
  const tasteSummary = getTasteLearningSummary(tasteMemory) || telemetry.lastTasteSummary;

  const topSilhouettes = tasteMemory
    ? Object.entries(tasteMemory.preferredSilhouettes)
        .filter(([_, w]) => w !== 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : [];

  const topBrands = tasteMemory
    ? Object.entries(tasteMemory.preferredBrands)
        .filter(([_, w]) => w !== 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : [];

  const bannedSkus = tasteMemory?.dislikedSkus || [];

  return (
    <div className="w-full bg-[#141210] rounded-3xl p-6 border border-white/10 shadow-2xl text-white font-ui animate-fadeIn">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-[#E5BA82]" />
          <div>
            <h3 className="font-serif text-lg font-medium text-white">Under the Hood</h3>
            <span className="text-[11px] text-white/50">Live Judge Telemetry & Pipeline Inspector</span>
          </div>
        </div>

        <button
          onClick={fetchTelemetry}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition cursor-pointer"
          title="Refresh telemetry"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Live Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* YouCam Unit Budget Status */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-xs text-white/70 mb-1">
            <span>YouCam Unit Quota</span>
            <Shield className="w-3.5 h-3.5 text-[#E5BA82]" />
          </div>
          <div className="font-mono text-xl font-bold text-white">
            {telemetry.youcamCallsUsed} / {telemetry.youcamCallCap}
          </div>
          <div className="text-[10px] text-white/50 mt-1">
            Hard session cap to preserve free tier (~1000 units)
          </div>
        </div>

        {/* Local Hash Cache Hits */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-xs text-white/70 mb-1">
            <span>SHA-256 Cache Hits</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-mono text-xl font-bold text-emerald-400">
            {telemetry.cacheHits} Hits
          </div>
          <div className="text-[10px] text-white/50 mt-1">
            Replay reliability in DEMO_MODE
          </div>
        </div>
      </div>

      {/* Self-Learning Taste Memory Status Section */}
      <div className="mb-5">
        <div className="text-xs font-semibold tracking-wider uppercase text-white/70 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            <span>Self-Learning Taste Memory</span>
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-mono">
            {totalInteractions > 0 ? `${totalInteractions} interactions recorded` : 'Listening for signals'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-[11px] font-mono space-y-2">
          <div className="flex items-center justify-between text-white/80">
            <span>Planner Injection:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Injected in Gemini System Prompt
            </span>
          </div>

          <div className="text-white/60 text-[10px]">
            Learned Profile: <span className="text-[#E5BA82]">{tasteSummary || 'Awaiting initial like/dislike'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[10px]">
            <div className="flex items-center gap-1.5 text-rose-300">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              <span>{tasteMemory?.likedLookCount || 0} Liked Looks</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400">
              <ThumbsDown className="w-3 h-3 text-neutral-400" />
              <span>{tasteMemory?.dislikedLookCount || 0} Disliked Looks</span>
            </div>
          </div>

          {topSilhouettes.length > 0 && (
            <div className="text-[10px] text-white/70">
              • Silhouettes: {topSilhouettes.map(([s, w]) => `${s} (${w > 0 ? `+${w}` : w})`).join(', ')}
            </div>
          )}

          {topBrands.length > 0 && (
            <div className="text-[10px] text-white/70">
              • Brands: {topBrands.map(([b, w]) => `${b} (${w > 0 ? `+${w}` : w})`).join(', ')}
            </div>
          )}

          {bannedSkus.length > 0 && (
            <div className="text-[10px] text-rose-400">
              • Banned from Planner: {bannedSkus.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* YouCam APIs Active Table */}
      <div className="mb-5">
        <div className="text-xs font-semibold tracking-wider uppercase text-white/70 mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#E5BA82]" />
          <span>Active YouCam APIs (4 Live)</span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-white/90">1. AI Skin Analysis</span>
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Pores, Oil, Redness
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-white/90">2. AI Skin Tone Analysis</span>
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 6-Swatch Palette
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-white/90">3. AI Clothes Virtual Try-On (Full Body)</span>
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Full-Body Silhouette
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-white/90">4. AI Clothes Virtual Try-On (Upper Body)</span>
            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Upper-Body Drape
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-white/40">
            <span className="text-white/50">AI Makeup Virtual Try-On</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white/50 text-[10px] font-semibold tracking-wider">
              ROADMAP
            </span>
          </div>
        </div>
      </div>

      {/* Gemini Agent Loop & Self-Correction Engine */}
      <div className="mb-4">
        <div className="text-xs font-semibold tracking-wider uppercase text-white/70 mb-2 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#E5BA82]" />
          <span>Gemini Reasoning & Self-Correction</span>
        </div>

        <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-[11px] font-mono space-y-1.5 leading-relaxed">
          <div className="text-[#E5BA82]">• Model: {telemetry.geminiModel}</div>
          <div className="text-white/80">• Roles: Planner (JSON) → Scorer → Critic → Copywriter</div>
          <div className="text-emerald-400">• Scoring Math: CIEDE2000 ΔE (40pt) + Occasion (25pt) + Budget (15pt) + Skin Safety (20pt) + Taste Memory (±10pt)</div>
          <div className="text-rose-400">• Self-Correction Trigger: ΔE &gt; 40 or clash with skin redness/oiliness or Taste Memory conflict → auto-swap item</div>
        </div>
      </div>

      {/* Live YouCam Task Trace Log with Full Task IDs (>=16px for 1080p recording readability) */}
      {telemetry.recentTasks && telemetry.recentTasks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-xs font-semibold tracking-wider uppercase text-[#E5BA82] mb-2 flex items-center justify-between">
            <span>Live YouCam Task Trace IDs (4 S2S Calls)</span>
            <span className="text-[10px] text-emerald-400 font-mono">FOUR LIVE S2S</span>
          </div>
          <div className="space-y-2.5 max-h-48 overflow-y-auto font-mono pr-1">
            {telemetry.recentTasks.map((t, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-black/70 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#E5BA82] font-semibold">{t.endpoint}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'success' || t.status === 'youcam-live' ? 'text-emerald-300 bg-emerald-500/20' : 'text-amber-300 bg-amber-500/20'}`}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[16px] text-emerald-400 font-mono font-bold break-all select-all leading-snug tracking-tight">
                  {t.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
