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
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { PlotService } from '../../../services/plot.service';
import { Plot } from '../../../models/plot';
import { Account } from '../../../models/account';
import { AccountService } from '../../../services/account.service';
import { InfoComponent } from '../../commons/info/info.component';

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
  //#region Services
  private ownerService = inject(OwnerService);
  private plotService = inject(PlotService);
  private accountService = inject(AccountService);
  private modalService = inject(NgbModal);
  //#end region

  //#region Variables
  owners: Owner[] = [];
  plots: Plot[] = [];
  accounts: Account[] = [];

  newOwnersLastYear: number = 0;
  activeOwnersCount: number = 0;
  mostFrequentOwnerType: string = '';
  unvalidatedOwnersCount: number = 0;

  totalBuiltArea: number = 0;
  mostFrequentPlotType: string = '';
  averagePlotArea: number = 0;
  plotsCreatedLastMonth: number = 0;

  debtorAccountsCount: number = 0;
  creditorAccountsCount: number = 0;

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

  // Configuración de Filtros
  plotFilterConfig: Filter[] = new FilterConfigBuilder()
    .numberFilter('Nro. Manzana', 'blockNumber', 'Seleccione una Manzana')
    .selectFilter('Tipo', 'plotType', 'Seleccione un tipo', [
      { value: 'COMMERCIAL', label: 'Comercial' },
      { value: 'PRIVATE', label: 'Privado' },
      { value: 'COMMUNAL', label: 'Comunal' },
    ])
    .selectFilter('Estado', 'plotStatus', 'Seleccione un estado', [
      { value: 'CREATED', label: 'Creado' },
      { value: 'FOR_SALE', label: 'En Venta' },
      { value: 'SALE', label: 'Venta' },
      { value: 'SALE_PROCESS', label: 'Proceso de Venta' },
      { value: 'CONSTRUCTION_PROCESS', label: 'En construcciones' },
      { value: 'EMPTY', label: 'Vacio' },
    ])
    .selectFilter('Activo', 'isActive', '', [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
      { value: '', label: 'Todo' },
    ])
    .build();
  //#end region

  ngOnInit(): void {
    this.loadOwners();
    this.loadPlots();
    this.loadAccounts();
  }

  ngAfterViewInit(): void {
    this.updateOwnerCharts();
  }

  //#region Load Data
  loadOwners(filters: Record<string, any> = {}) {
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

  loadPlots(filters: Record<string, any> = {}) {
    this.plotService
      .dinamicFilters(0, 1000, filters)
      .pipe(
        map((response: PaginatedResponse<Plot>) => {
          this.plots = response.content;
          this.calculatePlotKPIs();
          this.updatePlotCharts();
        }),
        catchError((error) => {
          console.error('Error loading plots', error);
          return of([]);
        })
      )
      .subscribe();
  }

  loadAccounts(
    page: number = 0,
    size: number = 1000,
    isActive?: boolean,
    sortProperty: string = 'isActive,createdDate',
    sortDirection: 'ASC' | 'DESC' = 'DESC'
  ): void {
    this.accountService.getAccountsBalances(page, size, isActive, sortProperty, sortDirection)
      .pipe(
        map((accounts: Account[]) => {
          this.accounts = accounts;
          this.calculateAccountKpis();
        }),
        catchError(error => {
          console.error('Error loading accounts:', error);
          return of([] as Account[]);
        })
      )
      .subscribe();
  }
  //#end region
  
  
  //# Update Charts
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

  updatePlotCharts() {
    const plotTypeCounts = this.plots.reduce((acc, plot) => {
      acc[plot.plotType] = (acc[plot.plotType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    this.plotTypeChartLabels = Object.keys(plotTypeCounts);
    this.plotTypeChartDatasets[0].data = Object.values(plotTypeCounts);

    const plotStatusCounts = this.plots.reduce((acc, plot) => {
      acc[plot.plotStatus] = (acc[plot.plotStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    this.plotStatusChartLabels = Object.keys(plotStatusCounts);
    this.plotStatusChartDatasets[0].data = Object.values(plotStatusCounts);

    const activeCounts = this.plots.reduce((acc, plot) => {
      const status = plot.isActive ? 'Activo' : 'Inactivo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    this.plotActiveChartLabels = Object.keys(activeCounts);
    this.plotActiveChartDatasets[0].data = Object.values(activeCounts);
  }
  //#end region

  //#region Filters
  filterChange($event: Record<string, any>) {
    this.loadOwners($event)
  }

  plotFilterChange($event: Record<string, any>) {
    this.loadPlots($event);
  }
  //#end region

  //#region KPIs
  calculateKPIs() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    this.newOwnersLastYear = this.owners.filter(owner => {
      const birthdate = new Date(owner.birthdate);
      return birthdate >= oneYearAgo;
    }).length;

    this.activeOwnersCount = this.owners.filter(owner => owner.isActive).length;

    const ownerTypeCounts = this.owners.reduce((acc, owner) => {
      acc[owner.ownerType] = (acc[owner.ownerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    this.mostFrequentOwnerType = Object.keys(ownerTypeCounts).reduce((a, b) =>
      ownerTypeCounts[a] > ownerTypeCounts[b] ? a : b
    );

    this.unvalidatedOwnersCount = this.owners.filter(
      owner => owner.kycStatus === StateKYC.INITIATED || owner.kycStatus === StateKYC.TO_VALIDATE
    ).length;
  }

  calculatePlotKPIs() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    this.totalBuiltArea = this.plots.reduce((sum, plot) => sum + parseFloat(plot.builtArea), 0);

    const plotTypeCounts = this.plots.reduce((acc, plot) => {
      acc[plot.plotType] = (acc[plot.plotType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    this.mostFrequentPlotType = Object.keys(plotTypeCounts).reduce((a, b) =>
      plotTypeCounts[a] > plotTypeCounts[b] ? a : b
    );

    this.averagePlotArea = this.plots.reduce((sum, plot) => sum + parseFloat(plot.totalArea), 0) / this.plots.length;

    this.plotsCreatedLastMonth = this.plots.filter(plot => {
      const plotDate = new Date() // new Date(plot.createdDate);
      return plotDate >= oneMonthAgo;
    }).length;
  }

  calculateAccountKpis() {
    this.debtorAccountsCount = this.accounts.filter(account => account.balance < 0).length;
    this.creditorAccountsCount = this.accounts.filter(account => account.balance >= 0).length;

    this.accountBalanceChartDatasets = [
      {
        data: [this.creditorAccountsCount, this.debtorAccountsCount],
        backgroundColor: ['rgba(25, 135, 84, 0.2)', 'rgba(220, 53, 69, 0.2)'],
        hoverBackgroundColor: ['rgba(25, 135, 84, 0.4)', 'rgba(220, 53, 69, 0.4)'],
        borderColor: ['rgba(25, 135, 84, 1)', 'rgba(220, 53, 69, 1)'],
        borderWidth: 1,
      },
    ];
  }
  //#end region


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

  //#region Propiedades para Gráficos de Plots
  public plotTypeChartLabels: string[] = [];
  public plotTypeChartDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: ['rgba(255, 193, 7, 0.2)', 'rgba(25, 135, 84, 0.2)', 'rgba(220, 53, 69, 0.2)'],
      hoverBackgroundColor: ['rgba(255, 193, 7, 0.4)', 'rgba(25, 135, 84, 0.4)', 'rgba(220, 53, 69, 0.4)'],
      borderColor: ['rgba(255, 193, 7, 1)', 'rgba(25, 135, 84, 1)', 'rgba(220, 53, 69, 1)'],
      borderWidth: 1,
    },
  ];

  public plotStatusChartLabels: string[] = [];
  public plotStatusChartDatasets: ChartDataset<'bar', number[]>[] = [
    {
      data: [],
      label: 'Estado del Lote',
      backgroundColor: ['rgba(255, 193, 7, 0.2)', 'rgba(0, 123, 255, 0.2)', 'rgba(25, 135, 84, 0.2)', 'rgba(220, 53, 69, 0.2)', 'rgba(23, 162, 184, 0.2)', 'rgba(52, 58, 64, 0.2)'],
      hoverBackgroundColor: ['rgba(255, 193, 7, 0.4)', 'rgba(0, 123, 255, 0.4)', 'rgba(25, 135, 84, 0.4)', 'rgba(220, 53, 69, 0.4)', 'rgba(23, 162, 184, 0.4)', 'rgba(52, 58, 64, 0.4)'],
      borderColor: ['rgba(255, 193, 7, 1)', 'rgba(0, 123, 255, 1)', 'rgba(25, 135, 84, 1)', 'rgba(220, 53, 69, 1)', 'rgba(23, 162, 184, 1)', 'rgba(52, 58, 64, 1)'],
      borderWidth: 1,
    },
  ];

  public plotActiveChartLabels: string[] = ['Activo', 'Inactivo'];
  public plotActiveChartDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: ['rgba(255, 193, 7, 0.2)', 'rgba(220, 53, 69, 0.2)'],
      hoverBackgroundColor: ['rgba(255, 193, 7, 0.4)', 'rgba(220, 53, 69, 0.4)'],
      borderColor: ['rgba(255, 193, 7, 1)', 'rgba(220, 53, 69, 1)'],
      borderWidth: 1,
    },
  ];
  //#endregion

  //#region Propiedades para Gráficos de Cuentas (Accounts)
  public accountBalanceChartLabels: string[] = ['Saldo Acreedor', 'Saldo Deudor'];
  public accountBalanceChartDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [this.creditorAccountsCount, this.debtorAccountsCount],
      backgroundColor: ['rgba(25, 135, 84, 0.2)', 'rgba(220, 53, 69, 0.2)'],
      hoverBackgroundColor: ['rgba(25, 135, 84, 0.4)', 'rgba(220, 53, 69, 0.4)'],
      borderColor: ['rgba(25, 135, 84, 1)', 'rgba(220, 53, 69, 1)'],
      borderWidth: 1,
    },
  ];
  //#endregion

  //#region Info Button
openInfo() {
  const modalRef = this.modalService.open(InfoComponent, {
    size: 'lg',
    backdrop: 'static',
    keyboard: false,
    centered: true,
    scrollable: true,
  });

  modalRef.componentInstance.title = 'Información de Propietarios, Lotes y Cuentas';
  modalRef.componentInstance.description =
    'En esta pantalla se podrán visualizar y gestionar los propietarios, lotes y cuentas del consorcio.';
  modalRef.componentInstance.body = [
    {
      title: 'Datos de Propietarios',
      content: [
        {
          strong: 'Nombre Completo:',
          detail: 'Nombre y apellido del propietario.',
        },
        {
          strong: 'Tipo de Propietario:',
          detail: 'Clasificación del propietario (Persona, Compañía, Otro).',
        },
        {
          strong: 'Estado KYC:',
          detail:
            'Estado de verificación KYC del propietario (Iniciado, Validado, Cancelado).',
        },
        {
          strong: 'Activo:',
          detail: 'Estado activo o inactivo del propietario.',
        },
      ],
    },
    {
      title: 'Datos de Lotes',
      content: [
        {
          strong: 'N° de Manzana:',
          detail: 'Número de manzana del lote.',
        },
        {
          strong: 'N° de Lote:',
          detail: 'Número identificador del lote.',
        },
        {
          strong: 'Área Total:',
          detail: 'Área total ocupada por el lote en metros cuadrados.',
        },
        {
          strong: 'Área Construida:',
          detail: 'Área construida en el lote (en metros cuadrados).',
        },
        {
          strong: 'Tipo de Lote:',
          detail: 'Tipo de lote (Comercial, Privado, Comunal).',
        },
        {
          strong: 'Estado del Lote:',
          detail: 'Estado del lote (En venta, Proceso de venta, Vacio, etc.).',
        },
      ],
    },
    {
      title: 'Datos de Cuentas',
      content: [
        {
          strong: 'Saldo de la Cuenta:',
          detail: 'Balance de la cuenta asociado a cada lote.',
        },
        {
          strong: 'Estado del Balance:',
          detail:
            'Clasificación de saldo como acreedor o deudor dependiendo del balance positivo o negativo.',
        },
        {
          strong: 'Historial de Conceptos:',
          detail:
            'Detalle de los conceptos financieros registrados para cada cuenta.',
        },
        {
          strong: 'Documentos Adjuntos:',
          detail: 'Documentos de soporte asociados a cada transacción.',
        },
      ],
    },
    {
      title: 'Acciones',
      content: [
        {
          strong: 'Detalle:',
          detail: 'Redirige a la vista detallada para cada propietario, lote o cuenta.',
        },
        {
          strong: 'Editar:',
          detail:
            'Permite modificar la información de propietarios, lotes y cuentas.',
        },
        {
          strong: 'Eliminar:',
          detail: 'Inactiva el propietario, lote o cuenta.',
        },
      ],
    },
    {
      title: 'Filtros',
      content: [
        {
          strong: 'Filtrar por Nombre o Documento:',
          detail:
            'Busca propietarios mediante el nombre completo o número de documento.',
        },
        {
          strong: 'Filtrar por Tipo de Lote:',
          detail:
            'Filtra los lotes según su clasificación (Comercial, Privado, Comunal).',
        },
        {
          strong: 'Filtrar por Saldo de Cuenta:',
          detail: 'Muestra cuentas con saldo acreedor o deudor.',
        },
      ],
    },
    {
      title: 'Funcionalidades de los Botones',
      content: [
        {
          strong: 'Filtros:',
          detail:
            'Botón que despliega los filtros avanzados para propietarios, lotes y cuentas.',
        },
        {
          strong: 'Añadir Nuevo:',
          detail:
            'Permite añadir un nuevo propietario, lote o cuenta en el sistema.',
        },
        {
          strong: 'Exportar a Excel o PDF:',
          detail:
            'Exporta la información actual a un archivo Excel o PDF para su almacenamiento y análisis.',
        },
        {
          strong: 'Paginación:',
          detail: 'Navega entre las páginas de información.',
        },
      ],
    },
  ];
  modalRef.componentInstance.notes = [
    'La interfaz está diseñada para ofrecer una administración eficiente de propietarios, lotes y cuentas, garantizando la precisión y consistencia de los datos.',
  ];
}
//#endregion

}
