import { Product } from "@/types/enhanced-product.types";

export interface SearchFilters {
  query?: string;
  category?: string;
  priceRange?: { min: number; max: number };
  paymentType?: 'money' | 'points' | 'hybrid' | 'all';
  inStock?: boolean;
  onSale?: boolean;
  rating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popularity';
}

export class ProductSearchService {
  static searchProducts(products: Product[], filters: SearchFilters): Product[] {
    let filteredProducts = [...products];

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(product =>
        product.category === filters.category
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filteredProducts = filteredProducts.filter(product => {
        const price = product.discount.percentage > 0 
          ? product.price * (1 - product.discount.percentage / 100)
          : product.price;
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }

    // Payment type filter
    if (filters.paymentType && filters.paymentType !== 'all') {
      filteredProducts = filteredProducts.filter(product =>
        product.paymentType === filters.paymentType
      );
    }

    // Stock filter
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(product => product.stock > 0);
    }

    // Sale filter
    if (filters.onSale) {
      filteredProducts = filteredProducts.filter(product => 
        product.isOnSale || product.discount.percentage > 0
      );
    }

    // Rating filter
    if (filters.rating) {
      filteredProducts = filteredProducts.filter(product =>
        product.rating >= filters.rating!
      );
    }

    // Sorting
    if (filters.sortBy) {
      filteredProducts = this.sortProducts(filteredProducts, filters.sortBy);
    }

    return filteredProducts;
  }

  private static sortProducts(products: Product[], sortBy: string): Product[] {
    return products.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return this.getEffectivePrice(a) - this.getEffectivePrice(b);
        case 'price_desc':
          return this.getEffectivePrice(b) - this.getEffectivePrice(a);
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.id - a.id; // Assuming higher ID means newer
        case 'popularity':
          return b.rating * Math.random() - a.rating * Math.random(); // Mock popularity
        default:
          return 0;
      }
    });
  }

  private static getEffectivePrice(product: Product): number {
    return product.discount.percentage > 0 
      ? product.price * (1 - product.discount.percentage / 100)
      : product.price;
  }

  static getCategories(products: Product[]): string[] {
    const categories = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(categories) as string[];
  }

  static getPriceRange(products: Product[]): { min: number; max: number } {
    const prices = products.map(p => this.getEffectivePrice(p));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }
}