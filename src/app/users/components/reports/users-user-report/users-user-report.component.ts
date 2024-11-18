import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  TableComponent,
  TableFiltersComponent,
} from 'ngx-dabd-grupo01';
import { ChartDataset, ChartOptions } from 'chart.js';
import { catchError, combineLatest, map, of } from 'rxjs';
import { PaginatedResponse } from '../../../models/api-response';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { User } from '../../../models/user';
import { Role } from '../../../models/role';
import { InfoComponent } from '../../commons/info/info.component';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables);

@Component({
  selector: 'app-users-user-report',
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
  templateUrl: './users-user-report.component.html',
  styleUrl: './users-user-report.component.scss',
  providers: [DatePipe],
})
export class UsersUserReportComponent implements OnInit, AfterViewInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private modalService = inject(NgbModal);
  private cdr = inject(ChangeDetectorRef);

  users: any[] = [];
  roles: Role[] = [];

  colors = [
    '#62B68F',  // rgba(98, 182, 143)
    '#FF919E',  // rgba(255, 145, 158)
    '#82B1FF',  // rgba(130, 177, 255)
    '#BB83D1',  // rgba(187, 131, 209)
    '#FFAB91',  // rgba(255, 171, 145)
    '#A2D9A5',  // rgba(162, 217, 165)
    '#95A0D9',  // rgba(149, 160, 217)
    '#FFA29A',  // rgba(255, 162, 154)
    '#7ECEC6',  // rgba(126, 206, 198)
    '#FFF59D',  // rgba(255, 245, 157)
    '#FFE082',  // rgba(255, 224, 130)
    '#DCE775',  // rgba(220, 231, 117)
    '#C4C4C4',  // rgba(196, 196, 196)
    '#BCAAAC',  // rgba(188, 170, 164)
    '#90CAF9'   // rgba(144, 202, 249)
];


  chartFilters: Record<string, any> = {};
  dateFilterTo: any;
  dateFilterFrom: any;

  // KPIs
  usersCreatedLastMonth = 0;
  ownerUsersCount = 0;
  activeUsersCount = 0;
  mostFrequentUserRole = '';

  public pieChartPlugins: any = [ChartDataLabels];


  filterConfig: Filter[] = new FilterConfigBuilder()
    .selectFilter(
      'Tipo de Documento',
      'documentType',
      'Seleccione un tipo de documento',
      [
        { value: 'DNI', label: 'DNI' },
        { value: 'ID', label: 'Cédula' },
        { value: 'PASSPORT', label: 'Pasaporte' },

      ]
    )
    // .selectFilter('Activo', 'isActive', '', [
    //   { value: 'true', label: 'Activo' },
    //   { value: 'false', label: 'Inactivo' },
    //   { value: '', label: 'Todos' },
    // ])
    // .dateFilter(
    //   'Fecha de Nacimiento Desde',
    //   'birthdateStart',
    //   'Seleccione la fecha de inicio'
    // )
    // .dateFilter(
    //   'Fecha de Nacimiento Hasta',
    //   'birthdateEnd',
    //   'Seleccione la fecha de fin'
    // )
    .build();

  userFilterConfig: Filter[] = new FilterConfigBuilder()
    .textFilter('Nombre', 'firstName', 'Nombre')
    .textFilter('Apellido', 'lastName', 'Apellido')
    .textFilter('Nombre de Usuario', 'userName', 'Nombre de Usuario')
    .textFilter('Correo Electrónico', 'email', 'Correo Electrónico')
    .selectFilter('Activo', 'isActive', '', [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
      { value: '', label: 'Todo' },
    ])
    .build();

  roleFilterConfig: Filter[] = new FilterConfigBuilder()
    .textFilter('Código', 'code', 'Código')
    .textFilter('Nombre Técnico', 'name', 'Nombre Técnico')
    .textFilter('Nombre Visible', 'prettyName', 'Nombre Visible')
    .textFilter('Descripción', 'description', 'Descripción')
    .selectFilter('Activo', 'active', '', [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
      { value: '', label: 'Todo' },
    ])
    .build();

  ngOnInit(): void {
    this.filterReports();
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.updateCharts();
  }

  updateCharts() {
    this.updateUserCharts();
    this.updateRoleCharts();
  }

  loadData(filters: Record<string, any> = {}): void {


    this.userService
    .dinamicFilters(0, 2147483647, filters)
    .pipe(
      map((response: PaginatedResponse<any>) => {
        this.users = response.content;
        this.calculateKPIs();
        this.updateCharts();

      }),
      catchError(() => of([]))
    );
  }

  //#region Filtros de los charts

  //Acá manejo lo de la fecha desde
  changeFilterDateFrom(date: string){
    //Verifico primero si no existe la prop en el objeto de charFilters
    //Si existe la piso con lo nuevo
    const dateFilter = new Date(date)
    if(this.chartFilters['startDate']){
      this.chartFilters['startDate'] = dateFilter.toISOString().slice(0, 16)
    }
    //Si no existe entonces la agrego al objeto de chartfilters
    else{
      this.chartFilters = {
        ...this.chartFilters,
        startDate: dateFilter.toISOString().slice(0, 16)
      }
    }
    //console.log(this.chartFilters);
    this.filterReports()
  }

  //Acá manejo lo de la fecha hasta (Mismo funcionamiento que la fecha desde)
  changeFilterDateTo(date: string){
    const dateFilter = new Date(date)
    if(this.chartFilters['endDate']){
      this.chartFilters['endDate'] = dateFilter.toISOString().slice(0, 16)
    }
    else{
      this.chartFilters = {
        ...this.chartFilters,
        endDate: dateFilter.toISOString().slice(0, 16)
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


  clearAllFilters() {
    this.resetDateFilter()
  }

  resetDateFilter() {
    this.dateFilterFrom = ""
    this.dateFilterTo = ""
    this.chartFilters = {}
  }


  //#endregion

  filterReports(): void {
    let cleanFilters = this.cleanFilters(this.chartFilters)
    cleanFilters = {
      ...cleanFilters,
      "isActive" : true
    }
    this.userService
      .dinamicFilters(0, 2147483647, cleanFilters)
      .pipe(
        map((response: PaginatedResponse<any>) => {
          this.users = response.content;
          this.calculateKPIs();
          this.updateUserCharts();
        }),
        catchError((error) => {
          console.error('Error loading owners', error);
          return of([])})
      )
      .subscribe();
  }

/*   loadRoles(): void {
    this.roleService
      .getAllRoles(0, 1000)
      .pipe(
        map((response: PaginatedResponse<Role>) => {
          this.roles = response.content;
          this.updateRoleCharts();
        }),
        catchError(() => of([]))
      )
      .subscribe();
  } */

  calculateKPIs(): void {
    if (this.users.length > 0) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      this.usersCreatedLastMonth = this.users.filter(
        (user) => new Date() //new Date(user.createdDate) >= oneMonthAgo
      ).length;

      this.ownerUsersCount = this.users.filter(
        (user) => user.ownerId && user.plotId
      ).length;
      this.activeUsersCount = this.users.filter((user) => user.isActive).length;

      const roleCounts = this.users.reduce((acc, user) => {
        user.roles?.forEach(
          (role: Role) => (acc[role.prettyName] = (acc[role.prettyName] || 0) + 1)
        );
        return acc;
      }, {} as Record<string, number>);

      this.mostFrequentUserRole = Object.keys(roleCounts).reduce((a, b) =>
        roleCounts[a] > roleCounts[b] ? a : b
      );
    }
  }

  updateUserCharts(): void {
    const userActiveStatusCounts = this.users.reduce((acc, user) => {
      const status = user.isActive ? 'Activo' : 'Inactivo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.pieChartUserActiveStatusLabels = Object.keys(userActiveStatusCounts);
    this.pieChartUserActiveStatusDatasets[0].data = Object.values(
      userActiveStatusCounts
    );

    const ageGroups = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0,
    };
    const currentDate = new Date();

    this.users.forEach((user) => {
      if (user.birthdate) {
        const age =
          currentDate.getFullYear() - new Date(user.birthdate).getFullYear();
        if (age >= 18 && age <= 24) ageGroups['18-24']++;
        else if (age >= 25 && age <= 34) ageGroups['25-34']++;
        else if (age >= 35 && age <= 44) ageGroups['35-44']++;
        else if (age >= 45 && age <= 54) ageGroups['45-54']++;
        else if (age >= 55) ageGroups['55+']++;
      }
    });
    this.histogramAgeDistributionLabels = Object.keys(ageGroups);
    this.histogramAgeDistributionDatasets[0].data = Object.values(ageGroups);

    const userCategoryDistribution = this.users.reduce((acc, user) => {
      const category =
        user.ownerId && user.plotId
          ? 'Propietario'
          : !user.ownerId && user.plotId
          ? 'Inquilino'
          : 'Empleados';

      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.barChartUserCategoryLabels = Object.keys(userCategoryDistribution);
    this.barChartUserCategoryDatasets[0].data = Object.values(
      userCategoryDistribution
    );

    this.cdr.detectChanges();
  }

  updateRoleCharts(): void {
    const roleActiveStatusCounts = this.roles.reduce((acc, role) => {
      const status = role.active ? 'Activo' : 'Inactivo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.pieChartRoleActiveStatusLabels = Object.keys(roleActiveStatusCounts);
    this.pieChartRoleActiveStatusDatasets[0].data = Object.values(
      roleActiveStatusCounts
    );

    const roleDistribution = this.roles.reduce((acc, role) => {
      acc[role.prettyName] = (acc[role.prettyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.barChartUserRoleLabels = Object.keys(roleDistribution);
    this.barChartUserRoleDatasets[0].data = Object.values(roleDistribution);

    const userByRoleDistribution = this.users?.reduce((acc, user) => {
      user.roles?.forEach((role: Role) => {
        acc[role.prettyName] = (acc[role.prettyName] || 0) + 1;
      });

      return acc;
    }, {} as Record<string, number>);

    this.barChartUserByRoleLabels = Object.keys(userByRoleDistribution);
    this.barChartUserByRoleDatasets[0].data = Object.values(
      userByRoleDistribution
    );

    this.cdr.detectChanges();
  }

  filterChange(event: Record<string, any>): void {
    this.chartFilters = {
      ...this.chartFilters,
      event
    }
    this.filterReports();
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
        //position: 'top',
        display: false,
      },
    },
  };

  // User Chart Data
  pieChartUserActiveStatusLabels: string[] = ['Activo', 'Inactivo'];
  pieChartUserActiveStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: this.colors,
      hoverBackgroundColor: this.colors,
      borderColor: this.colors,
      borderWidth: 1,
    },
  ];

  histogramAgeDistributionLabels: string[] = [];
  histogramAgeDistributionDatasets: ChartDataset<'bar', number[]>[] = [
    {
      data: [],
      label: '',
      backgroundColor: this.colors,
      hoverBackgroundColor: this.colors,
      borderColor: this.colors,
      borderWidth: 1,
    },
  ];

  barChartUserCategoryLabels = ['Propietarios', 'Inquilinos', 'Otros'];
  barChartUserCategoryDatasets: ChartDataset<'bar', number[]>[] = [
    {
      data: [],
      label: '',
      backgroundColor: this.colors,
      hoverBackgroundColor: this.colors,
      borderColor: this.colors,
      borderWidth: 1,
    },
  ];

  barChartUserRoleLabels: string[] = [];
  barChartUserRoleDatasets: ChartDataset<'bar', number[]>[] = [
    {
      data: [],
      label: '',
      backgroundColor: this.colors,
      hoverBackgroundColor: this.colors,
      borderColor: this.colors,
      borderWidth: 1,
    },
  ];

  pieChartRoleActiveStatusLabels = ['Activo', 'Inactivo'];
  pieChartRoleActiveStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: this.colors,
      hoverBackgroundColor: this.colors,
      borderColor: this.colors,
      borderWidth: 1,
    },
  ];

  barChartUserByRoleLabels: string[] = [];
  barChartUserByRoleDatasets: ChartDataset<'bar', number[]>[] = [
    {
      data: [],
      label: '',
      backgroundColor: this.colors,
      hoverBackgroundColor: this.colors,
      borderColor: this.colors,
      borderWidth: 1,
    },
  ];
  //#endregion

  //#region Info
  openInfo() {
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true,
    });

    modalRef.componentInstance.title = 'Información de Usuarios y roles';
    modalRef.componentInstance.description =
      'En esta pantalla se podrán visualizar reportes de los usuario y los roles cargados en el consorcio.';
    modalRef.componentInstance.body = [
      {
        title: 'KPIs',
        content: [
          {
            strong: '',
            detail:
              'Métricas relevantes que muestra estadísticas claves para evaluar rápidamente el estado y desempeño de los usuarios y los roles del consorcio.',
          },
        ],
      },
      {
        title: 'Gráficos',
        content: [
          {
            strong: '',
            detail:
              'Gráficos de barra o torta que permite visualizar de forma rápida y detallada el estado y desempeño de los usuarios y los roles del consorcio..',
          },
        ],
      },
      {
        title: 'Filtros',
        content: [
          {
            strong: 'Nombre:',
            detail:
              'Filtra los gráficos y kpis correspondientes a usuarios por el nombre personal del usuario.',
          },
          {
            strong: 'Apellido:',
            detail:
              'Filtra los gráficos y kpis correspondientes a usuarios por el apellido personal del usuario.',
          },
          {
            strong: 'Nombre de usuario:',
            detail:
              'Filtra los gráficos y kpis correspondientes a usuarios por el nombre del usuario.',
          },
          {
            strong: 'Correo electrónico:',
            detail:
              'Filtra los gráficos y kpis correspondientes a usuarios por el correo electrónico del usuario',
          },
          {
            strong: 'Activo:',
            detail:
              'Filtra los gráficos y kpis correspondientes a usuarios por el estado de activo o inactivo del usuario',
          },
        ],
      },
      {
        title: 'Funcionalidades de los Botones',
        content: [
          {
            strong: 'Filtros:',
            detail:
              'Botón que despliega los filtros avanzados para los gráficos y KPIs.',
          },
        ],
      },
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una administración eficiente de usuarios y roles, garantizando la precisión y consistencia de los datos.',
    ];
  }
  //#end region


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
