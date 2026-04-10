import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const isApiRequest = req.url.startsWith(environment.keycloak.apiBaseUrl);

  if (!isApiRequest) {
    return next(req);
  }

  return from(authService.getBearerToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(clonedReq);
    }),
  );
};
