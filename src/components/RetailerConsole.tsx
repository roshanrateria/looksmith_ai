import React, { useState } from 'react';
import {
  Sliders,
  Copy,
  Check,
  TrendingUp,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  Code2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface RetailerConsoleProps {
  onBackToApp: () => void;
}

export const RetailerConsole: React.FC<RetailerConsoleProps> = ({ onBackToApp }) => {
  const [selectedBrand, setSelectedBrand] = useState<'meridian' | 'northloom'>('meridian');
  const [accentColor, setAccentColor] = useState('#1F3A34');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const brandConfigs = {
    meridian: {
      name: 'Meridian Mart',
      type: 'Luxury Multi-Brand Marketplace',
      defaultAccent: '#1F3A34',
      catalogSize: '62 Products',
    },
    northloom: {
      name: 'Northloom Denim Co.',
      type: 'Single-Brand Heritage Apparel',
      defaultAccent: '#1E293B',
      catalogSize: '38 Products',
    },
  };

  const currentBrand = brandConfigs[selectedBrand];

  const embedSnippet = `<script 
  src="${window.location.origin}/looksmith.js" 
  data-key="pk_${selectedBrand}_2026" 
  data-theme="${selectedBrand}"
></script>`;

  const handleCopySnippet = () => {
    navigator.clipboard?.writeText(embedSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-[#14110F] p-4 sm:p-8 font-ui">
      <div className="max-w-5xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-black/10 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="p-2 rounded-xl bg-white border border-black/10 hover:bg-neutral-100 transition cursor-pointer"
              aria-label="Back to LOOKSMITH App"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold tracking-tight">LOOKSMITH Retailer Console</h1>
                <span className="text-[11px] font-semibold tracking-wider uppercase bg-[#1F3A34] text-white px-2.5 py-0.5 rounded-full">
                  B2B Portal
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Configure your white-label AI Stylist widget, brand tokens, and embed tags.
              </p>
            </div>
          </div>

          <a
            href="/demo-store.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F3A34] text-white text-xs font-medium hover:opacity-95 transition cursor-pointer"
          >
            <span>Preview Live Host Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Operational Architecture Tiles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-neutral-500">
              Pilot Operational Architecture
            </h2>
            <span className="text-[11px] text-neutral-400 italic">
              Verified autonomous styling pipeline configuration
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                <span>Active Catalog SKUs</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-mono text-2xl font-bold text-neutral-900">17 Items</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">Multi-brand storefront</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                <span>Color Harmony Engine</span>
                <RotateCcw className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-mono text-2xl font-bold text-neutral-900">CIEDE2000</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">Undertone math verification</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                <span>Ensemble Purchasing</span>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-mono text-2xl font-bold text-neutral-900">One-Click</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">postMessage cart sync</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 text-xs mb-1">
                <span>Live YouCam S2S</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-mono text-2xl font-bold text-neutral-900">4 APIs</div>
              <div className="text-[11px] text-neutral-500 font-medium mt-1">Skin, tone, and clothes VTO</div>
            </div>
          </div>
        </div>

        {/* Main Settings & Embed Code Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Retailer Brand & Token Selector */}
          <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-xs space-y-6">
            <h3 className="font-serif text-xl font-medium text-neutral-900">
              White-Label Brand Selection
            </h3>

            {/* Brand Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedBrand('meridian');
                  setAccentColor(brandConfigs.meridian.defaultAccent);
                }}
                className={`p-4 rounded-2xl text-left border transition cursor-pointer ${
                  selectedBrand === 'meridian'
                    ? 'border-[#1F3A34] bg-emerald-50/40 ring-2 ring-[#1F3A34]/20'
                    : 'border-black/10 hover:bg-neutral-50'
                }`}
              >
                <div className="font-serif text-base font-semibold text-neutral-900">Meridian Mart</div>
                <div className="text-[11px] text-neutral-500">Marketplace Feed</div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#1F3A34]" />
                  <span className="text-[10px] font-mono text-neutral-600">Forest Emerald</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedBrand('northloom');
                  setAccentColor(brandConfigs.northloom.defaultAccent);
                }}
                className={`p-4 rounded-2xl text-left border transition cursor-pointer ${
                  selectedBrand === 'northloom'
                    ? 'border-[#1E293B] bg-slate-50/50 ring-2 ring-[#1E293B]/20'
                    : 'border-black/10 hover:bg-neutral-50'
                }`}
              >
                <div className="font-serif text-base font-semibold text-neutral-900">Northloom Denim</div>
                <div className="text-[11px] text-neutral-500">Single Brand Feed</div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#1E293B]" />
                  <span className="text-[10px] font-mono text-neutral-600">Deep Indigo</span>
                </div>
              </button>
            </div>

            {/* Token Adjustments */}
            <div className="space-y-4 pt-2 border-t border-black/10">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Brand Primary Accent Token (<code>--accent</code>)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-black/10"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="font-mono text-xs px-3 py-2 rounded-xl bg-neutral-100 border border-black/10 w-32"
                  />
                  <span className="text-xs text-neutral-500">
                    Will dynamically adapt to shopper's skin tone palette on scan.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Embed Code Snippet & Host Integration */}
          <div className="p-6 rounded-3xl bg-white border border-black/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-xl font-medium text-neutral-900 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-neutral-700" />
                  <span>One-Script Drop-in Embed</span>
                </h3>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Zero Config
                </span>
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                Add this single tag to your store header or Google Tag Manager. It injects the launcher button, manages the secure iframe modal, and passes chosen SKUs directly to your checkout.
              </p>

              {/* Code Box */}
              <div className="relative rounded-2xl bg-[#0F0E0D] p-4 text-[#FAF8F5] font-mono text-xs overflow-x-auto border border-black/20 mb-4">
                <pre>{embedSnippet}</pre>
                <button
                  onClick={handleCopySnippet}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Copy embed snippet"
                >
                  {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* postMessage Communication Specs */}
              <div className="p-3 rounded-2xl bg-neutral-50 border border-black/5 text-xs space-y-1">
                <div className="font-semibold text-neutral-800">Supported postMessage events:</div>
                <div className="font-mono text-[11px] text-neutral-600">• looksmith:ready — Widget loaded</div>
                <div className="font-mono text-[11px] text-neutral-600">• looksmith:add-to-bag {'{ skus: [] }'} — Shopper cart handoff</div>
                <div className="font-mono text-[11px] text-neutral-600">• looksmith:close — Modal dismiss</div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/demo-store.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl bg-[#1F3A34] text-white text-xs font-medium flex items-center justify-center gap-2 hover:opacity-95 transition cursor-pointer"
              >
                <span>Launch Fictional Retailer Demo Store</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
