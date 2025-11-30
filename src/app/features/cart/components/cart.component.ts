import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService, AuthService } from '../../../core/services';
import { CartItemDto } from '../../../core/models';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly cart = this.cartService.cart;
  protected readonly loading = this.cartService.loading;
  protected readonly isEmpty = this.cartService.isEmpty;
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.cartService.loadCart().subscribe();
    }
  }

  protected updateQuantity(item: CartItemDto, delta: number): void {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) {
      this.removeItem(item.productId);
      return;
    }
    if (newQuantity > item.availableStock) {
      return;
    }
    this.cartService.updateQuantity(item.productId, newQuantity).subscribe();
  }

  protected removeItem(productId: string): void {
    this.cartService.removeFromCart(productId).subscribe();
  }

  protected clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  protected proceedToCheckout(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
