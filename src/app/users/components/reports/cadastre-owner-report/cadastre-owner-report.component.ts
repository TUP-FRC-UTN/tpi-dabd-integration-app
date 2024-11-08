import {Component, inject} from '@angular/core';
import {BaseChartDirective} from 'ng2-charts';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  TableComponent,
  TableFiltersComponent
} from 'ngx-dabd-grupo01';
import {OwnerService} from '../../../services/owner.service';
import {Owner} from '../../../models/owner';
import {ChartDataset, ChartOptions} from 'chart.js';
import {catchError, map, of} from 'rxjs';
import {PaginatedResponse} from '../../../models/api-response';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit } from '@angular/core';
import { Chart, registerables} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-cadastre-owner-report',
  standalone: true,
  imports: [
    CommonModule,
    MainContainerComponent,
    TableComponent,
    BaseChartDirective,
    FormsModule,
    NgbPagination,
    TableFiltersComponent
  ],
  templateUrl: './cadastre-owner-report.component.html',
  styleUrl: './cadastre-owner-report.component.scss',
  providers: [DatePipe]
})
export class CadastreOwnerReportComponent implements AfterViewInit{
  private ownerService = inject(OwnerService);

  owners: Owner[] = [];

  filterConfig: Filter[] = new FilterConfigBuilder()
    .selectFilter('Tipo de Documento', 'doc_type', 'Seleccione un tipo de documento', [
      { value: 'P', label: 'DNI' },
      { value: 'I', label: 'Cédula' },
      { value: 'T', label: 'Pasaporte' }
    ])
    .selectFilter('Tipo de Propietario', 'owner_type', 'Seleccione un tipo de propietario', [
      { value: 'PERSON', label: 'Persona' },
      { value: 'COMPANY', label: 'Compañía' },
      { value: 'OTHER', label: 'Otro' }
    ])
    .selectFilter('Estado del Propietario', 'owner_kyc', 'Seleccione un estado del propietario', [
      { value: 'INITIATED', label: 'Iniciado' },
      { value: 'TO_VALIDATE', label: 'Para Validar' },
      { value: 'VALIDATED', label: 'Validado' },
      { value: 'CANCELED', label: 'Cancelado' }
    ])
    .selectFilter('Activo', 'is_active', '', [
      {value: 'true', label: 'Activo'},
      {value: 'false', label: 'Inactivo'}
    ])
    .build()

  ngOnInit(): void {
    this.loadOwners();
  }

  ngAfterViewInit(): void {
    this.updateOwnerCharts();
  }

  loadOwners() {
    this.ownerService
      .getOwners(0, 1000)
      .pipe(
        map((response: PaginatedResponse<Owner>) => {
          this.owners = response.content;
          this.updateOwnerCharts();
        }),
        catchError((error) => {
          console.error('Error loading owners', error);
          return of([]);
        })
      )
      .subscribe();
  }

  updateOwnerCharts() {
    const kycStatusCounts = this.owners.reduce((acc, owner) => {
      const status = owner.kycStatus ?? 'DESCONOCIDO';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.pieChartKycStatusLabels = Object.keys(kycStatusCounts);
    this.pieChartKycStatusDatasets[0].data = Object.values(kycStatusCounts);

    const ownerTypeCounts = this.owners.reduce((acc, owner) => {
      acc[owner.ownerType] = (acc[owner.ownerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.barChartOwnerTypeLabels = Object.keys(ownerTypeCounts);
    this.barChartOwnerTypeDatasets[0].data = Object.values(ownerTypeCounts);

    const activeStatusCounts = this.owners.reduce((acc, owner) => {
      const status = owner.isActive ? 'Activo' : 'Inactivo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.pieChartActiveStatusLabels = Object.keys(activeStatusCounts);
    this.pieChartActiveStatusDatasets[0].data =
      Object.values(activeStatusCounts);
  }

  filterChange($event: Record<string, any>) {
    console.log("ASDAS")
    this.ownerService.dinamicFilters(0, 1000000, $event).subscribe({
      next : (result) => {
        this.owners = result.content;
        this.updateOwnerCharts();
      }
    })
  }

  //#region Graficos
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Owner Chart Data
  public pieChartKycStatusLabels: string[] = [];
  public pieChartKycStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: ['#0dcaf0', '#0d6efd'], // Active (info) and Inactive (primary)
      hoverBackgroundColor: ['#3dd5f3', '#1c7efd'], // Lighter on hover
    },
  ];

  public barChartOwnerTypeLabels: string[] = [];
  public barChartOwnerTypeDatasets: ChartDataset<'bar', number[]>[] = [
    {
      data: [],
      label: 'Tipo de propietario',
      backgroundColor: '#198754', // Bootstrap success color
      hoverBackgroundColor: '#28a745', // Hover color for bars
      borderColor: '#198754',
      borderWidth: 1,
    },
  ];

  public pieChartActiveStatusLabels: string[] = ['Active', 'Inactive'];
  public pieChartActiveStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: ['#0dcaf0', '#0d6efd'], // Active (info) and Inactive (primary)
      hoverBackgroundColor: ['#3dd5f3', '#1c7efd'], // Lighter on hover
    },
  ];
  //#endregion
}
