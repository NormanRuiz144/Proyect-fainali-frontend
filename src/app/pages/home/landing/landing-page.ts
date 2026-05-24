import { Component, inject } from '@angular/core';
import { InteractionService } from '../../../shared/service/interaction.service';
import { AuthService } from '../../../auth/service/auth-service';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  private interactionService = inject(InteractionService);
  public authService = inject(AuthService);

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
