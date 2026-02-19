import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly apiUrl = `${environment.apiUrl}/config`;
  private countries$?: Observable<string[]>;

  constructor(private readonly http: HttpClient) {}

  getShippingCountries(): Observable<string[]> {
    if (!this.countries$) {
      this.countries$ = this.http.get<string[]>(`${this.apiUrl}/countries`).pipe(shareReplay(1));
    }
    return this.countries$;
  }
}
