import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CustomerProfileDto,
  UpdateProfileRequest,
  CustomerAddressDto,
  CreateAddressRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly apiUrl = `${environment.apiUrl}/customers`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<CustomerProfileDto> {
    return this.http.get<CustomerProfileDto>(`${this.apiUrl}/profile`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<CustomerProfileDto> {
    return this.http.put<CustomerProfileDto>(`${this.apiUrl}/profile`, request);
  }

  // Addresses
  getAddresses(): Observable<CustomerAddressDto[]> {
    return this.http.get<CustomerAddressDto[]>(`${this.apiUrl}/addresses`);
  }

  getAddress(id: string): Observable<CustomerAddressDto> {
    return this.http.get<CustomerAddressDto>(`${this.apiUrl}/addresses/${id}`);
  }

  addAddress(request: CreateAddressRequest): Observable<CustomerAddressDto> {
    return this.http.post<CustomerAddressDto>(`${this.apiUrl}/addresses`, request);
  }

  updateAddress(id: string, request: CreateAddressRequest): Observable<CustomerAddressDto> {
    return this.http.put<CustomerAddressDto>(`${this.apiUrl}/addresses/${id}`, request);
  }

  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/addresses/${id}`);
  }

  setDefaultAddress(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/addresses/${id}/set-default`, {});
  }
}
