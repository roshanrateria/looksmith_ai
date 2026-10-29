import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, IndianRupee, Tag } from 'lucide-react';

interface OccasionViewProps {
  initialOccasion?: string;
  initialBudget?: number;
  onProceed: (occasion: string, budget: number) => void;
}

export const OccasionView: React.FC<OccasionViewProps> = ({
  initialOccasion = "Cousin's wedding, evening, under ₹6000",
  initialBudget = 6000,
  onProceed,
}) => {
  const [occasionText, setOccasionText] = useState(initialOccasion);
  const [budget, setBudget] = useState(initialBudget);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const occasionPresets = [
    "Cousin's wedding, evening, under ₹6000",
    'Sunset Rooftop Cocktail',
    'Art Gallery Soirée',
    'Weekend Linen Brunch',
    'Formal Boardroom Meeting',
    'Casual Coffee & Bookshop',
  ];

  const rotatingPlaceholders = [
    "e.g. Sister's sangeet celebration, rich silk, under ₹8000",
    'e.g. Sunday coastal brunch, relaxed linen, breathable',
    'e.g. Autumn rooftop dinner, tailored blazer, warm palette',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % rotatingPlaceholders.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [rotatingPlaceholders.length]);

  const handleBudgetChange = (val: number) => {
    setBudget(val);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-[var(--canvas)] animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-full">
            Step 3 of 3 • Occasion & Budget
          </span>
          <span className="text-xs text-[var(--ink-3)]">Wardrobe Intent</span>
        </div>

        <h2 className="font-display text-3xl text-[var(--ink)] mb-1">
          Where are you heading?
        </h2>
        <p className="text-xs text-[var(--ink-2)] mb-5">
          Tell us the setting. LOOKSMITH aligns formality, silhouette, and your skin palette.
        </p>

        {/* Free Text Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
            Describe the occasion or mood
          </label>
          <div className="relative">
            <textarea
              value={occasionText}
              onChange={(e) => setOccasionText(e.target.value)}
              placeholder={rotatingPlaceholders[placeholderIndex]}
              rows={2}
              className="w-full p-3 rounded-2xl bg-[var(--surface)] border border-[var(--hairline)] text-sm text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--accent)] transition resize-none shadow-xs"
            />
          </div>
        </div>

        {/* Quick Occasion Chips */}
        <div className="mb-6">
          <label className="block text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-2">
            Popular Occasion Filters
          </label>
          <div className="flex flex-wrap gap-2">
            {occasionPresets.map((preset) => {
              const isSelected = occasionText === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setOccasionText(preset)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                      : 'bg-[var(--surface)] text-[var(--ink-2)] border-[var(--hairline)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget Slider */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--hairline)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Outfit Budget Target</span>
            </span>
            <span className="tabular-nums text-sm font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 rounded-lg">
              ₹{budget.toLocaleString('en-IN')}
            </span>
          </div>

          <input
            type="range"
            min={2000}
            max={15000}
            step={500}
            value={budget}
            onChange={(e) => handleBudgetChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
          />

          <div className="flex justify-between text-[10px] text-[var(--ink-3)] tabular-nums mt-1.5">
            <span>₹2,000 (Casual)</span>
            <span>₹6,000 (Festive)</span>
            <span>₹15,000 (Luxury Gala)</span>
          </div>
        </div>
      </div>

      {/* Launch CTA */}
      <div className="pt-4 border-t border-[var(--hairline)]">
        <button
          onClick={() => onProceed(occasionText || "Cousin's wedding, evening, under ₹6000", budget)}
          className="w-full h-13 rounded-[14px] bg-[var(--accent)] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#E5BA82]" />
          <span>Launch AI Stylist Agent</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
