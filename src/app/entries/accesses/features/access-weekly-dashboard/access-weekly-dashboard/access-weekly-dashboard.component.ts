import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartType, ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartState,
  DashboardWeeklyDTO,
} from '../../../../models/dashboard.model';
import { AccessService } from '../../../../services/access/access.service';

@Component({
  selector: 'app-access-weekly-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './access-weekly-dashboard.component.html',
  styleUrl: './access-weekly-dashboard.component.css',
})
export class AccessWeeklyDashboardComponent {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  @Input() dateFrom: Date = new Date();
  @Input() dateTo: Date = new Date();
  dateFromText: string = '';
  dateToText: string = '';
  chartState: ChartState = {
    hasData: false,
    message: 'No hay información para esas fechas.',
  };

  public chartType: ChartType = 'bar';

  chartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Ingresos',
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        data: [],
        label: 'Egresos',
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
    ],
    labels: [],
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          autoSkip: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
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
        .getWeeklyAccesses(this.dateFromText, this.dateToText)
        .subscribe((data) => {
          console.log(data);
          this.updateChartData(data);
        });
    }
  }

  resetFilters() {
    this.loadInitialData();
  }

  private updateChartData(data: DashboardWeeklyDTO[]) {
    this.chartState.hasData =
      data.length > 0 &&
      (data.some((item) => item.value > 0) ||
        data.some((item) => item.secondaryValue > 0));

    if (!this.chartState.hasData) {
      this.chartData.labels = [];
      if (this.chartData.datasets) {
        this.chartData.datasets[0].data = [];
        this.chartData.datasets[1].data = [];
      }
    } else {
      this.chartData.labels = data.map((item) =>
        this.traducirDiaSemana(item.key)
      );
      if (this.chartData.datasets) {
        this.chartData.datasets[0].data = data.map((item) => item.value);
        this.chartData.datasets[1].data = data.map(
          (item) => item.secondaryValue
        );
      }
    }

    if (this.chart && this.chart.chart) {
      this.chart.chart.update();
    }
  }

  traducirDiaSemana(diaIngles: string): string {
    const diasSemana: { [key: string]: string } = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };

    return diasSemana[diaIngles] || 'Día no válido';
  }
}
