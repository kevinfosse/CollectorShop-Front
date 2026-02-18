import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../../shared/components/card-preview/product-card.component';
import { ProductService, CategoryService } from '../../../core/services';
import { ProductListDto, CategoryListDto } from '../../../core/models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

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
    console.log('Add to cart:', product);
  }

  onAddToWishlist(product: ProductListDto): void {
    console.log('Add to wishlist:', product);
  }

  onQuickView(product: ProductListDto): void {
    console.log('Quick view:', product);
  }
}
