import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
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
  private readonly keycloak = new Keycloak({
    url: environment.keycloak.url,
    realm: environment.keycloak.realm,
    clientId: environment.keycloak.clientId,
  });
  private readonly silentCheckSsoRedirectUri = `${window.location.origin}/assets/silent-check-sso.html`;
  private readonly _isKeycloakInitialized = signal(false);
  private readonly _isKeycloakAuthenticated = signal(false);

  // Signals for reactive state
  private readonly _accessToken = signal<string | null>(this.getStoredToken());
  private readonly _user = signal<UserDto | null>(this.getStoredUser());

  readonly accessToken = this._accessToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._isKeycloakAuthenticated() || !!this._accessToken());
  readonly isAdmin = computed(() => this._user()?.roles?.includes('Admin') ?? false);
  readonly userDisplayName = computed(() => {
    const currentUser = this._user();
    if (!currentUser) {
      return '';
    }

    const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
    return fullName || currentUser.email;
  });

  async initKeycloak(): Promise<void> {
    if (this._isKeycloakInitialized()) {
      return;
    }

    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: this.silentCheckSsoRedirectUri,
        checkLoginIframe: true,
      });
      this._isKeycloakInitialized.set(true);
      this._isKeycloakAuthenticated.set(authenticated);

      if (authenticated) {
        this.syncUserFromKeycloak();
      }
    } catch {
      this._isKeycloakInitialized.set(true);
      this._isKeycloakAuthenticated.set(false);
    }
  }

  async login(redirectUri?: string): Promise<void>;
  login(request: LoginRequest): Observable<AuthResponse>;
  login(requestOrRedirectUri?: LoginRequest | string): Observable<AuthResponse> | Promise<void> {
    if (typeof requestOrRedirectUri !== 'object') {
      return this.keycloak.login({
        redirectUri: requestOrRedirectUri ?? window.location.href,
      });
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, requestOrRedirectUri)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  logout(redirectUri?: string): void {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    this.clearAuth();
    void this.keycloak.logout({
      redirectUri: redirectUri ?? `${window.location.origin}/`,
    });
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

  async ensureAuthenticated(redirectUri?: string): Promise<boolean> {
    await this.initKeycloak();
    if (this.keycloak.authenticated) {
      this.syncUserFromKeycloak();
      return true;
    }

    await this.login(redirectUri);
    return false;
  }

  async getBearerToken(): Promise<string | null> {
    await this.initKeycloak();
    if (!this.keycloak.authenticated) {
      return this._accessToken();
    }

    try {
      await this.keycloak.updateToken(30);
    } catch {
      return this._accessToken();
    }

    return this.keycloak.token ?? this._accessToken();
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
    this._isKeycloakAuthenticated.set(false);
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

  private syncUserFromKeycloak(): void {
    const tokenParsed = this.keycloak.tokenParsed;
    if (!tokenParsed) {
      return;
    }

    const roles = (tokenParsed.realm_access?.roles ?? []).filter((role): role is string =>
      typeof role === 'string',
    );
    const keycloakUser: UserDto = {
      id: String(tokenParsed.sub ?? ''),
      email: String(tokenParsed['email'] ?? ''),
      firstName: String(tokenParsed['given_name'] ?? ''),
      lastName: String(tokenParsed['family_name'] ?? ''),
      roles,
    };

    this._accessToken.set(this.keycloak.token ?? null);
    this._user.set(keycloakUser);
  }
}
