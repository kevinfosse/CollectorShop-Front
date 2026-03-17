import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CouponDto,
  ValidateCouponRequest,
  ValidateCouponResponse,
  CreateCouponRequest,
  UpdateCouponRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/coupons`;

  validateCoupon(request: ValidateCouponRequest): Observable<ValidateCouponResponse> {
    return this.http.post<ValidateCouponResponse>(`${this.apiUrl}/validate`, request);
  }

  // Admin methods
  getCoupons(): Observable<CouponDto[]> {
    return this.http.get<CouponDto[]>(this.apiUrl);
  }

  getCoupon(id: string): Observable<CouponDto> {
    return this.http.get<CouponDto>(`${this.apiUrl}/${id}`);
  }

  createCoupon(request: CreateCouponRequest): Observable<CouponDto> {
    return this.http.post<CouponDto>(this.apiUrl, request);
  }

  updateCoupon(id: string, request: UpdateCouponRequest): Observable<CouponDto> {
    return this.http.put<CouponDto>(`${this.apiUrl}/${id}`, request);
  }

  deleteCoupon(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
