import { Component, inject, input, output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService, CartService, AuthService, ToastService } from '../../../core/services';
import { ProductDto, ProductCondition, ProductConditionLabels } from '../../../core/models';

@Component({
  selector: 'app-quick-view-modal',
  imports: [RouterLink, CurrencyPipe, TranslateModule],
  templateUrl: './quick-view-modal.component.html',
  styleUrl: './quick-view-modal.component.scss',
})
export class QuickViewModalComponent implements OnChanges {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  productId = input<string | null>(null);
  closed = output<void>();

  protected readonly product = signal<ProductDto | null>(null);
  protected readonly loading = signal(false);
  protected readonly quantity = signal(1);
  protected readonly selectedImageIndex = signal(0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId']) {
      const id = this.productId();
      if (id) {
        this.loadProduct(id);
      } else {
        this.product.set(null);
      }
    }
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.quantity.set(1);
    this.selectedImageIndex.set(0);
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.close();
      },
    });
  }

  protected get conditionLabel(): string {
    const p = this.product();
    if (!p) return '';
    return ProductConditionLabels[p.condition as ProductCondition] || '';
  }

  protected get discountPercentage(): number | null {
    const p = this.product();
    if (!p || !p.compareAtPrice || p.compareAtPrice <= p.price) return null;
    return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
  }

  protected get isInStock(): boolean {
    const p = this.product();
    return p ? p.availableQuantity > 0 : false;
  }

  protected get selectedImage(): string {
    const p = this.product();
    if (!p || !p.images.length) return '/assets/images/placeholder.jpg';
    return p.images[this.selectedImageIndex()]?.url ?? p.images[0].url;
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
    const p = this.product();
    if (!p) return;

    if (!this.authService.isAuthenticated()) {
      this.toastService.show('TOAST.LOGIN_REQUIRED', 'warning');
      return;
    }

    this.cartService.addToCart({ productId: p.id, quantity: this.quantity() }).subscribe({
      next: () => {
        this.toastService.show('TOAST.ADDED_TO_CART', 'success');
        this.close();
      },
      error: () => this.toastService.show('TOAST.CART_ERROR', 'error'),
    });
  }

  protected close(): void {
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('quick-view-backdrop')) {
      this.close();
    }
  }
}
