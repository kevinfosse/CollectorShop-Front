import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BrandDto, CreateBrandRequest, UpdateBrandRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/brands`;

  getBrands(): Observable<BrandDto[]> {
    return this.http.get<BrandDto[]>(this.apiUrl);
  }

  getBrand(id: string): Observable<BrandDto> {
    return this.http.get<BrandDto>(`${this.apiUrl}/${id}`);
  }

  getBrandBySlug(slug: string): Observable<BrandDto> {
    return this.http.get<BrandDto>(`${this.apiUrl}/slug/${slug}`);
  }

  // Admin methods
  createBrand(request: CreateBrandRequest): Observable<BrandDto> {
    return this.http.post<BrandDto>(this.apiUrl, request);
  }

  updateBrand(id: string, request: UpdateBrandRequest): Observable<BrandDto> {
    return this.http.put<BrandDto>(`${this.apiUrl}/${id}`, request);
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
