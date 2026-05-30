import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EstadoAdminService {
  // esto simula u obtiene el usuario logueado desde localStorage (útil para cuando integren el login)
  usuarioLogueado = signal<any>(this.obtenerUsuarioInicial());

  // esto determina si el usuario logueado es Super Administrador (Rol ID 1)
  esSuperAdmin = computed(() => {
    const user = this.usuarioLogueado();
    if (!user) return false; // Si no hay login en desarrollo, no mostramos el selector y queda fijo en la Inst. 1
    return user.idRol === 1;
  });

  // esto almacena globalmente la institución seleccionada por el Super Admin (null = Todas)
  // Si no es Super Admin, se fuerza a la institución asignada a su usuario
  institucionSeleccionadaId = signal<number | null>(this.obtenerIdInicial());

  private obtenerUsuarioInicial(): any {
    try {
      const userRaw = localStorage.getItem('usuario_comunica');
      return userRaw ? JSON.parse(userRaw) : null;
    } catch (e) {
      return null;
    }
  }

  private obtenerIdInicial(): number | null {
    // Si ya está preparado el login y es un admin normal, forzamos su institución
    const user = this.obtenerUsuarioInicial();
    if (user && user.idRol !== 1) {
      return user.idInstitucion || 1;
    }

    const guardado = localStorage.getItem('admin_institucion_id');
    // Por el momento (desarrollo), si está vacío, es '0' (Todas) o 'null', lo forzamos a 1 para iniciar con la Alcaldía de Rivas
    if (guardado === null || guardado === '0' || guardado === 'null') {
      return 1;
    }
    return Number(guardado);
  }

  // esto actualiza la institución seleccionada y la persiste en localStorage
  establecerInstitucion(id: number | null) {
    // Si no es Super Admin, no permitimos cambiar la institución (seguridad en el frontend)
    const user = this.usuarioLogueado();
    if (user && user.idRol !== 1) {
      this.institucionSeleccionadaId.set(user.idInstitucion || 1);
      return;
    }

    this.institucionSeleccionadaId.set(id);
    localStorage.setItem('admin_institucion_id', id === null ? '0' : id.toString());
  }

  // Función preparada para cuando hagan el login en el frontend:
  // Solo deben llamar a este método al iniciar sesión con el objeto de usuario retornado por la API
  iniciarSesion(usuario: any) {
    this.usuarioLogueado.set(usuario);
    localStorage.setItem('usuario_comunica', JSON.stringify(usuario));
    
    // Forzamos la institución si es un admin regular
    if (usuario && usuario.idRol !== 1) {
      this.establecerInstitucion(usuario.idInstitucion || 1);
    } else {
      // Si es Super Admin, restauramos su selección previa o el default 1
      const guardado = localStorage.getItem('admin_institucion_id');
      const idInicial = guardado === null ? 1 : (guardado === '0' || guardado === 'null' ? null : Number(guardado));
      this.institucionSeleccionadaId.set(idInicial);
    }
  }

  // Función preparada para el cierre de sesión
  cerrarSesion() {
    this.usuarioLogueado.set(null);
    localStorage.removeItem('usuario_comunica');
    localStorage.removeItem('admin_institucion_id');
    this.institucionSeleccionadaId.set(1); // Reseteamos al valor por defecto (institución 1)
  }
}
