import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();
    if (role === 'CLIENT') {
      return true;
    }
    // If not a client, redirect to staff dashboard
    return router.createUrlTree(['/dashboard']);
  }

  return router.createUrlTree(['/auth/login']);
};
