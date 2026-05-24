import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../dashboard/service/dashboard';
import { EstadoAdminService } from '../../../../shared/service/estado-admin.service';

@Component({
  selector: 'app-layout-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './layout-admin.html',
  styleUrl: './layout-admin.css'
})
export class LayoutAdmin implements OnInit {
  private dashboardService = inject(DashboardService);
  public estadoAdminService = inject(EstadoAdminService);

  menuAbierto = signal(false);
  instituciones = signal<any[]>([]);

  menuAdmin = [
    { texto: 'Panel de Control', icono: 'fa-solid fa-chart-line', url: '/admin/dashboard' },
    { texto: 'Reportes', icono: 'fa-solid fa-file-signature', url: '/admin/reportes' },
    { texto: 'Historial por Usuario', icono: 'fa-solid fa-users-viewfinder', url: '/admin/historial' },
    { texto: 'Instituciones', icono: 'fa-solid fa-building', url: '/admin/instituciones' }
  ];

  ngOnInit(): void {
    this.cargarInstituciones();
  }

  // esto carga la lista de instituciones para mostrarlas en el selector del header global
  cargarInstituciones() {
    this.dashboardService.obtenerInstituciones().subscribe({
      next: (res) => {
        this.instituciones.set(res.lista_Instituciones || []);
      },
      error: (err) => {
        console.error('Error al cargar instituciones en layout:', err);
      }
    });
  }

  // esto maneja el cambio de institución desde el header global y actualiza el estado compartido
  onInstitucionChange(event: any) {
    const val = event.target.value;
    const id = val === 'null' || val === '0' || val === '' ? null : Number(val);
    this.estadoAdminService.establecerInstitucion(id);
  }

  alternarMenu() {
    this.menuAbierto.set(!this.menuAbierto());
  }
}
