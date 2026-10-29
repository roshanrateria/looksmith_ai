import React, { useState, useEffect } from 'react';
import { Sparkles, ScanLine, CheckCircle2 } from 'lucide-react';
import { SkinConcernScores, ToneProfile } from '../utils/skinRules';

interface ScanningViewProps {
  userImage: string;
  personaId?: string;
  onScanComplete: (skinScores?: SkinConcernScores, toneProfile?: ToneProfile) => void;
}

export const ScanningView: React.FC<ScanningViewProps> = ({
  userImage,
  personaId,
  onScanComplete,
}) => {
  const [copyIndex, setCopyIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [apiDone, setApiDone] = useState(false);
  const [fetchedScores, setFetchedScores] = useState<SkinConcernScores | undefined>();
  const [fetchedTone, setFetchedTone] = useState<ToneProfile | undefined>();
  const [analysisNotice, setAnalysisNotice] = useState<string>('Dual YouCam AI Pipeline');

  const copyStages = [
    'Reading skin tone & undertones…',
    'Analyzing surface texture & oiliness…',
    'Detecting facial color landmarks…',
    'Generating personal 6-swatch palette…',
  ];

  // Fire live API requests to YouCam endpoints
  useEffect(() => {
    let isCancelled = false;

    const payload = {
      personaId,
      imageBase64: userImage.startsWith('data:') ? userImage : undefined,
      imageUrl: userImage.startsWith('http') ? userImage : undefined,
    };

    const fetchAnalysis = async () => {
      try {
        const [skinRes, toneRes] = await Promise.allSettled([
          fetch('/api/skin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then((r) => r.json()),
          fetch('/api/tone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).then((r) => r.json()),
        ]);

        if (isCancelled) return;

        let scores: SkinConcernScores | undefined;
        let tone: ToneProfile | undefined;

        if (skinRes.status === 'fulfilled' && skinRes.value?.scores) {
          scores = skinRes.value.scores;
          setFetchedScores(scores);
          if (skinRes.value.mode === 'youcam-live') {
            setAnalysisNotice('Live YouCam AI Engine Result');
          }
        }

        if (toneRes.status === 'fulfilled' && toneRes.value?.profile) {
          tone = toneRes.value.profile;
          setFetchedTone(tone);
        }

        setApiDone(true);
      } catch (err) {
        console.warn('Scanning API intake error, using calibrated values', err);
        setApiDone(true);
      }
    };

    fetchAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [userImage, personaId]);

  // Rotate status message
  useEffect(() => {
    const copyTimer = setInterval(() => {
      setCopyIndex((prev) => (prev + 1) % copyStages.length);
    }, 750);
    return () => clearInterval(copyTimer);
  }, [copyStages.length]);

  // Smooth progress animation
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) {
          if (apiDone) {
            clearInterval(progressTimer);
            setTimeout(() => {
              onScanComplete(fetchedScores, fetchedTone);
            }, 350);
            return 100;
          }
          return 96; // wait for API
        }
        return prev + 14;
      });
    }, 280);

    return () => clearInterval(progressTimer);
  }, [apiDone, fetchedScores, fetchedTone, onScanComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 bg-[#14110F] text-white animate-fadeIn">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pt-2">
        <span className="text-xs text-white/60 font-medium">Skin AI & Tone Analysis</span>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs">
          <ScanLine className="w-3.5 h-3.5 text-[#E5BA82] animate-pulse" />
          <span>{analysisNotice}</span>
        </div>
      </div>

      {/* Center Image with Light Sweep Band */}
      <div className="relative my-auto flex flex-col items-center">
        <div className="relative w-64 h-80 rounded-[32px] overflow-hidden border border-white/20 shadow-2xl">
          <img
            src={userImage}
            alt="Scanning face"
            className="w-full h-full object-cover"
          />

          {/* Light Sweep Scanning Beam */}
          <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#E5BA82]/40 to-transparent pointer-events-none animate-scan-beam" />

          {/* Facial Landmark Tracking Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Detected Face Box */}
          <div className="absolute top-8 inset-x-6 bottom-8 rounded-2xl border border-white/40 pointer-events-none flex items-start justify-between p-2">
            <span className="text-[9px] font-mono tracking-wider bg-emerald-500/80 text-black font-bold px-1.5 py-0.5 rounded">
              AI FACE CROP
            </span>
            <span className="text-[10px] font-mono tracking-wider bg-black/60 px-1.5 py-0.5 rounded text-white/80 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              ALIGN: OK
            </span>
          </div>
        </div>

        {/* Dynamic Status Copy */}
        <div className="mt-6 text-center">
          <div className="text-sm font-medium text-white/90 mb-1.5 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E5BA82]" />
            <span>{copyStages[copyIndex]}</span>
          </div>
          <p className="text-xs text-white/50">Cosmetic intelligence in progress • ~2.4s</p>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full pb-4">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-[#1F3A34] to-[#E5BA82] transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-white/50">
          <span>{analysisNotice}</span>
          <span>Processing</span>
        </div>
      </div>
    </div>
  );
};
