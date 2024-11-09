import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { MainContainerComponent, TableComponent } from 'ngx-dabd-grupo01';
import { BaseChartDirective } from 'ng2-charts';
import { catchError, map, of } from 'rxjs';
import { Chart, registerables, ChartDataset, ChartOptions } from 'chart.js';
import { OwnerService } from '../../../services/owner.service';
import { Owner } from '../../../models/owner';
import { PaginatedResponse } from '../../../models/api-response';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { User } from '../../../models/user';
import { Role } from '../../../models/role';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MainContainerComponent,
    TableComponent,
    BaseChartDirective,
    FormsModule,
    NgbPagination,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [DatePipe],
})
export class HomeComponent {
  /* private ownerService = inject(OwnerService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  owners: Owner[] = [];
  users: User[] = [];
  roles: Role[] = [];

  // Chart configurations
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

  ngOnInit(): void {
    this.loadOwners();
    this.loadUsers();
    this.loadRoles();
  }

  ngAfterViewInit(): void {
    this.updateCharts();
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

  updateCharts() {
    this.updateOwnerCharts();
    this.updateUserCharts();
    this.updateRoleCharts();
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
  } */



























}
