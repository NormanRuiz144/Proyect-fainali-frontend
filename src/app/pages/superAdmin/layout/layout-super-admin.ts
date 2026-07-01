import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/service/auth-service';
import { InteractionService } from '../../../shared/service/interaction.service';

@Component({
  selector: 'app-layout-super-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout-super-admin.html',
  styleUrl: './layout-super-admin.css',
})
export class LayoutSuperAdmin {
  public authService = inject(AuthService);
  private router = inject(Router);
  private interactionService = inject(InteractionService);

  menuAbierto = signal(false);

  menuAdmin = [
    { texto: 'Dashboard', icono: 'fa-solid fa-chart-line', url: '/superAdmin/dashboard' },
    {
      texto: 'Mapa de Reportes',
      icono: 'fa-solid fa-map-location-dot',
      url: '/superAdmin/mapa-reportes',
    },
    {
      texto: 'Problemáticas',
      icono: 'fa-solid fa-triangle-exclamation',
      url: '/superAdmin/problematicas',
    },
    { texto: 'Ubicaciones', icono: 'fa-solid fa-map-marker-alt', url: '/superAdmin/ubicaciones' },
    { texto: 'Instituciones', icono: 'fa-solid fa-building', url: '/superAdmin/instituciones' },
    { texto: 'Usuarios', icono: 'fa-solid fa-users', url: '/superAdmin/usuarios' },
    { texto: 'Baneados', icono: 'fa-solid fa-hand', url: '/superAdmin/baneados' },
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
