import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { InteractionService } from '../../../shared/service/interaction.service';
import { ISuperAdminDashboard } from './interface/isuper-admin-dashboard';
import { SuperAdminDashboardService } from './service/super-admin-dashboard.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.css',
})
export class SuperAdminDashboard implements OnInit, OnDestroy {
  private dashboardService = inject(SuperAdminDashboardService);
  private interactionService = inject(InteractionService);

  datos = signal<ISuperAdminDashboard | null>(null);
  cargando = signal(true);

  tendenciaChart: any = null;
  estadosChart: any = null;
  institucionesChart: any = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.cargarDashboard();
    this.intervalId = setInterval(() => this.cargarDashboardSilencioso(), 15000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cargarDashboard(): void {
    this.cargando.set(true);
    this.dashboardService.obtenerResumen().subscribe({
      next: (res) => {
        this.datos.set(res);
        this.configurarGraficos(res);
        this.cargando.set(false);
      },
      error: async (err) => {
        this.cargando.set(false);
        await this.interactionService.mostrarError(err);
      },
    });
  }

  cargarDashboardSilencioso(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: (res) => {
        this.datos.set(res);
        this.configurarGraficos(res);
      },
      error: (err) => console.error('Error auto-actualizando dashboard Super Admin', err),
    });
  }

  private configurarGraficos(datos: ISuperAdminDashboard): void {
    this.tendenciaChart = {
      series: [
        {
          name: 'Reportes',
          data: datos.reportes.tendencia.map((item) => item.total),
        },
      ],
      chart: {
        height: 280,
        type: 'line',
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ['#1C4D8D'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      markers: { size: 4 },
      xaxis: {
        categories: datos.reportes.tendencia.map((item) => this.formatShortDate(item.fecha)),
      },
      yaxis: { min: 0, forceNiceScale: true },
      grid: { borderColor: '#e2e8f0' },
    };

    this.estadosChart = {
      series: datos.reportes.porEstado.map((item) => item.total),
      chart: {
        height: 280,
        type: 'donut',
      },
      labels: datos.reportes.porEstado.map((item) => item.estado),
      colors: ['#f59e0b', '#1C4D8D', '#16a34a', '#94a3b8'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: true },
    };

    const topInstituciones = datos.instituciones.ranking.slice(0, 6);
    this.institucionesChart = {
      series: [
        {
          name: 'Reportes',
          data: topInstituciones.map((item) => item.totalReportes),
        },
      ],
      chart: {
        height: 280,
        type: 'bar',
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 5,
        },
      },
      colors: ['#4988C4'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: topInstituciones.map((item) => item.nombre),
      },
    };
  }

  totalAlertas(): number {
    const alertas = this.datos()?.alertas;
    if (!alertas) return 0;
    return (
      alertas.reportesAltaPrioridad.length +
      alertas.reportesPendientesAntiguos.length +
      alertas.institucionesSinAdmin.length +
      alertas.baneosPorVencer.length
    );
  }

  nombreRolVisible(rol: string): string {
    if (rol === 'Super-Admin') return 'Administrador de la plataforma';
    if (rol === 'Admin') return 'Administrador de Institución';
    if (rol === 'default') return 'Ciudadanos';
    return rol;
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }

  private formatShortDate(dateString: string): string {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
