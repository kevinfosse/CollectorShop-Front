import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PagedResponse,
  ProductDto,
  ProductListDto,
  ProductFilterRequest,
  CreateProductRequest,
  UpdateProductRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private readonly http: HttpClient) {}

  getProducts(filter?: ProductFilterRequest): Observable<PagedResponse<ProductListDto>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
      if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
      if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
      if (filter.brandId) params = params.set('brandId', filter.brandId);
      if (filter.minPrice !== undefined)
        params = params.set('minPrice', filter.minPrice.toString());
      if (filter.maxPrice !== undefined)
        params = params.set('maxPrice', filter.maxPrice.toString());
      if (filter.condition !== undefined)
        params = params.set('condition', filter.condition.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortDescending !== undefined)
        params = params.set('sortDescending', filter.sortDescending.toString());
    }

    return this.http.get<PagedResponse<ProductListDto>>(this.apiUrl, { params });
  }

  getProduct(id: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.apiUrl}/${id}`);
  }

  getProductBySku(sku: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.apiUrl}/sku/${sku}`);
  }

  getFeaturedProducts(count: number = 8): Observable<ProductListDto[]> {
    return this.http.get<ProductListDto[]>(`${this.apiUrl}/featured`, {
      params: new HttpParams().set('count', count.toString()),
    });
  }

  getNewArrivals(count: number = 8): Observable<ProductListDto[]> {
    return this.http.get<ProductListDto[]>(`${this.apiUrl}/new-arrivals`, {
      params: new HttpParams().set('count', count.toString()),
    });
  }

  getRelatedProducts(productId: string, count: number = 4): Observable<ProductListDto[]> {
    return this.http.get<ProductListDto[]>(`${this.apiUrl}/${productId}/related`, {
      params: new HttpParams().set('count', count.toString()),
    });
  }

  searchProducts(query: string, limit: number = 10): Observable<ProductListDto[]> {
    return this.http.get<ProductListDto[]>(`${this.apiUrl}/search`, {
      params: new HttpParams().set('query', query).set('limit', limit.toString()),
    });
  }

  // Admin methods
  createProduct(request: CreateProductRequest): Observable<ProductDto> {
    return this.http.post<ProductDto>(this.apiUrl, request);
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<ProductDto> {
    return this.http.put<ProductDto>(`${this.apiUrl}/${id}`, request);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStock(id: string, quantity: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/stock`, { quantity });
  }
}
