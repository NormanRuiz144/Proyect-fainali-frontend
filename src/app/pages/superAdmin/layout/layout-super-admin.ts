import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/service/auth-service';

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

  menuAbierto = signal(false);

  menuAdmin = [
    {
      texto: 'Problemáticas',
      icono: 'fa-solid fa-triangle-exclamation',
      url: '/superAdmin/problematicas',
    },
    { texto: 'Ubicaciones', icono: 'fa-solid fa-map-marker-alt', url: '/superAdmin/ubicaciones' },
    { texto: 'Instituciones', icono: 'fa-solid fa-building', url: '/superAdmin/instituciones' },
    { texto: 'Usuarios', icono: 'fa-solid fa-users', url: '/superAdmin/usuarios' },
  ];

  alternarMenu() {
    this.menuAbierto.set(!this.menuAbierto());
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/inicio']);
  }
}
