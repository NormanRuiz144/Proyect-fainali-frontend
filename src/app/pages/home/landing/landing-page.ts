import { Component, inject } from '@angular/core';
import { InteractionService } from '../../../shared/service/interaction.service';
import { AuthService } from '../../../auth/service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  private interactionService = inject(InteractionService);
  public authService = inject(AuthService);
  private router = inject(Router);

  private rolUsuario = this.authService.rolUsuario();

  abrirLogin() {
    this.interactionService.abrirModalAuth('login');
  }

  abrirRegistro() {
    this.interactionService.abrirModalAuth('registro');
  }

  abrirApp() {
    if (this.authService.estaAutenticado()) {
      // Redirigir a la página principal de la aplicación
      console.log('Navegando');
      if (this.rolUsuario == 'default') {
        this.router.navigate(['/nuevo-reporte']);
      } else if (this.rolUsuario == 'admin') {
        this.router.navigate(['/admin']);
      } else if (this.rolUsuario == 'Super-Admin') {
        this.router.navigate(['/superAdmin']);
      } else {
        this.router.navigate(['/inicio']);
      }
    }
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
