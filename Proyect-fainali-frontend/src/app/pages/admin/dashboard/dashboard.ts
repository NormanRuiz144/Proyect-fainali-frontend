import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './service/dashboard';
import { InteractionService } from '../../../shared/service/interaction.service';
import { IDashboard } from './interface/idashboard';

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
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private interactionService = inject(InteractionService);

  datos = signal<IDashboard | null>(null);
  cargando = signal(true);

  chartOptions: ChartOptions | null = null;

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.cargando.set(true);

    this.dashboardService.obtenerResumen().subscribe({
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

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Fecha desconocida';
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
}
