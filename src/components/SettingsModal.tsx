import React from 'react';
import { X, Trash2, Moon, Sun, RefreshCw, Shield, Info, Check } from 'lucide-react';

interface SettingsModalProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onClearTasteMemory: () => void;
  onDeleteAllData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  darkMode,
  onToggleDarkMode,
  onClearTasteMemory,
  onDeleteAllData,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end animate-fadeIn">
      <div className="w-full bg-[var(--canvas)] rounded-t-[28px] p-5 shadow-2xl animate-slideUp max-h-[85%] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl text-[var(--ink)]">Stylist Settings</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface)] border border-[var(--hairline)]">
              <div className="flex items-center gap-2.5">
                {darkMode ? <Moon className="w-4 h-4 text-[var(--accent)]" /> : <Sun className="w-4 h-4 text-[#E5BA82]" />}
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)]">Theme Appearance</div>
                  <div className="text-[10px] text-[var(--ink-3)]">
                    {darkMode ? 'Dark luxury mode' : 'Warm editorial light'}
                  </div>
                </div>
              </div>
              <button
                onClick={onToggleDarkMode}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] text-xs font-medium text-[var(--ink)] cursor-pointer"
              >
                Toggle {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Clear Taste Memory */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface)] border border-[var(--hairline)]">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-[var(--accent)]" />
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)]">Clear Taste Memory</div>
                  <div className="text-[10px] text-[var(--ink-3)]">
                    Resets learned likes, silhouettes, and color preferences
                  </div>
                </div>
              </div>
              <button
                onClick={onClearTasteMemory}
                className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-rose-50 hover:text-rose-600 text-xs font-medium text-[var(--ink)] cursor-pointer transition"
              >
                Reset
              </button>
            </div>

            {/* Delete All Data */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface)] border border-[var(--hairline)]">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <div>
                  <div className="text-xs font-semibold text-[var(--ink)]">Delete All Data</div>
                  <div className="text-[10px] text-[var(--ink-3)]">
                    Wipes photo session, profile caches, and local storage
                  </div>
                </div>
              </div>
              <button
                onClick={onDeleteAllData}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer hover:bg-rose-100 transition"
              >
                Delete
              </button>
            </div>

            {/* Hackathon Specs Info */}
            <div className="p-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)] text-xs space-y-1">
              <div className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>YouCam API Hackathon 2026</span>
              </div>
              <p className="text-[11px] text-[var(--ink-2)]">
                Dual Track Entry: Skin AI + eCommerce VTO. Powered by AI Skin Analysis, AI Skin Tone Analysis, AI Clothes VTO, and AI Makeup VTO.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-[var(--hairline)]">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-[var(--accent)] text-white text-xs font-medium cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
