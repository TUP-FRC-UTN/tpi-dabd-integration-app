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
import {UserService} from '../../../services/user.service';
import {RoleService} from '../../../services/role.service';
import {User} from '../../../models/user';
import {Role} from '../../../models/role';

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
    TableFiltersComponent
  ],
  templateUrl: './users-user-report.component.html',
  styleUrl: './users-user-report.component.scss',
  providers: [DatePipe]
})
export class UsersUserReportComponent {
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  users: User[] = [];
  roles: Role[] = [];

  filterConfig: Filter[] = new FilterConfigBuilder()
    .textFilter("Nombre", "firstName", "Nombre")
    .textFilter("Apellido", "lastName", "Apellido")
    .textFilter("Nombre de Usuario", "userName", "Nombre de Usuario")
    .textFilter("Correo Electrónico", "email", "Correo Electrónico")
    .selectFilter("Activo", "isActive", "", [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
      { value: '', label: 'Todo' }
    ])
    .build()

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  ngAfterViewInit(): void {
    this.updateCharts();
  }

  updateCharts() {
    this.updateUserCharts();
    this.updateRoleCharts();
  }

  loadUsers() {
    this.userService
      .getAllUsers(0, 1000)
      .pipe(
        map((response: PaginatedResponse<User>) => {
          this.users = response.content;
          this.updateUserCharts();
        }),
        catchError((error) => {
          console.error('Error loading users', error);
          return of([]);
        })
      )
      .subscribe();
  }

  loadRoles() {
    this.roleService
      .getAllRoles(0, 1000)
      .pipe(
        map((response: PaginatedResponse<Role>) => {
          this.roles = response.content;
          this.updateRoleCharts();
        }),
        catchError((error) => {
          console.error('Error loading roles', error);
          return of([]);
        })
      )
      .subscribe();
  }

  updateUserCharts() {
    const userActiveStatusCounts = this.users.reduce((acc, user) => {
      const status = user.isActive ? 'Activo' : 'Inactivo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.pieChartUserActiveStatusLabels = Object.keys(userActiveStatusCounts);
    this.pieChartUserActiveStatusDatasets[0].data = Object.values(
      userActiveStatusCounts
    );

    const userRoleCounts = this.users.reduce((acc, user) => {
      user.roles?.forEach((role) => {
        acc[role.name] = (acc[role.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    this.barChartUserRoleLabels = Object.keys(userRoleCounts);
    this.barChartUserRoleDatasets[0].data = Object.values(userRoleCounts);
  }

  updateRoleCharts() {
    const roleActiveStatusCounts = this.roles.reduce((acc, role) => {
      const status = role.active ? 'Activo' : 'Inactivo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.pieChartRoleActiveStatusLabels = Object.keys(roleActiveStatusCounts);
    this.pieChartRoleActiveStatusDatasets[0].data = Object.values(
      roleActiveStatusCounts
    );
  }

  filterChange($event: Record<string, any>) {
    this.userService.dinamicFilters(0, 1000000, $event).subscribe({
      next : (result) => {
        this.users = result.content;
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

  // User Chart Data
  public pieChartUserActiveStatusLabels: string[] = ['Active', 'Inactive'];
  public pieChartUserActiveStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: ['#0dcaf0', '#0d6efd'], // Active (info) and Inactive (primary)
      hoverBackgroundColor: ['#3dd5f3', '#1c7efd'], // Lighter on hover
    },
  ];

  public barChartUserRoleLabels: string[] = [];
  public barChartUserRoleDatasets: ChartDataset<'bar', number[]>[] = [
    {
      data: [],
      label: 'Roles de usuarios',
      backgroundColor: '#198754',
      hoverBackgroundColor: '#28a745',
      borderColor: '#198754',
      borderWidth: 1,
    },
  ];

  // Role Chart Data
  public pieChartRoleActiveStatusLabels: string[] = ['Active', 'Inactive'];
  public pieChartRoleActiveStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: ['#0dcaf0', '#0d6efd'], // Active (info) and Inactive (primary)
      hoverBackgroundColor: ['#3dd5f3', '#1c7efd'], // Lighter on hover
    },
  ];

  //#endregion
}
