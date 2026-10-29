import { SkinConcernScores, ToneProfile } from '../utils/skinRules';
import { Product } from '../utils/catalogAdapter';

export interface LookBlueprint {
  id: string;
  name: string;
  styleVibe: string;
  totalPrice: number;
  items: Product[];
  score: number;
  skinSafeBadge: string;
  whyThisWorks: string;
  makeupPatternId: string;
  makeupPatternName: string;
  makeupFinish: 'matte' | 'satin' | 'dewy' | 'sheer';
  makeupIntensity: number;
  tryOnImageUrl: string;
  originalImageUrl: string;
  selfCorrectionApplied?: {
    swappedFrom: Product;
    swappedTo: Product;
    reason: string;
  };
}

export interface DemoPersona {
  id: string;
  name: string;
  tagline: string;
  avatarUrl: string;
  fullBodyUrl: string;
  skinScores: SkinConcernScores;
  toneProfile: ToneProfile;
  suggestedOccasions: string[];
  defaultBudget: number;
  precomputedLooks: LookBlueprint[];
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'persona-maya',
    name: 'Maya',
    tagline: 'Warm Olive • T-Zone Oiliness & Pore Sensitivity',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    fullBodyUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    skinScores: {
      oiliness: 76,
      pores: 72,
      moisture: 62,
      redness: 24,
      texture: 30,
      spots: 18,
    },
    toneProfile: {
      skinToneHex: '#C69B75',
      undertone: 'warm',
      eyeColorHex: '#382315',
      eyebrowColorHex: '#25160D',
      lipColorHex: '#9E5B53',
      hairColorHex: '#1B120C',
      paletteHexes: ['#1F3A34', '#556B2F', '#C69B75', '#E5BA82', '#6E473B', '#F5EBE1'],
    },
    suggestedOccasions: [
      "Cousin's wedding, evening, under ₹6000",
      'Sunset Rooftop Cocktail',
      'Art Gallery Soirée',
      'Weekend Linen Brunch',
    ],
    defaultBudget: 6000,
    precomputedLooks: [
      {
        id: 'look-maya-1',
        name: 'The Forest Silk Ensemble',
        styleVibe: 'Quiet Luxury Evening',
        totalPrice: 5400,
        items: [
          {
            sku: 'SA-DRS-01',
            title: 'Forest Green Bias-Cut Slip Dress',
            brand: 'Solstice Atelier',
            price: 5400,
            currency: '₹',
            category: 'dress',
            colorName: 'Forest Pine',
            colorHex: '#1F3A34',
            imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
            tags: ['silk', 'bias-cut', 'elegant', 'fluid'],
            occasion: ['evening', 'wedding', 'cocktail'],
            url: '/products/SA-DRS-01',
            inStock: true,
            material: 'Heavyweight Mulberry Silk',
          },
        ],
        score: 96,
        skinSafeBadge: 'Pore-Refining & Oil Balance',
        whyThisWorks:
          'Deep forest silk creates a breathtaking analog with your olive tone; satin base prevents shine through evening humidity.',
        makeupPatternId: 'pattern_velvet_matte_refine',
        makeupPatternName: 'Velvet Satin Balance',
        makeupFinish: 'satin',
        makeupIntensity: 50,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
        originalImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        selfCorrectionApplied: {
          swappedFrom: {
            sku: 'MS-TOP-03',
            title: 'Crimson Clashing Silk Scarf',
            brand: 'Meridian Studio',
            price: 1600,
            currency: '₹',
            category: 'accessory',
            colorName: 'Harsh Crimson',
            colorHex: '#D71920',
            imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80',
            tags: ['clashing'],
            occasion: ['party'],
            url: '/products/MS-TOP-03',
            inStock: true,
          },
          swappedTo: {
            sku: 'SA-ACC-01',
            title: 'Whisper Cashmere Stole in Camel',
            brand: 'Solstice Atelier',
            price: 2400,
            currency: '₹',
            category: 'accessory',
            colorName: 'Camel Beige',
            colorHex: '#C19A6B',
            imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=600&q=80',
            tags: ['cashmere', 'neutral', 'soft'],
            occasion: ['wedding', 'evening'],
            url: '/products/SA-ACC-01',
            inStock: true,
          },
          reason: 'Swapped harsh crimson scarf — it clashed with warm undertone (ΔE=52) and overwhelmed delicate facial framing.',
        },
      },
      {
        id: 'look-maya-2',
        name: 'Terracotta Chanderi Classic',
        styleVibe: 'Regal Heritage Festive',
        totalPrice: 4200,
        items: [
          {
            sku: 'KT-ETH-01',
            title: 'Terracotta Handwoven Chanderi Kurta',
            brand: 'Kaveri Threadworks',
            price: 4200,
            currency: '₹',
            category: 'ethnic',
            colorName: 'Burnt Terracotta',
            colorHex: '#C85A32',
            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
            tags: ['handloom', 'chanderi', 'festive'],
            occasion: ['wedding', 'festive'],
            url: '/products/KT-ETH-01',
            inStock: true,
            material: 'Handspun Chanderi Silk Cotton',
          },
        ],
        score: 92,
        skinSafeBadge: 'Breathable Natural Fibre',
        whyThisWorks:
          'Warm terracotta brings golden warmth to your skin without amplifying surface redness.',
        makeupPatternId: 'pattern_velvet_matte_refine',
        makeupPatternName: 'Velvet Satin Balance',
        makeupFinish: 'satin',
        makeupIntensity: 45,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        originalImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'look-maya-3',
        name: 'Olive Linen Minimalist',
        styleVibe: 'Understated Tailored',
        totalPrice: 5998,
        items: [
          {
            sku: 'NL-TOP-01',
            title: 'Olive Crisp Linen Overshirt',
            brand: 'Northloom Denim Co.',
            price: 2899,
            currency: '₹',
            category: 'top',
            colorName: 'Muted Olive',
            colorHex: '#556B2F',
            imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
            tags: ['linen', 'relaxed', 'breathable'],
            occasion: ['casual', 'brunch', 'day out'],
            url: '/products/NL-TOP-01',
            inStock: true,
          },
          {
            sku: 'NL-BTM-02',
            title: 'Straight-Fit Pleated Trouser',
            brand: 'Northloom Denim Co.',
            price: 3100,
            currency: '₹',
            category: 'bottom',
            colorName: 'Charcoal Slate',
            colorHex: '#3A3F47',
            imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
            tags: ['pleated', 'tailored'],
            occasion: ['office', 'dinner'],
            url: '/products/NL-BTM-02',
            inStock: true,
          },
        ],
        score: 89,
        skinSafeBadge: 'Air-Woven Linen Comfort',
        whyThisWorks:
          'Earth-toned linen keeps your look fresh and calm while letting the complexion breathe.',
        makeupPatternId: 'pattern_velvet_matte_refine',
        makeupPatternName: 'Velvet Satin Balance',
        makeupFinish: 'satin',
        makeupIntensity: 40,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        originalImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'persona-aisha',
    name: 'Aisha',
    tagline: 'Deep Bronze • Dry Texture & Hydration Need',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    fullBodyUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    skinScores: {
      oiliness: 18,
      pores: 24,
      moisture: 32,
      redness: 16,
      texture: 64,
      spots: 28,
    },
    toneProfile: {
      skinToneHex: '#724933',
      undertone: 'warm',
      eyeColorHex: '#1B0F09',
      eyebrowColorHex: '#1B0F09',
      lipColorHex: '#753D38',
      hairColorHex: '#100A06',
      paletteHexes: ['#D4AF37', '#724933', '#C85A32', '#FAF5EF', '#2F4F4F', '#9E5B53'],
    },
    suggestedOccasions: ['Golden Hour Reception', 'Autumn Evening Dinner', 'Cultural Gala'],
    defaultBudget: 8000,
    precomputedLooks: [
      {
        id: 'look-aisha-1',
        name: 'The Golden Hour Wrap',
        styleVibe: 'Radiant Luminous Gala',
        totalPrice: 7900,
        items: [
          {
            sku: 'SA-DRS-02',
            title: 'Champagne Hammered Silk Wrap Gown',
            brand: 'Solstice Atelier',
            price: 7900,
            currency: '₹',
            category: 'dress',
            colorName: 'Champagne Gold',
            colorHex: '#E8D8C8',
            imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
            tags: ['silk', 'wrap', 'evening'],
            occasion: ['wedding', 'reception', 'gala'],
            url: '/products/SA-DRS-02',
            inStock: true,
            material: 'Hammered Silk Satin',
          },
        ],
        score: 97,
        skinSafeBadge: 'Hydration Cushion Care',
        whyThisWorks:
          'Hammered silk mirrors light to illuminate your complexion; dewy veil softens texture without cling.',
        makeupPatternId: 'pattern_dewy_luminous_glow',
        makeupPatternName: 'Dewy Luminous Veil',
        makeupFinish: 'dewy',
        makeupIntensity: 45,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        originalImageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'look-aisha-2',
        name: 'Sage & Gold Anarkali',
        styleVibe: 'Regal Sangeet Elegance',
        totalPrice: 6800,
        items: [
          {
            sku: 'KT-ETH-02',
            title: 'Sage & Gold Zari Anarkali Ensemble',
            brand: 'Kaveri Threadworks',
            price: 6800,
            currency: '₹',
            category: 'ethnic',
            colorName: 'Sage Green',
            colorHex: '#8A9A86',
            imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
            tags: ['festive', 'zari', 'wedding'],
            occasion: ['wedding', 'reception'],
            url: '/products/KT-ETH-02',
            inStock: true,
          },
        ],
        score: 94,
        skinSafeBadge: 'Hydration Cushion Care',
        whyThisWorks:
          'Subtle sage green balances rich undertones while gold zari highlights natural cheekbone warmth.',
        makeupPatternId: 'pattern_dewy_luminous_glow',
        makeupPatternName: 'Dewy Luminous Veil',
        makeupFinish: 'dewy',
        makeupIntensity: 50,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        originalImageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'persona-chloe',
    name: 'Chloe',
    tagline: 'Cool Fair • Redness & Sensitive Barrier',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    fullBodyUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    skinScores: {
      oiliness: 38,
      pores: 30,
      moisture: 52,
      redness: 68,
      texture: 36,
      spots: 14,
    },
    toneProfile: {
      skinToneHex: '#EAD5C3',
      undertone: 'cool',
      eyeColorHex: '#4A6B82',
      eyebrowColorHex: '#4A3528',
      lipColorHex: '#BA7A7C',
      hairColorHex: '#2C1D18',
      paletteHexes: ['#1E293B', '#8A9A86', '#EAD5C3', '#E8D8C8', '#3A3F47', '#FAF8F5'],
    },
    suggestedOccasions: ['Garden Afternoon Tea', 'Intimate Dinner', 'Weekend Botanical Walk'],
    defaultBudget: 5000,
    precomputedLooks: [
      {
        id: 'look-chloe-1',
        name: 'The Sage Linen Drape',
        styleVibe: 'Serene Botanical Ease',
        totalPrice: 4250,
        items: [
          {
            sku: 'NL-BTM-01',
            title: 'Ecru Wide-Leg Selvedge Chino',
            brand: 'Northloom Denim Co.',
            price: 3499,
            currency: '₹',
            category: 'bottom',
            colorName: 'Natural Ecru',
            colorHex: '#F5EBE1',
            imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
            tags: ['cotton', 'relaxed', 'neutral'],
            occasion: ['casual', 'brunch'],
            url: '/products/NL-BTM-01',
            inStock: true,
          },
        ],
        score: 95,
        skinSafeBadge: 'Sensitivity Gentle Pick',
        whyThisWorks:
          'Neutral ecru and soft sage cool facial flush while hypoallergenic natural cotton prevents contact friction.',
        makeupPatternId: 'pattern_gentle_neutral_calm',
        makeupPatternName: 'Gentle Neutral Whisper',
        makeupFinish: 'satin',
        makeupIntensity: 40,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
        originalImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
];
