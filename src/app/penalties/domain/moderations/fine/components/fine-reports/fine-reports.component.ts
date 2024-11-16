import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Fine } from '../../models/fine.model';
import { FineService } from '../../services/fine.service';
import { CommonModule } from '@angular/common';
import { ConfirmAlertComponent, Filter, FilterConfigBuilder, MainContainerComponent, TableColumn, TableComponent, TableFiltersComponent } from 'ngx-dabd-grupo01';
import { GetValueByKeyForEnumPipe } from '../../../../../shared/pipes/get-value-by-key-for-status.pipe';
import { FineStatusEnum } from '../../models/fine-status.enum';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartDataset, ChartOptions } from 'chart.js';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fine-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MainContainerComponent,
    TableComponent,
    GetValueByKeyForEnumPipe,
    BaseChartDirective,
    TableFiltersComponent,
  ],
  templateUrl: './fine-reports.component.html',
  styleUrl: './fine-reports.component.scss',
})
export class FineReportsComponent {
  fineService = inject(FineService);

  groupedItems: any[] = [];

  columns: TableColumn[] = [];
  FineStatusEnum = FineStatusEnum;

  filterConfig: Filter[] = new FilterConfigBuilder()
    .selectFilter('Estado', 'fineState', 'Seleccione el Estado', [
      { value: '', label: 'Todos' },
      { value: 'ON_ASSEMBLY', label: 'En asamblea' },
      { value: 'REJECTED', label: 'Rechazado' },
      { value: 'APPROVED', label: 'Aprobado' },
    ])
    /* .selectFilter("Tipo de sanción", 'sanction_type', 'Seleccione el Tipo de sanción', [

    ]) */
    .build();

  private modalService = inject(NgbModal);

  dateFilter = {
    startDate: '',
    endDate: '',
  };

  MONTH_NAMES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  currentMonth: string =
    this.MONTH_NAMES[new Date().getMonth() < 1 ? 0 : new Date().getMonth()];
  previousMonth: string =
    this.MONTH_NAMES[
      new Date().getMonth() - 1 < 0 ? 11 : new Date().getMonth() - 1
    ];

  searchParams: { [key: string]: any } = {};

  items$: Observable<Fine[]> = this.fineService.items$;
  isLoading$: Observable<boolean> = this.fineService.isLoading$;

  totalApprovedFines = 0;
  totalRejectedFines = 0;
  fineResolutionAverage = 0;
  monthlyFineGrowthRate = 0;

  @ViewChild('fineState') fineStateTemplate!: TemplateRef<any>;
  @ViewChild('fineDate') fineDateTemplate!: TemplateRef<any>;
  @ViewChild('fineAmount') fineAmountTemplate!: TemplateRef<any>;

  // Datos genéricos para gráficos
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
    plugins: {
      legend: {
        position: 'right',
      },
      datalabels: {
        color: '#3d3d3d',
        font: {
          size: 20,
        },
      },
    },
  };

  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
    backgroundColor: [
      'rgba(255, 245, 157, 1)', // Amarillo
      'rgba(130, 177, 255, 1)', // Azul
      'rgba(255, 145, 158, 1)', // Rosa
      'rgba(187, 131, 209, 1)', // Morado claro
      'rgba(126, 206, 157, 1)', // Azul celeste
      'rgba(255, 171, 145, 1)', // Naranja
      'rgba(98, 182, 143, 1)', // Verde menta
    ],
    plugins: {
      datalabels: {
        color: '#3d3d3d',
        font: {
          size: 20,
        },
      },
    },
  };

  // Datos para el gráfico de torta de multas por tipo de sanción
  public pieChartSanctionTypeLabels: string[] = [];
  public pieChartSanctionTypeDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: [
        'rgba(255, 245, 157, 1)', // Amarillo
        'rgba(130, 177, 255, 1)', // Azul
        'rgba(255, 145, 158, 1)', // Rosa
        'rgba(187, 131, 209, 1)', // Morado claro
        'rgba(126, 206, 157, 1)', // Azul celeste
        'rgba(255, 171, 145, 1)', // Naranja
        'rgba(98, 182, 143, 1)', // Verde menta
      ],
    },
  ];

  // Datos para el gráfico de barras de multas por lote
  public barChartPlotData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Cantidad de Multas',
      },
    ],
  };

  // Datos para el grafico de torta de multas por estado
  public pieChartStatusLabels: string[] = [];
  public pieChartStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: [
        'rgba(255, 245, 157, 1)', // Amarillo
        'rgba(130, 177, 255, 1)', // Azul
        'rgba(255, 145, 158, 1)', // Rosa
        'rgba(187, 131, 209, 1)', // Morado claro
        'rgba(126, 206, 157, 1)', // Azul celeste
        'rgba(255, 171, 145, 1)', // Naranja
        'rgba(98, 182, 143, 1)', // Verde menta
      ],
    },
  ];

  // Datos para el grafico de barras de multas por mes
  public barChartMonthlyData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Multas por Mes',
      },
    ],
  };

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.columns = [
        { headerName: 'Nº de Lote', accessorKey: 'plot_id' },
        {
          headerName: 'Cantidad',
          accessorKey: 'fine_amount',
          cellRenderer: this.fineAmountTemplate,
        },
      ];
    });

    this.resetDateFilter();

    this.loadItems();

    this.items$.subscribe((items) => {
      this.updatePieSanctionTypeChartData(items);
      this.updateBarPlotChartData(items);
      this.updatePieChartStatusData(items);
      this.updateBarChartMonthlyData(items);
      this.getTotalApprovedFines(items);
      this.getTotalRejectedFines(items);
      this.getFineResolutionAverage(items);
      this.getMonthlyFineGrowthRate(items);
    });
  }

  loadItems(): void {
    this.fineService
      .getPaginatedFines(1, 1000, {
        ...this.searchParams,
        startDate: this.dateFilter.startDate,
        endDate: this.dateFilter.endDate,
      })
      .subscribe((response) => {
        this.fineService.setItems(response.items);
        this.fineService.setTotalItems(response.total);
      });

    this.fineService
      .getMostFinedPlots({
        ...this.searchParams,
        startDate: this.dateFilter.startDate,
        endDate: this.dateFilter.endDate,
      })
      .subscribe((data) => {
        this.groupedItems = data;
      });
  }

  // Multas por tipo de sanción
  private updatePieSanctionTypeChartData(items: Fine[]): void {
    const sanctionTypeCounts: Record<string, number> = {};

    items.forEach((item) => {
      const sanctionType = item.sanction_type.name;
      sanctionTypeCounts[sanctionType] =
        (sanctionTypeCounts[sanctionType] || 0) + 1;
    });

    this.pieChartSanctionTypeLabels = Object.keys(
      sanctionTypeCounts
    ) as string[];
    this.pieChartSanctionTypeDatasets[0].data = Object.values(
      sanctionTypeCounts
    ) as number[];
  }

  // Multas por estado
  private updatePieChartStatusData(items: Fine[]): void {
    const statusCounts: Record<string, number> = {};

    items.forEach((item) => {
      let status;
      const itemStatus = item.fine_state.toString();

      switch (itemStatus) {
        case 'APPROVED':
          status = 'Aprobada';
          break;
        case 'ON_ASSEMBLY':
          status = 'En asamblea';
          break;
        case 'REJECTED':
          status = 'Rechazada';
          break;
        default:
          status = 'Desconocido';
      }

      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    this.pieChartStatusLabels = Object.keys(statusCounts);
    this.pieChartStatusDatasets[0].data = Object.values(statusCounts);
  }

  // Multas por mes
  private updateBarChartMonthlyData(items: Fine[]): void {
    const monthlyCounts: Record<string, number> = {};

    items.forEach((item) => {
      const month = new Date(item.created_date).toLocaleString('default', {
        month: 'long',
      });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    const sortedMonthlyCounts = this.MONTH_NAMES.filter(
      (month) => monthlyCounts[month]
    ) // Filtrar solo los meses presentes en monthlyCounts
      .reduce(
        (acc, month) => {
          acc.labels.push(`${month[0].toUpperCase()}${month.slice(1)}`);
          acc.data.push(monthlyCounts[month]);
          return acc;
        },
        { labels: [], data: [] } as { labels: string[]; data: number[] }
      );

    this.barChartMonthlyData = {
      labels: sortedMonthlyCounts.labels,
      datasets: [
        { data: sortedMonthlyCounts.data, label: 'Cantidad de Multas' },
      ],
    };
  }

  // Multas por lote
  private updateBarPlotChartData(items: Fine[]): void {
    const plotCounts: Record<number, number> = {};

    items.forEach((item) => {
      const plotId = item.plot_id;
      plotCounts[plotId] = (plotCounts[plotId] || 0) + 1;
    });

    this.barChartPlotData = {
      labels: Object.keys(plotCounts).map((key) => `Lote ${key}`),
      datasets: [
        { data: Object.values(plotCounts), label: 'Cantidad de Multas' },
      ],
    };
  }

  onFilterValueChange(filters: Record<string, any>) {
    this.searchParams = {
      ...filters,
    };

    this.loadItems();
  }

  resetDateFilter() {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24);
    const endDate = new Date();

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    this.dateFilter = {
      startDate: startDateString,
      endDate: endDateString,
    };
  }

  onFilterValueClear() {
    this.resetDateFilter();
  }

  onDateFilterChange() {
    this.loadItems();
  }

  getTotalApprovedFines(items: Fine[]) {
    const total = items.reduce((acc, item) => {
      if (item.fine_state.toString() === 'APPROVED') {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);

    this.totalApprovedFines = total;
  }

  getTotalRejectedFines(items: Fine[]) {
    const total = items.reduce((acc, item) => {
      if (item.fine_state.toString() === 'REJECTED') {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);

    this.totalRejectedFines = total;
  }

  getFineResolutionAverage(items: Fine[]) {
    const totalDays = items.reduce((acc, item) => {
      if (item.last_updated_at) {
        const startDate = new Date(item.created_date.split('T')[0]);
        const endDate = new Date(item.last_updated_at.split('T')[0]);

        const timeDifference = endDate.getTime() - startDate.getTime();
        const dayDifference = timeDifference / (1000 * 3600 * 24);

        return acc + dayDifference;
      }

      return acc;
    }, 0);

    const averageDays = totalDays / items.length;

    this.fineResolutionAverage = Math.floor(averageDays);
  }

  getMonthlyFineGrowthRate(items: Fine[]): void {
    const finesByMonth: { [key: string]: number } = {};

    items.forEach((item) => {
      const date = new Date(item.created_date.split('T')[0]);
      const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
      finesByMonth[yearMonth] = (finesByMonth[yearMonth] || 0) + 1;
    });

    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
    let previousYearMonth = `${now.getFullYear()}-${now.getMonth()}`;

    if (now.getMonth() === 0) {
      const lastYear = now.getFullYear() - 1;
      previousYearMonth = `${lastYear}-12`;
    }

    const currentMonthCount = finesByMonth[currentYearMonth] || 0;
    const previousMonthCount = finesByMonth[previousYearMonth] || 0;

    if (currentMonthCount === 0 && previousMonthCount === 0) {
      this.monthlyFineGrowthRate = 0;
      return;
    }

    if (previousMonthCount === 0) {
      this.monthlyFineGrowthRate = currentMonthCount > 0 ? 100 : 0;
    } else {
      const growthRate =
        ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;
      this.monthlyFineGrowthRate = parseFloat(growthRate.toFixed(2));
    }
  }

  infoModal() {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertType = 'info';

    modalRef.componentInstance.alertTitle = 'Ayuda';
    modalRef.componentInstance.alertMessage = `Esta pantalla presenta reportes detallados de las multas registradas, ofreciendo información clave sobre cada construcción, como el número de construcción, lote, fechas de inicio y finalización, y el motivo de la infracción. Además, cuenta con gráficos interactivos que permiten visualizar el estado de las construcciones y analizar distintos aspectos, como la distribución de infracciones por tipo de sanción, estado, lote y mes, proporcionando una comprensión visual de las tendencias y patrones. También incluye estadísticas relevantes, como la duración promedio de las obras y la cantidad promedio de trabajadores. Las herramientas de filtrado, búsqueda y exportación facilitan una gestión efectiva de los datos, permitiendo al usuario organizar y analizar la información de manera precisa y estructurada.`;
  }
}