import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from './service/reportes';
import { IReporte, IRespuestaReportes } from './interface/ireporte';
import { EstadoAdminService } from '../../../shared/service/estado-admin.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit {
  private reportesService = inject(ReportesService);
  public estadoAdminService = inject(EstadoAdminService); // esto comparte el estado de la institución seleccionada

  reportes = signal<IReporte[]>([]);
  cargando = signal(true);
  
  // Estado para filtros
  terminoBusqueda = signal('');
  filtroEstado = signal('');

  // Computado que retorna los reportes filtrados
  reportesFiltrados = computed(() => {
    let filtrados = this.reportes();
    
    const estado = this.filtroEstado();
    if (estado) {
      filtrados = filtrados.filter(r => r.estado === estado);
    }

    // Filtrar por la institución seleccionada globalmente si existe
    const idFiltro = this.estadoAdminService.institucionSeleccionadaId();
    if (idFiltro !== null) {
      filtrados = filtrados.filter(r => r.institucion && r.institucion.id === idFiltro);
    }
    
    const busqueda = this.terminoBusqueda().toLowerCase().trim();
    if (busqueda) {
      filtrados = filtrados.filter(r => 
        r.descripcion.toLowerCase().includes(busqueda) ||
        r.problematica?.problema.toLowerCase().includes(busqueda) ||
        (r.usuario?.nombres + ' ' + r.usuario?.apellidos).toLowerCase().includes(busqueda) ||
        r.id.toString().includes(busqueda)
      );
    }
    
    return filtrados;
  });

  // Estado para el modal
  reporteSeleccionado = signal<IReporte | null>(null);

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes() {
    this.cargando.set(true);
    this.reportesService.obtenerReportes().subscribe({
      next: (res: IRespuestaReportes) => {
        this.reportes.set(res.lista_Reportes);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.cargando.set(false);
      }
    });
  }

  abrirModal(reporte: IReporte) {
    this.reporteSeleccionado.set(reporte);
  }

  cerrarModal() {
    this.reporteSeleccionado.set(null);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Fecha desconocida';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
}
