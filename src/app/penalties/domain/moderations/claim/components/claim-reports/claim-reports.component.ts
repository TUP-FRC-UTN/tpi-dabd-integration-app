import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { MainContainerComponent } from '../../../../../../../projects/ngx-dabd-grupo01/src/lib/main-container/main-container.component';
import { TableComponent } from '../../../../../../../projects/ngx-dabd-grupo01/src/lib/table/table.component';
import { CommonModule } from '@angular/common';
import { GetValueByKeyForEnumPipe } from '../../../../../shared/pipes/get-value-by-key-for-status.pipe';
import { BaseChartDirective } from 'ng2-charts';
import { ClaimDTO, ClaimStatusEnum } from '../../models/claim.model';
import { ClaimService } from '../../service/claim.service';
import { ChartOptions, ChartConfiguration, ChartDataset } from 'chart.js';

import { Observable } from 'rxjs';
import { InfractionResponseDTO } from '../../../infraction/models/infraction.model';
import { Filter, FilterConfigBuilder, TableColumn } from 'ngx-dabd-grupo01';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-claim-reports',
  standalone: true,
  imports: [
    MainContainerComponent,
    TableComponent,
    FormsModule,
    CommonModule,
    GetValueByKeyForEnumPipe,
    BaseChartDirective,
  ],
  templateUrl: './claim-reports.component.html',
  styleUrl: './claim-reports.component.scss',
})
export class ClaimReportsComponent {
  claimService = inject(ClaimService);

  columns: TableColumn[] = [];

  searchParams: { [key: string]: any } = {};

  items$: Observable<ClaimDTO[]> = this.claimService.items$;
  isLoading$: Observable<boolean> = this.claimService.isLoading$;

  ClaimStatusEnum = ClaimStatusEnum;

  dateFilter = {
    startDate: '',
    endDate: '',
  };

  @ViewChild('sanctionType') sanctionType!: TemplateRef<any>;
  @ViewChild('date') date!: TemplateRef<any>;
  @ViewChild('claimStatus') claimStatus!: TemplateRef<any>;
  @ViewChild('infraction') infraction!: TemplateRef<any>;

  // Datos genéricos para gráficos
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: false,
  };

  // Datos para el gráfico de torta de infracciones por tipo de sanción
  public pieChartStatusLabels: string[] = [];
  public pieChartStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
      ],
    },
  ];

  // datos para el gráfico de barras de infracciones por lote
  public barChartPlotData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Cantidad de Infracciones',
      },
    ],
  };

  // Filtros:

  filterConfig: Filter[] = new FilterConfigBuilder()
    .dateFilter('Fecha desde', 'startDate', 'Placeholder')
    .dateFilter('Fecha hasta', 'endDate', 'Placeholder')
    .build();

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.columns = [
        {
          headerName: 'Nº.',
          accessorKey: 'id',
        },
        {
          headerName: 'Alta',
          accessorKey: 'sanction_type.created_date',
          cellRenderer: this.date,
        },
        { headerName: 'Lote', accessorKey: 'plot_id' },
        /*  {
          headerName: 'Tipo',
          accessorKey: 'sanction_type.name',
          cellRenderer: this.sanctionType,
        }, */
        {
          headerName: 'Estado',
          accessorKey: 'description',
          cellRenderer: this.claimStatus,
        },
        /*  {
          headerName: 'Infracción',
          accessorKey: 'description',
          cellRenderer: this.infraction,
        }, */
      ];
    });

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24);
    const endDate = new Date();

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    this.dateFilter = {
      startDate: startDateString,
      endDate: endDateString,
    };

    this.loadItems();

    this.items$.subscribe((items) => {
      this.updatePieChartStatusData(items);
      this.updateBarPlotChartData(items);
    });
  }

  loadItems(): void {
    this.claimService
      .getPaginatedClaims(1, 1000, {
        startDate: this.dateFilter.startDate,
        endDate: this.dateFilter.endDate,
      })
      .subscribe((response) => {
        this.claimService.setItems(response.items);
        this.claimService.setTotalItems(response.total);
      });
  }

  onFilterValueChange(filters: Record<string, any>) {
    this.searchParams = {
      ...filters,
    };

    this.loadItems();
  }

  onDateFilterChange() {
    this.loadItems();
  }

  private updatePieChartStatusData(items: ClaimDTO[]): void {
    const statusCounts: Record<string, number> = {};

    items.forEach((item) => {
      let status;
      const itemStatus = item.claim_status.toString();

      switch (itemStatus) {
        case 'APPROVED':
          status = 'Aprobada';
          break;
        case 'ON_APPEALING':
          status = 'En asamblea';
          break;
        case 'REJECTED':
          status = 'Rechazada';
          break;
        case 'SENT':
          status = 'Enviado';
          break;
        default:
          status = 'Desconocido';
      }

      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    this.pieChartStatusLabels = Object.keys(statusCounts);
    this.pieChartStatusDatasets[0].data = Object.values(statusCounts);
  }

  // infracciones por lote
  private updateBarPlotChartData(items: ClaimDTO[]): void {
    const plotCounts: Record<number, number> = {};

    items.forEach((item) => {
      const plotId = item.plot_id;
      plotCounts[plotId] = (plotCounts[plotId] || 0) + 1;
    });

    this.barChartPlotData = {
      labels: Object.keys(plotCounts).map((key) => `Lote ${key}`),
      datasets: [
        { data: Object.values(plotCounts), label: 'Cantidad de infracciones' },
      ],
    };
  }
}
