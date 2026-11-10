import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../auth/service/auth-service';
import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractionService } from '../../../../shared/service/interaction.service';

@Component({
  selector: 'app-layout-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout-admin.html',
  styleUrl: './layout-admin.css',
})
export class LayoutAdmin {
  public authService = inject(AuthService);
  private router = inject(Router);
  private interactionService = inject(InteractionService);

  menuAbierto = signal(false);

  nombreCompletoUsuario = computed(() => {
    const user = this.authService.usuarioActual();
    return user ? `${user.nombres} ${user.apellidos}` : 'Administrador';
  });

  menuAdmin = [
    { texto: 'Panel de control', icono: 'fa-solid fa-chart-line', url: '/operadores/dashboard', permisos: ['operadores.ver'] },
    { texto: 'Incidencias', icono: 'fa-solid fa-file-signature', url: '/operadores/incidencias', permisos: ['incidencias.ver'] },
    { texto: 'Historial', icono: 'fa-solid fa-clock-rotate-left', url: '/operadores/historial', permisos: ['incidencias.ver'] },
    { texto: 'Mapa', icono: 'fa-solid fa-map-location-dot', url: '/operadores/mapa', permisos: ['incidencias.ver'] },
    { texto: 'Problemáticas', icono: 'fa-solid fa-triangle-exclamation', url: '/operadores/problematicas', permisos: ['problematicas.ver'] },
    { texto: 'Ubicaciones', icono: 'fa-solid fa-map-marker-alt', url: '/operadores/ubicaciones', permisos: ['departamentos.ver', 'municipios.ver', 'sectores.ver'], requiereAlguno: true },
    { texto: 'Usuarios', icono: 'fa-solid fa-users', url: '/operadores/usuarios', permisos: ['usuarios.ver'] },
    { texto: 'Baneados', icono: 'fa-solid fa-ban', url: '/operadores/baneados', permisos: ['banned_users.ver'] },
    { texto: 'Operadores y permisos', icono: 'fa-solid fa-user-gear', url: '/operadores/accesos', permisos: ['operadores.ver', 'operadores.crear', 'permisos.ver', 'permisos.administrar'], requiereAlguno: true },
  ];

  alternarMenu() {
    this.menuAbierto.set(!this.menuAbierto());
  }

  async cerrarSesion() {
    const confirm = await this.interactionService.confirmar(
      'Cerrar Sesión',
      '¿Seguro que deseas salir?',
    );
    if (!confirm) return;

    this.authService.logout();
    this.router.navigate(['/inicio']);
  }
}
