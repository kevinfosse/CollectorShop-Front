// Category DTOs matching the C# backend

export interface CategoryDto {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  parentCategoryId?: string;
  parentCategoryName?: string;
  productCount: number;
  subCategories: CategoryDto[];
}

export interface CategoryListDto {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  parentCategoryId?: string;
  productCount: number;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  displayOrder: number;
  parentCategoryId?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  displayOrder: number;
  parentCategoryId?: string;
  isActive: boolean;
}
