import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCardComponent } from '../../../../shared/components/card-preview/product-card.component';
import {
  ProductService,
  CartService,
  WishlistService,
  CategoryService,
  AuthService,
} from '../../../../core/services';
import { ProductListDto, ProductFilterRequest, CategoryListDto } from '../../../../core/models';

@Component({
  selector: 'app-catalog-list',
  imports: [RouterLink, TranslateModule, ProductCardComponent],
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.scss',
})
export class CatalogListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);

  // State signals
  protected readonly products = signal<ProductListDto[]>([]);
  protected readonly categories = signal<CategoryListDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly totalCount = signal(0);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(12);

  // Filter state
  protected readonly selectedCategoryId = signal<string | null>(null);
  protected readonly searchTerm = signal('');
  protected readonly minPrice = signal<number | undefined>(undefined);
  protected readonly maxPrice = signal<number | undefined>(undefined);
  protected readonly sortBy = signal('createdAt');
  protected readonly sortDescending = signal(true);

  protected readonly currentCategory = computed(() => {
    const categorySlug = this.route.snapshot.paramMap.get('category');
    if (!categorySlug) return 'All Products';
    return this.formatCategoryName(categorySlug);
  });

  protected readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

    // Watch for route parameter changes
    this.route.paramMap.subscribe((params) => {
      const categorySlug = params.get('category');
      if (categorySlug) {
        this.findCategoryBySlug(categorySlug);
      } else {
        this.selectedCategoryId.set(null);
      }
      this.currentPage.set(1);
      this.loadProducts();
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        // Re-check route param now that categories are loaded
        const categorySlug = this.route.snapshot.paramMap.get('category');
        if (categorySlug) {
          this.findCategoryBySlug(categorySlug);
          this.loadProducts();
        }
      },
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  private findCategoryBySlug(slug: string): void {
    const category = this.categories().find((c) => c.slug === slug);
    if (category) {
      this.selectedCategoryId.set(category.id);
    }
  }

  protected loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    const filter: ProductFilterRequest = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      categoryId: this.selectedCategoryId() ?? undefined,
      searchTerm: this.searchTerm() || undefined,
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      sortBy: this.sortBy(),
      sortDescending: this.sortDescending(),
    };

    this.productService.getProducts(filter).subscribe({
      next: (response) => {
        this.products.set(response.items as ProductListDto[]);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load products');
        this.loading.set(false);
      },
    });
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadProducts();
  }

  protected onSortChange(sortValue: string): void {
    switch (sortValue) {
      case 'price-asc':
        this.sortBy.set('price');
        this.sortDescending.set(false);
        break;
      case 'price-desc':
        this.sortBy.set('price');
        this.sortDescending.set(true);
        break;
      case 'name-asc':
        this.sortBy.set('name');
        this.sortDescending.set(false);
        break;
      default: // created-desc
        this.sortBy.set('createdAt');
        this.sortDescending.set(true);
        break;
    }
    this.currentPage.set(1);
    this.loadProducts();
  }

  protected applyPriceFilter(minStr: string, maxStr: string): void {
    this.minPrice.set(minStr ? +minStr : undefined);
    this.maxPrice.set(maxStr ? +maxStr : undefined);
    this.currentPage.set(1);
    this.loadProducts();
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  protected getPageNumbers(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push('...');
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  }

  onAddToCart(product: ProductListDto): void {
    if (!this.isAuthenticated()) {
      // Could show a toast or redirect to login
      console.log('Please login to add items to cart');
      return;
    }

    this.cartService.addToCart({ productId: product.id, quantity: 1 }).subscribe({
      next: () => console.log('Added to cart:', product.name),
      error: (err) => console.error('Failed to add to cart', err),
    });
  }

  onAddToWishlist(product: ProductListDto): void {
    if (!this.isAuthenticated()) {
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

  onQuickView(product: ProductListDto): void {
    console.log('Quick view:', product);
    // Could open a modal with product details
  }

  formatCategoryName(slug: string): string {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
