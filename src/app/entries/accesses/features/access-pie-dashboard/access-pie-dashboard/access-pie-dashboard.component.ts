import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartState,
  DashboardWeeklyDTO,
} from '../../../../models/dashboard.model';
import { AccessService } from '../../../../services/access/access.service';

@Component({
  selector: 'app-access-pie-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './access-pie-dashboard.component.html',
  styleUrl: './access-pie-dashboard.component.scss',
})
export class AccessPieDashboardComponent {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  @Input() dateFrom: Date = new Date();
  @Input() dateTo: Date = new Date();
  dateFromText: string = '';
  dateToText: string = '';

  chartState: ChartState = {
    hasData: false,
    message: 'No hay información para esas fechas.',
  };

  legendItems: Array<{ day: string; percentage: number; color: string }> = [];

  private colors: string[] = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
  ];

  chartData: ChartConfiguration<'pie'>['data'] = {
    datasets: [
      {
        data: [],
        backgroundColor: this.colors,
      },
    ],
    labels: [],
  };

  chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const dataset = context.dataset.data;
            const total = dataset.reduce(
              (acc, curr) => acc + (typeof curr === 'number' ? curr : 0),
              0
            );
            const percentage = ((value * 100) / total).toFixed(1);
            return `${label}: ${percentage}% (${value} accesos)`;
          },
        },
      },
    },
  };

  constructor(private dashboardService: AccessService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadInitialData();
    });
  }

  loadInitialData() {
    this.dateTo = new Date();
    this.dateFrom = new Date(this.dateTo.getDate() - 30);

    this.filterData();
  }

  filterData() {
    this.dateFromText = new Date(this.dateFrom).toISOString().split('T')[0];
    this.dateToText = new Date(this.dateTo).toISOString().split('T')[0];
    if (this.dateFrom && this.dateTo) {
      this.dashboardService
        .getVisitorTypeAccesses(this.dateFromText, this.dateToText)
        .subscribe((data) => {
          this.updateChartData(data);
        });
    }
  }

  resetFilters() {
    this.loadInitialData();
  }

  private updateChartData(data: DashboardWeeklyDTO[]) {
    this.chartState.hasData =
      data.length > 0 && data.some((item) => item.value > 0);

    if (!this.chartState.hasData) {
      this.chartData.labels = [];
      if (this.chartData.datasets) {
        this.chartData.datasets[0].data = [];
      }
    } else {
      this.chartData.labels = data.map((item) => this.traducirRol(item.key));
      if (this.chartData.datasets) {
        this.chartData.datasets[0].data = data.map((item) => item.value);
      }
    }

    if (this.legendItems) {
      if (!this.chartState.hasData) {
        this.legendItems = data.map((item) => ({
          day: this.traducirRol(item.key),
          percentage: 0,
          color: this.colors[0],
        }));
      } else {
        const numericData = data.map((item) => item.value);
        const total = numericData.reduce((acc, curr) => acc + curr, 0);
        this.legendItems = data.map((item, index) => ({
          day: this.traducirRol(item.key),
          percentage: Number(((item.value * 100) / total).toFixed(1)),
          color: this.colors[index],
        }));
      }
    }

    if (this.chart && this.chart.chart) {
      this.chart.chart.update();
    }
  }

  traducirRol(rolIngles: string): string {
    const roles: { [key: string]: string } = {
      OWNER: 'Propietario',
      WORKER: 'Trabajador',
      VISITOR: 'Visitante',
      EMPLOYEE: 'Empleado',
      PROVIDER: 'Proveedor',
      PROVIDER_ORGANIZATION: 'Organización Proveedora',
      COHABITANT: 'Conviviente',
      EMERGENCY: 'Emergencia',
    };

    return roles[rolIngles.toUpperCase()] || 'Rol desconocido';
  }
}
