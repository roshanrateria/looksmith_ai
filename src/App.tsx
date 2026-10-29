import React, { useState, useEffect } from 'react';
import { DeviceFrame } from './components/DeviceFrame';
import { WelcomeView } from './components/WelcomeView';
import { ConsentSheet } from './components/ConsentSheet';
import { CaptureView } from './components/CaptureView';
import { ScanningView } from './components/ScanningView';
import { ProfileView } from './components/ProfileView';
import { OccasionView } from './components/OccasionView';
import { AgentStageView } from './components/AgentStageView';
import { LookCarouselView } from './components/LookCarouselView';
import { BagSheet } from './components/BagSheet';
import { ShareCardModal } from './components/ShareCardModal';
import { SettingsModal } from './components/SettingsModal';
import { RetailerConsole } from './components/RetailerConsole';
import { UnderTheHoodPanel } from './components/UnderTheHoodPanel';
import { DEMO_PERSONAS, DemoPersona, LookBlueprint } from './data/demoPersonas';
import { deriveDynamicAccent, SkinConcernScores, ToneProfile } from './utils/skinRules';
import { Product } from './utils/catalogAdapter';
import {
  TasteMemory,
  INITIAL_TASTE_MEMORY,
  updateTasteWithLook,
  updateTasteWithSwap,
  getTasteLearningSummary,
} from './utils/tasteMemory';
import { Settings, ShoppingBag } from 'lucide-react';

type Screen =
  | 'welcome'
  | 'consent'
  | 'capture'
  | 'scanning'
  | 'profile'
  | 'occasion'
  | 'agent_stage'
  | 'carousel'
  | 'console';

const SAMPLE_FULL_BODY_URL =
  'https://plugins-media.makeupar.com/strapi/assets/small_clothes_09_908428b0fe.jpg';

const INITIAL_SKIN_SCORES: SkinConcernScores = {
  oiliness: 38,
  pores: 34,
  moisture: 72,
  redness: 18,
  texture: 24,
  spots: 14,
};

const INITIAL_TONE_PROFILE: ToneProfile = {
  skinToneHex: '#C7A594',
  undertone: 'warm',
  eyeColorHex: '#4A3B31',
  eyebrowColorHex: '#3B2E26',
  lipColorHex: '#B6635F',
  hairColorHex: '#6E523F',
  paletteHexes: ['#C7A594', '#9D6B53', '#E0C5B5', '#2C4A3E', '#8E3B33', '#1F3A34'],
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedPersona, setSelectedPersona] = useState<DemoPersona | null>(null);
  const [userImage, setUserImage] = useState<string>(SAMPLE_FULL_BODY_URL);
  const [croppedFaceImage, setCroppedFaceImage] = useState<string | null>(null);
  const [skinScores, setSkinScores] = useState<SkinConcernScores>(INITIAL_SKIN_SCORES);
  const [toneProfile, setToneProfile] = useState<ToneProfile>(INITIAL_TONE_PROFILE);
  const [occasion, setOccasion] = useState<string>("Cousin's wedding, evening, under ₹6000");
  const [budget, setBudget] = useState<number>(6000);
  const [looks, setLooks] = useState<LookBlueprint[]>(DEMO_PERSONAS[0].precomputedLooks);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [bagItems, setBagItems] = useState<Product[]>([]);
  const [tasteMemory, setTasteMemory] = useState<TasteMemory>(() => {
    try {
      const saved = localStorage.getItem('looksmith_taste_memory');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return INITIAL_TASTE_MEMORY;
  });

  // Persist taste memory across sessions
  useEffect(() => {
    try {
      localStorage.setItem('looksmith_taste_memory', JSON.stringify(tasteMemory));
    } catch (e) {
      // ignore
    }
  }, [tasteMemory]);

  // Modals & UI states
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [shareLook, setShareLook] = useState<LookBlueprint | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showInspector, setShowInspector] = useState(true);

  // Check URL params for widget mode or console view
  const isWidgetMode = new URLSearchParams(window.location.search).get('widget') === '1';
  const initialView = new URLSearchParams(window.location.search).get('view');

  useEffect(() => {
    if (initialView === 'console') {
      setCurrentScreen('console');
    }
  }, [initialView]);

  // Load catalog on mount
  useEffect(() => {
    fetch('/api/catalog')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setCatalog(data.products);
        }
      })
      .catch((e) => console.warn('Catalog load fallback', e));
  }, []);

  // Dynamic Accent Takeover: Update CSS variables whenever tone profile changes
  useEffect(() => {
    if (toneProfile && toneProfile.paletteHexes) {
      const { accentHex, accentSoft } = deriveDynamicAccent(toneProfile.paletteHexes);
      document.documentElement.style.setProperty('--accent', accentHex);
      document.documentElement.style.setProperty('--accent-soft', accentSoft);
    }
  }, [toneProfile]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persona Selection Handler
  const handleSelectPersona = (personaId: string) => {
    const p = DEMO_PERSONAS.find((item) => item.id === personaId) || DEMO_PERSONAS[0];
    setSelectedPersona(p);
    setUserImage(p.avatarUrl);
    setSkinScores(p.skinScores);
    setToneProfile(p.toneProfile);
    setOccasion(p.suggestedOccasions[0] || "Cousin's wedding, evening, under ₹6000");
    setBudget(p.defaultBudget || 6000);
    setLooks(p.precomputedLooks);
    setCurrentScreen('scanning');
  };

  // Photo Capture Handler
  const handlePhotoCaptured = (
    imgData: string,
    personaId?: string,
    croppedFaceUrl?: string
  ) => {
    setUserImage(imgData);
    setCroppedFaceImage(croppedFaceUrl || null);
    if (personaId) {
      const p = DEMO_PERSONAS.find((item) => item.id === personaId) || DEMO_PERSONAS[0];
      setSelectedPersona(p);
      setSkinScores(p.skinScores);
      setToneProfile(p.toneProfile);
      setLooks(p.precomputedLooks);
    } else {
      setSelectedPersona(null);
    }
    setCurrentScreen('scanning');
  };

  // Look Interactions
  const handleLikeLook = (look: LookBlueprint) => {
    setTasteMemory((prev) => updateTasteWithLook(prev, look.items, 'like'));
  };

  const handleDislikeLook = (look: LookBlueprint) => {
    setTasteMemory((prev) => updateTasteWithLook(prev, look.items, 'dislike'));
  };

  const handleAddToBag = (look: LookBlueprint) => {
    setBagItems((prev) => {
      const existingSkus = new Set(prev.map((i) => i.sku));
      const newItems = look.items.filter((i) => !existingSkus.has(i.sku));
      return [...prev, ...newItems];
    });
    setIsBagOpen(true);

    // If running in embedded widget, postMessage to host
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'looksmith:add-to-bag',
          skus: look.items.map((i) => i.sku),
        },
        '*'
      );
    }
  };

  const handleSwapItem = (lookId: string, oldItemSku: string, newItem: Product) => {
    const oldItem = catalog.find((c) => c.sku === oldItemSku);
    if (oldItem) {
      setTasteMemory((prev) => updateTasteWithSwap(prev, oldItem, newItem));
    }
    setLooks((prev) =>
      prev.map((l) => {
        if (l.id !== lookId) return l;
        const newItems = l.items.map((item) => (item.sku === oldItemSku ? newItem : item));
        const newPrice = newItems.reduce((sum, item) => sum + item.price, 0);
        return {
          ...l,
          items: newItems,
          totalPrice: newPrice,
          whyThisWorks: `Refreshed with ${newItem.title} for enhanced silhouette balance and personal tone harmony.`,
        };
      })
    );
  };

  // Render current active screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeView
            onStart={() => setCurrentScreen('consent')}
            onSelectPersona={handleSelectPersona}
          />
        );

      case 'consent':
        return (
          <ConsentSheet
            onAccept={() => setCurrentScreen('capture')}
            onDecline={() => setCurrentScreen('welcome')}
          />
        );

      case 'capture':
        return (
          <CaptureView
            onPhotoCaptured={handlePhotoCaptured}
            onSelectPersona={handleSelectPersona}
          />
        );

      case 'scanning':
        return (
          <ScanningView
            userImage={croppedFaceImage || userImage}
            personaId={selectedPersona?.id}
            onScanComplete={(scores, tone) => {
              if (scores) setSkinScores(scores);
              if (tone) setToneProfile(tone);
              setCurrentScreen('profile');
            }}
          />
        );

      case 'profile':
        return (
          <ProfileView
            userImage={croppedFaceImage || userImage}
            scores={skinScores}
            tone={toneProfile}
            onContinue={() => setCurrentScreen('occasion')}
          />
        );

      case 'occasion':
        return (
          <OccasionView
            initialOccasion={occasion}
            initialBudget={budget}
            onProceed={(occ, bgt) => {
              setOccasion(occ);
              setBudget(bgt);
              setCurrentScreen('agent_stage');
            }}
          />
        );

      case 'agent_stage':
        return (
          <AgentStageView
            occasion={occasion}
            budget={budget}
            personaId={selectedPersona?.id || ''}
            userImage={userImage}
            tasteMemory={tasteMemory}
            onLooksReady={(curatedLooks) => {
              setLooks(curatedLooks);
              setCurrentScreen('carousel');
            }}
          />
        );

      case 'carousel':
        return (
          <LookCarouselView
            looks={looks}
            userImage={userImage}
            tone={toneProfile}
            tasteChipText={getTasteLearningSummary(tasteMemory)}
            tasteMemory={tasteMemory}
            onLikeLook={handleLikeLook}
            onDislikeLook={handleDislikeLook}
            onAddToBag={handleAddToBag}
            onShareLook={(look) => setShareLook(look)}
            onSwapItem={handleSwapItem}
            onReplanWithTaste={() => setCurrentScreen('agent_stage')}
            catalog={catalog}
            onBackToOccasion={() => setCurrentScreen('occasion')}
          />
        );

      case 'console':
        return <RetailerConsole onBackToApp={() => setCurrentScreen('welcome')} />;

      default:
        return <WelcomeView onStart={() => setCurrentScreen('consent')} />;
    }
  };

  // If retailer console is selected full-screen
  if (currentScreen === 'console') {
    return <RetailerConsole onBackToApp={() => setCurrentScreen('welcome')} />;
  }

  return (
    <DeviceFrame
      isWidgetMode={isWidgetMode}
      brandName="MERIDIAN MART"
      onOpenConsole={() => setCurrentScreen('console')}
      showInspector={showInspector}
      onToggleInspector={() => setShowInspector(!showInspector)}
      inspectorNode={<UnderTheHoodPanel tasteMemory={tasteMemory} />}
    >
      {/* App Floating Header Utilities */}
      <div className="absolute top-3 right-4 z-40 flex items-center gap-2">
        {bagItems.length > 0 && currentScreen !== 'welcome' && (
          <button
            onClick={() => setIsBagOpen(true)}
            className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--ink)] shadow-xs border border-[var(--hairline)] flex items-center justify-center relative cursor-pointer"
            aria-label="View shopping bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[9px] font-bold flex items-center justify-center">
              {bagItems.length}
            </span>
          </button>
        )}

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--ink-2)] hover:text-[var(--ink)] shadow-xs border border-[var(--hairline)] flex items-center justify-center cursor-pointer"
          aria-label="Open settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Main Screen Container */}
      <main className="flex-1 flex flex-col relative">{renderScreen()}</main>

      {/* Bag Modal Sheet */}
      {isBagOpen && (
        <BagSheet
          items={bagItems}
          brandName="Meridian Mart"
          onClose={() => setIsBagOpen(false)}
          onRemoveItem={(sku) => setBagItems((prev) => prev.filter((i) => i.sku !== sku))}
          onCheckout={() => {
            alert('Redirecting to secure retailer checkout with ' + bagItems.length + ' items.');
            setIsBagOpen(false);
          }}
        />
      )}

      {/* Share Look Card Modal */}
      {shareLook && (
        <ShareCardModal
          look={shareLook}
          tone={toneProfile}
          brandName="MERIDIAN MART"
          onClose={() => setShareLook(null)}
        />
      )}

      {/* Settings Modal Sheet */}
      {isSettingsOpen && (
        <SettingsModal
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onClearTasteMemory={() => {
            setTasteMemory(INITIAL_TASTE_MEMORY);
            try {
              localStorage.removeItem('looksmith_taste_memory');
            } catch (e) {
              // ignore
            }
          }}
          onDeleteAllData={() => {
            setTasteMemory(INITIAL_TASTE_MEMORY);
            try {
              localStorage.removeItem('looksmith_taste_memory');
            } catch (e) {
              // ignore
            }
            setBagItems([]);
            setCurrentScreen('welcome');
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </DeviceFrame>
  );
}
