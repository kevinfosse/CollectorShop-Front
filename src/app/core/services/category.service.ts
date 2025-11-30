import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CategoryDto,
  CategoryListDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  constructor(private readonly http: HttpClient) {}

  getCategories(): Observable<CategoryListDto[]> {
    return this.http.get<CategoryListDto[]>(this.apiUrl);
  }

  getCategoryTree(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.apiUrl}/tree`);
  }

  getCategory(id: string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.apiUrl}/${id}`);
  }

  getCategoryBySlug(slug: string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.apiUrl}/slug/${slug}`);
  }

  getSubCategories(id: string): Observable<CategoryListDto[]> {
    return this.http.get<CategoryListDto[]>(`${this.apiUrl}/${id}/subcategories`);
  }

  // Admin methods
  createCategory(request: CreateCategoryRequest): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.apiUrl, request);
  }

  updateCategory(id: string, request: UpdateCategoryRequest): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.apiUrl}/${id}`, request);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
