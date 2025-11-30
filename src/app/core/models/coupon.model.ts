// Coupon DTOs matching the C# backend

export enum CouponType {
  Percentage = 0,
  FixedAmount = 1,
  FreeShipping = 2,
}

export interface CouponDto {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  usageLimitPerCustomer?: number;
  startsAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  isValid: boolean;
}

export interface CreateCouponRequest {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  startsAt?: Date;
  expiresAt?: Date;
}

export interface UpdateCouponRequest {
  description: string;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  startsAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface ValidateCouponRequest {
  code: string;
  orderAmount: number;
}

export interface ValidateCouponResponse {
  isValid: boolean;
  message?: string;
  discountAmount: number;
}

// Helper to get coupon type label
export const CouponTypeLabels: Record<CouponType, string> = {
  [CouponType.Percentage]: 'Percentage',
  [CouponType.FixedAmount]: 'Fixed Amount',
  [CouponType.FreeShipping]: 'Free Shipping',
};
