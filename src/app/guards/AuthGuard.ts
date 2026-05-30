import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/service/auth-service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    router.navigate(['/inicio']);
    return false;
  }

  const rolEsperado = route.data['rol'];
  const rolUsuario = authService.rolUsuario();

  if (rolEsperado && rolUsuario !== rolEsperado) {
    router.navigate(['/inicio']);
    return false;
  }

  return true;
};
