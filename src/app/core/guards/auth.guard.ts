import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.ensureAuthenticated(`${window.location.origin}${state.url}`);
};

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await authService.ensureAuthenticated(
    `${window.location.origin}${state.url}`,
  );

  if (!isAuthenticated) {
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }

  // User is authenticated but not admin
  router.navigate(['/']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Already logged in, redirect to home
  router.navigate(['/']);
  return false;
};
