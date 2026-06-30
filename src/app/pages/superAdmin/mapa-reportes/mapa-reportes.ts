import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { MapaReportesService } from './service/mapa-reportes.service';
import { IReporteMapa, IReporteMapaResponse } from './interface/ireporte-mapa';
import { InstitucionesService } from '../../../features/instituciones/service/instituciones.service';
import { ProblematicaService } from '../../../features/problematicas/service/problematica.service';
import { Institucion } from '../../../features/instituciones/interface/instituciones';
import { Problematica } from '../../../features/problematicas/interface/problematica';
import { InteractionService } from '../../../shared/service/interaction.service';

@Component({
  selector: 'app-mapa-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-reportes.html',
  styleUrl: './mapa-reportes.css',
})
export class MapaReportes implements OnInit, AfterViewInit, OnDestroy {
  private mapaReportesService = inject(MapaReportesService);
  private institucionesService = inject(InstitucionesService);
  private problematicaService = inject(ProblematicaService);
  private interactionService = inject(InteractionService);

  reportes = signal<IReporteMapa[]>([]);
  instituciones = signal<Institucion[]>([]);
  problematicas = signal<Problematica[]>([]);
  cargando = signal(false);
  total = signal(0);
  totalConUbicacion = signal(0);
  totalSinUbicacion = signal(0);

  filtroEstado = signal('');
  filtroInstitucion = signal('');
  filtroProblematica = signal('');
  fechaDesde = signal('');
  fechaHasta = signal('');

  private map: L.Map | undefined;
  private markersLayer: L.LayerGroup | undefined;
  private readonly defaultLat = 14.1;
  private readonly defaultLng = -87.2;

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarReportes();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.renderizarMarcadores();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  aplicarFiltros(): void {
    this.cargarReportes();
  }

  limpiarFiltros(): void {
    this.filtroEstado.set('');
    this.filtroInstitucion.set('');
    this.filtroProblematica.set('');
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.cargarReportes();
  }

  private cargarCatalogos(): void {
    this.institucionesService.obtenerInstituciones().subscribe({
      next: (res) => {
        const lista = res.lista_Instituciones as any;
        const instituciones: Institucion[] = Array.isArray(lista) ? lista : lista?.data || [];
        this.instituciones.set(instituciones.filter((institucion) => !institucion.isDeleted));
      },
      error: (err) => console.error('Error al cargar instituciones:', err),
    });

    this.problematicaService.obtenerProblematicas().subscribe({
      next: (res) => {
        const lista = res.lista_Problematicas as any;
        const problematicas: Problematica[] = Array.isArray(lista) ? lista : lista?.data || [];
        this.problematicas.set(problematicas.filter((problematica) => !problematica.isDeleted));
      },
      error: (err) => console.error('Error al cargar problematicas:', err),
    });
  }

  private cargarReportes(): void {
    this.cargando.set(true);

    this.mapaReportesService
      .obtenerReportesMapa({
        estado: this.filtroEstado(),
        idInstitucion: this.filtroInstitucion(),
        idProblematica: this.filtroProblematica(),
        fechaDesde: this.fechaDesde(),
        fechaHasta: this.fechaHasta(),
      })
      .subscribe({
        next: (res: IReporteMapaResponse) => {
          this.total.set(res.total || 0);
          this.totalConUbicacion.set(res.totalConUbicacion || 0);
          this.totalSinUbicacion.set(res.totalSinUbicacion || 0);
          this.reportes.set(res.data || []);
          this.cargando.set(false);
          this.renderizarMarcadores();
        },
        error: (err) => {
          this.cargando.set(false);
          this.interactionService.mostrarError(err);
          this.reportes.set([]);
          this.renderizarMarcadores();
        },
      });
  }

  private inicializarMapa(): void {
    if (this.map) return;

    this.map = L.map('mapa-general-reportes', {
      center: [this.defaultLat, this.defaultLng],
      zoom: 7,
      preferCanvas: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  private renderizarMarcadores(): void {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();
    const reportes = this.reportes();
    const bounds = L.latLngBounds([]);

    reportes.forEach((reporte) => {
      const latLng = L.latLng(reporte.lat, reporte.lng);
      bounds.extend(latLng);

      const marker = L.circleMarker(latLng, {
        radius: reporte.nvl_prioridad === 10 ? 10 : 7,
        color: reporte.nvl_prioridad === 10 ? '#b91c1c' : this.obtenerColorEstado(reporte.estado),
        fillColor: this.obtenerColorEstado(reporte.estado),
        fillOpacity: 0.82,
        weight: reporte.nvl_prioridad === 10 ? 3 : 2,
        renderer: L.canvas(),
      });

      marker.bindPopup(this.construirPopup(reporte), {
        maxWidth: 300,
        className: 'popup-reporte-mapa',
      });
      marker.addTo(this.markersLayer!);
    });

    if (reportes.length > 0 && bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
    } else {
      this.map.setView([this.defaultLat, this.defaultLng], 7);
    }
  }

  private obtenerColorEstado(estado: string | null): string {
    if (estado === 'Finalizado') return '#16a34a';
    if (estado === 'En Proceso') return '#2563eb';
    if (estado === 'Pendiente') return '#f59e0b';
    return '#64748b';
  }

  private construirPopup(reporte: IReporteMapa): string {
    const fecha = reporte.fecha_gen ? new Date(reporte.fecha_gen).toLocaleDateString() : 'Sin fecha';
    const institucion = reporte.institucion?.nombreInstitucion || 'Sin institución';
    const problema = reporte.problematica?.problema || 'Sin problemática';
    const descripcion = reporte.descripcion || 'Sin descripción';
    const prioridad = reporte.nvl_prioridad === 10 ? '<span class="popup-alerta">Alta prioridad</span>' : '';

    return `
      <div class="popup-contenido">
        <strong>Reporte #${reporte.id}</strong>
        ${prioridad}
        <span>Estado: ${this.escaparHtml(reporte.estado || 'Sin estado')}</span>
        <span>Institución: ${this.escaparHtml(institucion)}</span>
        <span>Problemática: ${this.escaparHtml(problema)}</span>
        <span>Fecha: ${this.escaparHtml(fecha)}</span>
        <p>${this.escaparHtml(descripcion)}</p>
      </div>
    `;
  }

  private escaparHtml(valor: string): string {
    return valor
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
