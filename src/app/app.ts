import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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
    // Set default and current language
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');
  }
}
