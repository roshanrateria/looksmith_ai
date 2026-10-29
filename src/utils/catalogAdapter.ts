/**
 * Catalog Adapter and Type Definitions
 * Normalizes any retailer feed to the uniform Product schema specified in §5.
 */

export type ProductCategory =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'ethnic'
  | 'shoes'
  | 'bag'
  | 'accessory'
  | 'jewellery';

export interface Product {
  sku: string;
  title: string;
  brand: string;
  price: number;
  currency: string;
  category: ProductCategory;
  colorName: string;
  colorHex: string;
  imageUrl: string;
  tags: string[];
  occasion: string[];
  url: string;
  inStock: boolean;
  material?: string;
}

export interface CatalogFilterOptions {
  category?: ProductCategory;
  maxPrice?: number;
  occasion?: string;
  inStockOnly?: boolean;
  preferredColors?: string[];
  searchQuery?: string;
}

/**
 * Filter catalog products by category, occasion, price, and stock
 */
export function filterCatalog(products: Product[], options: CatalogFilterOptions): Product[] {
  return products.filter((p) => {
    if (options.inStockOnly !== false && !p.inStock) return false;
    if (options.category && p.category !== options.category) return false;
    if (options.maxPrice && p.price > options.maxPrice) return false;

    if (options.occasion && options.occasion !== 'all') {
      const occLower = options.occasion.toLowerCase();
      const hasOccasion = p.occasion.some(
        (o) => o.toLowerCase().includes(occLower) || occLower.includes(o.toLowerCase())
      );
      const hasTag = p.tags.some(
        (t) => t.toLowerCase().includes(occLower) || occLower.includes(t.toLowerCase())
      );
      if (!hasOccasion && !hasTag) return false;
    }

    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      const titleMatch = p.title.toLowerCase().includes(q);
      const brandMatch = p.brand.toLowerCase().includes(q);
      const tagMatch = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!titleMatch && !brandMatch && !tagMatch) return false;
    }

    return true;
  });
}

/**
 * Finds alternative replacement items for a given product in the same category slot.
 */
export function findSwapAlternatives(
  currentProduct: Product,
  allProducts: Product[],
  paletteHexes: string[] = [],
  limit = 3
): Product[] {
  // Find products in same category (or complementary), excluding current SKU
  const candidates = allProducts.filter(
    (p) => p.sku !== currentProduct.sku && p.category === currentProduct.category && p.inStock
  );

  if (candidates.length <= limit) {
    return candidates;
  }

  // Rank candidates by price proximity or palette harmony
  return candidates.slice(0, limit);
}
