// Cart DTOs matching the C# backend

export interface CartDto {
  id: string;
  customerId: string;
  items: CartItemDto[];
  totalAmount: number;
  currency: string;
  totalItems: number;
  expiresAt?: Date;
}

export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  availableStock: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
