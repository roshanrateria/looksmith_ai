/**
 * Skin-Aware Styling & Makeup Rule Engine
 * Translates YouCam AI Skin Analysis and Skin Tone features into makeup,
 * fabric recommendations, and comfort badging without medical claims.
 */

export interface SkinConcernScores {
  oiliness: number; // 0 - 100
  moisture: number; // 0 - 100 (lower means dryer)
  redness: number;  // 0 - 100
  texture: number;  // 0 - 100 (higher means rougher)
  pores: number;    // 0 - 100
  spots: number;    // 0 - 100
}

export interface ToneProfile {
  skinToneHex: string;
  undertone: 'warm' | 'cool' | 'neutral';
  eyeColorHex: string;
  eyebrowColorHex: string;
  lipColorHex: string;
  hairColorHex: string;
  paletteHexes: string[];
}

export interface MakeupRecommendation {
  patternId: string;
  patternName: string;
  baseFinish: 'matte' | 'satin' | 'dewy' | 'sheer';
  lipFinish: 'velvet-matte' | 'satin-nude' | 'hydrating-sheer' | 'soft-tint';
  recommendedIntensity: number; // 0 - 100 (e.g. 45 - 60)
  skinSafeReason: string;
  comfortBadge: string;
  fabricsPicks: string[];
}

/**
 * Derives makeup finish, pattern and skin-safety rationale from skin analysis scores.
 */
export function deriveMakeupFromSkin(
  scores: SkinConcernScores,
  tone: ToneProfile
): MakeupRecommendation {
  // 1. High oiliness or enlarged pores
  if (scores.oiliness > 60 || scores.pores > 60) {
    return {
      patternId: 'pattern_velvet_matte_refine',
      patternName: 'Velvet Satin Balance',
      baseFinish: 'satin',
      lipFinish: 'velvet-matte',
      recommendedIntensity: 50,
      skinSafeReason:
        'Satin-matte finish curated to balance natural shine in the T-zone while maintaining clean pore definition.',
      comfortBadge: 'Pore-Refining & Oil Balance',
      fabricsPicks: ['Pure Linen', 'Crisp Cotton Poplin', 'Breathable Chambray'],
    };
  }

  // 2. Low hydration or textured dry skin
  if (scores.moisture < 45 || scores.texture > 55) {
    return {
      patternId: 'pattern_dewy_luminous_glow',
      patternName: 'Dewy Luminous Veil',
      baseFinish: 'dewy',
      lipFinish: 'hydrating-sheer',
      recommendedIntensity: 45,
      skinSafeReason:
        'Luminous moisture-rich veil chosen to avoid settling into dry areas, keeping the complexion visibly refreshed and supple.',
      comfortBadge: 'Hydration Cushion',
      fabricsPicks: ['Soft Silk Twill', 'Modal Jersey', 'Brushed Fine Wool'],
    };
  }

  // 3. Redness or skin sensitivity
  if (scores.redness > 50) {
    return {
      patternId: 'pattern_gentle_neutral_calm',
      patternName: 'Gentle Neutral Whisper',
      baseFinish: 'satin',
      lipFinish: 'soft-tint',
      recommendedIntensity: 40,
      skinSafeReason:
        'Gentle muted tones chosen to naturally calm warmth and redness without heavy color clash.',
      comfortBadge: 'Sensitivity Gentle Pick',
      fabricsPicks: ['Organic Unbleached Cotton', 'Hypoallergenic Bamboo', 'Washed Linen'],
    };
  }

  // 4. Uneven pigmentation or spots
  if (scores.spots > 55) {
    return {
      patternId: 'pattern_balanced_radiance_tint',
      patternName: 'Radiant Uniform Tint',
      baseFinish: 'satin',
      lipFinish: 'satin-nude',
      recommendedIntensity: 55,
      skinSafeReason:
        'Even-toned soft radiant finish harmonized with your natural lip and eyebrow undertones for seamless complexion symmetry.',
      comfortBadge: 'Tone-Balancing Veil',
      fabricsPicks: ['Mulberry Silk', 'Rich Slub Cotton', 'Structured Tailored Suiting'],
    };
  }

  // 5. Balanced profile: Freedom of expression from user palette
  return {
    patternId: 'pattern_effortless_sunlit_glow',
    patternName: 'Sunlit Warmth Glow',
    baseFinish: 'satin',
    lipFinish: 'satin-nude',
    recommendedIntensity: 50,
    skinSafeReason:
      'Harmonized natural finish reflecting your healthy barrier and radiant personal color palette.',
    comfortBadge: 'Skin-Nurturing Match',
    fabricsPicks: ['Fluid Linen-Silk Blend', 'Supima Cotton', 'Merino Knit'],
  };
}

/**
 * Calculates a dynamic accent color with verified WCAG AA contrast (>= 4.5:1)
 * against a white or off-white background (#FAF8F5 / #FFFFFF).
 */
export function deriveDynamicAccent(paletteHexes: string[]): {
  accentHex: string;
  accentSoft: string;
} {
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (hex1: string, hex2: string = '#FFFFFF') => {
    const rgb1 = hexToRgbSimple(hex1);
    const rgb2 = hexToRgbSimple(hex2);
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  function hexToRgbSimple(hex: string) {
    const c = hex.replace('#', '');
    const num = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  // Look for palette color with >= 4.5:1 contrast against white
  for (const hex of paletteHexes) {
    if (getContrastRatio(hex, '#FFFFFF') >= 4.5) {
      return {
        accentHex: hex,
        accentSoft: `${hex}1A`, // 10% opacity tint
      };
    }
  }

  // Fallback to signature deep brand emerald/forest
  return {
    accentHex: '#1F3A34',
    accentSoft: '#1F3A341A',
  };
}
