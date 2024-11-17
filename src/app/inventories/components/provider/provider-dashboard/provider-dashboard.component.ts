
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Provider, ViewChild, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ProvidersService } from '../../../services/providers.service';
import { Supplier } from '../../../models/suppliers/supplier.model';
import { ToastService, MainContainerComponent } from 'ngx-dabd-grupo01';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { ProviderDashboardInfoComponent } from './provider-dashboard-info/provider-dashboard-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseChartDirective } from 'ng2-charts';
import { Company } from '../../../models/suppliers/company.model';
import { Service } from '../../../models/suppliers/service.model';

import { TopProvider, ServicesByCompany } from '../../../models/suppliers/chart-objects.model';

import { NavigationExtras, Router } from '@angular/router';
import { ListEmpresasRegComponent } from "../dashboards/list-empresas-reg/list-empresas-reg.component";
import { ListProviderRegComponent } from "../dashboards/list-provider-reg/list-provider-reg.component";


Chart.register(...registerables);

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainContainerComponent,
    BaseChartDirective, FormsModule,
    ListEmpresasRegComponent,
    ListProviderRegComponent
],
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.css']
})
export class ProviderDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Form controls
  providerList: Supplier[] = [];
  searchFilterAll = new FormControl('');
  filterForm: FormGroup ;
  showModalFilter = false;
  companies: Company[] = [];
  services: Service[] = [];
  topProviders: TopProvider[] = [];
  private chartsInitialized = false;
  dataLoaded = false;
  private route = inject(Router);

  pieChartType: ChartType = 'pie';
  barChartType: ChartType = 'bar';
  doughnutChartType: ChartType = 'doughnut';

  // KPI metrics
  metrics = {
    activeCount: 0,
    inactiveCount: 0,
    activationRate: 0, 
    monthlyGrowthRate: 5.2, // Mock value
    uniqueServicesCount: 0, //servicio unico
    uniqueCompaniesCount: 0,
    avgProvidersPerService: 0, //promedio de proveedores por servicio
    avgProvidersPerCompany: 0,
    securityProvidersCount: 0,
    maintenanceProvidersCount: 0,
    gardeningProvidersCount: 0,
    cleaningProvidersCount: 0,
    essentialServicesCount: 0,
    specializedServicesCount: 0,
    previousCompaniesCount: 0,
    companiesGrowthRate: 0,
    companiesGrowthCount: 0,
    previousProvidersCount: 0,
    providersGrowthCount: 0,
    currentMonthCount: 0,
    activationRateChange: 0,
    //Compañias 
    activeCompaniesCount: 0,
    inactiveCompaniesCount: 0,
    companiesActivationRate: 0,
    companiesActivationRateChange: 0,
    isNegativeTrend: false,
    isNegativeTrendActive: false,
    uniqueSuppliersCount: 0,

    //proveedores vs corporativos
    independentProvidersCount: 0,
    corporateProvidersCount: 0,
    independentPercentage: 0,
    corporatePercentage: 0,
  };
  previousProviderList: Supplier[] = [];
  previousCompaniesCount: number = 0;

  getMonthName(offset: number = 0): string {
    const date = new Date();
    date.setMonth(date.getMonth() - offset);
    return date.toLocaleString('es', { month: 'long' });
  }
  getGrowthDescription(): string {
    if (this.metrics.providersGrowthCount === 0) {
      return 'Sin cambios respecto al mes anterior';
    }

    if (this.metrics.providersGrowthCount > 0) {
      return `Incremento de ${this.metrics.providersGrowthCount} proveedores`;
    }

    // Caso de disminución
    const decrease = Math.abs(this.metrics.providersGrowthCount);
    return `Disminución de ${decrease} proveedores`;
  }
  // Chart configurations

//  readonly chartConfigs = {
//     pieChart: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: { position: 'right' as const
//           //, onClick: null 
//         },
//         title: { display: true, text: 'Estado de Proveedores' }
//       },
//       animation: {
//         duration : 500
//       }
//     },
//     barChart: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: { 
//           position: 'top' as const,
//           //onClick: null  // Deshabilitar clicks en la leyenda
//         },
//         title: { display: true, text: 'Distribución por Servicio' }
//       },
//       scales: {
//         y: {
//           beginAtZero: true,
//           ticks: { stepSize: 1 }
//         }
//       },
//       animation: {
//         duration: 500
//       }
//     },
//     doughnutChart: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: { 
//           position: 'right' as const
//           //onClick: null  // Deshabilitar clicks en la leyenda
//         },
//         title: { display: true, text: 'Tipos de Servicios' }
//       },
//       animation: {
//         duration: 500
//       }
//     }
//   }

  readonly chartConfigs = {
    pieChart: this.getChartConfig('pie', 'Estado de Proveedores'),
    barChart: this.getChartConfig('bar', 'Distribución por Tipo de Servicio', true),
    doughnutChart: this.getChartConfig('doughnut', 'Distribución de Servicios', false, 'right'),
    horizontalBarChart: this.getChartConfig('horizontalBar', 'Distribución por Zona'),
    // config para proveedores x compania
    companyBarChart: this.getChartConfig('bar', 'Proveedores por Compañía', true),

    //config proveedores por mes de registro
    monthlyRegistrationChart: this.getChartConfig('bar', 'Registro Mensual de Proveedores', true),

    //config prov independientes vs corpo
    independentVsCorporateChart: this.getChartConfig(
      'doughnut', 
      'Distribución de Proveedores', 
      false, 
      'right'
    ),

    // Proveedores con servicios groupby company basicamente
    servicesByCompanyChart: this.getChartConfig('bar', 'Distribución de Servicios por Compañía', true)

  };

  // Datos de los gráficos
  pieChartData: ChartData<'pie'> = {
    labels: ['Activos', 'Inactivos'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#28a745', '#dc3545']
    }]
  };

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Cantidad de Proveedores',
      backgroundColor: ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#dc3545', '#6610f2']
    }]
  };

  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Servicios Esenciales', 'Servicios Especializados'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#17a2b8', '#ffc107']
    }]
  };


  horizontalBarChartData: ChartData<'bar'> = {
    labels: ['Zona Norte', 'Zona Sur', 'Zona Este', 'Zona Oeste', 'Zona Central'],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      backgroundColor: '#20c997'
    }]
  };

  companyBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Cantidad de Proveedores',
      backgroundColor: '#4CAF50'
    }]
  };

  monthlyRegistrationChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Proveedores Registrados',
      backgroundColor: '#3f51b5', // Color índigo para diferenciarlo
      borderRadius: 5 // Bordes redondeados para las barras
    }]
  };

  // Prov. Independintes vs Corporativos
  independentVsCorporateChartData: ChartData<'doughnut'> = {
    labels: ['Independientes', 'Corporativos'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#4CAF50', '#2196F3'],  // Verde para independientes, Azul para corporativos
      borderWidth: 1,
      borderColor: ['#388E3C', '#1976D2']
    }]
  };

  // Servicios agrupados x compania
  servicesByCompanyChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  private getChartConfig(
    type: string, 
    title: string, 
    showAxes = false, 
    legendPosition: 'top' | 'right' = 'top'
  ): ChartConfiguration['options'] {
    const config: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: legendPosition,
          display: true 
        },
        title: {
          display: true,
          text: title
        }
      }
    };

    if (showAxes) {
      config.scales = {
        x: { 
          title: { display: true, text: 'Servicios' },
          ticks: { maxRotation: 45, minRotation: 45 }
        },
        y: { 
          title: { display: true, text: 'Cantidad' },
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      };
    }

    return config;
  }

  constructor(
    private fb: FormBuilder,
    private providerService: ProvidersService,
    private toastService: ToastService,
    private modalService: NgbModal,
    private changeDetector: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      serviceName: ['', Validators.maxLength(100)],
      enabled: [''],
      registration: ['']
    });
    this.initializeForm();
    this.setupSearchFilter();
  }

  ngOnInit(): void {
    //this.getProviders();
    this.getAllProviders();
    this.getCompany();
    this.getServices();
  }

  getCompany(): void {
    this.providerService.getCompany().subscribe({
      next: (response) => {
        console.log('Estas son las compañias', response);
        //this.providerList = response;
        this.companies = response;
        this.calculateMetrics();
        this.updateCharts();
      },
      error: () => {
        this.toastService.sendError('Error al cargar proveedores.');
      }
    });
  }
  getAllProviders(): void {
    this.providerService.getAllProvider().subscribe({
      next: (response) => {
        console.log('Estos son los proveedores', response);
        this.providerList = response;
        this.calculateMetrics();
        //New
        this.dataLoaded = true;
        // Solo actualizar los gráficos si ya están inicializados
        this.chartsInitialized = true;
        if (this.chartsInitialized) {
          this.updateCharts();
        } else if (this.chart) {
          // Si el chart existe pero no está inicializado, inicializarlo
          this.initializeCharts();
        }
        
        // Forzar la detección de cambios
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.toastService.sendError('Error al cargar proveedores.');
      }
    });
  }
  getServices(): void {
    this.providerService.getServices().subscribe({
      next: (response) => {
        this.services = response;
        this.calculateMetrics();
        this.updateCharts();
      },
      error: () => {
        this.toastService.sendError('Error al cargar servicios.');
      }
    });
  }

  private initializeFilterForm(): FormGroup {
    return this.fb.group({
      serviceName: ['', Validators.maxLength(100)],
      enabled: [''],
      registration: ['']
    });
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      serviceName: [''],
      enabled: [''],
      registration: ['']
    });
  }

  private setupSearchFilter(): void {
    this.searchFilterAll.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.getProviders(searchTerm || '');
      });
  }

  

  getProviders(searchTerm?: string): void {
    const filters = this.getFilters(searchTerm);

    this.providerService.getProviders(filters).subscribe({
      next: (response) => {
        this.providerList = response.content;
        this.calculateMetrics();
        this.updateCharts();
      },
      error: () => {
        this.toastService.sendError('Error al cargar proveedores.');
      }
    });
  }

  private calculateMetrics(): void {
    const metrics = this.metrics;

    // Cálculo de crecimiento
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Cálculo de proveedores activos e inactivos
    metrics.activeCount = this.providerList.filter(p => p.enabled).length;
    metrics.inactiveCount = this.providerList.length - metrics.activeCount;
    // Cálculo del porcentaje de activación
    metrics.activationRate = this.providerList.length > 0 
      ? Math.round((metrics.activeCount / this.providerList.length) * 100)
      : 0;

    // Determinar si hay más inactivos que activos (como en empresas)
    this.metrics.isNegativeTrendActive = metrics.inactiveCount > metrics.activeCount;

    // Cálculo del cambio en la tasa de activación (solo para referencia)
    const previousActiveCount = this.previousProviderList.filter(p => p.enabled).length;
    const previousTotalCount = this.previousProviderList.length;
    const previousActivationRate = previousTotalCount > 0 
      ? Math.round((previousActiveCount / previousTotalCount) * 100)
      : 0;
    metrics.activationRateChange = metrics.activationRate - previousActivationRate;

    // Cálculo de proveedores activos e inactivos
    metrics.activeCount = this.providerList.filter(p => p.enabled).length;
    metrics.inactiveCount = this.providerList.length - metrics.activeCount;
    // Cálculo del porcentaje de activación
    metrics.activationRate = this.providerList.length > 0 
      ? Math.round((metrics.activeCount / this.providerList.length) * 100)
      : 0;

    // Calculo de unicas compañias
    const uniqueCompanies = new Set(
      this.companies.map(c => c.name).filter(Boolean)
    );
    metrics.uniqueCompaniesCount = uniqueCompanies.size;

    // Cálculo de empresas activas e inactivas
    metrics.activeCompaniesCount = this.companies.filter(c => c.enabled).length;
    metrics.inactiveCompaniesCount = this.companies.length - metrics.activeCompaniesCount;

    // Cálculo del porcentaje de activación de empresas
    metrics.companiesActivationRate = this.companies.length > 0 
      ? Math.round((metrics.activeCompaniesCount / this.companies.length) * 100)
      : 0;

    metrics.isNegativeTrend = this.metrics.inactiveCompaniesCount > this.metrics.activeCompaniesCount;
    // Cálculo del porcentaje de crecimiento de empresas
    metrics.companiesGrowthCount = metrics.activeCompaniesCount - this.previousCompaniesCount;
    metrics.companiesGrowthRate = this.previousCompaniesCount > 0
      ? Math.round(((metrics.activeCompaniesCount - this.previousCompaniesCount) / this.previousCompaniesCount) * 100)
      : metrics.activeCompaniesCount > 0 ? 100 : 0;

    // Calcular proveedores del mes actual y anterior
    const currentMonthProviders = this.providerList.filter(provider => {
      const regDate = new Date(provider.registration);
      return regDate.getMonth() === currentMonth && 
             regDate.getFullYear() === currentYear;
    });

    // Calcular proveedores del mes anterior
    const previousMonthProviders = this.providerList.filter(provider => {
      const regDate = new Date(provider.registration);
      const isPreviousMonth = currentMonth === 0 
        ? regDate.getMonth() === 11 && regDate.getFullYear() === currentYear - 1
        : regDate.getMonth() === currentMonth - 1 && regDate.getFullYear() === currentYear;
      return isPreviousMonth;
    });

    metrics.currentMonthCount = currentMonthProviders.length;
    metrics.previousProvidersCount = previousMonthProviders.length;
    metrics.providersGrowthCount = currentMonthProviders.length - previousMonthProviders.length;
  
    // Calcular tasa de crecimiento mensual
    metrics.monthlyGrowthRate = previousMonthProviders.length > 0
      ? ((currentMonthProviders.length - previousMonthProviders.length) / previousMonthProviders.length * 100)
      : currentMonthProviders.length > 0 ? 100 : 0;

    const uniqueServicess = new Set(
      this.services.map(p => p.name).filter(Boolean)
    );
    metrics.uniqueServicesCount = uniqueServicess.size;

    // Service-specific counts
    metrics.securityProvidersCount = this.getProvidersCountByService('seguridad');
    metrics.maintenanceProvidersCount = this.getProvidersCountByService('mantenimiento');
    metrics.gardeningProvidersCount = this.getProvidersCountByService('jardinería');
    metrics.cleaningProvidersCount = this.getProvidersCountByService('limpieza');

    console.log(metrics);
    console.log('Estas son las de seguridad', metrics.securityProvidersCount);
    console.log('Estas son las de mantenimiento', metrics.maintenanceProvidersCount);
    console.log('Estas son las de jardineria', metrics.gardeningProvidersCount);
    console.log('Estas son las de limpieza', metrics.cleaningProvidersCount);

    // Unique counts
    const uniqueServices = new Set(this.services.map(p => p.name).filter(Boolean));
    metrics.uniqueServicesCount = uniqueServices.size;

    // Essential vs Specialized services
    metrics.essentialServicesCount = 
      metrics.securityProvidersCount + 
      metrics.maintenanceProvidersCount + 
      metrics.cleaningProvidersCount;
    console.log('Estas son las de esenciales', metrics.maintenanceProvidersCount);
    metrics.specializedServicesCount = this.providerList.length - metrics.essentialServicesCount;
    console.log('Estas son las de especializados', metrics.specializedServicesCount);
    // Averages
    metrics.avgProvidersPerService = metrics.uniqueServicesCount > 0
      ? Math.round(this.providerList.length / metrics.uniqueServicesCount)
      : 0;
    metrics.avgProvidersPerCompany = metrics.uniqueCompaniesCount > 0
      ? Math.round(this.providerList.length / metrics.uniqueCompaniesCount)
      : 0;

    // Top antiguedad
    this.calculateTopProviders();
  }

  private getProvidersCountByService(service: string): number {
    return this.providerList.filter(p => 
      p.service?.name?.toLowerCase().includes(service)
    ).length;
  }



  getBadgeClass(): string {
    if (this.metrics.providersGrowthCount > 0) {
      return 'bg-success';
    } else if (this.metrics.providersGrowthCount < 0) {
      return 'bg-danger';
    } else {
      return 'bg-secondary';
    }
  }

  getArrowClass(): string {
    if (this.metrics.providersGrowthCount > 0) {
      return 'bi-arrow-up';
    } else if (this.metrics.providersGrowthCount < 0) {
      return 'bi-arrow-down';
    } else {
      return 'bi-dash';
    }
  }

  private updateCharts(): void {
    if (!this.providerList.length) return;

    const metrics = this.metrics;
    
    // Update pie chart
    this.pieChartData.datasets[0].data = [metrics.activeCount, metrics.inactiveCount];
    
    // Update bar chart
    const serviceDistribution = this.getServiceDistribution();
    this.barChartData.labels = Object.keys(serviceDistribution);
    this.barChartData.datasets[0].data = Object.values(serviceDistribution);

    // Update doughnut chart
    this.doughnutChartData.datasets[0].data = [
      metrics.essentialServicesCount,
      metrics.specializedServicesCount
    ];

    // Update horizontal bar chart
    this.horizontalBarChartData.datasets[0].data = this.getZoneDistribution();

    // Actualizar nuevo gráfico de compañías
    const companyDistribution = this.getCompanyDistribution();
    this.companyBarChartData.labels = Object.keys(companyDistribution);
    this.companyBarChartData.datasets[0].data = Object.values(companyDistribution);

      // Actualizar gráfico de registro mensual
    const monthlyDistribution = this.getMonthlyRegistrationDistribution();
    this.monthlyRegistrationChartData.labels = Object.keys(monthlyDistribution);
    this.monthlyRegistrationChartData.datasets[0].data = Object.values(monthlyDistribution);

    // opciones especificas para el grafico de registro mensual
    const monthlyChartOptions = this.chartConfigs.monthlyRegistrationChart;
    if (monthlyChartOptions && monthlyChartOptions.scales) {
      monthlyChartOptions.scales['y'] = {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0 // Solo números enteros
        },
        title: {
          display: true,
          text: 'Cantidad de Proveedores'
        }
      };
      monthlyChartOptions.scales['x'] = {
        title: {
          display: true,
          text: 'Mes y Año'
        }
      };
    }

    // Calcular de independientes vs corporativos
    this.calculateIndependentVsCorporateMetrics();

    // Calcular servicios groupby company
    this.calculateServicesByCompany();


    // Force chart update
    this.chart?.update();
  }



  private getZoneDistribution(): number[] {
    const total = this.providerList.length;
    return [
      Math.floor(total * 0.25), // Norte
      Math.floor(total * 0.20), // Sur
      Math.floor(total * 0.15), // Este
      Math.floor(total * 0.20), // Oeste
      Math.floor(total * 0.20)  // Central
    ];
  }

  private getFilters(searchTerm?: string): any {
    const filters = { ...this.filterForm.value };
    
    if (searchTerm) {
      filters.name = searchTerm;
      filters.cuil = searchTerm;
      filters['service.name'] = searchTerm;
      filters['company.name'] = searchTerm;
    }

    return Object.entries(filters)
      .filter(([_, value]) => value !== '' && value != null)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }

  // UI Actions
  showInfo(): void {
    this.modalService.open(ProviderDashboardInfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });
  }

  applyFilters(): void {
    this.getProviders();
    this.closeModalFilter();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.getProviders();
  }

  openModalFilter(): void {
    this.showModalFilter = true;
  }

  closeModalFilter(): void {
    this.showModalFilter = false;
  }
  private initializeCharts(): void {
    if (!this.chart || !this.dataLoaded) return;

    // Configuración inicial de los gráficos
    this.pieChartData = {
      labels: ['Activos', 'Inactivos'],
      datasets: [{
        data: [this.metrics.activeCount, this.metrics.inactiveCount],
        backgroundColor: ['#28a745', '#dc3545']
      }]
    };
  }
  private getServiceDistribution(): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    
    // Agrupar proveedores por servicio
    this.providerList.forEach(provider => {
      const serviceName = provider.service?.name || 'Sin categorizar';
      distribution[serviceName] = (distribution[serviceName] || 0) + 1;
    });

    // Ordenar por cantidad de proveedores (opcional)
    return Object.fromEntries(
      Object.entries(distribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6) // Limitar a los 6 servicios más comunes
    );
  }

  ngAfterViewInit() {
    // Si los datos ya están cargados, inicializar los gráficos
    if (this.dataLoaded) {
      this.initializeCharts();
    }
  }

 /* private providerListasGraficas : Supplier[] = [];
  calculateCharsGraphics() {
    this.providerService.getAllProvider().subscribe({
      next: (response) => {
        this.providerListasGraficas = response;
        this.updateCharts();
      },
      error: () => {
        this.toastService.sendError('Error al cargar proveedores.');
      }
    })
  }
  // private updateCharts(): void {
  //   // Actualizar gráfico de estado de proveedores
  //   this.pieChartData.datasets[0].data = [
  //     this.metrics.activeCount,
  //     this.metrics.inactiveCount
  //   ];

  //   // Actualizar gráfico de distribución por servicio
  //   const serviceDistribution = this.getServiceDistribution();
  //   this.barChartData.labels = Object.keys(serviceDistribution);
  //   this.barChartData.datasets[0].data = Object.values(serviceDistribution);

  //   // Actualizar gráfico de tipos de servicios
  //   this.doughnutChartData.datasets[0].data = [
  //     this.metrics.essentialServicesCount,
  //     this.metrics.specializedServicesCount
  //   ];

  //   // Forzar actualización de los gráficos
  //   if (this.chart) {
  //     this.chart.update();
  //   }
  // }
  private updateCharts(): void {
    if (!this.chart || !this.chartsInitialized) return;

    // Actualizar los datos
    this.pieChartData.datasets[0].data = [
      this.metrics.activeCount,
      this.metrics.inactiveCount
    ];

    const serviceDistribution = this.getServiceDistribution();
    this.barChartData.labels = Object.keys(serviceDistribution);
    this.barChartData.datasets[0].data = Object.values(serviceDistribution);

    this.doughnutChartData.datasets[0].data = [
      this.metrics.essentialServicesCount,
      this.metrics.specializedServicesCount
    ];

    // Forzar la actualización de los gráficos
    setTimeout(() => {
      this.chart?.update();
      this.changeDetector.detectChanges();
    }, 0);
  }

  private getServiceDistribution(): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    
    // Agrupar proveedores por servicio
    this.providerList.forEach(provider => {
      const serviceName = provider.service?.name || 'Sin categorizar';
      distribution[serviceName] = (distribution[serviceName] || 0) + 1;
    });

    // Ordenar por cantidad de proveedores (opcional)
    return Object.fromEntries(
      Object.entries(distribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6) // Limitar a los 6 servicios más comunes
    );
  }

  private dataLoaded = false;
  private chartsInitialized = false;
  
  ngAfterViewInit() {
    // Si los datos ya están cargados, inicializar los gráficos
    if (this.dataLoaded) {
      this.initializeCharts();
    }
  }
  

    this.barChartData = {
      labels: [],
      datasets: [{
        data: [],
        label: 'Cantidad de Proveedores',
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#dc3545', '#6610f2']
      }]
    };

    this.doughnutChartData = {
      labels: ['Servicios Esenciales', 'Servicios Especializados'],
      datasets: [{
        data: [this.metrics.essentialServicesCount, this.metrics.specializedServicesCount],
        backgroundColor: ['#17a2b8', '#ffc107']
      }]
    };

    // Actualizar los datos de los gráficos
    const serviceDistribution = this.getServiceDistribution();
    this.barChartData.labels = Object.keys(serviceDistribution);
    this.barChartData.datasets[0].data = Object.values(serviceDistribution);

    // Marcar los gráficos como inicializados
    this.chartsInitialized = true;

    // Forzar la actualización inicial
    setTimeout(() => {
      this.chart?.update();
      this.changeDetector.detectChanges();
    }, 0);
  }

}*/


  // Suppliers x Compania
  
  //metodo para calcular
  private getCompanyDistribution(): { [key: string]: number } {
    return this.providerList.reduce((acc, provider) => {
      const companyName = provider.company?.name || 'Sin compañía';
      acc[companyName] = (acc[companyName] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }
  
  // Supplierx x mes de registro
  //metodo para calcular la distribución por mes
  private getMonthlyRegistrationDistribution(): { [key: string]: number } {
    // Ordenar los proveedores por fecha de registro
    const sortedProviders = [...this.providerList].sort((a, b) => {
      return new Date(a.registration).getTime() - new Date(b.registration).getTime();
    });
  
    // Crear objeto con la distribución
    const distribution = sortedProviders.reduce((acc, provider) => {
      const date = new Date(provider.registration);
      // Formatear la fecha como "MMM YYYY" (ej: "Nov 2024")
      const monthYear = date.toLocaleDateString('es', { 
        month: 'short', 
        year: 'numeric'
      });
      
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  
    // Ordenar las entradas por fecha
    return Object.fromEntries(
      Object.entries(distribution).sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
    );
  }

  // PROVEEDORES MAS ANTIGUOS
  // Calc tiempo activo
  private calculateTimeActive(registrationDate: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - registrationDate.getTime());
    const years = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (years > 0) {
      return `${years} año${years > 1 ? 's' : ''} ${months} mes${months > 1 ? 'es' : ''}`;
    }
    return `${months} mes${months > 1 ? 'es' : ''}`;
  }

  private calculateTopProviders(): void {
    // Filtrar solo proveedores activos
    const activeProviders = this.providerList
      .filter(provider => provider.enabled)
      .map(provider => ({
        name: provider.name,
        companyName: provider.company?.name || 'Independiente',
        serviceName: provider.service?.name || 'Sin servicio',
        registrationDate: new Date(provider.registration),
        timeActive: ''
      }));
  
    // Ordenar por fecha de registro (más antiguos primero)
    activeProviders.sort((a, b) => a.registrationDate.getTime() - b.registrationDate.getTime());
  
    // Tomar los top 5 y calcular su tiempo activo
    this.topProviders = activeProviders
      .slice(0, 5)
      .map(provider => ({
        ...provider,
        timeActive: this.calculateTimeActive(provider.registrationDate)
      }));
  }
  
  // PROVEEDORES INDEPENDIENTES VS CORPORATIVOS
  // Agregar este método para calcular las métricas de independientes vs corporativos
private calculateIndependentVsCorporateMetrics(): void {
  const independentId = 1; // ID de la compañía "Independiente"
  
  // Contar proveedores activos independientes y corporativos
  const activeProviders = this.providerList.filter(p => p.enabled);
  const independentProviders = activeProviders.filter(p => p.company?.id === independentId);
  const corporateProviders = activeProviders.filter(p => p.company?.id !== independentId);

  // Actualizar métricas
  this.metrics.independentProvidersCount = independentProviders.length;
  this.metrics.corporateProvidersCount = corporateProviders.length;
  
  // Calcular porcentajes
  const total = activeProviders.length;
  this.metrics.independentPercentage = total > 0 
    ? Math.round((independentProviders.length / total) * 100) 
    : 0;
  this.metrics.corporatePercentage = total > 0 
    ? Math.round((corporateProviders.length / total) * 100) 
    : 0;

  // Actualizar datos del gráfico
  this.independentVsCorporateChartData.datasets[0].data = [
    independentProviders.length,
    corporateProviders.length
    ];
  }

  // PROVEEDORES POR SERVICIOS GROUP BY COMPANY

  // Colores para los diferentes servicios
  private getColorForIndex(index: number): string {
    // Lista de colores agradables predefinidos
    const colors = [
      '#2196F3', // Azul
      '#4CAF50', // Verde
      '#F44336', // Rojo
      '#FFC107', // Ámbar
      '#9C27B0', // Púrpura
      '#00BCD4', // Cyan
      '#FF5722', // Naranja profundo
      '#3F51B5', // Índigo
      '#E91E63', // Rosa
      '#009688', // Verde azulado
      '#673AB7', // Violeta profundo
      '#795548', // Marrón
      '#607D8B'  // Gris azulado
    ];
    
    return colors[index % colors.length];
  }

  // Método para procesar los datos
  private calculateServicesByCompany(): void {
    // Solo considerar proveedores activos
    const activeProviders = this.providerList.filter(p => p.enabled);

    // Agrupar por compañía y servicio
    const servicesByCompany: ServicesByCompany = {};
    
    activeProviders.forEach(provider => {
      const companyName = provider.company?.name || 'Sin Compañía';
      const serviceName = provider.service?.name || 'Sin Servicio';

      if (!servicesByCompany[companyName]) {
        servicesByCompany[companyName] = {};
      }
      
      servicesByCompany[companyName][serviceName] = 
        (servicesByCompany[companyName][serviceName] || 0) + 1;
    });

    // Obtener todos los servicios únicos
    const allServices = Array.from(new Set(
      activeProviders.map(p => p.service?.name || 'Sin Servicio')
    ));

    // Preparar los datos para el gráfico
    this.servicesByCompanyChartData.labels = Object.keys(servicesByCompany);
    this.servicesByCompanyChartData.datasets = allServices.map((service, index) => ({
      label: service,
      data: Object.keys(servicesByCompany).map(company => 
        servicesByCompany[company][service] || 0
      ),
      backgroundColor: this.getColorForIndex(index),
      borderColor: 'white',
      borderWidth: 1
    }));

    // Configurar opciones específicas
    if (this.chartConfigs.servicesByCompanyChart && this.chartConfigs.servicesByCompanyChart.scales) {
      this.chartConfigs.servicesByCompanyChart.scales['x'] = {
        stacked: true,
        title: {
          display: true,
          text: 'Compañías'
        }
      };
      this.chartConfigs.servicesByCompanyChart.scales['y'] = {
        stacked: true,
        title: {
          display: true,
          text: 'Cantidad de Proveedores'
        },
        ticks: {
          stepSize: 1
        }
      };
    }

    const chartConfig = this.chartConfigs.servicesByCompanyChart;
    if (!chartConfig) return;
    // Configurar plugins
    // Configurar opciones específicas
    if (chartConfig.scales) {
      chartConfig.scales['x'] = {
        stacked: true,
        title: {
          display: true,
          text: 'Compañías'
        }
      };
      chartConfig.scales['y'] = {
        stacked: true,
        title: {
          display: true,
          text: 'Cantidad de Proveedores'
        },
        ticks: {
          stepSize: 1
        }
      };
    }

  // Configurar plugins con verificación de existencia
    chartConfig.plugins = {
      ...(chartConfig.plugins || {}),  // Si plugins no existe, usar un objeto vacío
      tooltip: {
        callbacks: {
          footer: (tooltipItems: any[]) => {
            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
            return `Total: ${total} proveedores`;
          }
        }
      },
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    };
  }
  @ViewChild(ListEmpresasRegComponent) activeCompaniesModal!: ListEmpresasRegComponent;
  @ViewChild(ListProviderRegComponent) activeProvidersModal!: ListProviderRegComponent;

  openActiveCompaniesModal() {
    this.activeCompaniesModal.openModal();
  }

  openActiveProvidersModal() {
    this.activeProvidersModal.openModal();
  }

  navigateToProvidersList() {
    // Definimos los filtros que queremos aplicar
    const navigationExtras: NavigationExtras = {
      queryParams: {
        page: 0,
        size: 10,
        sort: 'registration,desc',
        enabled: 'true',
        fromDashboard: 'true'
      }
    };

    // Navegar a la lista de proveedores con los filtros
    this.route.navigate(['providers/list'], navigationExtras);
  }
}

