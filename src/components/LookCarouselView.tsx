import React, { useState } from 'react';
import {
  Heart,
  ThumbsDown,
  ShoppingBag,
  Share2,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Sliders,
  Eye,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import { LookBlueprint } from '../data/demoPersonas';
import { Product } from '../utils/catalogAdapter';
import { ToneProfile } from '../utils/skinRules';
import { TasteMemory } from '../utils/tasteMemory';

interface LookCarouselViewProps {
  looks: LookBlueprint[];
  userImage: string;
  tone: ToneProfile;
  tasteChipText: string | null;
  tasteMemory?: TasteMemory;
  onLikeLook: (look: LookBlueprint) => void;
  onDislikeLook: (look: LookBlueprint) => void;
  onAddToBag: (look: LookBlueprint) => void;
  onShareLook: (look: LookBlueprint) => void;
  onSwapItem: (lookId: string, oldItemSku: string, newItem: Product) => void;
  onReplanWithTaste?: () => void;
  catalog: Product[];
  onBackToOccasion?: () => void;
}

export const LookCarouselView: React.FC<LookCarouselViewProps> = ({
  looks,
  userImage,
  tone,
  tasteChipText,
  tasteMemory,
  onLikeLook,
  onDislikeLook,
  onAddToBag,
  onShareLook,
  onSwapItem,
  onReplanWithTaste,
  catalog,
  onBackToOccasion,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPeekingOriginal, setIsPeekingOriginal] = useState(false);
  const [showSkinSafeSheet, setShowSkinSafeSheet] = useState(false);
  const [swappingProduct, setSwappingProduct] = useState<Product | null>(null);
  const [makeupIntensity, setMakeupIntensity] = useState(50);
  const [likedLooks, setLikedLooks] = useState<Set<string>>(new Set());
  const [dislikedLooks, setDislikedLooks] = useState<Set<string>>(new Set());
  const [heartBloom, setHeartBloom] = useState(false);
  const [tasteNotice, setTasteNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setTasteNotice(msg);
    setTimeout(() => setTasteNotice(null), 3500);
  };

  const currentLook = looks[activeIndex] || looks[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % looks.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + looks.length) % looks.length);
  };

  const handleLike = () => {
    setHeartBloom(true);
    setTimeout(() => setHeartBloom(false), 800);
    setLikedLooks((prev) => new Set(prev).add(currentLook.id));
    setDislikedLooks((prev) => {
      const next = new Set(prev);
      next.delete(currentLook.id);
      return next;
    });
    onLikeLook(currentLook);
    triggerNotice('Taste recorded: Prioritizing this aesthetic in future plans.');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const handleDislike = () => {
    setDislikedLooks((prev) => new Set(prev).add(currentLook.id));
    setLikedLooks((prev) => {
      const next = new Set(prev);
      next.delete(currentLook.id);
      return next;
    });
    onDislikeLook(currentLook);
    triggerNotice('Taste recorded: Excluded from Gemini Planner priors.');
  };

  const hasTasteSignals = Boolean(
    tasteMemory &&
      (tasteMemory.likedLookCount > 0 ||
        tasteMemory.dislikedLookCount > 0 ||
        (tasteMemory.dislikedSkus && tasteMemory.dislikedSkus.length > 0))
  );

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-[var(--canvas)] animate-fadeIn relative">
      {/* Top Bar with Brand, Taste Memory Chip, Re-style CTA, and Pagination */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <div className="flex items-center gap-2">
          {onBackToOccasion && (
            <button
              onClick={onBackToOccasion}
              className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] transition cursor-pointer"
              aria-label="Back to Occasion"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="font-serif text-lg font-medium text-[var(--ink)]">LOOKSMITH</span>
        </div>

        {/* Dynamic Taste Learning Chip & Re-style Button */}
        <div className="flex items-center gap-1.5">
          {tasteChipText && (
            <div className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[10px] font-medium text-[var(--accent)] border border-[var(--accent)]/20 animate-slideDown max-w-[130px] truncate">
              {tasteChipText}
            </div>
          )}

          {hasTasteSignals && onReplanWithTaste && (
            <button
              onClick={onReplanWithTaste}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--accent)] text-white text-[10px] font-semibold hover:opacity-95 shadow-xs transition cursor-pointer"
              title="Generate new looks with updated taste memory"
            >
              <Sparkles className="w-3 h-3 text-[#E5BA82]" />
              <span>Re-plan</span>
            </button>
          )}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center gap-1.5">
          {looks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                idx === activeIndex
                  ? 'w-5 bg-[var(--accent)]'
                  : 'bg-[var(--ink-3)]/30 hover:bg-[var(--ink-3)]'
              }`}
              aria-label={`Go to look ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Taste Learning Feedback Toast */}
      {tasteNotice && (
        <div className="absolute top-14 inset-x-4 z-40 bg-[#1A1816] text-[#FAF8F5] text-xs px-3 py-2 rounded-xl border border-white/10 shadow-lg flex items-center justify-between animate-slideDown">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E5BA82] shrink-0" />
            <span className="text-[11px] leading-tight">{tasteNotice}</span>
          </div>
          {onReplanWithTaste && (
            <button
              onClick={onReplanWithTaste}
              className="ml-2 text-[10px] font-semibold text-[#E5BA82] hover:underline shrink-0"
            >
              Re-plan now →
            </button>
          )}
        </div>
      )}

      {/* Look Card Main Container */}
      <div className="flex-1 flex flex-col justify-between py-1">
        {/* Hero Try-On Image with Before/After peek */}
        <div className="relative rounded-[24px] overflow-hidden bg-[#E5E7EB] aspect-[3/4] shadow-md border border-[var(--hairline)] select-none">
          {/* Main Virtual Try-On Image */}
          <img
            src={isPeekingOriginal ? currentLook.originalImageUrl || userImage : currentLook.tryOnImageUrl}
            alt={currentLook.name}
            className="w-full h-full object-cover object-top transition-transform duration-300"
          />

          {/* Heart Bloom Animation */}
          {heartBloom && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping">
              <Heart className="w-20 h-20 text-rose-500 fill-rose-500 drop-shadow-xl" />
            </div>
          )}

          {/* Press-and-Hold Before/After Peek Badge */}
          <div className="absolute top-3 left-3 z-20">
            <button
              onMouseDown={() => setIsPeekingOriginal(true)}
              onMouseUp={() => setIsPeekingOriginal(false)}
              onTouchStart={() => setIsPeekingOriginal(true)}
              onTouchEnd={() => setIsPeekingOriginal(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-medium border border-white/20 active:scale-95 transition cursor-pointer"
            >
              <Eye className="w-3 h-3 text-[#E5BA82]" />
              <span>{isPeekingOriginal ? 'Original Photo (Before VTO)' : 'Hold to Peek Before'}</span>
            </button>
          </div>

          {/* Skin-Safe Shield Badge (Tap to open skin explanation sheet) */}
          <button
            onClick={() => setShowSkinSafeSheet(true)}
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/90 backdrop-blur text-white text-xs font-medium border border-white/20 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#E5BA82]" />
            <span>Match Score: {currentLook.score}</span>
          </button>

          {/* Gradient Overlay at bottom for Name & Price */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white z-10 flex items-end justify-between">
            <div>
              <div className="text-[11px] font-medium tracking-wide uppercase text-[#E5BA82]">
                {currentLook.styleVibe}
              </div>
              <h3 className="font-display text-2xl font-normal leading-tight text-white">
                {currentLook.name}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/70">Complete Look</div>
              <div className="tabular-nums text-lg font-semibold text-white">
                ₹{currentLook.totalPrice.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Prev/Next arrows overlay */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur transition cursor-pointer z-20"
            aria-label="Previous Look"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur transition cursor-pointer z-20"
            aria-label="Next Look"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Why this works editorial statement */}
        <div className="my-2 p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--hairline)]">
          <p className="text-[11px] text-[var(--ink-2)] leading-relaxed italic">
            "{currentLook.whyThisWorks}"
          </p>
        </div>

        {/* Item Chips with Swap Action */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-1.5">
            <span>Ensemble Items (Tap to Swap)</span>
            <span>{currentLook.items.length} pieces</span>
          </div>

          <div className="space-y-1.5">
            {currentLook.items.map((item) => (
              <div
                key={item.sku}
                onClick={() => setSwappingProduct(item)}
                className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface)] border border-[var(--hairline)] hover:border-[var(--accent)] hover:shadow-xs transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[var(--ink)] leading-snug line-clamp-1">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-[var(--ink-3)]">
                      {item.brand} • <span style={{ color: item.colorHex }}>●</span> {item.colorName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="tabular-nums text-xs font-semibold text-[var(--ink)]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                  <div className="p-1 rounded-md bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--accent)]">
                    <RefreshCw className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Makeup Intensity Slider */}
        <div className="mt-2 p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--hairline)]">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--ink)] mb-1">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3 h-3 text-[var(--accent)]" />
              <span>Makeup Intensity: {makeupIntensity}%</span>
            </span>
            <span className="text-[10px] text-[var(--ink-3)]">
              {makeupIntensity <= 40 ? 'Soft Sheer' : makeupIntensity >= 70 ? 'Bold Evening' : 'Natural Satin'}
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={90}
            step={5}
            value={makeupIntensity}
            onChange={(e) => setMakeupIntensity(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
          />
        </div>
      </div>

      {/* Bottom Action CTAs: Like/Dislike, Add to Bag, Share */}
      <div className="pt-2 border-t border-[var(--hairline)] flex items-center gap-2">
        <button
          onClick={handleDislike}
          className="w-12 h-12 rounded-xl bg-[var(--surface-2)] text-[var(--ink-3)] hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
          aria-label="Dislike Look"
        >
          <ThumbsDown className="w-4 h-4" />
        </button>

        <button
          onClick={handleLike}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition cursor-pointer ${
            likedLooks.has(currentLook.id)
              ? 'bg-rose-50 text-rose-500'
              : 'bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-rose-500 hover:bg-rose-50'
          }`}
          aria-label="Like Look"
        >
          <Heart className={`w-4 h-4 ${likedLooks.has(currentLook.id) ? 'fill-rose-500' : ''}`} />
        </button>

        <button
          onClick={() => onAddToBag(currentLook)}
          className="flex-1 h-12 rounded-xl bg-[var(--accent)] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs hover:opacity-95 active:scale-[0.98] transition cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add Complete Look to Bag</span>
        </button>

        <button
          onClick={() => onShareLook(currentLook)}
          className="w-12 h-12 rounded-xl bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)] flex items-center justify-center transition cursor-pointer"
          aria-label="Share Look Card"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Skin-Safe Bottom Sheet Modal */}
      {showSkinSafeSheet && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end animate-fadeIn">
          <div className="w-full bg-[var(--canvas)] rounded-t-[28px] p-5 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--accent)]" />
                <h4 className="font-display text-xl text-[var(--ink)]">Skin-Safe Certification</h4>
              </div>
              <button
                onClick={() => setShowSkinSafeSheet(false)}
                className="p-1 rounded-full text-[var(--ink-3)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--hairline)] mb-4">
              <div className="text-xs font-semibold text-[var(--accent)] mb-1">
                Badge: {currentLook.skinSafeBadge}
              </div>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed mb-2">
                Curated specifically for your skin profile. The makeup finish ({currentLook.makeupFinish}) was selected because your skin registers balanced oiliness in the T-zone. Breathable natural fibers prevent occlusive sweat traps.
              </p>
              <div className="text-[10px] text-[var(--ink-3)]">
                * Based on cosmetic skin and tone analysis. Not medical advice.
              </div>
            </div>

            <button
              onClick={() => setShowSkinSafeSheet(false)}
              className="w-full h-11 rounded-xl bg-[var(--accent)] text-white text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Item Swap Bottom Sheet Modal */}
      {swappingProduct && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end animate-fadeIn">
          <div className="w-full bg-[var(--canvas)] rounded-t-[28px] p-5 shadow-2xl animate-slideUp max-h-[85%] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-display text-xl text-[var(--ink)]">Swap Item</h4>
                <p className="text-xs text-[var(--ink-3)]">
                  Replace "{swappingProduct.title}" with an alternative
                </p>
              </div>
              <button
                onClick={() => setSwappingProduct(null)}
                className="p-1 rounded-full text-[var(--ink-3)] hover:text-[var(--ink)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {catalog
                .filter((p) => p.sku !== swappingProduct.sku && p.category === swappingProduct.category)
                .slice(0, 4)
                .map((alt) => (
                  <div
                    key={alt.sku}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--hairline)] hover:border-[var(--accent)] transition cursor-pointer"
                    onClick={() => {
                      onSwapItem(currentLook.id, swappingProduct.sku, alt);
                      setSwappingProduct(null);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img src={alt.imageUrl} alt={alt.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs font-semibold text-[var(--ink)]">{alt.title}</div>
                        <div className="text-[10px] text-[var(--ink-3)]">
                          {alt.brand} • <span style={{ color: alt.colorHex }}>●</span> {alt.colorName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="tabular-nums text-xs font-semibold text-[var(--ink)]">
                        ₹{alt.price.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-[var(--accent)] font-medium">Select Swap</span>
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setSwappingProduct(null)}
              className="w-full h-11 rounded-xl bg-[var(--surface-2)] text-[var(--ink-2)] text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
