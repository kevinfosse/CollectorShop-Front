import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordPolicyResponse,
  UserDto,
} from '../models';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signals for reactive state
  private readonly _accessToken = signal<string | null>(this.getStoredToken());
  private readonly _user = signal<UserDto | null>(this.getStoredUser());

  readonly accessToken = this._accessToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken());
  readonly isAdmin = computed(() => this._user()?.roles?.includes('Admin') ?? false);

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  logout(): void {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    this.clearAuth();
    // Revoke the refresh token on the backend
    if (refreshToken) {
      this.http
        .post(`${this.apiUrl}/revoke-token`, { refreshToken })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
  }

  refreshToken(): Observable<AuthResponse | null> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const accessToken = this._accessToken();

    if (!refreshToken || !accessToken) {
      this.clearAuth();
      return of(null);
    }

    const request: RefreshTokenRequest = {
      accessToken,
      refreshToken,
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, request).pipe(
      tap((response) => this.handleAuthResponse(response)),
      catchError(() => {
        this.clearAuth();
        return of(null);
      }),
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, request);
  }

  getPasswordPolicy(): Observable<PasswordPolicyResponse> {
    return this.http.get<PasswordPolicyResponse>(`${this.apiUrl}/password-policy`);
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));

    this._accessToken.set(response.accessToken);
    this._user.set(response.user);
  }

  private clearAuth(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    this._accessToken.set(null);
    this._user.set(null);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private getStoredUser(): UserDto | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}
