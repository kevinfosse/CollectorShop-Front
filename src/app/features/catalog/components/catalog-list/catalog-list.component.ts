import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../../../shared/components/card-preview/product-card.component';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-catalog-list',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.scss',
})
export class CatalogListComponent {
  private route = inject(ActivatedRoute);

  protected currentCategory = this.route.snapshot.paramMap.get('category') || 'All Products';

  // Mock products - will be replaced with API
  protected products: Product[] = [
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
    {
      id: '5',
      name: 'Mewtwo GX Full Art',
      slug: 'mewtwo-gx-full-art',
      description: 'Shining Legends Mewtwo GX Full Art',
      price: 85,
      currency: 'USD',
      images: [
        {
          id: '5',
          url: 'https://placehold.co/400x400/1a1a1a/c9a962?text=Mewtwo',
          alt: 'Mewtwo GX',
          isPrimary: true,
          order: 1,
        },
      ],
      category: { id: '1', name: 'Trading Cards', slug: 'trading-cards' },
      tags: ['pokemon', 'gx', 'full-art'],
      condition: 'mint',
      rarity: 'ultra-rare',
      inStock: true,
      stockQuantity: 3,
      sku: 'PKM-005',
      brand: 'Pokemon',
      year: 2017,
      rating: 5,
      reviewCount: 18,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '6',
      name: 'Darth Vader Vintage Figure',
      slug: 'darth-vader-vintage',
      description: '1977 Original Kenner Darth Vader',
      price: 1800,
      currency: 'USD',
      images: [
        {
          id: '6',
          url: 'https://placehold.co/400x400/1a1a1a/c9a962?text=Darth+Vader',
          alt: 'Darth Vader',
          isPrimary: true,
          order: 1,
        },
      ],
      category: { id: '2', name: 'Figurines', slug: 'figurines' },
      tags: ['star-wars', 'vintage', 'kenner'],
      condition: 'excellent',
      rarity: 'rare',
      inStock: false,
      stockQuantity: 0,
      sku: 'SW-002',
      brand: 'Kenner',
      year: 1977,
      rating: 5,
      reviewCount: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  onAddToCart(product: Product): void {
    console.log('Add to cart:', product);
  }

  onAddToWishlist(product: Product): void {
    console.log('Add to wishlist:', product);
  }

  onQuickView(product: Product): void {
    console.log('Quick view:', product);
  }

  formatCategoryName(slug: string): string {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
