import test from 'node:test';
import assert from 'node:assert/strict';
import { hexToLab, calculateDeltaE, scorePaletteHarmony } from './deltaE';
import { deriveMakeupFromSkin, deriveDynamicAccent, SkinConcernScores, ToneProfile } from './skinRules';
import { filterCatalog, findSwapAlternatives, Product } from './catalogAdapter';
import { scoreLook } from './scoring';
import {
  INITIAL_TASTE_MEMORY,
  updateTasteWithLook,
  updateTasteWithSwap,
  getTasteLearningSummary,
  calculateTasteAffinity,
  formatTasteMemoryForPlanner,
  TasteMemory,
} from './tasteMemory';

test('CIEDE2000 deltaE: identical colors have 0 distance', () => {
  const lab = hexToLab('#1F3A34');
  const dE = calculateDeltaE(lab, lab);
  assert.equal(dE, 0);
});

test('CIEDE2000 deltaE: black and white produce high contrast distance (>80)', () => {
  const labBlack = hexToLab('#000000');
  const labWhite = hexToLab('#FFFFFF');
  const dE = calculateDeltaE(labBlack, labWhite);
  assert.ok(dE > 80, `Expected dE > 80, got ${dE}`);
});

test('scorePaletteHarmony returns high score for closely matching swatch', () => {
  const result = scorePaletteHarmony('#2A4D45', ['#1F3A34', '#E8DFD8']);
  assert.ok(result.score >= 34, `Expected harmony score >= 34, got ${result.score}`);
});

test('deriveMakeupFromSkin: recommends velvet satin balance for oily/pore skin', () => {
  const oilySkin: SkinConcernScores = {
    oiliness: 78,
    moisture: 65,
    redness: 20,
    texture: 30,
    pores: 72,
    spots: 15,
  };
  const tone: ToneProfile = {
    skinToneHex: '#D4AA7D',
    undertone: 'warm',
    eyeColorHex: '#3D2314',
    eyebrowColorHex: '#2B1A0E',
    lipColorHex: '#9E5B53',
    hairColorHex: '#1C120C',
    paletteHexes: ['#D4AA7D', '#556B2F', '#8B4513', '#E6C280', '#2F4F4F'],
  };
  const rec = deriveMakeupFromSkin(oilySkin, tone);
  assert.equal(rec.baseFinish, 'satin');
  assert.equal(rec.lipFinish, 'velvet-matte');
  assert.ok(rec.comfortBadge.includes('Oil Balance') || rec.comfortBadge.includes('Pore'));
});

test('deriveMakeupFromSkin: recommends dewy veil for dry skin', () => {
  const drySkin: SkinConcernScores = {
    oiliness: 15,
    moisture: 32,
    redness: 18,
    texture: 62,
    pores: 22,
    spots: 20,
  };
  const tone: ToneProfile = {
    skinToneHex: '#8D5524',
    undertone: 'warm',
    eyeColorHex: '#1E120B',
    eyebrowColorHex: '#1E120B',
    lipColorHex: '#7C3F3B',
    hairColorHex: '#110A05',
    paletteHexes: ['#8D5524', '#D4AF37', '#990000', '#F5DEB3', '#2C3539'],
  };
  const rec = deriveMakeupFromSkin(drySkin, tone);
  assert.equal(rec.baseFinish, 'dewy');
  assert.equal(rec.lipFinish, 'hydrating-sheer');
  assert.ok(rec.comfortBadge.includes('Hydration'));
});

test('deriveDynamicAccent produces a color with contrast against white', () => {
  const palette = ['#F5EBE1', '#E3D2C3', '#2F4F4F', '#D4AF37'];
  const accent = deriveDynamicAccent(palette);
  assert.equal(accent.accentHex, '#2F4F4F');
});

test('Catalog filter filters by category, occasion and inStock', () => {
  const mockProducts: Product[] = [
    {
      sku: 'SKU-01',
      title: 'Olive Linen Shirt',
      brand: 'Northloom',
      price: 2400,
      currency: '₹',
      category: 'top',
      colorName: 'Olive',
      colorHex: '#556B2F',
      imageUrl: '/placeholder.jpg',
      tags: ['linen', 'relaxed', 'breathable'],
      occasion: ['casual', 'vacation', 'brunch'],
      url: '/product/1',
      inStock: true,
    },
    {
      sku: 'SKU-02',
      title: 'Silk Evening Saree',
      brand: 'Kaveri',
      price: 8500,
      currency: '₹',
      category: 'ethnic',
      colorName: 'Emerald',
      colorHex: '#1F3A34',
      imageUrl: '/placeholder.jpg',
      tags: ['silk', 'formal'],
      occasion: ['wedding', 'evening', 'party'],
      url: '/product/2',
      inStock: true,
    },
    {
      sku: 'SKU-03',
      title: 'Sold Out Blazer',
      brand: 'Meridian',
      price: 4900,
      currency: '₹',
      category: 'outerwear',
      colorName: 'Charcoal',
      colorHex: '#333333',
      imageUrl: '/placeholder.jpg',
      tags: ['tailored'],
      occasion: ['formal', 'office'],
      url: '/product/3',
      inStock: false,
    },
  ];

  const tops = filterCatalog(mockProducts, { category: 'top' });
  assert.equal(tops.length, 1);
  assert.equal(tops[0].sku, 'SKU-01');

  const wedding = filterCatalog(mockProducts, { occasion: 'wedding' });
  assert.equal(wedding.length, 1);
  assert.equal(wedding[0].sku, 'SKU-02');

  const available = filterCatalog(mockProducts, { inStockOnly: true });
  assert.equal(available.length, 2);
});

test('Deterministic Look Scoring calculates total within 0-100', () => {
  const item: Product = {
    sku: 'SKU-01',
    title: 'Olive Linen Shirt',
    brand: 'Northloom',
    price: 2400,
    currency: '₹',
    category: 'top',
    colorName: 'Olive',
    colorHex: '#556B2F',
    imageUrl: '/placeholder.jpg',
    tags: ['linen', 'relaxed'],
    occasion: ['casual', 'brunch'],
    url: '/product/1',
    inStock: true,
  };
  const tone: ToneProfile = {
    skinToneHex: '#D4AA7D',
    undertone: 'warm',
    eyeColorHex: '#3D2314',
    eyebrowColorHex: '#2B1A0E',
    lipColorHex: '#9E5B53',
    hairColorHex: '#1C120C',
    paletteHexes: ['#556B2F', '#D4AA7D', '#2F4F4F'],
  };
  const skin: SkinConcernScores = {
    oiliness: 40,
    moisture: 60,
    redness: 20,
    texture: 25,
    pores: 30,
    spots: 10,
  };

  const score = scoreLook({
    items: [item],
    occasion: 'casual',
    budget: 3000,
    tone,
    skin,
  });

  assert.ok(score.totalScore > 70, `Expected score > 70, got ${score.totalScore}`);
  assert.equal(score.budgetScore, 15);
  assert.ok(score.paletteScore >= 35);
});

test('Taste Memory updates correctly on like feedback', () => {
  const item: Product = {
    sku: 'SKU-01',
    title: 'Olive Linen Shirt',
    brand: 'Northloom',
    price: 2400,
    currency: '₹',
    category: 'top',
    colorName: 'Olive',
    colorHex: '#556B2F',
    imageUrl: '/placeholder.jpg',
    tags: ['relaxed', 'linen'],
    occasion: ['casual'],
    url: '/product/1',
    inStock: true,
  };

  const updated = updateTasteWithLook(INITIAL_TASTE_MEMORY, [item], 'like');
  assert.equal(updated.likedLookCount, 1);
  assert.equal(updated.preferredBrands['Northloom'], 1);
  assert.equal(updated.preferredSilhouettes['relaxed'], 1);
  assert.ok(updated.likedSkus.includes('SKU-01'));

  const summary = getTasteLearningSummary(updated);
  assert.ok(summary?.includes('Northloom') || summary?.includes('relaxed fit'));
});

test('Taste Memory updates correctly on item swap and calculates affinity', () => {
  const swappedFrom: Product = {
    sku: 'SKU-OLD',
    title: 'Stiff Polyester Blazer',
    brand: 'FastTrend',
    price: 3200,
    currency: '₹',
    category: 'outerwear',
    colorName: 'Neon Orange',
    colorHex: '#FF5722',
    imageUrl: '/placeholder.jpg',
    tags: ['structured'],
    occasion: ['party'],
    url: '/old',
    inStock: true,
  };

  const swappedTo: Product = {
    sku: 'SKU-NEW',
    title: 'Handloom Khadi Jacket',
    brand: 'FabIndia',
    price: 4500,
    currency: '₹',
    category: 'outerwear',
    colorName: 'Sage Green',
    colorHex: '#8A9A86',
    imageUrl: '/placeholder.jpg',
    tags: ['relaxed', 'linen'],
    occasion: ['party'],
    url: '/new',
    inStock: true,
  };

  const updated = updateTasteWithSwap(INITIAL_TASTE_MEMORY, swappedFrom, swappedTo);
  assert.ok(updated.dislikedSkus.includes('SKU-OLD'));
  assert.ok(updated.likedSkus.includes('SKU-NEW'));
  assert.equal(updated.preferredBrands['FabIndia'], 1);
  assert.equal(updated.preferredBrands['FastTrend'], -1);

  const affOld = calculateTasteAffinity(swappedFrom, updated);
  const affNew = calculateTasteAffinity(swappedTo, updated);
  assert.ok(affOld < 0, `Expected negative affinity for swapped-out item, got ${affOld}`);
  assert.ok(affNew > 0, `Expected positive affinity for swapped-to item, got ${affNew}`);
});

test('formatTasteMemoryForPlanner generates strict self-learning prompt directives', () => {
  const taste: TasteMemory = {
    preferredColors: { '#1F3A34': 2, '#D71920': -2 },
    preferredCategories: { dress: 1 },
    preferredSilhouettes: { relaxed: 3, structured: -2 },
    preferredBrands: { Solstice: 2, FastTrend: -2 },
    likedLookCount: 3,
    dislikedLookCount: 1,
    likedSkus: ['SA-DRS-01'],
    dislikedSkus: ['MS-TOP-03'],
  };

  const formatted = formatTasteMemoryForPlanner(taste);
  assert.ok(formatted.includes('3 liked looks, 1 disliked looks'));
  assert.ok(formatted.includes('relaxed (+3)'));
  assert.ok(formatted.includes('structured (-2)'));
  assert.ok(formatted.includes('Solstice (+2)'));
  assert.ok(formatted.includes('STRICTLY FORBIDDEN / REJECTED SKUs: MS-TOP-03'));
  assert.ok(formatted.includes('SELF-LEARNING PLANNER MANDATE'));
});

test('scoreLook incorporates taste memory bonus and detects taste conflicts', () => {
  const favoredItem: Product = {
    sku: 'SKU-FAV',
    title: 'Emerald Silk Kaftan',
    brand: 'Solstice',
    price: 3500,
    currency: '₹',
    category: 'dress',
    colorName: 'Forest',
    colorHex: '#1F3A34',
    imageUrl: '/placeholder.jpg',
    tags: ['relaxed', 'silk'],
    occasion: ['evening'],
    url: '/fav',
    inStock: true,
  };

  const tone: ToneProfile = {
    skinToneHex: '#D4AA7D',
    undertone: 'warm',
    eyeColorHex: '#3D2314',
    eyebrowColorHex: '#2B1A0E',
    lipColorHex: '#9E5B53',
    hairColorHex: '#1C120C',
    paletteHexes: ['#1F3A34', '#D4AA7D'],
  };
  const skin: SkinConcernScores = {
    oiliness: 30,
    moisture: 70,
    redness: 10,
    texture: 20,
    pores: 20,
    spots: 10,
  };

  const taste: TasteMemory = {
    preferredColors: { '#1F3A34': 2 },
    preferredCategories: {},
    preferredSilhouettes: { relaxed: 2 },
    preferredBrands: { Solstice: 2 },
    likedLookCount: 2,
    dislikedLookCount: 0,
    likedSkus: ['SKU-FAV'],
    dislikedSkus: [],
  };

  const scoreWithTaste = scoreLook({
    items: [favoredItem],
    occasion: 'evening',
    budget: 5000,
    tone,
    skin,
    taste,
  });

  assert.ok(scoreWithTaste.tasteBonus > 0, `Expected positive tasteBonus, got ${scoreWithTaste.tasteBonus}`);
  assert.ok(scoreWithTaste.rationale.includes('learned style preferences'));
});

test('runAgenticStylist: executes multi-step agent loop with taste memory & self-correction', async () => {
  const { runAgenticStylist } = await import('../agent/agentLoop');
  const mockCatalog: Product[] = [
    {
      sku: 'SA-DRS-01',
      title: 'Forest Green Silk Slip Dress',
      brand: 'Solstice',
      price: 5400,
      currency: '₹',
      category: 'dress',
      colorName: 'Forest',
      colorHex: '#1F3A34',
      imageUrl: '/placeholder.jpg',
      tags: ['silk', 'elegant', 'relaxed'],
      occasion: ['wedding', 'evening'],
      url: '/1',
      inStock: true,
    },
    {
      sku: 'MS-TOP-03',
      title: 'Crimson Clashing Silk Scarf',
      brand: 'Meridian',
      price: 1600,
      currency: '₹',
      category: 'accessory',
      colorName: 'Crimson',
      colorHex: '#D71920',
      imageUrl: '/placeholder.jpg',
      tags: ['clashing'],
      occasion: ['evening'],
      url: '/2',
      inStock: true,
    },
    {
      sku: 'SA-ACC-01',
      title: 'Whisper Cashmere Stole in Camel',
      brand: 'Solstice',
      price: 2400,
      currency: '₹',
      category: 'accessory',
      colorName: 'Camel',
      colorHex: '#C19A6B',
      imageUrl: '/placeholder.jpg',
      tags: ['cashmere', 'neutral'],
      occasion: ['wedding', 'evening'],
      url: '/3',
      inStock: true,
    },
  ];

  const taste: TasteMemory = {
    preferredColors: { '#1F3A34': 2 },
    preferredCategories: {},
    preferredSilhouettes: { relaxed: 2 },
    preferredBrands: { Solstice: 2 },
    likedLookCount: 1,
    dislikedLookCount: 0,
    likedSkus: ['SA-DRS-01'],
    dislikedSkus: [],
  };

  const stepsObserved: string[] = [];
  const tracesObserved: Record<string, any>[] = [];

  const looks = await runAgenticStylist({
    occasion: "Cousin's wedding, evening, under ₹6000",
    budget: 6000,
    skinScores: {
      oiliness: 76,
      pores: 72,
      moisture: 60,
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
      paletteHexes: ['#1F3A34', '#556B2F', '#C69B75', '#E5BA82'],
    },
    catalog: mockCatalog,
    userImage: '/placeholder.jpg',
    tasteMemory: taste,
    apiKey: '', // Deterministic fallback path for instant test verification
    onProgress: (evt) => {
      stepsObserved.push(evt.id);
      if (evt.technicalTrace) tracesObserved.push(evt.technicalTrace);
    },
  });

  assert.equal(looks.length, 3);
  assert.ok(stepsObserved.includes('step-1'));
  assert.ok(stepsObserved.includes('step-2'));
  assert.ok(stepsObserved.includes('step-4'));
  assert.ok(stepsObserved.includes('step-5'));

  // Verify step-2 technical trace records taste memory sent to planner
  const plannerTrace = tracesObserved.find((t) => t.role === 'Planner');
  assert.ok(plannerTrace, 'Planner trace should be recorded');
  assert.equal(plannerTrace.tasteMemorySentToPlanner, true);
  assert.equal(plannerTrace.tastePriorsApplied, true);

  assert.ok(looks[0].selfCorrectionApplied !== undefined, 'Expected self-correction to be applied');
  assert.equal(looks[0].selfCorrectionApplied?.swappedTo.sku, 'SA-ACC-01');
});
