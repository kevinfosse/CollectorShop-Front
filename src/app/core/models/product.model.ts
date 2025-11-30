// Product DTOs matching the C# backend

export enum ProductCondition {
  New = 0,
  LikeNew = 1,
  Excellent = 2,
  Good = 3,
  Fair = 4,
  Poor = 5,
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  compareAtPrice?: number;
  stockQuantity: number;
  availableQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  condition: ProductCondition;
  weight: number;
  dimensions?: string;
  categoryId: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  images: ProductImageDto[];
  attributes: ProductAttributeDto[];
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ProductListDto {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  compareAtPrice?: number;
  availableQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  condition: ProductCondition;
  categoryName?: string;
  brandName?: string;
  primaryImageUrl?: string;
  averageRating: number;
}

export interface ProductImageDto {
  id: string;
  url: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductAttributeDto {
  id: string;
  name: string;
  value: string;
}

export interface ProductFilterRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  sku: string;
  price: number;
  currency?: string;
  compareAtPrice?: number;
  stockQuantity: number;
  condition?: ProductCondition;
  weight: number;
  dimensions?: string;
  categoryId: string;
  brandId?: string;
  isFeatured?: boolean;
  images: CreateProductImageRequest[];
  attributes: CreateProductAttributeRequest[];
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  currency?: string;
  compareAtPrice?: number;
  stockQuantity: number;
  condition: ProductCondition;
  weight: number;
  dimensions?: string;
  categoryId: string;
  brandId?: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface CreateProductImageRequest {
  url: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface CreateProductAttributeRequest {
  name: string;
  value: string;
}

// Helper to get condition label
export const ProductConditionLabels: Record<ProductCondition, string> = {
  [ProductCondition.New]: 'New',
  [ProductCondition.LikeNew]: 'Like New',
  [ProductCondition.Excellent]: 'Excellent',
  [ProductCondition.Good]: 'Good',
  [ProductCondition.Fair]: 'Fair',
  [ProductCondition.Poor]: 'Poor',
};
