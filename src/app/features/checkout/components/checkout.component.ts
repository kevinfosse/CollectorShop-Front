import { Component } from '@angular/core';

@Component({
  selector: 'app-checkout',
  template: `
    <div class="checkout section">
      <div class="container">
        <h1>Checkout</h1>

        <div class="checkout__layout">
          <!-- Forms -->
          <div class="checkout__forms">
            <!-- Shipping -->
            <div class="checkout__section">
              <h2>Shipping Information</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" placeholder="John" />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Doe" />
                </div>
                <div class="form-group full-width">
                  <label>Email</label>
                  <input type="email" placeholder="john@example.com" />
                </div>
                <div class="form-group full-width">
                  <label>Address</label>
                  <input type="text" placeholder="123 Main St" />
                </div>
                <div class="form-group">
                  <label>City</label>
                  <input type="text" placeholder="New York" />
                </div>
                <div class="form-group">
                  <label>Postal Code</label>
                  <input type="text" placeholder="10001" />
                </div>
                <div class="form-group full-width">
                  <label>Country</label>
                  <select>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Payment -->
            <div class="checkout__section">
              <h2>Payment Method</h2>
              <div class="payment-methods">
                <label class="payment-option">
                  <input type="radio" name="payment" checked />
                  <span class="payment-option__content">
                    <i class="pi pi-credit-card"></i>
                    Credit Card
                  </span>
                </label>
                <label class="payment-option">
                  <input type="radio" name="payment" />
                  <span class="payment-option__content">
                    <i class="pi pi-paypal"></i>
                    PayPal
                  </span>
                </label>
              </div>
              <div class="form-grid" style="margin-top: 1.5rem">
                <div class="form-group full-width">
                  <label>Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" />
                </div>
                <div class="form-group">
                  <label>Expiry Date</label>
                  <input type="text" placeholder="MM/YY" />
                </div>
                <div class="form-group">
                  <label>CVV</label>
                  <input type="text" placeholder="123" />
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="checkout__summary">
            <h2>Order Summary</h2>
            <div class="order-items">
              <div class="order-item">
                <img src="https://placehold.co/60x60/1a1a1a/c9a962?text=1" alt="Product" />
                <div class="order-item__info">
                  <span class="name">Charizard Holo</span>
                  <span class="qty">Qty: 1</span>
                </div>
                <span class="price">$15,000</span>
              </div>
              <div class="order-item">
                <img src="https://placehold.co/60x60/1a1a1a/c9a962?text=2" alt="Product" />
                <div class="order-item__info">
                  <span class="name">Pikachu Plush</span>
                  <span class="qty">Qty: 2</span>
                </div>
                <span class="price">$300</span>
              </div>
            </div>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>$15,300.00</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>$25.00</span>
            </div>
            <div class="summary-row">
              <span>Tax</span>
              <span>$1,226.00</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>$16,551.00</span>
            </div>
            <button class="btn-accent btn-lg" style="width: 100%">Place Order</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    h1 { margin-bottom: 2rem; }

    .checkout__layout {
      display: grid;
      gap: 2rem;

      @media (min-width: 1024px) {
        grid-template-columns: 1fr 400px;
      }
    }

    .checkout__section {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1.125rem;
        margin: 0 0 1.5rem;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .form-group {
      &.full-width { grid-column: span 2; }

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      input, select {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #e5e5e5;
        border-radius: 0.5rem;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: #1a1a1a;
        }
      }
    }

    .payment-methods {
      display: flex;
      gap: 1rem;
    }

    .payment-option {
      flex: 1;
      cursor: pointer;

      input { display: none; }

      &__content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        border: 2px solid #e5e5e5;
        border-radius: 0.5rem;
        transition: all 0.2s;
      }

      input:checked + &__content {
        border-color: #1a1a1a;
        background: #fafafa;
      }
    }

    .checkout__summary {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      height: fit-content;
      position: sticky;
      top: 100px;

      h2 {
        font-size: 1.125rem;
        margin: 0 0 1.5rem;
      }
    }

    .order-items {
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 0;

      img {
        width: 50px;
        height: 50px;
        border-radius: 0.25rem;
        object-fit: cover;
      }

      &__info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .name { font-weight: 500; font-size: 0.875rem; }
        .qty { font-size: 0.75rem; color: #737373; }
      }

      .price { font-weight: 500; }
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.875rem;

      &.total {
        font-weight: 600;
        font-size: 1.125rem;
        border-top: 1px solid #e5e5e5;
        padding-top: 1rem;
        margin: 1rem 0;
      }
    }
  `,
})
export class CheckoutComponent {}
