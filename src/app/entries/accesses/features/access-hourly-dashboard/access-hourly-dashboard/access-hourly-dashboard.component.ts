import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartType, ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartState, DashboardHourlyDTO } from '../../../../models/dashboard.model';
import { AccessService } from '../../../../services/access/access.service';

@Component({
  selector: 'app-access-hourly-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './access-hourly-dashboard.component.html',
  styleUrl: './access-hourly-dashboard.component.scss',
})
export class AccessHourlyDashboardComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  @Input() dateFrom: Date = new Date();
  @Input() dateTo: Date = new Date();
  dateFromText:string = ""
  dateToText:string = ""
  chartState: ChartState = {
    hasData: false,
    message: 'No hay información para esas fechas.',
  };

  public chartType: ChartType = 'line';

  chartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Accesos por Hora',
        fill: true,
        tension: 0.5,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
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
    },
    plugins: {
      legend: {
        display: true,
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
    if (this.dateFromText && this.dateToText) {
      this.dashboardService
        .getHourlyAccesses(this.dateFromText, this.dateToText)
        .subscribe((data) => {
          this.updateChartData(data);
        });
    }
  }

  resetFilters() {
    this.loadInitialData();
  }

  private updateChartData(data: DashboardHourlyDTO[]) {
    this.chartState.hasData =
      data.length > 0 && data.some((item) => item.value > 0);

    if (!this.chartState.hasData) {
      this.chartData.labels = [];
      if (this.chartData.datasets) {
        this.chartData.datasets[0].data = [];
      }
    } else {
      this.chartData.labels = data.map((item) => item.key);
      if (this.chartData.datasets) {
        this.chartData.datasets[0].data = data.map((item) => item.value);
      }
    }

    if (this.chart && this.chart.chart) {
      this.chart.chart.update();
    }
  }
}
