import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = extractValidationErrors(error) || error.error?.message || 'Bad request';
            break;
          case 401: {
            const isAuthEndpoint = req.url.includes('/api/auth/');
            if (isAuthEndpoint) {
              errorMessage = error.error?.message || 'Invalid email or password';
            } else {
              errorMessage = 'Session expired. Please log in again.';
              authService.logout();
              router.navigate(['/auth/login']);
            }
            break;
          }
          case 403:
            errorMessage = 'You do not have permission to access this resource';
            break;
          case 404:
            errorMessage = error.error?.message || 'Resource not found';
            break;
          case 422:
            errorMessage =
              extractValidationErrors(error) || error.error?.message || 'Validation error';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Error: ${error.status}`;
        }
      }

      // Only log non-404 errors (404s are often handled by individual services)
      if (error.status !== 404) {
        console.error('HTTP Error:', errorMessage, error);
      }
      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        error: error.error,
      }));
    }),
  );
};

/**
 * Extracts human-readable error messages from ASP.NET Core ValidationProblemDetails
 * or from a plain { errors } / { Errors } response.
 */
function extractValidationErrors(error: HttpErrorResponse): string | null {
  const body = error.error;
  if (!body) return null;

  // ASP.NET Core ValidationProblemDetails: { errors: { FieldName: ["msg1", "msg2"] } }
  const errors = body.errors || body.Errors;
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const messages: string[] = [];
    for (const field of Object.keys(errors)) {
      const fieldErrors = errors[field];
      if (Array.isArray(fieldErrors)) {
        messages.push(...fieldErrors);
      }
    }
    if (messages.length > 0) {
      return messages.join('. ');
    }
  }

  // Array of strings
  if (Array.isArray(errors)) {
    return errors.join('. ');
  }

  // ASP.NET Identity errors: { errors: ["msg1", "msg2"] }
  if (body.message) return body.message;
  if (body.Message) return body.Message;
  if (body.title) return body.title;

  return null;
}
