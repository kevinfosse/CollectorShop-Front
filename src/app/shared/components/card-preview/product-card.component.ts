import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../features/catalog/models/product.model';
import { ProductListDto, ProductConditionLabels, ProductCondition } from '../../../core/models';

// Union type to support both legacy and API product models
export type ProductInput = Product | ProductListDto;

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<ProductInput>();
  showQuickView = input<boolean>(true);
  showWishlist = input<boolean>(true);

  addToCart = output<ProductInput>();
  addToWishlist = output<ProductInput>();
  quickView = output<ProductInput>();

  get discountPercentage(): number | null {
    const prod = this.product();
    if (prod.compareAtPrice && prod.compareAtPrice > prod.price) {
      return Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100);
    }
    return null;
  }

  get primaryImage(): string {
    const prod = this.product();
    // Check if it's a ProductListDto (has primaryImageUrl)
    if ('primaryImageUrl' in prod && prod.primaryImageUrl) {
      return prod.primaryImageUrl;
    }
    // Legacy Product model with images array
    if ('images' in prod && prod.images) {
      const primary = prod.images.find((img) => img.isPrimary);
      return primary?.url || prod.images[0]?.url || '/assets/images/placeholder.jpg';
    }
    return '/assets/images/placeholder.jpg';
  }

  get productUrl(): string {
    const prod = this.product();
    // Check if it's a legacy Product with slug
    if ('slug' in prod && prod.slug) {
      return `/product/${prod.slug}`;
    }
    // API ProductListDto uses id
    return `/product/${prod.id}`;
  }

  get productName(): string {
    return this.product().name;
  }

  get categoryName(): string | null {
    const prod = this.product();
    // API ProductListDto has categoryName
    if ('categoryName' in prod && prod.categoryName) {
      return prod.categoryName;
    }
    // Legacy Product has category object
    if ('category' in prod && prod.category) {
      return prod.category.name;
    }
    return null;
  }

  get averageRating(): number {
    const prod = this.product();
    // API ProductListDto has averageRating
    if ('averageRating' in prod) {
      return prod.averageRating;
    }
    // Legacy Product has rating
    if ('rating' in prod && prod.rating) {
      return prod.rating;
    }
    return 0;
  }

  get isInStock(): boolean {
    const prod = this.product();
    if ('inStock' in prod) {
      return prod.inStock;
    }
    if ('availableQuantity' in prod) {
      return prod.availableQuantity > 0;
    }
    return true;
  }

  get conditionLabel(): string {
    const prod = this.product();
    if ('condition' in prod) {
      // Check if it's the enum (number) from API
      if (typeof prod.condition === 'number') {
        return ProductConditionLabels[prod.condition as ProductCondition] || 'Unknown';
      }
      // Legacy string condition
      return this.getConditionLabel(prod.condition as string);
    }
    return '';
  }

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }

  onAddToWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToWishlist.emit(this.product());
  }

  onQuickView(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.quickView.emit(this.product());
  }

  getConditionLabel(condition: string): string {
    const labels: Record<string, string> = {
      mint: 'Mint',
      'near-mint': 'Near Mint',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
    };
    return labels[condition] || condition;
  }

  getRarityClass(rarity: string | undefined): string {
    if (!rarity) return '';
    return `product-card__rarity--${rarity}`;
  }
}
