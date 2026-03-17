import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { BrandService } from '../../../../core/services/brand.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  ProductListDto,
  ProductFilterRequest,
  CategoryListDto,
  BrandDto,
  ProductCondition,
  ProductConditionLabels,
} from '../../../../core/models';

@Component({
  selector: 'app-admin-product-list',
  imports: [RouterLink, FormsModule, CurrencyPipe, TranslateModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly brandService = inject(BrandService);
  private readonly toastService = inject(ToastService);

  protected readonly products = signal<ProductListDto[]>([]);
  protected readonly categories = signal<CategoryListDto[]>([]);
  protected readonly brands = signal<BrandDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 10;

  protected readonly conditions = Object.values(ProductCondition).filter(
    (v) => typeof v === 'number',
  ) as ProductCondition[];
  protected readonly conditionLabels = ProductConditionLabels;

  // Filters
  protected searchTerm = '';
  protected selectedCategoryId = '';
  protected selectedBrandId = '';
  protected selectedCondition: ProductCondition | '' = '';

  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit(): void {
    this.loadProducts();
    this.categoryService.getCategories().subscribe((c) => this.categories.set(c));
    this.brandService.getBrands().subscribe((b) => this.brands.set(b));
  }

  protected loadProducts(): void {
    this.loading.set(true);
    const filter: ProductFilterRequest = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      categoryId: this.selectedCategoryId || undefined,
      brandId: this.selectedBrandId || undefined,
      condition: this.selectedCondition !== '' ? this.selectedCondition : undefined,
      sortBy: 'createdAt',
      sortDescending: true,
    };

    this.productService.getProducts(filter).subscribe({
      next: (res) => {
        this.products.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('Failed to load products', 'error');
        this.loading.set(false);
      },
    });
  }

  protected onSearch(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  protected onDelete(product: ProductListDto): void {
    if (confirm(`Delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.toastService.show('Product deleted', 'success');
          this.loadProducts();
        },
        error: () => this.toastService.show('Failed to delete product', 'error'),
      });
    }
  }

  protected getStockClass(quantity: number): string {
    if (quantity <= 0) return 'stock--out';
    if (quantity <= 5) return 'stock--low';
    return 'stock--ok';
  }
}
