import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartDto, AddToCartRequest, UpdateCartItemRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  // Signals for reactive cart state
  private readonly _cart = signal<CartDto | null>(null);
  private readonly _loading = signal(false);

  readonly cart = this._cart.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly itemCount = computed(() => this._cart()?.totalItems ?? 0);
  readonly totalAmount = computed(() => this._cart()?.totalAmount ?? 0);
  readonly isEmpty = computed(() => (this._cart()?.items?.length ?? 0) === 0);

  constructor(private readonly http: HttpClient) {}

  loadCart(): Observable<CartDto> {
    this._loading.set(true);
    return this.http.get<CartDto>(this.apiUrl).pipe(
      tap((cart) => {
        this._cart.set(cart);
        this._loading.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        // 404 means no customer profile yet — treat as empty cart
        if (err.status === 404) {
          this._cart.set(null);
          return of(null as unknown as CartDto);
        }
        throw err;
      }),
    );
  }

  addToCart(request: AddToCartRequest): Observable<CartDto> {
    this._loading.set(true);
    return this.http.post<CartDto>(`${this.apiUrl}/items`, request).pipe(
      tap({
        next: (cart) => {
          this._cart.set(cart);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  updateCartItem(productId: string, request: UpdateCartItemRequest): Observable<CartDto> {
    this._loading.set(true);
    return this.http.put<CartDto>(`${this.apiUrl}/items/${productId}`, request).pipe(
      tap({
        next: (cart) => {
          this._cart.set(cart);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  removeFromCart(productId: string): Observable<CartDto> {
    this._loading.set(true);
    return this.http.delete<CartDto>(`${this.apiUrl}/items/${productId}`).pipe(
      tap({
        next: (cart) => {
          this._cart.set(cart);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  clearCart(): Observable<void> {
    this._loading.set(true);
    return this.http.delete<void>(this.apiUrl).pipe(
      tap({
        next: () => {
          this._cart.set(null);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  // Helper to update quantity
  updateQuantity(productId: string, quantity: number): Observable<CartDto> {
    return this.updateCartItem(productId, { quantity });
  }

  // Clear local cart state (e.g., on logout)
  resetCart(): void {
    this._cart.set(null);
  }
}
