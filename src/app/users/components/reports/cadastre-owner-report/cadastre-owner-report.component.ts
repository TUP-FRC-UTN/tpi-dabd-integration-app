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
import {
  DocumentTypeDictionary,
  Owner,
  OwnerTypeDictionary,
  StateKYC,
  OwnerStatusDictionary,
} from '../../../models/owner';
import { ChartDataset, ChartOptions } from 'chart.js';
import { catchError, map, of } from 'rxjs';
import { PaginatedResponse } from '../../../models/api-response';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { PlotService } from '../../../services/plot.service';
import {
  Plot,
  PlotStatusDictionary,
  PlotTypeDictionary,
} from '../../../models/plot';
import { Account } from '../../../models/account';
import { AccountService } from '../../../services/account.service';
import { InfoComponent } from '../../commons/info/info.component';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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

  chartFilters: Record<string, any> = {};
  dateFilterTo: any;
  dateFilterFrom: any;

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


  
  public pieChartPlugins: any = [ChartDataLabels];


  documentTypeDictionary = DocumentTypeDictionary;
  ownerTypeDictionary = OwnerTypeDictionary;
  OwnerStatusDictionary = OwnerStatusDictionary;
  ownerDicitionaries = [
    this.documentTypeDictionary,
    this.ownerTypeDictionary,
    this.OwnerStatusDictionary,
  ];

  

  plotTypeDictionary = PlotTypeDictionary;
  plotStatusDictionary = PlotStatusDictionary;
  plotDictionaries = [this.plotTypeDictionary, this.plotStatusDictionary];

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
      { value: 'EMPTY', label: 'Vacío' },
    ])
    .selectFilter('Activo', 'isActive', '', [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
      { value: '', label: 'Todo' },
    ])
    .build();
  //#end region

  ngOnInit(): void {
    this.filterReports();
    this.loadPlots();
    this.loadAccounts();
  }

  ngAfterViewInit(): void {
    this.updateOwnerCharts();
  }
  //#region Filtros de los charts

  //Acá manejo lo de la fecha desde
  changeFilterDateFrom(date: string){
    //Convierto el string en un date
    const dateFilter = new Date(date)
    //Verifico primero si no existe la prop en el objeto de charFilters
    //Si existe la piso con lo nuevo    
    if(this.chartFilters['dateFrom']){
      //Paso la prop de esta forma sino el Java se queja
      this.chartFilters['dateFrom'] = dateFilter.toISOString().slice(0, 16)
    }
    //Si no existe entonces la agrego al objeto de chartfilters
    else{
      this.chartFilters = {
        ...this.chartFilters,
        dateFrom: dateFilter.toISOString().slice(0, 16)
      }
    }    
    //console.log(this.chartFilters);
    this.filterReports()   
  }

  //Acá manejo lo de la fecha hasta (Mismo funcionamiento que la fecha desde)
  changeFilterDateTo(date: string){
    const dateFilter = new Date(date)
    if(this.chartFilters['dateTo']){
      this.chartFilters['dateTo'] = dateFilter.toISOString().slice(0, 16)
    }    
    else{
      this.chartFilters = {
        ...this.chartFilters,
        dateTo: dateFilter.toISOString().slice(0, 16)
      }
    }    
    //console.log(this.chartFilters);
    this.filterReports()
  }

  //Acá manejo los otros filtros (los que están en la lupita)
  //Basicamente siempre se pisan porque el event emitter del componente siempre te devuelve todos
  changeOtherFilters(filters: Record<string, any> = {}){
    //console.log(filters);
    this.chartFilters = {
      ...this.chartFilters,
      ...filters
    }
    ///console.log(this.chartFilters);
    this.filterReports()    
  }

  //Esta es una función que basicamente recorre los filtros o más bien el objeto que le pases por parámetro
  //Y te arma un objeto nuevo validando que cada prop tenga contenido, es decir que no sea nulo, undefined o ''
  private cleanFilters(filters: Record<string, any>): Record<string, any> {
    return Object.entries(filters).reduce((acc, [key, value]) => {
      const isEmpty = 
        value === null || 
        value === undefined || 
        value === '';

      if (!isEmpty) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  }
  //#endregion

  //#region Load Data
  //Acá esto lo modifiqué para que siempre haga la petición entonces le con la funcion cleanFilters que te devuelve el objeto
  //de filtros limpios, hace la petición bien sin filtros residuales, si no hay nada en chartFilters no le incluye ningún filtro
  filterReports() {  
    const clearFilters = this.cleanFilters(this.chartFilters)     
    this.ownerService
      .dinamicFilters(0, 2147483647, clearFilters)
      .pipe(
        map((response: PaginatedResponse<Owner>) => {
          console.log("Resp filterReports ", response.content)
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
    this.accountService
      .getAccountsBalances(page, size, isActive, sortProperty, sortDirection)
      .pipe(
        map((accounts: Account[]) => {
          this.accounts = accounts;
          this.calculateAccountKpis();
          this.generateAccountBalanceChart();
        }),
        catchError((error) => {
          console.error('Error loading accounts:', error);
          return of([] as Account[]);
        })
      )
      .subscribe();
  }
  //#end region

  //# Update Charts
  updateOwnerCharts() {
    const rawKycStatusCounts = this.owners.reduce((acc, owner) => {
      const status = owner.kycStatus ?? 'DESCONOCIDO';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const kycStatusCounts = Object.keys(rawKycStatusCounts).reduce(
      (acc, key) => {
        const translatedKey =
          this.ownerDicitionaries && this.ownerDicitionaries.length
            ? this.ownerDicitionaries
                .map((dict) => this.translateDictionary(key, dict))
                .find(Boolean) || key
            : key;

        acc[translatedKey] = rawKycStatusCounts[key];
        return acc;
      },
      {} as Record<string, number>
    );

    this.pieChartKycStatusLabels = Object.keys(kycStatusCounts);
    this.pieChartKycStatusDatasets[0].data = Object.values(kycStatusCounts);

    const rawOwnerTypeCounts = this.owners.reduce((acc, owner) => {
      acc[owner.ownerType] = (acc[owner.ownerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ownerTypeCounts = Object.keys(rawOwnerTypeCounts).reduce(
      (acc, key) => {
        const translatedKey =
          this.ownerDicitionaries && this.ownerDicitionaries.length
            ? this.ownerDicitionaries
                .map((dict) => this.translateDictionary(key, dict))
                .find(Boolean) || key
            : key;

        acc[translatedKey] = rawOwnerTypeCounts[key];
        return acc;
      },
      {} as Record<string, number>
    );

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
    const rawPlotTypeCounts = this.plots.reduce((acc, plot) => {
      acc[plot.plotType] = (acc[plot.plotType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const plotTypeCounts = Object.keys(rawPlotTypeCounts).reduce((acc, key) => {
      const translatedKey =
        this.plotDictionaries && this.plotDictionaries.length
          ? this.plotDictionaries
              .map((dict) => this.translateDictionary(key, dict))
              .find(Boolean) || key
          : key;

      acc[translatedKey] = rawPlotTypeCounts[key];
      return acc;
    }, {} as Record<string, number>);

    const rawPlotStatusCounts = this.plots.reduce((acc, plot) => {
      acc[plot.plotStatus] = (acc[plot.plotStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.plotTypeChartLabels = Object.keys(plotTypeCounts);
    this.plotTypeChartDatasets[0].data = Object.values(plotTypeCounts);

    const plotStatusCounts = Object.keys(rawPlotStatusCounts).reduce(
      (acc, key) => {
        const translatedKey =
          this.plotDictionaries && this.plotDictionaries.length
            ? this.plotDictionaries
                .map((dict) => this.translateDictionary(key, dict))
                .find(Boolean) || key
            : key;

        acc[translatedKey] = rawPlotStatusCounts[key];
        return acc;
      },
      {} as Record<string, number>
    );

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
    this.chartFilters = {
      ...this.chartFilters,
      $event
    }
    this.filterReports();
  }

  plotFilterChange($event: Record<string, any>) {
    this.loadPlots($event);
  }
  //#end region

  //#region KPIs
  calculateKPIs() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    this.newOwnersLastYear = this.owners.filter((owner) => {
      const birthdate = new Date(owner.birthdate);
      return birthdate >= oneYearAgo;
    }).length;

    this.activeOwnersCount = this.owners.filter(
      (owner) => owner.isActive
    ).length;

    const ownerTypeCounts = this.owners.reduce((acc, owner) => {
      acc[owner.ownerType] = (acc[owner.ownerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostFrequentTypeKey = Object.keys(ownerTypeCounts).reduce((a, b) =>
      ownerTypeCounts[a] > ownerTypeCounts[b] ? a : b
    );

    switch (mostFrequentTypeKey) {
      case OwnerTypeDictionary['Persona']:
        this.mostFrequentOwnerType = 'Persona';
        break;
      case OwnerTypeDictionary['Compañía']:
        this.mostFrequentOwnerType = 'Compañía';
        break;
      case OwnerTypeDictionary['Otro']:
        this.mostFrequentOwnerType = 'Otro';
        break;
      default:
        this.mostFrequentOwnerType = mostFrequentTypeKey;
    }

    this.unvalidatedOwnersCount = this.owners.filter(
      (owner) =>
        owner.kycStatus === StateKYC.INITIATED ||
        owner.kycStatus === StateKYC.TO_VALIDATE
    ).length;
  }

  calculatePlotKPIs() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    this.totalBuiltArea = this.plots.reduce(
      (sum, plot) => sum + parseFloat(plot.builtArea),
      0
    );

    const plotTypeCounts = this.plots.reduce((acc, plot) => {
      acc[plot.plotType] = (acc[plot.plotType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostFrequentPlotTypeKey = Object.keys(plotTypeCounts).reduce((a, b) =>
      plotTypeCounts[a] > plotTypeCounts[b] ? a : b
    );

    switch (mostFrequentPlotTypeKey) {
      case PlotTypeDictionary['Comercial']:
        this.mostFrequentPlotType = 'Comercial';
        break;
      case PlotTypeDictionary['Privado']:
        this.mostFrequentPlotType = 'Privado';
        break;
      case PlotTypeDictionary['Comunal']:
        this.mostFrequentPlotType = 'Comunal';
        break;
      default:
        this.mostFrequentPlotType = mostFrequentPlotTypeKey;
    }

    this.averagePlotArea =
      this.plots.reduce((sum, plot) => sum + parseFloat(plot.totalArea), 0) /
      this.plots.length;

    this.plotsCreatedLastMonth = this.plots.filter((plot) => {
      const plotDate = new Date(); // new Date(plot.createdDate);
      return plotDate >= oneMonthAgo;
    }).length;
  }

  calculateAccountKpis() {
    const balanceCounts = this.accounts.reduce((acc, account) => {
      if (account.balance < 0) {
        acc['Deudor'] = (acc['Deudor'] || 0) + 1;
      } else {
        acc['Acreedor'] = (acc['Acreedor'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    this.debtorAccountsCount = balanceCounts['Deudor'] || 0;
    this.creditorAccountsCount = balanceCounts['Acreedor'] || 0;
  }

  generateAccountBalanceChart() {
    const balanceTotals = this.accounts.reduce((acc, account) => {
      if (account.balance < 0) {
        acc['Deudor'] = (acc['Deudor'] || 0) + Math.abs(account.balance); // Total de saldo que los clientes deben al banco
      } else {
        acc['Acreedor'] = (acc['Acreedor'] || 0) + account.balance; // Total de saldo positivo de los clientes
      }
      return acc;
    }, {} as Record<string, number>);

    this.accountBalanceChartLabels = ['Saldo Acreedor', 'Saldo Deudor'];
    this.accountBalanceChartDatasets = [
      {
        data: [
          balanceTotals['Acreedor'] || 0,
          balanceTotals['Deudor'] || 0,
        ],
        backgroundColor: [
          'rgba(25, 135, 84, 0.2)',
          'rgba(220, 53, 69, 0.2)',
        ],
        hoverBackgroundColor: [
          'rgba(25, 135, 84, 0.4)',
          'rgba(220, 53, 69, 0.4)',
        ],
        borderColor: [
          'rgba(25, 135, 84, 1)',
          'rgba(220, 53, 69, 1)',
        ],
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
        //position: 'top',
        display: false,
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

  public plotStatusChartLabels: string[] = [];
  public plotStatusChartDatasets: ChartDataset<'bar', number[]>[] = [
    {
      data: [],
      label: 'Estado del Lote',
      backgroundColor: [
        'rgba(255, 193, 7, 0.2)',
        'rgba(0, 123, 255, 0.2)',
        'rgba(25, 135, 84, 0.2)',
        'rgba(220, 53, 69, 0.2)',
        'rgba(23, 162, 184, 0.2)',
        'rgba(52, 58, 64, 0.2)',
      ],
      hoverBackgroundColor: [
        'rgba(255, 193, 7, 0.4)',
        'rgba(0, 123, 255, 0.4)',
        'rgba(25, 135, 84, 0.4)',
        'rgba(220, 53, 69, 0.4)',
        'rgba(23, 162, 184, 0.4)',
        'rgba(52, 58, 64, 0.4)',
      ],
      borderColor: [
        'rgba(255, 193, 7, 1)',
        'rgba(0, 123, 255, 1)',
        'rgba(25, 135, 84, 1)',
        'rgba(220, 53, 69, 1)',
        'rgba(23, 162, 184, 1)',
        'rgba(52, 58, 64, 1)',
      ],
      borderWidth: 1,
    },
  ];

  public plotActiveChartLabels: string[] = ['Activo', 'Inactivo'];
  public plotActiveChartDatasets: ChartDataset<'pie', number[]>[] = [
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

  //#region Propiedades para Gráficos de Cuentas (Accounts)
  public accountBalanceChartLabels: string[] = [
    'Saldo Acreedor',
    'Saldo Deudor',
  ];
  public accountBalanceChartDatasets: ChartDataset<'bar', number[]>[] = [
    {
      data: [this.creditorAccountsCount, this.debtorAccountsCount],
      backgroundColor: [
        'rgba(25, 135, 84, 0.2)', // Verde para Acreedor
        'rgba(220, 53, 69, 0.2)', // Rojo para Deudor
      ],
      hoverBackgroundColor: [
        'rgba(25, 135, 84, 0.4)', // Verde más intenso para Acreedor
        'rgba(220, 53, 69, 0.4)', // Rojo más intenso para Deudor
      ],
      borderColor: [
        'rgba(25, 135, 84, 1)', // Borde verde para Acreedor
        'rgba(220, 53, 69, 1)', // Borde rojo para Deudor
      ],
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

    modalRef.componentInstance.title =
      'Información de Propietarios, Lotes y Cuentas';
    modalRef.componentInstance.description =
      'En esta pantalla se podrán visualizar reportes de los propietarios y los lotes con sus cuentas cargados en el consorcio.';
    modalRef.componentInstance.body = [
      {
        title: 'KPIs',
        content: [
          {
            strong: '',
            detail: 'Métricas relevantes que muestra estadísticas claves para evaluar rápidamente el estado y desempeño de los lotes y propietarios del consorcio.',
          }
        ],
      },
      {
        title: 'Gráficos',
        content: [
          {
            strong: '',
            detail: 'Gráficos de barra o torta que permite visualizar de forma rápida y detallada el estado y desempeño de los lotes y propietarios del consorcio.',
          }
        ],
      },
      {
        title: 'Filtros',
        content: [
          {
            strong: 'Tipo de documento:',
            detail:
              'Filtra los gráficos y kpis correspondientes a propietarios por tipo de documento.',
          },
          {
            strong: 'Tipo de propietario:',
            detail:
              'Filtra los gráficos y kpis correspondientes a propietarios por tipo de propietario.',
          },
          {
            strong: 'Estado del propietario:',
            detail: 'Filtra los gráficos y kpis correspondientes a propietarios por estado de validación del propietario.',
          },
          {
            strong: 'Activo:',
            detail: 'Filtra los gráficos y kpis correspondientes a propietarios por estado de activo del propietario.',
          },
          {
            strong: 'Fecha nacimiento desde:',
            detail: 'Filtra los gráficos y kpis correspondientes a propietarios por fecha de nacimiento del propietario.',
          },
          {
            strong: 'Fecha nacimiento hasta:',
            detail: 'Filtra los gráficos y kpis correspondientes a propietarios por fecha de nacimiento del propietario.',
          }
        ],
      },
      {
        title: 'Funcionalidades de los Botones',
        content: [
          {
            strong: 'Filtros:',
            detail:
              'Botón que despliega los filtros avanzados para los gráficos y KPIs.',
          }
        ],
      },
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una administración eficiente de propietarios, lotes y cuentas, garantizando la precisión y consistencia de los datos.',
    ];
  }
  //#endregion

  /**
   * Translates a value using the provided dictionary.
   *
   * @param value - The value to translate.
   * @param dictionary - The dictionary used for translation.
   * @returns The key that matches the value in the dictionary, or undefined if no match is found.
   */
  translateDictionary(value: any, dictionary?: { [key: string]: any }) {
    if (value !== undefined && value !== null && dictionary) {
      for (const key in dictionary) {
        if (dictionary[key].toString().toLowerCase() === value.toLowerCase()) {
          return key;
        }
      }
    }
    return;
  }
}
