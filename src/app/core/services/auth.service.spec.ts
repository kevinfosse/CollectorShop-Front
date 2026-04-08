import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResponse } from '../models';
import { environment } from '../../../environments/environment';

// The test runner provides a limited localStorage — replace it with a full in-memory mock
const storageMock = {
  _store: {} as Record<string, string>,
  getItem(key: string) { return this._store[key] ?? null; },
  setItem(key: string, value: string) { this._store[key] = value; },
  removeItem(key: string) { delete this._store[key]; },
  clear() { this._store = {}; },
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockCustomer: AuthResponse = {
    accessToken: 'customer-token',
    refreshToken: 'customer-refresh',
    expiresAt: new Date(),
    user: { id: '1', email: 'user@test.com', firstName: 'John', lastName: 'Doe', roles: ['Customer'] },
  };

  const mockAdmin: AuthResponse = {
    accessToken: 'admin-token',
    refreshToken: 'admin-refresh',
    expiresAt: new Date(),
    user: { id: '2', email: 'admin@test.com', firstName: 'Admin', lastName: 'User', roles: ['Admin'] },
  };

  beforeAll(() => {
    vi.stubGlobal('localStorage', storageMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    storageMock.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    storageMock.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be unauthenticated with no token in storage', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.isAdmin()).toBe(false);
  });

  it('should update signals after successful login', () => {
    service.login({ email: 'user@test.com', password: 'password' }).subscribe();

    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockCustomer);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.email).toBe('user@test.com');
    expect(service.isAdmin()).toBe(false);
  });

  it('should set isAdmin to true for users with Admin role', () => {
    service.login({ email: 'admin@test.com', password: 'password' }).subscribe();

    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockAdmin);

    expect(service.isAdmin()).toBe(true);
  });

  it('should persist token to localStorage after login', () => {
    service.login({ email: 'user@test.com', password: 'password' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockCustomer);

    expect(storageMock.getItem('access_token')).toBe('customer-token');
  });

  it('should clear auth state and signals after logout', () => {
    service.login({ email: 'user@test.com', password: 'password' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockCustomer);
    expect(service.isAuthenticated()).toBe(true);

    service.logout();
    httpMock.expectOne(`${environment.apiUrl}/auth/revoke-token`).flush({});

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
  });
});
