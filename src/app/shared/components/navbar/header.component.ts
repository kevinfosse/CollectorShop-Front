import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, CartService, WishlistService } from '../../../core/services';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private readonly translateService = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);

  protected isMenuOpen = false;
  protected isSearchOpen = false;
  protected isLangMenuOpen = false;
  protected isUserMenuOpen = false;

  // Reactive state from services
  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly user = this.authService.user;
  protected readonly cartItemCount = this.cartService.itemCount;
  protected readonly wishlistCount = this.wishlistService.count;

  protected languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  ];

  protected get currentLang() {
    return (
      this.languages.find((l) => l.code === this.translateService.currentLang) || this.languages[0]
    );
  }

  ngOnInit(): void {
    // Load cart and wishlist if authenticated
    if (this.isAuthenticated()) {
      this.cartService.loadCart().subscribe();
      this.wishlistService.loadWishlist().subscribe();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  closeLangMenu(): void {
    this.isLangMenuOpen = false;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  switchLanguage(langCode: string): void {
    this.translateService.use(langCode);
    localStorage.setItem('app_language', langCode);
    this.isLangMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.cartService.resetCart();
    this.wishlistService.resetWishlist();
    this.isUserMenuOpen = false;
    this.router.navigate(['/']);
  }
}
