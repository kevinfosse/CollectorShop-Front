export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number; // Original price for sale items
  currency: string;
  images: ProductImage[];
  category: ProductCategory;
  tags: string[];
  condition: ProductCondition;
  rarity?: ProductRarity;
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  brand?: string;
  year?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export type ProductCondition = 'mint' | 'near-mint' | 'excellent' | 'good' | 'fair' | 'poor';

export type ProductRarity = 'common' | 'uncommon' | 'rare' | 'ultra-rare' | 'legendary';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition[];
  rarity?: ProductRarity[];
  inStock?: boolean;
  search?: string;
  sort?: ProductSortOption;
}

export type ProductSortOption =
  | 'newest'
  | 'oldest'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc'
  | 'rating';
