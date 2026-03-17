import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WishlistItemDto, AddToWishlistRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly apiUrl = `${environment.apiUrl}/wishlist`;

  // Signals for reactive wishlist state
  private readonly _items = signal<WishlistItemDto[]>([]);
  private readonly _loading = signal(false);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly count = computed(() => this._items().length);
  readonly isEmpty = computed(() => this._items().length === 0);

  constructor(private readonly http: HttpClient) {}

  loadWishlist(): Observable<WishlistItemDto[]> {
    this._loading.set(true);
    return this.http.get<WishlistItemDto[]>(this.apiUrl).pipe(
      tap((items) => {
        this._items.set(items);
        this._loading.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        // 404 means no customer profile yet — treat as empty wishlist
        if (err.status === 404) {
          this._items.set([]);
          return of([] as WishlistItemDto[]);
        }
        throw err;
      }),
    );
  }

  addToWishlist(request: AddToWishlistRequest): Observable<WishlistItemDto | null> {
    return this.http.post<WishlistItemDto>(this.apiUrl, request).pipe(
      tap((item) => {
        this._items.update((items) => [...items, item]);
      }),
      catchError((err: HttpErrorResponse) => {
        // 400 or 409 means item already in wishlist — not a real error
        if (err.status === 400 || err.status === 409) {
          return of(null);
        }
        throw err;
      }),
    );
  }

  removeFromWishlist(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`).pipe(
      tap(() => {
        this._items.update((items) => items.filter((i) => i.productId !== productId));
      }),
    );
  }

  isInWishlist(productId: string): boolean {
    return this._items().some((item) => item.productId === productId);
  }

  moveToCart(productId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${productId}/move-to-cart`, {}).pipe(
      tap(() => {
        this._items.update((items) => items.filter((i) => i.productId !== productId));
      }),
    );
  }

  // Clear local wishlist state (e.g., on logout)
  resetWishlist(): void {
    this._items.set([]);
  }
}
