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
    // Initialize translation service
    this.translateService.setDefaultLang(DEFAULT_LANGUAGE);

    // Restore saved language or use default
    const savedLang = localStorage.getItem(LANGUAGE_KEY);
    const langToUse =
      savedLang && SUPPORTED_LANGUAGES.includes(savedLang) ? savedLang : DEFAULT_LANGUAGE;

    this.translateService.use(langToUse);
  }
}
