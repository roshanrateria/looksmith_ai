/**
 * Taste Memory Vector & Preference Learning
 * Stores and updates shopper preferences across likes, dislikes, and item swaps.
 * Generates explicit constraints and priors for the Gemini fashion planner agent.
 */

import { Product } from './catalogAdapter';

export interface TasteMemory {
  preferredColors: Record<string, number>; // colorHex -> score weight (+/-)
  preferredCategories: Record<string, number>;
  preferredSilhouettes: Record<string, number>; // e.g. 'relaxed', 'tailored', 'oversized', 'minimal'
  preferredBrands: Record<string, number>;
  likedLookCount: number;
  dislikedLookCount: number;
  likedSkus: string[];
  dislikedSkus: string[];
  lastAction?: {
    type: 'like' | 'dislike' | 'swap';
    detail: string;
    timestamp: number;
  };
}

export const INITIAL_TASTE_MEMORY: TasteMemory = {
  preferredColors: {},
  preferredCategories: {},
  preferredSilhouettes: {},
  preferredBrands: {},
  likedLookCount: 0,
  dislikedLookCount: 0,
  likedSkus: [],
  dislikedSkus: [],
};

const SILHOUETTE_TAGS = [
  'relaxed',
  'tailored',
  'oversized',
  'minimal',
  'classic',
  'linen',
  'structured',
  'flowy',
  'draped',
  'contemporary',
  'heritage',
  'breathable',
];

/**
 * Updates taste memory vector based on like / dislike of an entire look
 */
export function updateTasteWithLook(
  current: TasteMemory,
  items: Product[],
  sentiment: 'like' | 'dislike',
  lookTitle?: string
): TasteMemory {
  const delta = sentiment === 'like' ? 1 : -1;
  const updated: TasteMemory = {
    ...current,
    preferredColors: { ...current.preferredColors },
    preferredCategories: { ...current.preferredCategories },
    preferredSilhouettes: { ...current.preferredSilhouettes },
    preferredBrands: { ...current.preferredBrands },
    likedLookCount: current.likedLookCount + (sentiment === 'like' ? 1 : 0),
    dislikedLookCount: current.dislikedLookCount + (sentiment === 'dislike' ? 1 : 0),
    likedSkus: [...(current.likedSkus || [])],
    dislikedSkus: [...(current.dislikedSkus || [])],
    lastAction: {
      type: sentiment,
      detail: `${sentiment === 'like' ? 'Liked' : 'Disliked'} look: ${lookTitle || items.map(i => i.title).join(' + ')}`,
      timestamp: Date.now(),
    },
  };

  for (const item of items) {
    if (sentiment === 'like') {
      if (!updated.likedSkus.includes(item.sku)) {
        updated.likedSkus.push(item.sku);
      }
      updated.dislikedSkus = updated.dislikedSkus.filter((sku) => sku !== item.sku);
    } else {
      if (!updated.dislikedSkus.includes(item.sku)) {
        updated.dislikedSkus.push(item.sku);
      }
      updated.likedSkus = updated.likedSkus.filter((sku) => sku !== item.sku);
    }

    // 1. Color Hex
    const cHex = item.colorHex.toUpperCase();
    updated.preferredColors[cHex] = (updated.preferredColors[cHex] || 0) + delta;

    // 2. Category
    updated.preferredCategories[item.category] =
      (updated.preferredCategories[item.category] || 0) + delta;

    // 3. Brand
    updated.preferredBrands[item.brand] = (updated.preferredBrands[item.brand] || 0) + delta;

    // 4. Silhouette from tags
    for (const tag of item.tags) {
      const lower = tag.toLowerCase();
      if (SILHOUETTE_TAGS.includes(lower)) {
        updated.preferredSilhouettes[lower] = (updated.preferredSilhouettes[lower] || 0) + delta;
      }
    }
  }

  return updated;
}

/**
 * Updates taste memory when a user swaps an item inside a look
 * The swapped-out item gains negative affinity, while the replacement gains positive affinity.
 */
export function updateTasteWithSwap(
  current: TasteMemory,
  swappedFrom: Product,
  swappedTo: Product
): TasteMemory {
  let updated: TasteMemory = {
    ...current,
    preferredColors: { ...current.preferredColors },
    preferredCategories: { ...current.preferredCategories },
    preferredSilhouettes: { ...current.preferredSilhouettes },
    preferredBrands: { ...current.preferredBrands },
    dislikedSkus: [...(current.dislikedSkus || [])],
    likedSkus: [...(current.likedSkus || [])],
    lastAction: {
      type: 'swap',
      detail: `Swapped from "${swappedFrom.title}" to "${swappedTo.title}"`,
      timestamp: Date.now(),
    },
  };

  // Deprecate swappedFrom
  if (!updated.dislikedSkus.includes(swappedFrom.sku)) {
    updated.dislikedSkus.push(swappedFrom.sku);
  }
  updated.likedSkus = updated.likedSkus.filter((s) => s !== swappedFrom.sku);
  updated.preferredBrands[swappedFrom.brand] = (updated.preferredBrands[swappedFrom.brand] || 0) - 1;
  const fromHex = swappedFrom.colorHex.toUpperCase();
  updated.preferredColors[fromHex] = (updated.preferredColors[fromHex] || 0) - 1;
  for (const tag of swappedFrom.tags) {
    const l = tag.toLowerCase();
    if (SILHOUETTE_TAGS.includes(l)) {
      updated.preferredSilhouettes[l] = (updated.preferredSilhouettes[l] || 0) - 1;
    }
  }

  // Elevate swappedTo
  if (!updated.likedSkus.includes(swappedTo.sku)) {
    updated.likedSkus.push(swappedTo.sku);
  }
  updated.dislikedSkus = updated.dislikedSkus.filter((s) => s !== swappedTo.sku);
  updated.preferredBrands[swappedTo.brand] = (updated.preferredBrands[swappedTo.brand] || 0) + 1;
  const toHex = swappedTo.colorHex.toUpperCase();
  updated.preferredColors[toHex] = (updated.preferredColors[toHex] || 0) + 1;
  for (const tag of swappedTo.tags) {
    const l = tag.toLowerCase();
    if (SILHOUETTE_TAGS.includes(l)) {
      updated.preferredSilhouettes[l] = (updated.preferredSilhouettes[l] || 0) + 1;
    }
  }

  return updated;
}

/**
 * Calculates a numerical affinity score for any product given stored taste memory
 */
export function calculateTasteAffinity(item: Product, taste?: TasteMemory): number {
  if (!taste) return 0;
  let score = 0;

  // Exact SKU match
  if (taste.likedSkus?.includes(item.sku)) score += 3;
  if (taste.dislikedSkus?.includes(item.sku)) score -= 5;

  // Brand preference
  if (taste.preferredBrands[item.brand]) {
    score += taste.preferredBrands[item.brand] * 2;
  }

  // Color preference
  const hex = item.colorHex.toUpperCase();
  if (taste.preferredColors[hex]) {
    score += taste.preferredColors[hex] * 1.5;
  }

  // Silhouette / tags
  for (const tag of item.tags) {
    const l = tag.toLowerCase();
    if (taste.preferredSilhouettes[l]) {
      score += taste.preferredSilhouettes[l] * 1.5;
    }
  }

  return score;
}

/**
 * Formats the taste memory into rich, actionable prompt instructions for the Gemini Planner.
 * This is injected directly into the Gemini fashion stylist prompt.
 */
export function formatTasteMemoryForPlanner(taste?: TasteMemory): string {
  if (!taste || (taste.likedLookCount === 0 && taste.dislikedLookCount === 0 && (!taste.likedSkus || taste.likedSkus.length === 0) && (!taste.dislikedSkus || taste.dislikedSkus.length === 0))) {
    return 'Status: Fresh session (no prior likes/dislikes recorded yet. Default to tone, occasion, and comfort constraints).';
  }

  const lines: string[] = [];
  lines.push(`Total Interactions: ${taste.likedLookCount} liked looks, ${taste.dislikedLookCount} disliked looks`);

  // Preferred silhouettes
  const positiveSilhouettes = Object.entries(taste.preferredSilhouettes)
    .filter(([_, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, w]) => `${name} (+${w})`);
  if (positiveSilhouettes.length > 0) {
    lines.push(`• Preferred Silhouettes: ${positiveSilhouettes.join(', ')}`);
  }

  // Disliked silhouettes
  const negativeSilhouettes = Object.entries(taste.preferredSilhouettes)
    .filter(([_, weight]) => weight < 0)
    .sort((a, b) => a[1] - b[1])
    .map(([name, w]) => `${name} (${w})`);
  if (negativeSilhouettes.length > 0) {
    lines.push(`• Disliked/Avoided Silhouettes: ${negativeSilhouettes.join(', ')}`);
  }

  // Preferred brands
  const positiveBrands = Object.entries(taste.preferredBrands)
    .filter(([_, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, w]) => `${name} (+${w})`);
  if (positiveBrands.length > 0) {
    lines.push(`• Preferred Brands: ${positiveBrands.join(', ')}`);
  }

  // Avoided brands
  const negativeBrands = Object.entries(taste.preferredBrands)
    .filter(([_, weight]) => weight < 0)
    .sort((a, b) => a[1] - b[1])
    .map(([name, w]) => `${name} (${w})`);
  if (negativeBrands.length > 0) {
    lines.push(`• Disliked/Avoided Brands: ${negativeBrands.join(', ')}`);
  }

  // Color affinities
  const positiveColors = Object.entries(taste.preferredColors)
    .filter(([_, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([hex, w]) => `${hex} (+${w})`);
  if (positiveColors.length > 0) {
    lines.push(`• Favored Color Palette Hexes: ${positiveColors.join(', ')}`);
  }

  const negativeColors = Object.entries(taste.preferredColors)
    .filter(([_, weight]) => weight < 0)
    .sort((a, b) => a[1] - b[1])
    .map(([hex, w]) => `${hex} (${w})`);
  if (negativeColors.length > 0) {
    lines.push(`• Avoided Color Palette Hexes: ${negativeColors.join(', ')}`);
  }

  // Disliked SKUs to ban
  if (taste.dislikedSkus && taste.dislikedSkus.length > 0) {
    lines.push(`• STRICTLY FORBIDDEN / REJECTED SKUs: ${taste.dislikedSkus.join(', ')} (Shopper explicitly downvoted or swapped away these items. DO NOT include them!)`);
  }

  lines.push('');
  lines.push('SELF-LEARNING PLANNER MANDATE:');
  lines.push('1. Actively prioritize items matching the shopper\'s preferred silhouettes, favored colors, and high-affinity brands.');
  lines.push('2. Under no circumstance should you recommend items with rejected SKUs or styles strongly conflicting with the shopper\'s downvoted traits.');
  lines.push('3. In the "initialRationale" of each look, cite specifically how this look honors the shopper\'s stored taste memory.');

  return lines.join('\n');
}

/**
 * Derives a human-friendly label for the Taste Memory chip in the UI
 * e.g. "Learning: leans relaxed fit, Solstice (2 likes)"
 */
export function getTasteLearningSummary(taste?: TasteMemory): string | null {
  if (!taste) return null;
  const totalFeedback = taste.likedLookCount + taste.dislikedLookCount;
  if (totalFeedback === 0 && (!taste.dislikedSkus || taste.dislikedSkus.length === 0)) {
    return null;
  }

  const traits: string[] = [];

  // Top silhouette
  const topSilhouette = Object.entries(taste.preferredSilhouettes).sort((a, b) => b[1] - a[1])[0];
  if (topSilhouette && topSilhouette[1] > 0) {
    traits.push(`${topSilhouette[0]} fit`);
  } else if (topSilhouette && topSilhouette[1] < 0) {
    traits.push(`avoids ${topSilhouette[0]}`);
  }

  // Top brand
  const topBrand = Object.entries(taste.preferredBrands).sort((a, b) => b[1] - a[1])[0];
  if (topBrand && topBrand[1] > 0) {
    traits.push(topBrand[0]);
  } else if (topBrand && topBrand[1] < 0) {
    traits.push(`avoids ${topBrand[0]}`);
  }

  if (traits.length === 0) {
    if (taste.dislikedSkus && taste.dislikedSkus.length > 0) {
      return `Learning: filtered ${taste.dislikedSkus.length} rejected item${taste.dislikedSkus.length > 1 ? 's' : ''}`;
    }
    return `Learning your style (${totalFeedback} interactions)`;
  }

  return `Learning: leans ${traits.join(', ')}`;
}
