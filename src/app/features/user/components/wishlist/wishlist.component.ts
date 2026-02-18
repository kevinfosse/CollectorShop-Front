import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WishlistService, AuthService } from '../../../../core/services';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink, CurrencyPipe, TranslateModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly items = this.wishlistService.items;
  protected readonly loading = this.wishlistService.loading;
  protected readonly isEmpty = this.wishlistService.isEmpty;
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.wishlistService.loadWishlist().subscribe();
    }
  }

  protected removeItem(productId: string): void {
    this.wishlistService.removeFromWishlist(productId).subscribe();
  }

  protected moveToCart(productId: string): void {
    this.wishlistService.moveToCart(productId).subscribe({
      next: () => {
        // Item removed from wishlist signal automatically via service
      },
      error: (err) => console.error('Failed to move to cart', err),
    });
  }

  protected viewProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }
}
