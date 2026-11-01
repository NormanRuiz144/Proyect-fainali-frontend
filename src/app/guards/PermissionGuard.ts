import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/service/auth-service';

export const PermissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permisos = (route.data['permisos'] as string[] | undefined) ?? [];
  const requiereAlguno = route.data['requiereAlguno'] === true;

  if (!auth.esOperador() || (permisos.length && !(requiereAlguno ? auth.tieneAlgunoDe(permisos) : permisos.every((p) => auth.tienePermiso(p))))) {
    router.navigate(['/operadores/dashboard']);
    return false;
  }
  return true;
};
