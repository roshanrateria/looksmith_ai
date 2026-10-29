/**
 * Deterministic Look Scoring Engine (0 - 100 points)
 * Evaluates an assembled outfit against personal skin profile, tone palette,
 * occasion suitability, user budget, and learned taste memory priors.
 */

import { Product } from './catalogAdapter';
import { scorePaletteHarmony } from './deltaE';
import { SkinConcernScores, ToneProfile } from './skinRules';
import { TasteMemory, calculateTasteAffinity } from './tasteMemory';

export interface LookScoringInput {
  items: Product[];
  occasion: string;
  budget?: number;
  tone: ToneProfile;
  skin: SkinConcernScores;
  taste?: TasteMemory;
}

export interface LookScoreBreakdown {
  totalScore: number; // 0 - 100
  paletteScore: number; // 0 - 40
  occasionScore: number; // 0 - 25
  budgetScore: number; // 0 - 15
  skinSafetyScore: number; // 0 - 20
  tasteBonus: number; // -15 to +15 based on learned taste memory
  penalties: number; // deducted
  rationale: string;
  hasSkinConflict: boolean;
  clashingItem?: Product;
  tasteConflictItem?: Product;
}

export function scoreLook(input: LookScoringInput): LookScoreBreakdown {
  const { items, occasion, budget, tone, skin, taste } = input;

  if (!items || items.length === 0) {
    return {
      totalScore: 0,
      paletteScore: 0,
      occasionScore: 0,
      budgetScore: 0,
      skinSafetyScore: 0,
      tasteBonus: 0,
      penalties: 0,
      rationale: 'No items in look.',
      hasSkinConflict: false,
    };
  }

  // 1. Palette Match (40 points max)
  // Average of item harmony scores against tone palette
  let paletteSum = 0;
  let worstDeltaE = 0;
  let clashingItem: Product | undefined;

  for (const item of items) {
    const harmony = scorePaletteHarmony(item.colorHex, tone.paletteHexes || [tone.skinToneHex]);
    paletteSum += harmony.score;
    if (harmony.minDeltaE > worstDeltaE) {
      worstDeltaE = harmony.minDeltaE;
      if (harmony.minDeltaE > 40) {
        clashingItem = item;
      }
    }
  }
  const paletteScore = Math.round(paletteSum / items.length);

  // 2. Occasion Fit (25 points max)
  const occTarget = occasion.toLowerCase();
  const isWedding = occTarget.includes('wedding');
  const isEvening = occTarget.includes('evening');

  let occScoreSum = 0;
  for (const item of items) {
    let itemScore = 12;
    const hasWeddingTag = item.occasion.some((o) => o.toLowerCase().includes('wedding'));
    const hasEveningTag = item.occasion.some((o) => o.toLowerCase().includes('evening'));
    const isSilkOrFestive =
      item.tags.some((t) => ['silk', 'festive', 'chanderi', 'luxe', 'wrap'].includes(t.toLowerCase())) ||
      Boolean(item.material && /silk|chanderi|satin|crepe/i.test(item.material));
    const isWinterHeavy =
      item.tags.some((t) => ['shearling', 'faux-fur'].includes(t.toLowerCase())) ||
      Boolean(item.material && /shearling|fleece|fur/i.test(item.material));
    const isCasual =
      item.tags.some((t) => ['relaxed', 'denim', 'casual'].includes(t.toLowerCase())) &&
      !hasWeddingTag;

    if (isWedding && hasWeddingTag) itemScore += 6;
    if (isEvening && hasEveningTag) itemScore += 4;
    if (isWedding && isSilkOrFestive) itemScore += 3; // silk / festive fabric bonus for wedding
    if (isWedding && isWinterHeavy) itemScore -= 7; // shearling/fur inappropriate as hero wedding drape
    if (isWedding && isCasual) itemScore -= 10;
    if (isWedding && item.category === 'outerwear') itemScore -= 8; // outerwear coat is not primary wedding attire

    occScoreSum += Math.max(2, Math.min(25, itemScore));
  }
  const occasionScore = Math.round(occScoreSum / items.length);

  // 3. Budget Fit (15 points max) - HARD CONSTRAINT
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  let budgetScore = 15;
  let budgetPenalty = 0;
  if (budget && budget > 0) {
    if (totalPrice <= budget) {
      budgetScore = 15;
    } else {
      // Hard filter: 0 budget points and severe penalty if look exceeds budget
      budgetScore = 0;
      const overagePercent = (totalPrice - budget) / budget;
      budgetPenalty = Math.round(35 + overagePercent * 50);
    }
  }

  // 4. Skin Safety & Comfort (20 points max)
  // Reward breathable hypoallergenic fabrics if redness or oiliness is notable
  let skinSafetyScore = 16;
  const breathableKeywords = ['linen', 'cotton', 'silk', 'bamboo', 'chambray', 'wool'];
  const hasBreathable = items.some((item) => {
    const text = (item.title + ' ' + (item.material || '') + ' ' + item.tags.join(' ')).toLowerCase();
    return breathableKeywords.some((k) => text.includes(k));
  });

  if (skin.oiliness > 50 || skin.redness > 50) {
    skinSafetyScore = hasBreathable ? 20 : 12;
  } else {
    skinSafetyScore = 18;
  }

  // 5. Taste Memory Affinity Evaluation (-15 to +15 points)
  let tasteBonus = 0;
  let tasteConflictItem: Product | undefined;

  if (taste && (taste.likedLookCount > 0 || taste.dislikedLookCount > 0 || (taste.dislikedSkus && taste.dislikedSkus.length > 0))) {
    let totalAffinity = 0;
    for (const item of items) {
      const aff = calculateTasteAffinity(item, taste);
      totalAffinity += aff;
      if (aff <= -4 || (taste.dislikedSkus && taste.dislikedSkus.includes(item.sku))) {
        tasteConflictItem = item;
      }
    }
    const avgAffinity = totalAffinity / items.length;
    // Map avgAffinity into a bounded -10 to +10 adjustment
    tasteBonus = Math.max(-10, Math.min(10, Math.round(avgAffinity * 2)));
  }

  // 6. Penalties for category conflict, severe palette clash, or forbidden taste items
  let penalties = budgetPenalty;
  const categories = items.map((i) => i.category);
  const duplicates = categories.filter((c, idx) => categories.indexOf(c) !== idx);
  if (duplicates.length > 0) {
    penalties += 10;
  }

  let hasSkinConflict = false;
  if (worstDeltaE > 45 && (skin.redness > 50 || tone.undertone === 'warm')) {
    hasSkinConflict = true;
    penalties += 10;
  }

  if (tasteConflictItem) {
    penalties += 8;
  }

  const rawTotal = paletteScore + occasionScore + budgetScore + skinSafetyScore + tasteBonus - penalties;
  const totalScore = Math.min(100, Math.max(10, rawTotal));

  let rationale = `Curated with ${paletteScore}/40 palette harmony, seamless ${occasion} styling, and certified comfort for your skin barrier.`;
  if (tasteBonus > 3) {
    rationale += ` Strongly aligns with your learned style preferences (+${tasteBonus} taste match).`;
  }
  if (hasSkinConflict && clashingItem) {
    rationale = `Item ${clashingItem.title} has high color contrast against your undertone; candidate for self-correction swap.`;
  } else if (tasteConflictItem) {
    rationale = `Item ${tasteConflictItem.title} conflicts with your stored taste memory (downvoted in prior look); candidate for self-correction swap.`;
  }

  return {
    totalScore,
    paletteScore,
    occasionScore,
    budgetScore,
    skinSafetyScore,
    tasteBonus,
    penalties,
    rationale,
    hasSkinConflict,
    clashingItem,
    tasteConflictItem,
  };
}
