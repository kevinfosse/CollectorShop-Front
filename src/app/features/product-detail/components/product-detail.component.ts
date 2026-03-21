import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  ProductService,
  CartService,
  AuthService,
  WishlistService,
  ToastService,
} from '../../../core/services';
import { ReviewService } from '../../../core/services/review.service';
import { ProductDto, ProductConditionLabels, ProductCondition } from '../../../core/models';
import { ReviewDto, CreateReviewRequest } from '../../../core/models/review.model';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, FormsModule, CurrencyPipe, DatePipe, DecimalPipe, TranslateModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  protected readonly authService = inject(AuthService);
  private readonly wishlistService = inject(WishlistService);
  private readonly toastService = inject(ToastService);
  private readonly reviewService = inject(ReviewService);

  protected readonly product = signal<ProductDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly selectedImageIndex = signal(0);
  protected readonly quantity = signal(1);

  // Reviews
  protected readonly reviews = signal<ReviewDto[]>([]);
  protected readonly reviewsLoading = signal(false);
  protected readonly submittingReview = signal(false);
  protected readonly canReview = signal(false);
  protected readonly canReviewReason = signal('');
  protected reviewRating = 0;
  protected reviewTitle = '';
  protected reviewComment = '';
  protected hoverRating = 0;

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
    return p?.discountPercentage ?? null;
  });

  protected readonly isInStock = computed(() => {
    const p = this.product();
    return p ? p.availableQuantity > 0 : false;
  });

  protected readonly averageRating = computed(() => {
    const r = this.reviews();
    if (!r.length) return 0;
    return r.reduce((sum, rev) => sum + rev.rating, 0) / r.length;
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

    this.productService.getProduct(idOrSlug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        this.loadReviews(product.id);
      },
      error: (err) => {
        this.error.set(err.message || 'Product not found');
        this.loading.set(false);
      },
    });
  }

  private loadReviews(productId: string): void {
    this.reviewsLoading.set(true);
    this.reviewService.getProductReviews(productId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.reviewsLoading.set(false);
      },
      error: () => {
        this.reviewsLoading.set(false);
      },
    });

    if (this.authService.isAuthenticated()) {
      this.reviewService.canReview(productId).subscribe({
        next: (res) => {
          this.canReview.set(res.canReview);
          this.canReviewReason.set(res.reason);
        },
        error: () => {
          this.canReview.set(false);
        },
      });
    }
  }

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.set(this.quantity() - 1);
    }
  }

  protected readonly remainingStock = computed(() => {
    const p = this.product();
    if (!p) return 0;
    const inCart = this.cartService.getCartQuantity(p.id);
    return Math.max(0, p.availableQuantity - inCart);
  });

  protected increaseQty(): void {
    const max = this.remainingStock();
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

    if (this.quantity() > this.remainingStock()) {
      this.toastService.show('TOAST.MAX_STOCK_REACHED', 'warning');
      return;
    }

    this.cartService.addToCart({ productId, quantity: this.quantity() }).subscribe({
      next: () => {
        this.toastService.show('TOAST.ADDED_TO_CART', 'success');
        this.quantity.set(1);
      },
      error: () => this.toastService.show('TOAST.CART_ERROR', 'error'),
    });
  }

  protected toggleWishlist(): void {
    const productId = this.product()?.id;
    if (!productId) return;

    if (!this.authService.isAuthenticated()) {
      this.toastService.show('TOAST.LOGIN_REQUIRED', 'warning');
      return;
    }

    if (this.wishlistService.isInWishlist(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: () => this.toastService.show('TOAST.WISHLIST_REMOVED', 'success'),
        error: () => this.toastService.show('TOAST.WISHLIST_ERROR', 'error'),
      });
    } else {
      this.wishlistService.addToWishlist({ productId }).subscribe({
        next: () => this.toastService.show('TOAST.WISHLIST_ADDED', 'success'),
        error: () => this.toastService.show('TOAST.WISHLIST_ERROR', 'error'),
      });
    }
  }

  protected isInWishlist(): boolean {
    const productId = this.product()?.id;
    return productId ? this.wishlistService.isInWishlist(productId) : false;
  }

  protected setRating(rating: number): void {
    this.reviewRating = rating;
  }

  protected submitReview(): void {
    const productId = this.product()?.id;
    if (!productId || this.reviewRating === 0) return;

    this.submittingReview.set(true);
    const request: CreateReviewRequest = {
      productId,
      rating: this.reviewRating,
      title: this.reviewTitle || undefined,
      comment: this.reviewComment || undefined,
    };

    this.reviewService.createReview(request).subscribe({
      next: () => {
        this.reviewRating = 0;
        this.reviewTitle = '';
        this.reviewComment = '';
        this.submittingReview.set(false);
        this.toastService.show('TOAST.REVIEW_SUBMITTED', 'success');
        this.loadReviews(productId);
      },
      error: () => {
        this.submittingReview.set(false);
        this.toastService.show('TOAST.REVIEW_ERROR', 'error');
      },
    });
  }
}
