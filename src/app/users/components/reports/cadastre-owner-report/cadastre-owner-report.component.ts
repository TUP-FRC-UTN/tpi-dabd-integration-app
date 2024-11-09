import { Component, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  TableComponent,
  TableFiltersComponent,
} from 'ngx-dabd-grupo01';
import { OwnerService } from '../../../services/owner.service';
import { Owner, StateKYC } from '../../../models/owner';
import { ChartDataset, ChartOptions } from 'chart.js';
import { catchError, map, of } from 'rxjs';
import { PaginatedResponse } from '../../../models/api-response';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

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
    TableFiltersComponent,
  ],
  templateUrl: './cadastre-owner-report.component.html',
  styleUrl: './cadastre-owner-report.component.scss',
  providers: [DatePipe],
})
export class CadastreOwnerReportComponent implements AfterViewInit {
  private ownerService = inject(OwnerService);

  owners: Owner[] = [];

  newOwnersLastYear: number = 0;
  activeOwnersCount: number = 0;
  mostFrequentOwnerType: string = '';
  unvalidatedOwnersCount: number = 0;

  filterConfig: Filter[] = new FilterConfigBuilder()
    .selectFilter(
      'Tipo de Documento',
      'doc_type',
      'Seleccione un tipo de documento',
      [
        { value: 'DNI', label: 'DNI' },
        { value: 'ID', label: 'Cédula' },
        { value: 'PASSPORT', label: 'Pasaporte' },
      ]
    )
    .selectFilter(
      'Tipo de Propietario',
      'owner_type',
      'Seleccione un tipo de propietario',
      [
        { value: 'PERSON', label: 'Persona' },
        { value: 'COMPANY', label: 'Compañía' },
        { value: 'OTHER', label: 'Otro' },
      ]
    )
    .selectFilter(
      'Estado del Propietario',
      'owner_kyc',
      'Seleccione un estado del propietario',
      [
        { value: 'INITIATED', label: 'Iniciado' },
        { value: 'TO_VALIDATE', label: 'Para Validar' },
        { value: 'VALIDATED', label: 'Validado' },
        { value: 'CANCELED', label: 'Cancelado' },
      ]
    )
    .selectFilter('Activo', 'is_active', '', [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
    ])
    .dateFilter(
      'Fecha de Nacimiento Desde',
      'birthdateStart',
      'Seleccione la fecha de inicio'
    )
    .dateFilter(
      'Fecha de Nacimiento Hasta',
      'birthdateEnd',
      'Seleccione la fecha de fin'
    )
    .build();

  ngOnInit(): void {
    this.loadOwners();
  }

  ngAfterViewInit(): void {
    this.updateOwnerCharts();
  }

  loadOwners(filters: Record<string, any> = {}) {
    /* this.ownerService
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
      .subscribe(); */
    this.ownerService
      .dinamicFilters(0, 1000, filters)
      .pipe(
        map((response: PaginatedResponse<Owner>) => {
          this.owners = response.content;
          this.updateOwnerCharts();
          this.calculateKPIs();
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
    /* this.ownerService.dinamicFilters(0, 1000000, $event).subscribe({
      next: (result) => {
        this.owners = result.content;
        this.updateOwnerCharts();
      },
    }); */
    this.loadOwners($event)
  }

  calculateKPIs() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // 1. Cantidad de propietarios nuevos en el último año
    this.newOwnersLastYear = this.owners.filter(owner => {
      const birthdate = new Date(owner.birthdate);
      return birthdate >= oneYearAgo;
    }).length;

    // 2. Cantidad de propietarios activos
    this.activeOwnersCount = this.owners.filter(owner => owner.isActive).length;

    // 3. Tipo de propietario más recurrente
    const ownerTypeCounts = this.owners.reduce((acc, owner) => {
      acc[owner.ownerType] = (acc[owner.ownerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    this.mostFrequentOwnerType = Object.keys(ownerTypeCounts).reduce((a, b) =>
      ownerTypeCounts[a] > ownerTypeCounts[b] ? a : b
    );

    // 4. Cantidad de propietarios sin validar
    this.unvalidatedOwnersCount = this.owners.filter(
      owner => owner.kycStatus === StateKYC.INITIATED || owner.kycStatus === StateKYC.TO_VALIDATE
    ).length;
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
  // Owner Chart Data
  public pieChartKycStatusLabels: string[] = [];
  public pieChartKycStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: [
        'rgba(255, 193, 7, 0.2)',
        'rgba(25, 135, 84, 0.2)',
        'rgba(220, 53, 69, 0.2)',
      ],
      hoverBackgroundColor: [
        'rgba(255, 193, 7, 0.4)',
        'rgba(25, 135, 84, 0.4)',
        'rgba(220, 53, 69, 0.4)',
      ],
      borderColor: [
        'rgba(255, 193, 7, 1)',
        'rgba(25, 135, 84, 1)',
        'rgba(220, 53, 69, 1)',
      ],
      borderWidth: 1,
    },
  ];

  public barChartOwnerTypeLabels: string[] = [];
  public barChartOwnerTypeDatasets: ChartDataset<'bar', number[]>[] = [
    {
      data: [],
      label: 'Tipo de propietario',
      backgroundColor: ['rgba(25, 135, 84, 0.2)'],
      hoverBackgroundColor: ['rgba(25, 135, 84, 0.4)'],
      borderColor: ['rgba(25, 135, 84, 1)'],
      borderWidth: 1,
    },
  ];

  public pieChartActiveStatusLabels: string[] = ['Activo', 'Inactivo'];
  public pieChartActiveStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: ['rgba(255, 193, 7, 0.2)', 'rgba(220, 53, 69, 0.2)'],
      hoverBackgroundColor: [
        'rgba(255, 193, 7, 0.4)',
        'rgba(220, 53, 69, 0.4)',
      ], 
      borderColor: ['rgba(255, 193, 7, 1)', 'rgba(220, 53, 69, 1)'],
      borderWidth: 1,
    },
  ];

  //#endregion
}
