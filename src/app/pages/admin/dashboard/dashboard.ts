import { Component, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // esto nos permite usar ngModel en los inputs del formulario
import { DashboardService } from './service/dashboard';
import { InteractionService } from '../../../shared/service/interaction.service';
import { IDashboard } from './interface/idashboard';
import { EstadoAdminService } from '../../../shared/service/estado-admin.service';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexFill,
  NgApexchartsModule,
  ApexPlotOptions,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  fill: ApexFill;
  colors: string[];
  plotOptions?: ApexPlotOptions;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private interactionService = inject(InteractionService);
  public estadoAdminService = inject(EstadoAdminService); // esto comparte el estado de la institución seleccionada

  datos = signal<IDashboard | null>(null);
  cargando = signal(true);

  chartOptions: ChartOptions | null = null;
  private intervalId: any;

  constructor() {
    effect(() => {
      // esto reacciona al cambio de institución seleccionada en el header global y recarga el dashboard
      const id = this.estadoAdminService.institucionSeleccionadaId();
      this.cargarDashboard();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    // Auto-actualizar el dashboard cada 5 segundos (Polling)
    this.intervalId = setInterval(() => {
      this.cargarDashboardSilencioso();
    }, 5000);
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el usuario sale de la pantalla del dashboard
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cargarDashboard() {
    this.cargando.set(true);

    this.dashboardService.obtenerResumen(this.estadoAdminService.institucionSeleccionadaId()).subscribe({
      next: (res: IDashboard | null) => {
        this.datos.set(res);

        if (res && res.porProblema && res.porProblema.length > 0) {
          const categorias = res.porProblema.map((p) => p.problema);
          const data = res.porProblema.map((p) => p.total);

          this.chartOptions = {
            series: [
              {
                name: 'Reportes',
                data: data,
              },
            ],
            chart: {
              height: 300,
              type: 'area',
              toolbar: { show: false },
              zoom: { enabled: false },
            },
            colors: ['#0F2854'],
            dataLabels: { enabled: false },
            stroke: {
              curve: 'smooth',
              width: 3,
            },
            fill: {
              type: 'gradient',
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100],
              },
            },
            xaxis: {
              categories: categorias,
            },
            yaxis: {
              min: 0,
            },
          };
        } else {
          this.chartOptions = null;
        }

        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.interactionService.mostrarError(err);
      },
    });
  }

  // Carga los datos sin mostrar el spinner de carga para no interrumpir al usuario
  cargarDashboardSilencioso() {
    this.dashboardService.obtenerResumen(this.estadoAdminService.institucionSeleccionadaId()).subscribe({
      next: (res: IDashboard | null) => {
        this.datos.set(res);

        if (res && res.porProblema && res.porProblema.length > 0) {
          const categorias = res.porProblema.map((p) => p.problema);
          const data = res.porProblema.map((p) => p.total);

          this.chartOptions = {
            series: [
              {
                name: 'Reportes',
                data: data,
              },
            ],
            chart: {
              height: 300,
              type: 'area',
              toolbar: { show: false },
              zoom: { enabled: false },
            },
            colors: ['#0F2854'],
            dataLabels: { enabled: false },
            stroke: {
              curve: 'smooth',
              width: 3,
            },
            fill: {
              type: 'gradient',
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100],
              },
            },
            xaxis: {
              categories: categorias,
            },
            yaxis: {
              min: 0,
            },
          };
        } else {
          this.chartOptions = null;
        }
      },
      error: (err) => {
        console.error('Error auto-actualizando dashboard', err);
      },
    });
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Fecha desconocida';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
}
