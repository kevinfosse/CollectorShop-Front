import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  template: `
    <div class="cart section">
      <div class="container">
        <h1>Shopping Cart</h1>

        <div class="cart__layout">
          <!-- Cart Items -->
          <div class="cart__items">
            <div class="cart-item">
              <img
                src="https://placehold.co/120x120/1a1a1a/c9a962?text=Product"
                alt="Product"
                class="cart-item__image"
              />
              <div class="cart-item__info">
                <h3 class="cart-item__name">Charizard Holo 1st Edition</h3>
                <p class="cart-item__meta">Condition: Near Mint</p>
                <div class="cart-item__quantity">
                  <button>-</button>
                  <span>1</span>
                  <button>+</button>
                </div>
              </div>
              <div class="cart-item__price">
                <span class="current">$15,000.00</span>
              </div>
              <button class="cart-item__remove">
                <i class="pi pi-trash"></i>
              </button>
            </div>

            <div class="cart-item">
              <img
                src="https://placehold.co/120x120/1a1a1a/c9a962?text=Product"
                alt="Product"
                class="cart-item__image"
              />
              <div class="cart-item__info">
                <h3 class="cart-item__name">Limited Edition Pikachu Plush</h3>
                <p class="cart-item__meta">Condition: Mint</p>
                <div class="cart-item__quantity">
                  <button>-</button>
                  <span>2</span>
                  <button>+</button>
                </div>
              </div>
              <div class="cart-item__price">
                <span class="current">$300.00</span>
              </div>
              <button class="cart-item__remove">
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="cart__summary">
            <h2>Order Summary</h2>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>$15,300.00</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>$15,300.00</span>
            </div>
            <a routerLink="/checkout" class="btn-primary btn-lg" style="width: 100%">
              Proceed to Checkout
            </a>
            <a routerLink="/catalog" class="btn-secondary" style="width: 100%; margin-top: 1rem">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    @use 'styles/variables' as *;

    h1 { margin-bottom: 2rem; }

    .cart__layout {
      display: grid;
      gap: 2rem;

      @media (min-width: 1024px) {
        grid-template-columns: 1fr 380px;
      }
    }

    .cart__items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 80px 1fr auto auto;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-radius: 0.75rem;
      align-items: center;

      @media (min-width: 768px) {
        grid-template-columns: 120px 1fr auto auto;
      }

      &__image {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 0.5rem;
      }

      &__name {
        font-size: 1rem;
        margin: 0 0 0.25rem;
      }

      &__meta {
        font-size: 0.875rem;
        color: #737373;
        margin: 0 0 0.75rem;
      }

      &__quantity {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        button {
          width: 28px;
          height: 28px;
          border: 1px solid #e5e5e5;
          border-radius: 0.25rem;
          background: white;
          cursor: pointer;

          &:hover { background: #f5f5f5; }
        }
      }

      &__price {
        font-weight: 600;
        text-align: right;
      }

      &__remove {
        background: none;
        border: none;
        color: #ef4444;
        cursor: pointer;
        padding: 0.5rem;

        &:hover { opacity: 0.7; }
      }
    }

    .cart__summary {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      height: fit-content;
      position: sticky;
      top: 100px;

      h2 {
        font-size: 1.25rem;
        margin: 0 0 1.5rem;
      }
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e5e5e5;
      font-size: 0.875rem;

      &.total {
        font-weight: 600;
        font-size: 1.125rem;
        border-bottom: none;
        margin-bottom: 1.5rem;
      }
    }
  `,
})
export class CartComponent {}
