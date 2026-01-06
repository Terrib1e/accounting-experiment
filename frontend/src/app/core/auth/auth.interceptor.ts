import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Skip adding token for auth endpoints to prevent 401s on login/register if token is invalid
  const isAuthRequest = req.url.includes('/auth/');

  if (token && !isAuthRequest && token !== 'undefined' && token !== 'null') {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('Authentication Error:', error.error); // Log the full backend error details
        // Avoid circular dependency by manually clearing and redirecting
        // or just use authService.logout() if circular dep allows (usually functional interceptors are better about this)
        // But to be safe:
        localStorage.removeItem('token');
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
