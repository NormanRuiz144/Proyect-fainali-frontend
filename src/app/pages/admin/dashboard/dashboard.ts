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

          if (!this.chartOptions || JSON.stringify(this.chartOptions.series[0].data) !== JSON.stringify(data)) {
            this.chartOptions = {
              series: [
                {
                  name: 'Reportes',
                  data: data,
                },
              ],
              chart: {
                height: 300,
                type: 'bar',
                toolbar: { show: false },
                zoom: { enabled: false },
              },
              plotOptions: {
                bar: {
                  borderRadius: 6,
                  columnWidth: '20%',
                }
              },
              colors: ['#1C4D8D'],
              dataLabels: { enabled: false },
              stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
              },
              fill: {
                opacity: 1
              },
              xaxis: {
                categories: categorias,
              },
              yaxis: {
                min: 0,
                tickAmount: Math.max(...data) < 5 ? Math.max(...data) : undefined,
              },
            };
          }
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

          if (!this.chartOptions || JSON.stringify(this.chartOptions.series[0].data) !== JSON.stringify(data)) {
            this.chartOptions = {
              series: [
                {
                  name: 'Reportes',
                  data: data,
                },
              ],
              chart: {
                height: 300,
                type: 'bar',
                toolbar: { show: false },
                zoom: { enabled: false },
              },
              plotOptions: {
                bar: {
                  borderRadius: 6,
                  columnWidth: '20%',
                }
              },
              colors: ['#1C4D8D'],
              dataLabels: { enabled: false },
              stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
              },
              fill: {
                opacity: 1
              },
              xaxis: {
                categories: categorias,
              },
              yaxis: {
                min: 0,
                tickAmount: Math.max(...data) < 5 ? Math.max(...data) : undefined,
              },
            };
          }
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
