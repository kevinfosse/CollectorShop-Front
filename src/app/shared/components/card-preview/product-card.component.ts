import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductListDto, ProductConditionLabels, ProductCondition } from '../../../core/models';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<ProductListDto>();
  showQuickView = input<boolean>(true);
  showWishlist = input<boolean>(true);

  addToCart = output<ProductListDto>();
  addToWishlist = output<ProductListDto>();
  quickView = output<ProductListDto>();

  get discountPercentage(): number | null {
    const prod = this.product();
    if (prod.compareAtPrice && prod.compareAtPrice > prod.price) {
      return Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100);
    }
    return null;
  }

  get primaryImage(): string {
    return this.product().primaryImageUrl || '/assets/images/placeholder.jpg';
  }

  get productUrl(): string {
    return `/product/${this.product().id}`;
  }

  get productName(): string {
    return this.product().name;
  }

  get categoryName(): string | null {
    return this.product().categoryName || null;
  }

  get averageRating(): number {
    return this.product().averageRating ?? 0;
  }

  get isInStock(): boolean {
    return this.product().availableQuantity > 0;
  }

  get conditionLabel(): string {
    const condition = this.product().condition;
    if (condition != null) {
      return ProductConditionLabels[condition as ProductCondition] || 'Unknown';
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
}
