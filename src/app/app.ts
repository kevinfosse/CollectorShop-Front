import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

const LANGUAGE_KEY = 'app_language';
const DEFAULT_LANGUAGE = 'fr';
const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'it'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private translateService = inject(TranslateService);
  protected readonly title = signal('CollectorShop');

  constructor() {
    // Restore saved language or use default
    let savedLang: string | null = null;
    try {
      savedLang = localStorage.getItem(LANGUAGE_KEY);
    } catch {
      // localStorage unavailable (SSR / test environment)
    }
    const langToUse =
      savedLang && SUPPORTED_LANGUAGES.includes(savedLang) ? savedLang : DEFAULT_LANGUAGE;

    this.translateService.use(langToUse);
  }
}
