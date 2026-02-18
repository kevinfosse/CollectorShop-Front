import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WishlistService, AuthService, ToastService } from '../../../../core/services';
import { TranslateService } from '@ngx-translate/core';

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
  private readonly toastService = inject(ToastService);
  private readonly translateService = inject(TranslateService);

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
      next: () => this.toastService.show(this.translateService.instant('TOAST.MOVED_TO_CART'), 'success'),
      error: () => this.toastService.show(this.translateService.instant('TOAST.CART_ERROR'), 'error'),
    });
  }

  protected viewProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }
}
