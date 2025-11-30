import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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
      tap({
        next: (items) => {
          this._items.set(items);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      })
    );
  }

  addToWishlist(request: AddToWishlistRequest): Observable<WishlistItemDto> {
    return this.http.post<WishlistItemDto>(this.apiUrl, request).pipe(
      tap((item) => {
        this._items.update((items) => [...items, item]);
      })
    );
  }

  removeFromWishlist(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`).pipe(
      tap(() => {
        this._items.update((items) => items.filter((i) => i.productId !== productId));
      })
    );
  }

  isInWishlist(productId: string): boolean {
    return this._items().some((item) => item.productId === productId);
  }

  // Clear local wishlist state (e.g., on logout)
  resetWishlist(): void {
    this._items.set([]);
  }
}
