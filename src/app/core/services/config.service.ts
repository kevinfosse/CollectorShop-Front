import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ShippingSettings {
  defaultShippingCost: number;
  taxRate: number;
  freeShippingThreshold: number;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/config`;
  private countries$?: Observable<string[]>;

  getShippingCountries(): Observable<string[]> {
    if (!this.countries$) {
      this.countries$ = this.http.get<string[]>(`${this.apiUrl}/countries`).pipe(shareReplay(1));
    }
    return this.countries$;
  }

  getShippingSettings(): Observable<ShippingSettings> {
    return this.http.get<ShippingSettings>(`${this.apiUrl}/shipping`);
  }

  updateShippingSettings(settings: ShippingSettings): Observable<ShippingSettings> {
    return this.http.put<ShippingSettings>(`${this.apiUrl}/shipping`, settings);
  }
}
