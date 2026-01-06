import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard for client portal routes.
 * Allows access only if the user has the CLIENT role.
 */
export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Check for CLIENT role
  const userRole = authService.getUserRole();
  if (userRole === 'CLIENT') {
    return true;
  }

  // Non-client users trying to access portal -> redirect to main dashboard
  router.navigate(['/dashboard']);
  return false;
};
