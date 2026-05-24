import { HttpInterceptorFn } from '@angular/common/http';
//import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth-service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyección de dependencias
  const authService = inject(AuthService);

  // Obtener el token del servicio de autenticación
  const token = authService.obtenerToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Enviar petición al servidor
  return next(req);
};
