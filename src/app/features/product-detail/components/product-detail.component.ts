import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink],
  template: `
    <div class="product-detail section">
      <div class="container">
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <i class="pi pi-angle-right"></i>
          <a routerLink="/catalog">Shop</a>
          <i class="pi pi-angle-right"></i>
          <span>Product Name</span>
        </nav>

        <div class="product-layout">
          <!-- Gallery -->
          <div class="product-gallery">
            <div class="product-gallery__main">
              <img
                src="https://placehold.co/600x600/1a1a1a/c9a962?text=Product+Image"
                alt="Product"
              />
            </div>
            <div class="product-gallery__thumbs">
              <button class="thumb active">
                <img src="https://placehold.co/100x100/1a1a1a/c9a962?text=1" alt="Thumbnail 1" />
              </button>
              <button class="thumb">
                <img src="https://placehold.co/100x100/1a1a1a/c9a962?text=2" alt="Thumbnail 2" />
              </button>
              <button class="thumb">
                <img src="https://placehold.co/100x100/1a1a1a/c9a962?text=3" alt="Thumbnail 3" />
              </button>
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <span class="product-info__category">Trading Cards</span>
            <h1 class="product-info__title">Charizard Holo 1st Edition Base Set</h1>

            <div class="product-info__rating">
              <div class="stars">
                <i class="pi pi-star-fill"></i>
                <i class="pi pi-star-fill"></i>
                <i class="pi pi-star-fill"></i>
                <i class="pi pi-star-fill"></i>
                <i class="pi pi-star-fill"></i>
              </div>
              <span>(24 reviews)</span>
            </div>

            <div class="product-info__price">
              <span class="current">$15,000.00</span>
              <span class="compare">$18,000.00</span>
              <span class="badge">-17%</span>
            </div>

            <p class="product-info__description">
              This is the iconic Base Set 1st Edition Charizard Holographic card from 1999. One of
              the most sought-after Pokemon cards in existence. Graded Near Mint condition by PSA.
            </p>

            <div class="product-info__meta">
              <div class="meta-item">
                <span class="label">Condition:</span>
                <span class="value">Near Mint</span>
              </div>
              <div class="meta-item">
                <span class="label">Year:</span>
                <span class="value">1999</span>
              </div>
              <div class="meta-item">
                <span class="label">SKU:</span>
                <span class="value">PKM-001</span>
              </div>
              <div class="meta-item">
                <span class="label">Availability:</span>
                <span class="value in-stock">In Stock</span>
              </div>
            </div>

            <div class="product-info__actions">
              <div class="quantity">
                <button class="quantity__btn">-</button>
                <input type="number" value="1" min="1" class="quantity__input" />
                <button class="quantity__btn">+</button>
              </div>
              <button class="btn-primary btn-lg">
                <i class="pi pi-shopping-cart"></i>
                Add to Cart
              </button>
              <button class="btn-secondary">
                <i class="pi pi-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #737373;
      margin-bottom: 2rem;

      a {
        color: inherit;
        text-decoration: none;
        &:hover { color: #1a1a1a; }
      }

      .pi { font-size: 10px; }
    }

    .product-layout {
      display: grid;
      gap: 3rem;

      @media (min-width: 1024px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    .product-gallery {
      &__main {
        aspect-ratio: 1;
        background: #f5f5f5;
        border-radius: 0.75rem;
        overflow: hidden;
        margin-bottom: 1rem;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      &__thumbs {
        display: flex;
        gap: 0.5rem;
      }

      .thumb {
        width: 80px;
        height: 80px;
        border: 2px solid transparent;
        border-radius: 0.5rem;
        overflow: hidden;
        cursor: pointer;
        padding: 0;

        &.active { border-color: #1a1a1a; }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .product-info {
      &__category {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #737373;
      }

      &__title {
        font-size: 1.875rem;
        margin: 0.5rem 0 1rem;
      }

      &__rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.5rem;

        .stars { color: #c9a962; }
        span { font-size: 0.875rem; color: #737373; }
      }

      &__price {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;

        .current {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .compare {
          font-size: 1rem;
          color: #a3a3a3;
          text-decoration: line-through;
        }

        .badge {
          background: #ef4444;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }
      }

      &__description {
        color: #525252;
        line-height: 1.75;
        margin-bottom: 1.5rem;
      }

      &__meta {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        padding: 1.5rem;
        background: #f5f5f5;
        border-radius: 0.5rem;
        margin-bottom: 2rem;

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .label {
          font-size: 0.75rem;
          color: #737373;
        }

        .value {
          font-weight: 500;
        }

        .in-stock { color: #22c55e; }
      }

      &__actions {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
    }

    .quantity {
      display: flex;
      align-items: center;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;

      &__btn {
        width: 40px;
        height: 44px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 1.25rem;

        &:hover { background: #f5f5f5; }
      }

      &__input {
        width: 50px;
        height: 44px;
        border: none;
        text-align: center;
        font-size: 1rem;

        &:focus { outline: none; }
      }
    }
  `,
})
export class ProductDetailComponent {}
