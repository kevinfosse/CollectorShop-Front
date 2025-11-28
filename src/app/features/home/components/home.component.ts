import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../../shared/components/card-preview/product-card.component';
import { Product } from '../../catalog/models/product.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  // Mock data - will be replaced with API calls
  protected featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Charizard Holo 1st Edition',
      slug: 'charizard-holo-1st-edition',
      description: 'Base Set 1st Edition Charizard Holographic',
      price: 15000,
      compareAtPrice: 18000,
      currency: 'USD',
      images: [
        {
          id: '1',
          url: 'https://placehold.co/400x400/1a1a1a/c9a962?text=Charizard',
          alt: 'Charizard Holo',
          isPrimary: true,
          order: 1,
        },
      ],
      category: { id: '1', name: 'Trading Cards', slug: 'trading-cards' },
      tags: ['pokemon', 'holographic', 'rare'],
      condition: 'near-mint',
      rarity: 'legendary',
      inStock: true,
      stockQuantity: 1,
      sku: 'PKM-001',
      brand: 'Pokemon',
      year: 1999,
      rating: 5,
      reviewCount: 24,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Black Lotus Alpha Edition',
      slug: 'black-lotus-alpha',
      description: 'Magic: The Gathering Alpha Black Lotus',
      price: 45000,
      currency: 'USD',
      images: [
        {
          id: '2',
          url: 'https://placehold.co/400x400/1a1a1a/c9a962?text=Black+Lotus',
          alt: 'Black Lotus',
          isPrimary: true,
          order: 1,
        },
      ],
      category: { id: '1', name: 'Trading Cards', slug: 'trading-cards' },
      tags: ['mtg', 'alpha', 'power-nine'],
      condition: 'excellent',
      rarity: 'legendary',
      inStock: true,
      stockQuantity: 1,
      sku: 'MTG-001',
      brand: 'Magic: The Gathering',
      year: 1993,
      rating: 5,
      reviewCount: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Vintage Star Wars Boba Fett',
      slug: 'vintage-boba-fett',
      description: '1979 Kenner Boba Fett Action Figure',
      price: 2500,
      currency: 'USD',
      images: [
        {
          id: '3',
          url: 'https://placehold.co/400x400/1a1a1a/c9a962?text=Boba+Fett',
          alt: 'Boba Fett Figure',
          isPrimary: true,
          order: 1,
        },
      ],
      category: { id: '2', name: 'Figurines', slug: 'figurines' },
      tags: ['star-wars', 'vintage', 'kenner'],
      condition: 'good',
      rarity: 'rare',
      inStock: true,
      stockQuantity: 2,
      sku: 'SW-001',
      brand: 'Kenner',
      year: 1979,
      rating: 4,
      reviewCount: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'Limited Edition Pikachu Plush',
      slug: 'limited-pikachu-plush',
      description: 'Pokemon Center 25th Anniversary Pikachu',
      price: 150,
      compareAtPrice: 200,
      currency: 'USD',
      images: [
        {
          id: '4',
          url: 'https://placehold.co/400x400/1a1a1a/c9a962?text=Pikachu',
          alt: 'Pikachu Plush',
          isPrimary: true,
          order: 1,
        },
      ],
      category: { id: '3', name: 'Plush Toys', slug: 'plush-toys' },
      tags: ['pokemon', 'anniversary', 'limited'],
      condition: 'mint',
      rarity: 'uncommon',
      inStock: true,
      stockQuantity: 5,
      sku: 'PLU-001',
      brand: 'Pokemon Center',
      year: 2021,
      rating: 5,
      reviewCount: 45,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  protected categories = [
    {
      name: 'Trading Cards',
      slug: 'trading-cards',
      image: 'https://placehold.co/600x400/1a1a1a/c9a962?text=Trading+Cards',
      count: 1250,
    },
    {
      name: 'Figurines',
      slug: 'figurines',
      image: 'https://placehold.co/600x400/1a1a1a/c9a962?text=Figurines',
      count: 890,
    },
    {
      name: 'Vintage Items',
      slug: 'vintage',
      image: 'https://placehold.co/600x400/1a1a1a/c9a962?text=Vintage',
      count: 420,
    },
    {
      name: 'Sealed Products',
      slug: 'sealed',
      image: 'https://placehold.co/600x400/1a1a1a/c9a962?text=Sealed',
      count: 320,
    },
  ];

  onAddToCart(product: Product): void {
    console.log('Add to cart:', product);
    // TODO: Implement cart service
  }

  onAddToWishlist(product: Product): void {
    console.log('Add to wishlist:', product);
    // TODO: Implement wishlist service
  }

  onQuickView(product: Product): void {
    console.log('Quick view:', product);
    // TODO: Implement quick view modal
  }
}
