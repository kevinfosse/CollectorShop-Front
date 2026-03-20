import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewDto, CreateReviewRequest, UpdateReviewRequest, CanReviewResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  getProductReviews(productId: string): Observable<ReviewDto[]> {
    return this.http.get<ReviewDto[]>(`${this.apiUrl}/product/${productId}`);
  }

  canReview(productId: string): Observable<CanReviewResponse> {
    return this.http.get<CanReviewResponse>(`${this.apiUrl}/can-review/${productId}`);
  }

  getMyReviews(): Observable<ReviewDto[]> {
    return this.http.get<ReviewDto[]>(`${this.apiUrl}/my-reviews`);
  }

  createReview(request: CreateReviewRequest): Observable<ReviewDto> {
    return this.http.post<ReviewDto>(this.apiUrl, request);
  }

  updateReview(id: string, request: UpdateReviewRequest): Observable<ReviewDto> {
    return this.http.put<ReviewDto>(`${this.apiUrl}/${id}`, request);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Admin methods
  getPendingReviews(): Observable<ReviewDto[]> {
    return this.http.get<ReviewDto[]>(`${this.apiUrl}/pending`);
  }

  approveReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reject`, {});
  }
}
