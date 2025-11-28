import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private translateService = inject(TranslateService);

  protected isMenuOpen = false;
  protected isSearchOpen = false;
  protected isLangMenuOpen = false;
  protected cartItemCount = 0;

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

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  closeLangMenu(): void {
    this.isLangMenuOpen = false;
  }

  switchLanguage(langCode: string): void {
    this.translateService.use(langCode);
    this.isLangMenuOpen = false;
  }
}
