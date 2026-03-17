import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCardComponent } from '../../../shared/components/card-preview/product-card.component';
import { QuickViewModalComponent } from '../../../shared/ui/modal/quick-view-modal.component';
import { ProductService, CategoryService, WishlistService, CartService, AuthService, ToastService } from '../../../core/services';
import { ProductListDto, CategoryListDto } from '../../../core/models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslateModule, ProductCardComponent, QuickViewModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly featuredProducts = signal<ProductListDto[]>([]);
  protected readonly categories = signal<CategoryListDto[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
  }

  private loadFeaturedProducts(): void {
    this.productService.getFeaturedProducts(4).subscribe({
      next: (products) => {
        this.featuredProducts.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load featured products', err);
        this.loading.set(false);
      },
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  onAddToCart(product: ProductListDto): void {
    if (!this.authService.isAuthenticated()) {
      console.log('Please login to add items to cart');
      return;
    }
    this.cartService.addToCart({ productId: product.id, quantity: 1 }).subscribe({
      next: () => this.toastService.show('TOAST.ADDED_TO_CART', 'success'),
      error: () => this.toastService.show('TOAST.CART_ERROR', 'error'),
    });
  }

  onAddToWishlist(product: ProductListDto): void {
    if (!this.authService.isAuthenticated()) {
      console.log('Please login to add items to wishlist');
      return;
    }

    if (this.wishlistService.isInWishlist(product.id)) {
      this.wishlistService.removeFromWishlist(product.id).subscribe({
        next: () => console.log('Removed from wishlist:', product.name),
        error: (err) => console.error('Failed to remove from wishlist', err),
      });
    } else {
      this.wishlistService.addToWishlist({ productId: product.id }).subscribe({
        next: () => console.log('Added to wishlist:', product.name),
        error: (err) => console.error('Failed to add to wishlist', err),
      });
    }
  }

  protected readonly quickViewProductId = signal<string | null>(null);

  onQuickView(product: ProductListDto): void {
    this.quickViewProductId.set(product.id);
  }

  onCloseQuickView(): void {
    this.quickViewProductId.set(null);
  }
}
