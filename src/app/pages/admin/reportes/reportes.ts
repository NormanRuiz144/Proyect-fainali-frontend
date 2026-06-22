import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { ReportesService } from './service/reportes';
import { IReporte, IRespuestaReportes } from './interface/ireporte';
import { EstadoAdminService } from '../../../shared/service/estado-admin.service';
import { AuthService } from '../../../auth/service/auth-service';
import { DashboardService } from '../dashboard/service/dashboard';

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
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  reportes = signal<IReporte[]>([]);
  instituciones = signal<any[]>([]);
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
  nuevoEstadoSeleccionado = signal('Pendiente');
  
  // Mapa
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  ngOnInit(): void {
    this.cargarReportes();
    this.cargarInstituciones();
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

  cargarInstituciones() {
    this.dashboardService.obtenerInstituciones().subscribe({
      next: (res) => {
        this.instituciones.set(res.lista_Instituciones || []);
      },
      error: (err) => {
        console.error('Error al cargar instituciones en reportes:', err);
      }
    });
  }

  obtenerNombreOrganizacion(): string {
    const idFiltro = this.estadoAdminService.institucionSeleccionadaId();
    if (idFiltro === null) {
      return 'Consolidado Global (Todas las Instituciones)';
    }
    const inst = this.instituciones().find(i => i.id === idFiltro);
    return inst ? inst.nombreInstitucion : 'Institución Activa';
  }

  abrirModal(reporte: IReporte) {
    this.reporteSeleccionado.set(reporte);
    this.nuevoEstadoSeleccionado.set(reporte.estado);
    
    // Parse coordinates and load map
    setTimeout(() => {
      this.initMap(reporte.ubicacion);
    }, 100);
  }

  cerrarModal() {
    this.reporteSeleccionado.set(null);
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  private initMap(ubicacionStr: string) {
    if (this.map) {
      this.map.remove();
    }

    // Configuración para arreglar el problema de las imágenes de Leaflet en Angular
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    let lat = 14.1; // Default Honduras lat
    let lng = -87.2; // Default Honduras lng

    // Intentar extraer lat y lng de "Lat: X, Lng: Y"
    if (ubicacionStr) {
      const match = ubicacionStr.match(/Lat:\s*([-0-9.]+),\s*Lng:\s*([-0-9.]+)/i);
      if (match && match.length === 3) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }

    this.map = L.map('mapa-admin', {
      center: [lat, lng],
      zoom: 15
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.map.invalidateSize();
  }

  actualizarEstado() {
    const rep = this.reporteSeleccionado();
    if (!rep) return;
    this.reportesService.actualizarEstadoReporte(rep.id, this.nuevoEstadoSeleccionado()).subscribe({
      next: (res) => {
        alert(res.mensaje || 'Estado actualizado con éxito');
        this.cargarReportes();
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        alert('Hubo un error al actualizar el estado: ' + (err?.error?.mensaje || err.message));
      }
    });
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Fecha desconocida';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  exportarPDF() {
    const lista = this.reportesFiltrados();
    const activeUser = this.authService.usuarioActual();
    const adminName = activeUser 
      ? `${activeUser.nombres} ${activeUser.apellidos}`
      : 'Administrador del Sistema';
    const orgName = this.obtenerNombreOrganizacion();
    const fechaExportacion = new Date().toLocaleString();
    const isTodasLasInstituciones = this.estadoAdminService.institucionSeleccionadaId() === null;

    // Abrir ventana para impresión
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes en este sitio para poder exportar el PDF.');
      return;
    }

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Incidencias - ${orgName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333333;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
            font-size: 13px;
          }

          @media print {
            .print-btn-container {
              display: none !important;
            }
          }

          .print-btn-container {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
          }

          .print-btn {
            background-color: #0F2854;
            color: white;
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
          }

          .cabecera-reporte {
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }

          .cabecera-reporte h1 {
            margin: 0 0 5px 0;
            font-size: 20px;
            color: #0F2854;
          }

          .cabecera-reporte p {
            margin: 0;
            color: #666;
            font-size: 12px;
          }

          .datos-reporte {
            margin-bottom: 20px;
            font-size: 12px;
          }

          .datos-reporte table {
            width: 100%;
            margin-bottom: 10px;
          }

          .datos-reporte td {
            padding: 4px 0;
            border: none;
          }

          .datos-reporte td.label {
            font-weight: bold;
            color: #666;
            width: 20%;
          }

          .datos-reporte td.value {
            color: #111;
            width: 30%;
          }

          table.tabla-datos {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }

          table.tabla-datos th {
            background-color: #f1f5f9;
            color: #0F2854;
            font-weight: bold;
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
          }

          table.tabla-datos td {
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            font-size: 12px;
          }

          table.tabla-datos tr:nth-child(even) {
            background-color: #f8fafc;
          }

          .prioridad-alta {
            color: #dc2626;
            font-weight: bold;
          }

          .badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            border-radius: 4px;
          }

          .badge-pendiente {
            background-color: #fef3c7;
            color: #d97706;
          }

          .badge-proceso {
            background-color: #e0f2fe;
            color: #0369a1;
          }

          .badge-finalizado {
            background-color: #dcfce7;
            color: #15803d;
          }

          .firmas {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }

          .firma-box {
            width: 45%;
            text-align: center;
          }

          .firma-linea {
            border-top: 1px solid #333;
            margin-top: 50px;
            margin-bottom: 5px;
          }

          .pie {
            text-align: center;
            font-size: 11px;
            color: #666;
            margin-top: 30px;
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container">
          <button class="print-btn" onclick="window.print()">Imprimir / Guardar PDF</button>
        </div>

        <div class="cabecera-reporte">
          <h1>Reporte de Incidencias</h1>
          <p>Generado a través de la plataforma Comunica</p>
        </div>

        <div class="datos-reporte">
          <table>
            <tr>
              <td class="label">Organización:</td>
              <td class="value">${orgName}</td>
              <td class="label">Generado por:</td>
              <td class="value">${adminName}</td>
            </tr>
            <tr>
              <td class="label">Fecha Emisión:</td>
              <td class="value">${fechaExportacion}</td>
              <td class="label">Total Reportes:</td>
              <td class="value">${lista.length}</td>
            </tr>
          </table>
        </div>

        <table class="tabla-datos">
          <thead>
            <tr>
              <th style="width: 15%">Fecha</th>
              <th style="width: 15%">Prioridad</th>
              <th style="width: 30%">Problema</th>
              <th style="width: 25%">Reportado por</th>
              ${isTodasLasInstituciones ? '<th style="width: 20%">Institución</th>' : ''}
              <th style="width: 15%">Estado</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (lista.length === 0) {
      const colSpan = isTodasLasInstituciones ? 7 : 6;
      htmlContent += `
        <tr>
          <td colspan="${colSpan}" style="text-align: center; color: #666; font-style: italic; padding: 20px;">
            No hay reportes para mostrar en este filtro.
          </td>
        </tr>
      `;
    } else {
      lista.forEach((rep, index) => {
        const fechaStr = this.formatDate(rep.fechaGen);
        const problemaStr = rep.problematica?.problema || 'N/A';
        const usuarioNombre = rep.usuario 
          ? `${rep.usuario.nombres} ${rep.usuario.apellidos}`
          : 'N/A';
        const institucionStr = rep.institucion?.nombreInstitucion || 'N/A';
        const prioridadStr = rep.nvlPrioridad >= 8 
          ? `<span class="prioridad-alta">Alta</span>`
          : `Normal`;
        
        let badgeClass = 'badge-pendiente';
        if (rep.estado === 'En Proceso') badgeClass = 'badge-proceso';
        if (rep.estado === 'Finalizado') badgeClass = 'badge-finalizado';

        htmlContent += `
          <tr>
            <td>${fechaStr}</td>
            <td>${prioridadStr}</td>
            <td>${problemaStr}</td>
            <td>${usuarioNombre}</td>
            ${isTodasLasInstituciones ? `<td>${institucionStr}</td>` : ''}
            <td>
              <span class="badge ${badgeClass}">${rep.estado}</span>
            </td>
          </tr>
        `;
      });
    }

    htmlContent += `
          </tbody>
        </table>

        <div class="firmas">
          <div class="firma-box">
            <div class="firma-linea"></div>
            <span>Firma Administrador</span>
          </div>
          <div class="firma-box">
            <div class="firma-linea"></div>
            <span>Validación Oficial (${orgName})</span>
          </div>
        </div>

        <div class="pie">
          Documento generado digitalmente. Plataforma Comunica &copy; ${new Date().getFullYear()}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 350);
    };
  }
}
