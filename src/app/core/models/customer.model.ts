// Customer DTOs matching the C# backend

export interface CustomerDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface CustomerProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  addresses: CustomerAddressDto[];
  orderCount: number;
  wishlistCount: number;
}

export interface CustomerAddressDto {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
  isBillingAddress: boolean;
  isShippingAddress: boolean;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface CreateAddressRequest {
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault?: boolean;
  isBillingAddress?: boolean;
  isShippingAddress?: boolean;
}

export interface UpdateAddressRequest {
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault?: boolean;
  isBillingAddress?: boolean;
  isShippingAddress?: boolean;
}
