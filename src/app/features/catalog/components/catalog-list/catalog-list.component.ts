import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ProductCardComponent } from '../../../../shared/components/card-preview/product-card.component';
import { QuickViewModalComponent } from '../../../../shared/ui/modal/quick-view-modal.component';
import {
  ProductService,
  CartService,
  WishlistService,
  CategoryService,
  AuthService,
  ToastService,
} from '../../../../core/services';
import {
  ProductListDto,
  ProductFilterRequest,
  ProductCondition,
  CategoryListDto,
} from '../../../../core/models';

@Component({
  selector: 'app-catalog-list',
  imports: [RouterLink, TranslateModule, ProductCardComponent, QuickViewModalComponent],
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.scss',
})
export class CatalogListComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private routeSub?: Subscription;
  private querySub?: Subscription;

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
  protected readonly selectedCategorySlug = signal<string | null>(null);
  protected readonly searchTerm = signal('');
  protected readonly minPrice = signal<number | undefined>(undefined);
  protected readonly maxPrice = signal<number | undefined>(undefined);
  protected readonly sortBy = signal('createdAt');
  protected readonly sortDescending = signal(true);
  protected readonly selectedSort = signal('created-desc');
  protected readonly selectedCondition = signal<ProductCondition | undefined>(undefined);

  // Mobile filter drawer
  protected isFilterDrawerOpen = false;

  protected readonly currentCategory = computed(() => {
    const slug = this.selectedCategorySlug();
    if (!slug) return 'All Products';
    const cat = this.categories().find((c) => c.slug === slug);
    if (cat) return cat.name;
    return this.formatCategoryName(slug);
  });

  protected readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  // Condition options for the filter UI
  protected readonly conditionOptions = [
    { value: ProductCondition.New, labelKey: 'CATALOG.CONDITIONS.MINT' },
    { value: ProductCondition.LikeNew, labelKey: 'CATALOG.CONDITIONS.NEAR_MINT' },
    { value: ProductCondition.Excellent, labelKey: 'CATALOG.CONDITIONS.EXCELLENT' },
    { value: ProductCondition.Good, labelKey: 'CATALOG.CONDITIONS.GOOD' },
  ];

  ngOnInit(): void {
    this.loadCategories();

    // Watch for route parameter changes
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const categorySlug = params.get('category');
      this.selectedCategorySlug.set(categorySlug);
      if (categorySlug) {
        this.findCategoryBySlug(categorySlug);
      } else {
        this.selectedCategoryId.set(null);
      }
      this.currentPage.set(1);
      this.loadProducts();
    });

    // Watch for query parameter changes (search)
    this.querySub = this.route.queryParamMap.subscribe((queryParams) => {
      const search = queryParams.get('search') || '';
      if (search !== this.searchTerm()) {
        this.searchTerm.set(search);
        this.currentPage.set(1);
        this.loadProducts();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.querySub?.unsubscribe();
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        // Re-check route param now that categories are loaded
        const categorySlug = this.selectedCategorySlug();
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
      condition: this.selectedCondition(),
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
    this.selectedSort.set(sortValue);
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

  protected onConditionChange(condition: ProductCondition, checked: boolean): void {
    if (checked) {
      this.selectedCondition.set(condition);
    } else if (this.selectedCondition() === condition) {
      this.selectedCondition.set(undefined);
    }
    this.currentPage.set(1);
    this.loadProducts();
  }

  protected applyAllFilters(minStr: string, maxStr: string): void {
    this.minPrice.set(minStr ? +minStr : undefined);
    this.maxPrice.set(maxStr ? +maxStr : undefined);
    this.currentPage.set(1);
    this.loadProducts();
    this.closeFilterDrawer();
  }

  protected resetFilters(): void {
    this.minPrice.set(undefined);
    this.maxPrice.set(undefined);
    this.selectedCondition.set(undefined);
    this.sortBy.set('createdAt');
    this.sortDescending.set(true);
    this.selectedSort.set('created-desc');
    this.currentPage.set(1);
    this.loadProducts();
    this.closeFilterDrawer();
  }

  protected toggleFilterDrawer(): void {
    this.isFilterDrawerOpen = !this.isFilterDrawerOpen;
  }

  protected closeFilterDrawer(): void {
    this.isFilterDrawerOpen = false;
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
      next: () => this.toastService.show('TOAST.ADDED_TO_CART', 'success'),
      error: () => this.toastService.show('TOAST.CART_ERROR', 'error'),
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
    this.quickViewProductId.set(product.id);
  }

  protected readonly quickViewProductId = signal<string | null>(null);

  onCloseQuickView(): void {
    this.quickViewProductId.set(null);
  }

  formatCategoryName(slug: string): string {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
