import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService, CartService, AuthService, WishlistService, ToastService } from '../../../core/services';
import { ProductDto, ProductConditionLabels, ProductCondition } from '../../../core/models';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, CurrencyPipe, TranslateModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly wishlistService = inject(WishlistService);
  private readonly toastService = inject(ToastService);

  protected readonly product = signal<ProductDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedImageIndex = signal(0);
  protected readonly quantity = signal(1);

  protected readonly selectedImage = computed(() => {
    const p = this.product();
    if (!p || !p.images.length) return '/assets/images/placeholder.jpg';
    return p.images[this.selectedImageIndex()]?.url ?? p.images[0].url;
  });

  protected readonly conditionLabel = computed(() => {
    const p = this.product();
    if (!p) return '';
    return ProductConditionLabels[p.condition as ProductCondition] || '';
  });

  protected readonly discountPercentage = computed(() => {
    const p = this.product();
    if (!p || !p.compareAtPrice || p.compareAtPrice <= p.price) return null;
    return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
  });

  protected readonly isInStock = computed(() => {
    const p = this.product();
    return p ? p.availableQuantity > 0 : false;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  private loadProduct(idOrSlug: string): void {
    this.loading.set(true);
    this.error.set(null);

    // Try loading by ID (UUID format) or fall back to treating it as an ID
    this.productService.getProduct(idOrSlug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Product not found');
        this.loading.set(false);
      },
    });
  }

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.set(this.quantity() - 1);
    }
  }

  protected increaseQty(): void {
    const max = this.product()?.availableQuantity ?? 99;
    if (this.quantity() < max) {
      this.quantity.set(this.quantity() + 1);
    }
  }

  protected addToCart(): void {
    const productId = this.product()?.id;
    if (!productId) return;

    if (!this.authService.isAuthenticated()) {
      console.log('Please login to add items to cart');
      return;
    }

    this.cartService.addToCart({ productId, quantity: this.quantity() }).subscribe({
      next: () => this.toastService.show('TOAST.ADDED_TO_CART', 'success'),
      error: () => this.toastService.show('TOAST.CART_ERROR', 'error'),
    });
  }

  protected toggleWishlist(): void {
    const productId = this.product()?.id;
    if (!productId) return;

    if (!this.authService.isAuthenticated()) {
      console.log('Please login to manage wishlist');
      return;
    }

    if (this.wishlistService.isInWishlist(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe();
    } else {
      this.wishlistService.addToWishlist({ productId }).subscribe();
    }
  }

  protected isInWishlist(): boolean {
    const productId = this.product()?.id;
    return productId ? this.wishlistService.isInWishlist(productId) : false;
  }
}
