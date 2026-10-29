import React from 'react';
import { Shield, Lock, EyeOff, Trash2, CheckCircle2 } from 'lucide-react';

interface ConsentSheetProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentSheet: React.FC<ConsentSheetProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="flex-1 flex flex-col justify-between p-6 animate-slideUp">
      <div>
        <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] mb-4 border border-[var(--hairline)]">
          <Shield className="w-6 h-6" />
        </div>

        <h2 className="font-display text-3xl text-[var(--ink)] mb-2">
          Your Privacy First
        </h2>
        <p className="text-xs text-[var(--ink-2)] mb-6 leading-relaxed">
          Before taking or uploading your photo, here is exactly how your data is handled with complete transparency.
        </p>

        <div className="space-y-3.5">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--hairline)]">
            <Lock className="w-4 h-4 text-[var(--success)] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[var(--ink)]">In-Memory Session Only</div>
              <div className="text-[11px] text-[var(--ink-3)]">
                Your selfie is analyzed in real-time and never saved to persistent retailer servers.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--hairline)]">
            <EyeOff className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[var(--ink)]">Cosmetic Intelligence Only</div>
              <div className="text-[11px] text-[var(--ink-3)]">
                Scores reflect cosmetic skin and undertone harmonies. We make zero medical or diagnostic claims.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--hairline)]">
            <Trash2 className="w-4 h-4 text-[var(--ink-2)] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[var(--ink)]">One-Click Delete Anytime</div>
              <div className="text-[11px] text-[var(--ink-3)]">
                You can wipe all session results, taste memory, and cached previews with a single tap in settings.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 space-y-2.5">
        <button
          onClick={onAccept}
          className="w-full h-13 rounded-[14px] bg-[var(--accent)] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I Agree & Continue</span>
        </button>
        <button
          onClick={onDecline}
          className="w-full h-11 rounded-[14px] bg-transparent text-[var(--ink-3)] font-medium text-xs hover:text-[var(--ink)] transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
