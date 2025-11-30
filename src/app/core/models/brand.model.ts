// Brand DTOs matching the C# backend

export interface BrandDto {
  id: string;
  name: string;
  description: string;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  productCount: number;
}

export interface CreateBrandRequest {
  name: string;
  description: string;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface UpdateBrandRequest {
  name: string;
  description: string;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
}
