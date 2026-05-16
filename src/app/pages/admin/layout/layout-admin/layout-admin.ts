import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout-admin.html',
  styleUrl: './layout-admin.css'
})
export class LayoutAdmin {
  menuAbierto = signal(false);

  menuAdmin = [
    { texto: 'Panel de Control', icono: 'fa-solid fa-chart-line', url: '/admin/dashboard' },
    { texto: 'Reportes', icono: 'fa-solid fa-file-signature', url: '/admin/reportes' },
    { texto: 'Instituciones', icono: 'fa-solid fa-building', url: '/admin/instituciones' }
  ];

  alternarMenu() {
    this.menuAbierto.set(!this.menuAbierto());
  }
}
