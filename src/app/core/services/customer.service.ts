import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CustomerDto,
  UpdateProfileRequest,
  CustomerAddressDto,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly apiUrl = `${environment.apiUrl}/customers`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<CustomerDto> {
    return this.http.get<CustomerDto>(`${this.apiUrl}/me`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<CustomerDto> {
    return this.http.put<CustomerDto>(`${this.apiUrl}/me`, request);
  }

  // Addresses
  getAddresses(): Observable<CustomerAddressDto[]> {
    return this.http.get<CustomerAddressDto[]>(`${this.apiUrl}/me/addresses`);
  }

  createAddress(request: CreateAddressRequest): Observable<CustomerAddressDto> {
    return this.http.post<CustomerAddressDto>(`${this.apiUrl}/me/addresses`, request);
  }

  updateAddress(addressId: string, request: UpdateAddressRequest): Observable<CustomerAddressDto> {
    return this.http.put<CustomerAddressDto>(`${this.apiUrl}/me/addresses/${addressId}`, request);
  }

  deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/addresses/${addressId}`);
  }
}
