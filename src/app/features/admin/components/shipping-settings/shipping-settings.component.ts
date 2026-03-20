import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigService, ShippingSettings, ToastService } from '../../../../core/services';

@Component({
  selector: 'app-shipping-settings',
  imports: [FormsModule, TranslateModule],
  templateUrl: './shipping-settings.component.html',
  styleUrl: './shipping-settings.component.scss',
})
export class ShippingSettingsComponent implements OnInit {
  private readonly configService = inject(ConfigService);
  private readonly toastService = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);

  protected settings: ShippingSettings = {
    defaultShippingCost: 0,
    taxRate: 0,
    freeShippingThreshold: 0,
  };

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading.set(true);
    this.configService.getShippingSettings().subscribe({
      next: (settings) => {
        this.settings = { ...settings };
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.show('TOAST.LOAD_ERROR', 'error');
      },
    });
  }

  protected saveSettings(): void {
    this.saving.set(true);
    this.configService.updateShippingSettings(this.settings).subscribe({
      next: (settings) => {
        this.settings = { ...settings };
        this.saving.set(false);
        this.toastService.show('TOAST.SETTINGS_SAVED', 'success');
      },
      error: () => {
        this.saving.set(false);
        this.toastService.show('TOAST.SAVE_ERROR', 'error');
      },
    });
  }

  protected get taxRatePercent(): number {
    return Math.round(this.settings.taxRate * 100);
  }

  protected set taxRatePercent(value: number) {
    this.settings.taxRate = value / 100;
  }
}
