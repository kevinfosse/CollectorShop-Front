import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PagedResponse,
  OrderDto,
  OrderListDto,
  OrderFilterRequest,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  ShipOrderRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  getOrders(filter?: OrderFilterRequest): Observable<PagedResponse<OrderListDto>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
      if (filter.customerId) params = params.set('customerId', filter.customerId);
      if (filter.status !== undefined) params = params.set('status', filter.status.toString());
      if (filter.fromDate) params = params.set('fromDate', filter.fromDate.toISOString());
      if (filter.toDate) params = params.set('toDate', filter.toDate.toISOString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortDescending !== undefined)
        params = params.set('sortDescending', filter.sortDescending.toString());
    }

    return this.http.get<PagedResponse<OrderListDto>>(this.apiUrl, { params });
  }

  getOrder(id: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.apiUrl}/${id}`);
  }

  getOrderByNumber(orderNumber: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.apiUrl}/number/${orderNumber}`);
  }

  createOrder(request: CreateOrderRequest): Observable<OrderDto> {
    return this.http.post<OrderDto>(this.apiUrl, request);
  }

  cancelOrder(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // Admin methods
  updateOrderStatus(id: string, request: UpdateOrderStatusRequest): Observable<OrderDto> {
    return this.http.patch<OrderDto>(`${this.apiUrl}/${id}/status`, request);
  }

  shipOrder(id: string, request: ShipOrderRequest): Observable<OrderDto> {
    return this.http.post<OrderDto>(`${this.apiUrl}/${id}/ship`, request);
  }

  markAsDelivered(id: string): Observable<OrderDto> {
    return this.http.post<OrderDto>(`${this.apiUrl}/${id}/deliver`, {});
  }
}
