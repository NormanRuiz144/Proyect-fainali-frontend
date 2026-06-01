import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from '../../auth/service/auth-service';

@Injectable({
  providedIn: 'root'
})
export class EstadoAdminService {
  private authService = inject(AuthService);

  // Obtener el usuario logueado en tiempo real desde la señal única de AuthService
  usuarioLogueado = computed(() => this.authService.usuarioActual());

  // Determina reactivamente si el usuario logueado es Super Administrador
  esSuperAdmin = computed(() => {
    const user = this.usuarioLogueado();
    if (!user) return false;
    return user.rol?.rol === 'Super-Admin';
  });

  // Almacena globalmente la institución seleccionada por el Super Admin (null = Todas)
  institucionSeleccionadaId = signal<number | null>(this.obtenerIdInicial());

  private obtenerIdInicial(): number | null {
    let esSuper = false;
    let userInstitucion: number | null = null;
    let hasUser = false;

    try {
      const userRaw = localStorage.getItem('usuario');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        hasUser = true;
        esSuper = !!(user && user.rol?.rol === 'Super-Admin');
        userInstitucion = user ? user.idInstitucion : null;
      }
    } catch (e) {}

    // Si ya está preparado el login y es un admin normal (no Super-Admin), forzamos su institución
    if (hasUser && !esSuper) {
      return userInstitucion || 1;
    }

    const guardado = localStorage.getItem('admin_institucion_id');
    // Si es Super-Admin y no hay nada guardado en el selector, el default es 'null' (Todas las Instituciones)
    if (guardado === null || guardado === '0' || guardado === 'null') {
      return esSuper ? null : 1; 
    }
    return Number(guardado);
  }

  // Actualiza la institución seleccionada y la persiste en localStorage
  establecerInstitucion(id: number | null) {
    const user = this.usuarioLogueado();
    const esSuper = user && user.rol?.rol === 'Super-Admin';
    // Si no es Super Admin, no permitimos cambiar la institución (seguridad en el frontend)
    if (user && !esSuper) {
      this.institucionSeleccionadaId.set(user.idInstitucion || 1);
      return;
    }

    this.institucionSeleccionadaId.set(id);
    localStorage.setItem('admin_institucion_id', id === null ? '0' : id.toString());
  }

  // Sincroniza al iniciar sesión
  iniciarSesion(usuario: any) {
    const esSuper = usuario && usuario.rol?.rol === 'Super-Admin';
    if (usuario && !esSuper) {
      this.establecerInstitucion(usuario.idInstitucion || 1);
    } else {
      const guardado = localStorage.getItem('admin_institucion_id');
      const idInicial = (guardado === null || guardado === '0' || guardado === 'null') ? null : Number(guardado);
      this.institucionSeleccionadaId.set(idInicial);
    }
  }

  // Sincroniza al cerrar sesión
  cerrarSesion() {
    localStorage.removeItem('admin_institucion_id');
    this.institucionSeleccionadaId.set(1);
  }
}
