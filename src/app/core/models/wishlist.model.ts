// Wishlist DTOs

export interface WishlistItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  imageUrl?: string;
  price: number;
  currency: string;
  isInStock: boolean;
  addedAt: Date;
}

export interface AddToWishlistRequest {
  productId: string;
}
