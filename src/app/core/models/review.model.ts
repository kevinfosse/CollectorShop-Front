// Review DTOs matching the C# backend

export interface ReviewDto {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
}

export interface CanReviewResponse {
  canReview: boolean;
  reason: string;
}
