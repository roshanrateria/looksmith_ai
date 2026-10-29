/**
 * CIEDE2000 Color Difference and Color Space Conversions
 * Used for skin tone palette matching and garment color harmony scoring.
 */

export interface LabColor {
  L: number;
  a: number;
  b: number;
}

export interface RGBColor {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

/**
 * Converts a Hex color code (#RRGGBB or #RGB) to RGB
 */
export function hexToRgb(hex: string): RGBColor {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) {
    return { r: 128, g: 128, b: 128 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB (sRGB, D65) to CIE-L*a*b*
 */
export function rgbToLab(rgb: RGBColor): LabColor {
  // 1. Convert to linear RGB
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // 2. Convert to XYZ using D65 illuminant matrix
  let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  let y = (r * 0.2126729 + g * 0.7151522 + b * 0.072175) / 1.0;
  let z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return {
    L: Math.round((116 * fy - 16) * 100) / 100,
    a: Math.round(500 * (fx - fy) * 100) / 100,
    b: Math.round(200 * (fy - fz) * 100) / 100,
  };
}

export function hexToLab(hex: string): LabColor {
  return rgbToLab(hexToRgb(hex));
}

/**
 * CIEDE2000 Color Difference implementation
 * Returns Delta E (0 - 100+). Smaller means more perceptually similar.
 * ΔE < 2: Indiscernible to human eye.
 * ΔE < 10: Closely harmonious.
 * ΔE < 25: Compatible complementary / accent.
 * ΔE > 40: High contrast or potential clash.
 */
export function calculateDeltaE(lab1: LabColor, lab2: LabColor): number {
  const deg2rad = (deg: number) => (deg * Math.PI) / 180;
  const rad2deg = (rad: number) => (rad * 180) / Math.PI;

  const L1 = lab1.L;
  const a1 = lab1.a;
  const b1 = lab1.b;

  const L2 = lab2.L;
  const a2 = lab2.a;
  const b2 = lab2.b;

  const avgL = (L1 + L2) / 2;
  const c1 = Math.sqrt(a1 * a1 + b1 * b1);
  const c2 = Math.sqrt(a2 * a2 + b2 * b2);
  const avgC = (c1 + c2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));

  const a1Prime = a1 * (1 + G);
  const a2Prime = a2 * (1 + G);

  const c1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
  const c2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);

  const h1Prime =
    Math.atan2(b1, a1Prime) >= 0
      ? rad2deg(Math.atan2(b1, a1Prime))
      : rad2deg(Math.atan2(b1, a1Prime)) + 360;

  const h2Prime =
    Math.atan2(b2, a2Prime) >= 0
      ? rad2deg(Math.atan2(b2, a2Prime))
      : rad2deg(Math.atan2(b2, a2Prime)) + 360;

  const deltaLPrime = L2 - L1;
  const deltaCPrime = c2Prime - c1Prime;

  let deltahPrime = 0;
  if (c1Prime * c2Prime !== 0) {
    if (Math.abs(h2Prime - h1Prime) <= 180) {
      deltahPrime = h2Prime - h1Prime;
    } else if (h2Prime - h1Prime > 180) {
      deltahPrime = h2Prime - h1Prime - 360;
    } else {
      deltahPrime = h2Prime - h1Prime + 360;
    }
  }

  const deltaHPrime = 2 * Math.sqrt(c1Prime * c2Prime) * Math.sin(deg2rad(deltahPrime / 2));

  const avgLPrime = avgL;
  const avgCPrime = (c1Prime + c2Prime) / 2;

  let avghPrime = 0;
  if (c1Prime * c2Prime !== 0) {
    if (Math.abs(h1Prime - h2Prime) <= 180) {
      avghPrime = (h1Prime + h2Prime) / 2;
    } else if (h1Prime + h2Prime < 360) {
      avghPrime = (h1Prime + h2Prime + 360) / 2;
    } else {
      avghPrime = (h1Prime + h2Prime - 360) / 2;
    }
  }

  const T =
    1 -
    0.17 * Math.cos(deg2rad(avghPrime - 30)) +
    0.24 * Math.cos(deg2rad(2 * avghPrime)) +
    0.32 * Math.cos(deg2rad(3 * avghPrime + 6)) -
    0.2 * Math.cos(deg2rad(4 * avghPrime - 63));

  const deltaTheta = 30 * Math.exp(-Math.pow((avghPrime - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(avgCPrime, 7) / (Math.pow(avgCPrime, 7) + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(avgLPrime - 50, 2)) / Math.sqrt(20 + Math.pow(avgLPrime - 50, 2));
  const SC = 1 + 0.045 * avgCPrime;
  const SH = 1 + 0.015 * avgCPrime * T;
  const RT = -Math.sin(deg2rad(2 * deltaTheta)) * RC;

  const dE = Math.sqrt(
    Math.pow(deltaLPrime / SL, 2) +
      Math.pow(deltaCPrime / SC, 2) +
      Math.pow(deltaHPrime / SH, 2) +
      RT * (deltaCPrime / SC) * (deltaHPrime / SH)
  );

  return Math.round(dE * 100) / 100;
}

/**
 * Calculates color harmony score (0 - 40) between garment hex and user palette
 */
export function scorePaletteHarmony(garmentHex: string, paletteHexes: string[]): {
  score: number;
  bestSwatchHex: string;
  minDeltaE: number;
} {
  if (!paletteHexes.length) {
    return { score: 25, bestSwatchHex: '#FFFFFF', minDeltaE: 20 };
  }

  const garmentLab = hexToLab(garmentHex);
  let minDeltaE = Infinity;
  let bestSwatchHex = paletteHexes[0];

  for (const swatch of paletteHexes) {
    const swatchLab = hexToLab(swatch);
    const dE = calculateDeltaE(garmentLab, swatchLab);
    if (dE < minDeltaE) {
      minDeltaE = dE;
      bestSwatchHex = swatch;
    }
  }

  // Scoring mapping for fashion harmony:
  // dE < 12: High match / monochromatic / ton-sur-ton (40 pts)
  // dE 12-25: Elegant harmonious contrast (34-39 pts)
  // dE 25-45: Balanced complement (25-33 pts)
  // dE > 45: High clash / discordant (10-24 pts)
  let score: number;
  if (minDeltaE <= 12) {
    score = 40;
  } else if (minDeltaE <= 25) {
    score = Math.round(40 - ((minDeltaE - 12) / 13) * 6);
  } else if (minDeltaE <= 45) {
    score = Math.round(34 - ((minDeltaE - 25) / 20) * 10);
  } else {
    score = Math.max(10, Math.round(24 - ((minDeltaE - 45) / 40) * 14));
  }

  return { score, bestSwatchHex, minDeltaE };
}
