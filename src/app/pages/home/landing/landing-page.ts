import { Component, AfterViewInit, inject } from '@angular/core';
import { InteractionService } from '../../../shared/service/interaction.service';
import { AuthService } from '../../../auth/service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements AfterViewInit {
  private interactionService = inject(InteractionService);
  public authService = inject(AuthService);
  private router = inject(Router);

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  abrirLogin() {
    this.interactionService.abrirModalAuth('login');
  }

  abrirRegistro() {
    this.interactionService.abrirModalAuth('registro');
  }

  abrirApp() {
    if (this.authService.estaAutenticado()) {
      const rolUsuario = this.authService.rolUsuario();
      console.log(rolUsuario);

      // Redirigir a la página principal de la aplicación
      if (rolUsuario == 'default') {
        this.router.navigate(['/reportes']);
      } else if (rolUsuario == 'Admin') {
        this.router.navigate(['/admin']);
      } else if (rolUsuario == 'Super-Admin') {
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
