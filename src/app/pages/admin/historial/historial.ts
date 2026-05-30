import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../reportes/service/reportes';
import { IReporte } from '../reportes/interface/ireporte';
import { EstadoAdminService } from '../../../shared/service/estado-admin.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class Historial implements OnInit {
  private reportesService = inject(ReportesService);
  public estadoAdminService = inject(EstadoAdminService); // esto comparte el estado de la institución seleccionada

  cargando = signal(true);

  // esto almacena todos los reportes de la comunidad
  reportesComunidad = signal<IReporte[]>([]);

  // esto guarda el texto de búsqueda del usuario (cédula o nombre)
  terminoBusquedaUsuario = signal('');

  // esto almacena el usuario seleccionado para su historial
  usuarioSeleccionado = signal<any | null>(null);

  // esto almacena el reporte seleccionado para ver en el modal
  reporteSeleccionado = signal<IReporte | null>(null);

  ngOnInit(): void {
    this.cargarReportesComunidad();
  }

  // esto carga todos los reportes de la comunidad para el historial por usuario
  cargarReportesComunidad() {
    this.cargando.set(true);
    this.reportesService.obtenerReportes().subscribe({
      next: (res) => {
        this.reportesComunidad.set(res.lista_Reportes || []);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar reportes en historial:', err);
        this.cargando.set(false);
      }
    });
  }

  // esto obtiene y filtra la lista de usuarios únicos a partir de los reportes y la institución seleccionada
  usuariosConReportes = computed(() => {
    const reportes = this.reportesComunidad();
    const busqueda = this.terminoBusquedaUsuario().toLowerCase().trim();
    const idFiltro = this.estadoAdminService.institucionSeleccionadaId();
    
    // extraemos usuarios únicos que tienen reportes asociados a la institución filtrada
    const mapaUsuarios = new Map<any, any>();
    reportes.forEach(rep => {
      if (rep.usuario) {
        // si hay una institución seleccionada globalmente, omitimos reportes de otras instituciones
        if (idFiltro !== null) {
          if (!rep.institucion || rep.institucion.id !== idFiltro) {
            return;
          }
        }
        const userId = rep.usuario.id || rep.usuario.numeroCedula || `${rep.usuario.nombres}_${rep.usuario.apellidos}`;
        mapaUsuarios.set(userId, rep.usuario);
      }
    });
    
    const listaUsuarios = Array.from(mapaUsuarios.values());
    
    // si no hay búsqueda activa, devolvemos la lista filtrada por institución
    if (!busqueda) {
      return listaUsuarios;
    }
    
    // filtramos usuarios por cédula, nombres o apellidos
    return listaUsuarios.filter(u => {
      const cedula = (u.numeroCedula || '').toLowerCase();
      const nombres = (u.nombres || '').toLowerCase();
      const apellidos = (u.apellidos || '').toLowerCase();
      const nombreCompleto = `${nombres} ${apellidos}`;
      
      return cedula.includes(busqueda) || 
             nombres.includes(busqueda) || 
             apellidos.includes(busqueda) || 
             nombreCompleto.includes(busqueda);
    });
  });

  // esto obtiene todos los reportes que pertenecen al usuario y corresponden a la institución seleccionada
  reportesDelUsuarioSeleccionado = computed(() => {
    const usuario = this.usuarioSeleccionado();
    if (!usuario) return [];
    
    const reportes = this.reportesComunidad();
    const idFiltro = this.estadoAdminService.institucionSeleccionadaId();
    
    return reportes.filter(rep => {
      if (!rep.usuario) return false;
      
      // 1. Verificamos coincidencia de usuario
      const idMatch = usuario.id && rep.usuario.id === usuario.id;
      const cedulaMatch = usuario.numeroCedula && rep.usuario.numeroCedula === usuario.numeroCedula;
      const usuarioMatch = idMatch || cedulaMatch;
      
      if (!usuarioMatch) return false;
      
      // 2. Si hay filtro de institución, verificamos que pertenezca a esa institución
      if (idFiltro !== null) {
        return rep.institucion && rep.institucion.id === idFiltro;
      }
      
      return true; // si es "Todas", incluimos todos sus reportes
    });
  });

  // esto selecciona un usuario específico para ver su historial
  seleccionarUsuario(usuario: any) {
    this.usuarioSeleccionado.set(usuario);
  }

  // esto quita la selección para volver al buscador de usuarios
  deseleccionarUsuario() {
    this.usuarioSeleccionado.set(null);
  }

  // esto abre el modal para visualizar los detalles de un reporte
  abrirModalDetalle(reporte: IReporte) {
    this.reporteSeleccionado.set(reporte);
  }

  // esto cierra el modal de detalles del reporte
  cerrarModalDetalle() {
    this.reporteSeleccionado.set(null);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Fecha desconocida';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
}
