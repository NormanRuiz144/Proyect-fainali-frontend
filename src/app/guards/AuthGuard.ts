import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/service/auth-service';

/**
 * Protege rutas autenticadas y, cuando la ruta lo indique, exige que el usuario
 * tenga un registro de operador. Los permisos específicos se validan en la API.
 */
export const AuthGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    router.navigate(['/inicio']);
    return false;
  }

  if (route.data['requiereOperador'] === true && !authService.esOperador()) {
    router.navigate(['/inicio']);
    return false;
  }

  return true;
};
