import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Provider, ViewChild, inject, Input } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ProvidersService } from '../../../services/providers.service';
import { Supplier } from '../../../models/suppliers/supplier.model';
import { ToastService, MainContainerComponent, TableFiltersComponent, Filter, FilterConfigBuilder } from 'ngx-dabd-grupo01';
import { debounceTime, distinctUntilChanged, finalize, forkJoin, Subject, takeUntil } from 'rxjs';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ProviderDashboardInfoComponent } from './provider-dashboard-info/provider-dashboard-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseChartDirective } from 'ng2-charts';
import { Company } from '../../../models/suppliers/company.model';
import { Service } from '../../../models/suppliers/service.model';

import { TopProvider, ServicesByCompany } from '../../../models/suppliers/chart-objects.model';

import { NavigationExtras, Router } from '@angular/router';
import { ListEmpresasRegComponent } from "../dashboards/list-empresas-reg/list-empresas-reg.component";
import { ListProviderRegComponent } from "../dashboards/list-provider-reg/list-provider-reg.component";

interface ChartData<T extends string> {
  labels?: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

interface ServicesByCompanyData {
  [company: string]: {
    [service: string]: number;
  };
}

interface DatasetConfig {
  label: string;
  data: number[];
  backgroundColor: string;
}


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
    ListProviderRegComponent,
    ReactiveFormsModule,TableFiltersComponent
],
  providers: [DecimalPipe,DatePipe],
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.css']
})
export class ProviderDashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private destroy$ = new Subject<void>();
  isUpdating = false;
// Instancia de DatePipe
private datePipe: DatePipe = new DatePipe('en-US');
// Método para formatear fechas
private formatDate(date: Date): string {
  if (isNaN(date.getTime())) {
    console.error('Fecha inválida proporcionada a formatDate:', date);
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

applyDateFilters(event: { startDate?: string | Date; endDate?: string | Date; enabled?: string }): void {
  const dateFilter = {
    start: event.startDate ? this.formatDate(new Date(event.startDate)) : undefined,
    end: event.endDate ? this.formatDate(new Date(event.endDate)) : undefined,
    state: this.filterForm.get('enabled')?.value || '' // Toma el valor del formulario
  };

  console.log('Filtros aplicados desde dashboard:', dateFilter);
  // Llama al método para obtener proveedores con los filtros formateados
  this.getProvidersWithFilters(dateFilter);
}




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
 //FILTROS NUEVOS
 filterConfig: Filter[] = new FilterConfigBuilder()
 .dateFilter('Fecha desde', 'startDate', 'Seleccione una fecha')
 .dateFilter('Fecha hasta', 'endDate', 'Seleccione una fecha')
 .build();

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
  isLoading: boolean = false;
  ngOnInit(): void {
    //this.getProviders();
    this.loadInitialData();
    //this.getAllProviders();
    //this.getCompany();
    //this.getServices();

  }

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
      //borderRadius: 5 // Bordes redondeados para las barras
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

  public LimpiarGraficos() : void {
    this.filterForm.reset(); // Restablecer el formulario de fecha
    this.getAllProviders(); // Cargar todos los proveedores
    this.toastService.sendSuccess('Dashboard restablecido correctamente');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //----------------------------------------

  private loadInitialData(): void {
    this.isLoading = true;
  
    forkJoin({
      providers: this.providerService.getProviderDashboard(),
      companies: this.providerService.getCompany(),
      services: this.providerService.getServices()
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        // Extrae el contenido de la respuesta paginada
        if (data.providers && Array.isArray(data.providers.content)) {
          this.providerList = data.providers.content; // Solo asigna el contenido
        } else {
          console.error('Estructura inesperada en providers:', data.providers);
          this.providerList = []; // Asignar un array vacío en caso de error
        }
  
        this.companies = data.companies;
        this.services = data.services;
  
        this.calculateMetrics();
        this.updateAllCharts();
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.toastService.sendError('Error al cargar los datos iniciales');
      }
    });
  }
  

  // New method to handle filter application

  
  private getProvidersWithFilters(dateFilter?: { start?: string; end?: string; state?: string }): void {
    this.providerService.getProviderDashboard(dateFilter).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.content)) {
          console.log('Respuesta del backend con filtros aplicados:', response);
          this.providerList = response.content; // Accede directamente al contenido
          this.calculateMetrics();
          this.updateAllCharts();
        } else {
          console.error('La respuesta no tiene un campo content válido:', response);
          this.providerList = [];
          this.toastService.sendError('Error en la estructura de los datos del backend.');
        }
      },
      error: (error) => {
        console.error('Error al cargar proveedores con filtros:', error);
        this.toastService.sendError('Error al aplicar filtros en proveedores.');
      }
    });
  }
  
  

  private updateAllCharts(): void {
    this.chart?.update();
    this.updateCompanyChart();
    this.updateMonthlyRegistrationChart();
    this.updateIndependentVsCorporateChart();

  }
  
  private updateCompanyChart(): void {
    if (!this.companyBarChartData?.datasets?.[0]) return;
    
    const companyDistribution = this.getCompanyDistributionn(this.providerList);
    this.companyBarChartData.labels = Object.keys(companyDistribution);
    this.companyBarChartData.datasets[0].data = Object.values(companyDistribution);
  }
  
  private updateMonthlyRegistrationChart(): void {
    if (!this.monthlyRegistrationChartData?.datasets?.[0]) return;
    
    const monthlyDistribution = this.getMonthlyRegistrationDistributionn(this.providerList);
    this.monthlyRegistrationChartData.labels = Object.keys(monthlyDistribution);
    this.monthlyRegistrationChartData.datasets[0].data = Object.values(monthlyDistribution);
  }
  
  private updateServicesByCompanyChart(): void {
    if (!this.servicesByCompanyChartData?.datasets) return;
    
    const servicesByCompany = this.calculateServicesByCompany(this.providerList);
    if (!servicesByCompany) return;
    
    const { labels, datasets } = this.createServicesByCompanyDatasets(servicesByCompany);
    this.servicesByCompanyChartData.labels = labels;
    this.servicesByCompanyChartData.datasets = datasets;
  }
  
  private calculateServicesByCompany(providers: Supplier[]): ServicesByCompanyData {
    const servicesByCompany: ServicesByCompanyData = {};
  
    // Agrupar proveedores por compañía y servicio
    providers.forEach(provider => {
      const companyName = provider.company?.name || 'Independiente';
      const serviceName = provider.service?.name || 'Sin servicio';
  
      if (!servicesByCompany[companyName]) {
        servicesByCompany[companyName] = {};
      }
  
      if (!servicesByCompany[companyName][serviceName]) {
        servicesByCompany[companyName][serviceName] = 0;
      }
  
      servicesByCompany[companyName][serviceName]++;
    });
  
    return servicesByCompany;
  }
  private createServicesByCompanyDatasets(servicesByCompany: ServicesByCompanyData): {
    labels: string[];
    datasets: DatasetConfig[];
  } {
    // Obtener lista única de compañías y servicios
    const companies = Object.keys(servicesByCompany);
    const services = new Set<string>();
    
    companies.forEach(company => {
      Object.keys(servicesByCompany[company]).forEach(service => {
        services.add(service);
      });
    });
  
    // Crear datasets para cada servicio
    const datasets = Array.from(services).map((service, index) => {
      const data = companies.map(company => 
        servicesByCompany[company][service] || 0
      );
  
      return {
        label: service,
        data: data,
        backgroundColor: this.getColorForIndex(index)
      };
    });
  
    return {
      labels: companies,
      datasets: datasets
    };
  }
  
  private updateIndependentVsCorporateChart(): void {
    if (!this.independentVsCorporateChartData?.datasets?.[0]) return;
    
    this.calculateIndependentVsCorporateMetricss(this.providerList);
    this.independentVsCorporateChartData.datasets[0].data = [
      this.metrics.independentProvidersCount,
      this.metrics.corporateProvidersCount
    ];
  }

  constructor(
    private fb: FormBuilder,
    private providerService: ProvidersService,
    private toastService: ToastService,
    private modalService: NgbModal,
    private changeDetector: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      enabled: ['']
    });
    this.providerList = [];
    this.initializeForm();
    this.setupSearchFilter();
    //this.setupDateFilter();
    this.initializeChartConfigs();
  }

  private initializeChartConfigs(): void {
    this.chartConfigs.companyBarChart = this.getChartConfig('bar', 'Proveedores por Compañía', true);
    this.chartConfigs.monthlyRegistrationChart = this.getChartConfig('bar', 'Registro Mensual de Proveedores', true);
    this.chartConfigs.independentVsCorporateChart = this.getChartConfig('doughnut', 
      'Distribución de Proveedores', 
      false, 
      'right'
    );
    this.chartConfigs.servicesByCompanyChart = this.getChartConfig('bar', 'Distribución de Servicios por Compañía', true);
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
    this.providerService.getProviderDashboard().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.providerList = response;
        } else {
          console.error('La respuesta no es un array:', response);
          this.providerList = [];
        }
        this.calculateMetrics();
        this.dataLoaded = true;
        
        if (this.chartsInitialized) {
          this.updateAllCharts();
        } else if (this.chart) {
          this.initializeCharts();
        }
        
        this.changeDetector.detectChanges();
        this.forceReloadChart(this.chart);
      },
      error: () => {
        this.toastService.sendError('Error al cargar proveedores.');
        this.providerList = [];
      }
    });
  }
  private forceReloadChart(chartDirective: BaseChartDirective | undefined): void {
    if (chartDirective?.chart) {
      chartDirective.chart.destroy();
      chartDirective.chart = undefined;
    }
  
    setTimeout(() => {
      chartDirective?.update();
    }, 0);
  }
  
  getServices(): void {
    this.providerService.getServices().subscribe({
      next: (response) => {
        this.services = response;
        this.calculateMetrics();
        this.updateChartsWithNewData(this.providerList);
      },
      error: () => {
        this.toastService.sendError('Error al cargar servicios.');
      }
    });
  }


  private initializeForm(): void {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
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
        this.updateAllCharts();
      },
      error: () => {
        this.toastService.sendError('Error al cargar proveedores.');
      }
    });
  }
  

  private calculateMetrics(): void {
    const metrics = this.metrics;
  
    if (!Array.isArray(this.providerList)) {
      console.error('providerList no es un array:', this.providerList);
      this.providerList = []; // Inicializar como array vacío si no es un array
      return;
    }
  
    // Obtener fechas del filtro
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
  
    // Lista de proveedores filtrada por fecha si hay filtros activos
    let filteredProviders = [...this.providerList]; // Crear una copia del array
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredProviders = filteredProviders.filter(provider => {
        const regDate = new Date(provider.registration);
        return regDate >= start && regDate <= end;
      });
    }
  
    // Cálculo de proveedores activos e inactivos con la lista filtrada
    metrics.activeCount = filteredProviders.filter(p => p.enabled).length;
    metrics.inactiveCount = filteredProviders.length - metrics.activeCount;
  
    // Cálculo del porcentaje de activación
    metrics.activationRate = filteredProviders.length > 0
      ? Math.round((metrics.activeCount / filteredProviders.length) * 100)
      : 0;
  
    // Cálculo de empresas únicas en el período
    const uniqueCompanies = new Set(
      filteredProviders
        .map(p => p.company?.name)
        .filter(Boolean)
    );
    metrics.uniqueCompaniesCount = uniqueCompanies.size;
  
    // Cálculo de empresas activas e inactivas
    const companiesInPeriod = this.companies.filter(company => {
      if (!startDate || !endDate) return true;
      const companyDate = new Date(company.registration);
      return companyDate >= new Date(startDate) && companyDate <= new Date(endDate);
    });
  
    metrics.activeCompaniesCount = companiesInPeriod.filter(c => c.enabled).length;
    metrics.inactiveCompaniesCount = companiesInPeriod.length - metrics.activeCompaniesCount;
  
    // Cálculo del porcentaje de activación de empresas
    metrics.companiesActivationRate = companiesInPeriod.length > 0
      ? Math.round((metrics.activeCompaniesCount / companiesInPeriod.length) * 100)
      : 0;
  
    // Calcular métricas de crecimiento mensual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
  
    // Proveedores del mes actual dentro del rango de fechas
    const currentMonthProviders = filteredProviders.filter(provider => {
      const regDate = new Date(provider.registration);
      return regDate.getMonth() === currentMonth &&
             regDate.getFullYear() === currentYear;
    });
  
    // Proveedores del mes anterior dentro del rango de fechas
    const previousMonthProviders = filteredProviders.filter(provider => {
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
      ? Math.round(((currentMonthProviders.length - previousMonthProviders.length) / previousMonthProviders.length) * 100)
      : currentMonthProviders.length > 0 ? 100 : 0;
  
    // Actualizar top providers
    this.calculateTopProviderss(filteredProviders);
  
    // Forzar actualización de gráficos
    this.updateChartsWithNewData(filteredProviders);
  }
  
  private getProvidersCountByService(serviceName: string, providers: Supplier[]): number {
    return providers.filter(p => 
      p.service?.name?.toLowerCase() === serviceName.toLowerCase()
    ).length;
  }

  private calculateTopProviderss(providers: Supplier[]): void {
    const activeProviders = providers
      .filter(provider => provider.enabled)
      .map(provider => ({
        name: provider.name,
        companyName: provider.company?.name || 'Independiente',
        serviceName: provider.service?.name || 'Sin servicio',
        registrationDate: new Date(provider.registration),
        timeActive: ''
      }));

    activeProviders.sort((a, b) => a.registrationDate.getTime() - b.registrationDate.getTime());

    this.topProviders = activeProviders
      .slice(0, 5)
      .map(provider => ({
        ...provider,
        timeActive: this.calculateTimeActive(provider.registrationDate)
      }));
  }

  private updateChartsWithNewData(filteredProviders: Supplier[]): void {
    if (!filteredProviders.length) return;

    const metrics = this.metrics;
    
    // Actualizar gráfico de torta

    
    // Actualizar gráfico de barras de servicios
    const serviceDistribution = this.getServiceDistributionn(filteredProviders);


    // Actualizar gráfico de dona

    // Actualizar gráfico de barras horizontal


    // Actualizar gráfico de compañías
    const companyDistribution = this.getCompanyDistributionn(filteredProviders);
    this.companyBarChartData.labels = Object.keys(companyDistribution);
    this.companyBarChartData.datasets[0].data = Object.values(companyDistribution);

    // Actualizar gráfico de registro mensual
    const monthlyDistribution = this.getMonthlyRegistrationDistributionn(filteredProviders);
    this.monthlyRegistrationChartData.labels = Object.keys(monthlyDistribution);
    this.monthlyRegistrationChartData.datasets[0].data = Object.values(monthlyDistribution);

    // Actualizar métricas de independientes vs corporativos
    this.calculateIndependentVsCorporateMetricss(filteredProviders);

    // Actualizar servicios por compañía
    this.calculateServicesByCompanyy(filteredProviders);

    // Forzar actualización de gráficos
    if (this.chart) {
      this.chart.update();
    }

    // Forzar detección de cambios
    this.changeDetector.detectChanges();
  }

  // Métodos auxiliares para distribuciones
  private getServiceDistributionn(providers: Supplier[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    providers.forEach(provider => {
      const serviceName = provider.service?.name || 'Sin servicio';
      distribution[serviceName] = (distribution[serviceName] || 0) + 1;
    });
    return distribution;
  }

  private getCompanyDistributionn(providers: Supplier[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    providers.forEach(provider => {
      const companyName = provider.company?.name || 'Independiente';
      distribution[companyName] = (distribution[companyName] || 0) + 1;
    });
    return distribution;
  }

  private getMonthlyRegistrationDistributionn(providers: Supplier[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    providers.forEach(provider => {
      const date = new Date(provider.registration);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      distribution[monthYear] = (distribution[monthYear] || 0) + 1;
    });
    
    return distribution;
  }

  private getZoneDistributionn(providers: Supplier[]): number[] {
    // Mapa para agrupar proveedores por zona
    const zoneMap: { [key: string]: number } = {
      'Norte': 0,
      'Sur': 0,
      'Este': 0,
      'Oeste': 0,
      'Centro': 0
    };

    providers.forEach(provider => {
      // Lógica para determinar la zona basada en la dirección
      const zone = this.determineZone(provider.address);
      if (zone && zone in zoneMap) {
        zoneMap[zone]++;
      }
    });

    // Retornar array con los conteos en el orden deseado
    return [
      zoneMap['Norte'],
      zoneMap['Sur'],
      zoneMap['Este'],
      zoneMap['Oeste'],
      zoneMap['Centro']
    ];
  }

  private determineZone(address: string): string {
    // Simplifica la dirección para el análisis
    const normalizedAddress = address?.toLowerCase() || '';
    
    // Define palabras clave para cada zona
    if (normalizedAddress.includes('norte')) return 'Norte';
    if (normalizedAddress.includes('sur')) return 'Sur';
    if (normalizedAddress.includes('este')) return 'Este';
    if (normalizedAddress.includes('oeste')) return 'Oeste';
    if (normalizedAddress.includes('centro')) return 'Centro';
    
    // Si no se puede determinar, asignar al Centro por defecto
    return 'Centro';
  }

  private calculateIndependentVsCorporateMetricss(providers: Supplier[]): void {
    const independentId = 1;

    this.metrics.independentProvidersCount = providers.filter(p => p.company?.id === independentId).length;
    this.metrics.corporateProvidersCount = providers.filter(p => p.company?.id !== independentId).length;
    
    const total = providers.length;
    this.metrics.independentPercentage = total > 0 
      ? Math.round((this.metrics.independentProvidersCount / total) * 100)
      : 0;
    this.metrics.corporatePercentage = total > 0 
      ? Math.round((this.metrics.corporateProvidersCount / total) * 100)
      : 0;

    this.independentVsCorporateChartData.datasets[0].data = [
      this.metrics.independentProvidersCount,
      this.metrics.corporateProvidersCount
    ];
  }

  private calculateServicesByCompanyy(providers: Supplier[]): void {
    // Crear estructura para almacenar servicios por compañía
    const servicesByCompany: { [key: string]: { [service: string]: number } } = {};
    
    // Procesar cada proveedor
    providers.forEach(provider => {
      const companyName = provider.company?.name || 'Independiente';
      const serviceName = provider.service?.name || 'Sin servicio';
      
      // Inicializar compañía si no existe
      if (!servicesByCompany[companyName]) {
        servicesByCompany[companyName] = {};
      }
      
      // Incrementar contador de servicio para esta compañía
      servicesByCompany[companyName][serviceName] = 
        (servicesByCompany[companyName][serviceName] || 0) + 1;
    });

    // Preparar datos para el gráfico
    const labels = Object.keys(servicesByCompany);
    const datasets = this.prepareServiceDatasets(servicesByCompany);

    // Actualizar datos del gráfico de servicios por compañía
    if (this.servicesByCompanyChartData) {
      this.servicesByCompanyChartData.labels = labels;
      this.servicesByCompanyChartData.datasets = datasets;
    }
  }

  private prepareServiceDatasets(servicesByCompany: { [key: string]: { [service: string]: number } }): any[] {
    // Obtener lista única de servicios
    const allServices = new Set<string>();
    Object.values(servicesByCompany).forEach(companyServices => {
      Object.keys(companyServices).forEach(service => allServices.add(service));
    });

    // Crear dataset para cada servicio
    return Array.from(allServices).map((service, index) => {
      const data = Object.keys(servicesByCompany).map(company => 
        servicesByCompany[company][service] || 0
      );

      return {
        label: service,
        data: data,
        backgroundColor: this.getColorForIndex(index), // Método que debes tener para obtener colores
        borderColor: this.getColorForIndex(index),
        borderWidth: 1
      };
    });
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

    
    // Update bar chart
    const serviceDistribution = this.getServiceDistribution();



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
    this.calculateServicesByCompanys();


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
  private calculateServicesByCompanys(): void {
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
    this.route.navigate(['/inventories/providers/list'], navigationExtras);
  }
}
