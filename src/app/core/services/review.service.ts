import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PagedResponse,
  ReviewDto,
  CreateReviewRequest,
  UpdateReviewRequest,
  PagedRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private readonly http: HttpClient) {}

  getProductReviews(
    productId: string,
    paging?: PagedRequest
  ): Observable<PagedResponse<ReviewDto>> {
    let params = new HttpParams();

    if (paging) {
      if (paging.pageNumber) params = params.set('pageNumber', paging.pageNumber.toString());
      if (paging.pageSize) params = params.set('pageSize', paging.pageSize.toString());
      if (paging.sortBy) params = params.set('sortBy', paging.sortBy);
      if (paging.sortDescending !== undefined)
        params = params.set('sortDescending', paging.sortDescending.toString());
    }

    return this.http.get<PagedResponse<ReviewDto>>(`${this.apiUrl}/product/${productId}`, {
      params,
    });
  }

  getMyReviews(paging?: PagedRequest): Observable<PagedResponse<ReviewDto>> {
    let params = new HttpParams();

    if (paging) {
      if (paging.pageNumber) params = params.set('pageNumber', paging.pageNumber.toString());
      if (paging.pageSize) params = params.set('pageSize', paging.pageSize.toString());
    }

    return this.http.get<PagedResponse<ReviewDto>>(`${this.apiUrl}/my-reviews`, { params });
  }

  getReview(id: string): Observable<ReviewDto> {
    return this.http.get<ReviewDto>(`${this.apiUrl}/${id}`);
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
  approveReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reject`, {});
  }
}
