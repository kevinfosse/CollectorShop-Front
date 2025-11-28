import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../features/catalog/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<Product>();
  showQuickView = input<boolean>(true);
  showWishlist = input<boolean>(true);

  addToCart = output<Product>();
  addToWishlist = output<Product>();
  quickView = output<Product>();

  get discountPercentage(): number | null {
    const prod = this.product();
    if (prod.compareAtPrice && prod.compareAtPrice > prod.price) {
      return Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100);
    }
    return null;
  }

  get primaryImage(): string {
    const images = this.product().images;
    const primary = images.find((img) => img.isPrimary);
    return primary?.url || images[0]?.url || '/assets/images/placeholder.jpg';
  }

  get productUrl(): string {
    return `/product/${this.product().slug}`;
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
