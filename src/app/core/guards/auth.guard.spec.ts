import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('Auth Guards', () => {
  let router: Router;
  let mockAuthService: { isAuthenticated: () => boolean; isAdmin: () => boolean };

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = (url: string) => ({ url } as RouterStateSnapshot);

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: () => false,
      isAdmin: () => false,
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  describe('authGuard', () => {
    it('should allow access when user is authenticated', () => {
      mockAuthService.isAuthenticated = () => true;

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState('/protected'))
      );

      expect(result).toBe(true);
    });

    it('should redirect to login with returnUrl when not authenticated', () => {
      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockRoute, mockState('/protected'))
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: '/protected' },
      });
    });
  });

  describe('adminGuard', () => {
    it('should allow access for authenticated admin user', () => {
      mockAuthService.isAuthenticated = () => true;
      mockAuthService.isAdmin = () => true;

      const result = TestBed.runInInjectionContext(() =>
        adminGuard(mockRoute, mockState('/admin'))
      );

      expect(result).toBe(true);
    });

    it('should redirect to login for unauthenticated user', () => {
      const result = TestBed.runInInjectionContext(() =>
        adminGuard(mockRoute, mockState('/admin'))
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: '/admin' },
      });
    });

    it('should redirect to home for authenticated non-admin user', () => {
      mockAuthService.isAuthenticated = () => true;
      mockAuthService.isAdmin = () => false;

      const result = TestBed.runInInjectionContext(() =>
        adminGuard(mockRoute, mockState('/admin'))
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('guestGuard', () => {
    it('should allow access for unauthenticated user', () => {
      const result = TestBed.runInInjectionContext(() =>
        guestGuard(mockRoute, mockState('/auth/login'))
      );

      expect(result).toBe(true);
    });

    it('should redirect to home for authenticated user', () => {
      mockAuthService.isAuthenticated = () => true;

      const result = TestBed.runInInjectionContext(() =>
        guestGuard(mockRoute, mockState('/auth/login'))
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
