import { Component, AfterViewInit, inject } from '@angular/core';
import { InteractionService } from '../../../shared/service/interaction.service';
import { AuthService } from '../../../auth/service/auth-service';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements AfterViewInit {
  private interactionService = inject(InteractionService);
  public authService = inject(AuthService);

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  abrirLogin() {
    this.interactionService.abrirModalAuth('login');
  }

  abrirRegistro() {
    this.interactionService.abrirModalAuth('registro');
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
