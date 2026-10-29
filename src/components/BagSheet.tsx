import React from 'react';
import { ShoppingBag, X, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Product } from '../utils/catalogAdapter';

interface BagSheetProps {
  items: Product[];
  brandName?: string;
  onClose: () => void;
  onRemoveItem: (sku: string) => void;
  onCheckout: () => void;
}

export const BagSheet: React.FC<BagSheetProps> = ({
  items,
  brandName = 'Meridian Mart',
  onClose,
  onRemoveItem,
  onCheckout,
}) => {
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end animate-fadeIn">
      <div className="w-full bg-[var(--canvas)] rounded-t-[28px] p-5 shadow-2xl animate-slideUp max-h-[90%] flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="font-display text-2xl text-[var(--ink)]">Your Styled Bag</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--ink-3)]">
              Your bag is empty. Add a look from the carousel!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--hairline)]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover"
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

                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-xs font-semibold text-[var(--ink)]">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.sku)}
                      className="p-1 text-[var(--ink-3)] hover:text-rose-500 cursor-pointer"
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Summary & Checkout CTA */}
        <div className="pt-4 border-t border-[var(--hairline)] mt-4">
          <div className="space-y-1.5 mb-4 text-xs">
            <div className="flex justify-between text-[var(--ink-2)]">
              <span>Subtotal ({items.length} items)</span>
              <span className="tabular-nums font-semibold">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[var(--ink-2)]">
              <span>Standard Insured Shipping</span>
              <span className="text-[var(--success)] font-medium">Complimentary</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-[var(--ink)] pt-2 border-t border-[var(--hairline)]">
              <span>Estimated Total</span>
              <span className="tabular-nums text-base font-bold text-[var(--accent)]">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full h-13 rounded-xl bg-[var(--accent)] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
          >
            <span>Checkout on {brandName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
