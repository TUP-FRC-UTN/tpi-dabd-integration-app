import { Component, OnInit, ViewChild, ElementRef, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Chart, ChartType, registerables } from 'chart.js';
import { ToastService, MainContainerComponent, TableFiltersComponent, Filter, FilterConfigBuilder } from 'ngx-dabd-grupo01';
import { forkJoin, map } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Employee, EmployeeType, StatusType, EmployeePayment } from '../../../models/employee.model';
import { EmployeesService } from '../../../services/employees.service';
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeDashboardInfoComponent } from './employe-dashboard-info/employee-dashboard-info.component';
import { ChartDataset, ChartOptions } from 'chart.js';
import { ActiveEmployeesModalComponent } from './employee-enabled-modal/employee-enabled-modal.component';
import { EmployeeRecentHireModalComponent } from './employee-recent-hire-modal/employee-recent-hire-modal.component';

Chart.register(...registerables);
interface DateRange {
  label: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [MainContainerComponent, CommonModule, ReactiveFormsModule,TableFiltersComponent],
  providers: [DecimalPipe,DatePipe],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('salaryChart') salaryChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('employeeCategoryChartRef') employeeCategoryChartRef!: ElementRef;

  // KPI Variables
  employeeList: Employee[] = [];
  employeesHiredLastMonth: number = 0;
  inServiceCount: number = 0;
  inactiveCount: number = 0;
  averageSalary: number = 0;
  totalPayroll: number = 0;
  employeesByType: Map<string, number> = new Map();
  retentionRate: number = 0;
  avgTenure: number = 0;
  private dataLoaded = false;
  //Barra Progreso
  activeEmployeesCount: number = 0;
  inactiveEmployeesCount: number = 0;
  employeesActivationRate: number = 0;
  employeesGrowthCount: number = 0;
  employeesGrowthRate: number = 0;
  isNegativeTrend: boolean = false;
  previousActiveEmployeesCount: number = 0;
  // Form Controls
  filterForm: FormGroup;
  searchFilterAll = new FormControl('');
  
  //Filtrado graficos
  showDropdown = false;
  selectedPeriod: string = '7';
  fromDate: string | null = null;
  toDate: string | null = null;
  chartData: any[] = []; // Datos actuales para los gráficos
  isLoading: boolean = false; // Añadir esta propiedad para evitar el error
  dateFilterForm: FormGroup;
  predefinedRanges: DateRange[] = [];
  //FILTROS NUEVOS
  filterConfig: Filter[] = new FilterConfigBuilder()
  .selectFilter('Estado', 'enabled', 'Seleccione un Estado', [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Activo' },
    { value: 'false', label: 'Inactivo' },
  ])
  .dateFilter('Fecha desde', 'startDate', 'Seleccione una fecha')
  .dateFilter('Fecha hasta', 'endDate', 'Seleccione una fecha')
  .build();

  // Charts
  charts: any = {};
  employeeTypesBar = Object.values(EmployeeType);
  employeeTypeCountMap: { [key: string]: number } = {};
  employeeCategoryData: { [key: string]: number } = {};
  
  
  // Chart Config
  pieChartEmployeeStatusLabels: string[] = ['En Servicio', 'Inactivo'];
  pieChartEmployeeStatusDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      backgroundColor: ['#28a745', '#dc3545']
    }
  ];

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  };

  // Service Injections
  private employeesService = inject(EmployeesService);
  private toastService = inject(ToastService);
  private mapperService = inject(MapperService);
  private modalService = inject(NgbModal);

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // Inicializar rangos predefinidos
    this.initializePredefinedRanges();

    // Mantener el filterForm existente
    this.filterForm = this.fb.group({
      name: [''],
      cuil: [''],
      'service.name': [''],
      'company.name': [''],
      contact: [''],
      enabled: ['']
    });

    // Agregar el nuevo dateFilterForm
    this.dateFilterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      selectedRange: ['']
    });

    // Mantener searchFilterAll existente
    this.searchFilterAll.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(searchTerm => {
      const filters = {
        ...this.getFilters(), // Obtén otros filtros existentes
        name: searchTerm || null, // Agrega el filtro de búsqueda por nombre
      };
  
      console.log('Filtros enviados desde búsqueda:', filters);
  
      // Llama al método actualizado
      this.getEmployeesWithFilters(filters);
    });
  

    // Agregar suscripción a cambios en filtros de fecha

  }

  ngOnInit(): void {
    // Solo cargamos los datos una vez
    if (!this.dataLoaded) {
      this.loadEmployeeData();
    }
  }
  // FILTROS NUEVOS
  private mapStateToBackend(state: string): string | null {
    if (state === 'true') return 'IN_SERVICE';
    if (state === 'false') return 'DOWN';
    return null; // Cuando no hay estado seleccionado
  }
  
  filterChange(filters: Record<string, any>): void {
    console.log('Filtros recibidos del componente:', filters);
  
    const { startDate, endDate, enabled } = filters;
  
    // Mapear `enabled` a `state`
    const state = this.mapStateToBackend(enabled);
  
    // Construye los filtros combinando fechas y estado
    const updatedFilters = {
      ...this.getFilters(), // Obtén otros filtros existentes
      startDate: startDate || null,
      endDate: endDate || null,
      state, // Agrega el estado mapeado
    };
  
    console.log('Filtros enviados al backend:', updatedFilters);
  
    // Llama al método con los filtros actualizados
    this.getEmployeesWithFilters(updatedFilters);
  }
  
  
  
  
  applyDateFilters(filterValues: any): void {
    console.log('Valores del filtro recibidos:', filterValues);
  
    // Mapea el estado recibido al valor esperado por el backend
    const state = this.mapStateToBackend(filterValues.enabled);
  
    // Actualiza el formulario de fecha
    this.dateFilterForm.patchValue({
      startDate: filterValues.startDate,
      endDate: filterValues.endDate,
    });
  
    const dateFilters = this.getDateFilters();
    console.log('Fechas seleccionadas después de aplicar filtros:', dateFilters);
  
    // Construimos los filtros a enviar al backend
    const filters = {
      ...dateFilters,
      state, // Incluimos el estado mapeado
    };
  
    // Validar si las fechas son correctas
    if (!dateFilters.startDate && !dateFilters.endDate) {
      console.log('No se seleccionaron fechas, cargando todos los empleados con estado...');
      this.getEmployeesWithFilters({ state }); // Solo se envía el estado
    } else if (dateFilters.startDate && dateFilters.endDate) {
      console.log('Se seleccionaron fechas, aplicando filtro de estado y fechas...');
      this.getEmployeesWithFilters(filters); // Se envían estado y fechas
    } else {
      this.toastService.sendError('Por favor, selecciona fechas válidas para aplicar el filtro.');
    }
  }
  
  
  // Nuevo método para obtener empleados con filtro de fecha
  getEmployeesWithFilters(filters: any): void {
    console.log('Filtros enviados al backend:', filters);
  
    this.employeesService.getAllEmployeesDashboard(filters).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
  
        if (!response || response.length === 0) {
          // Mostrar mensaje si no se encontraron empleados
          this.toastService.sendError('No se encontraron empleados para los filtros seleccionados.');
  
          // Cargar todos los empleados nuevamente
          this.loadEmployeeData();
          return;
        }
  
        // Si hay datos, actualizar la lista de empleados y métricas
        this.employeeList = response;
        this.calculateMetrics();
        this.updateCharts();
      },
      error: (error) => {
        console.error('Error al cargar empleados:', error);
        this.toastService.sendError('Error al cargar empleados.');
      },
    });
  }
  

  
  
  // getEmployeesWithDateFilter(): void {
  //   const dateFilters = this.getDateFilters();
  //   const filters = {
  //     ...this.getFilters(),
  //     startDate: dateFilters.startDate,
  //     endDate: dateFilters.endDate,
  //   };
  
  //   console.log('Filtros enviados al backend:', filters);
  
  //   this.employeesService.getAllEmployeesPaged(0, 40, filters).subscribe({
  //     next: (response) => {
  //       console.log('Respuesta del backend:', response);
  //       // Resto del procesamiento
  //     },
  //     error: (error) => {
  //       console.error('Error al cargar empleados:', error);
  //       this.toastService.sendError('Error al cargar empleados.');
  //     },
  //   });
  // }
  
  
  private initializePredefinedRanges(): void {
    // Función auxiliar para formatear fechas en formato ISO
    const formatDateToISO = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Último mes
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);

    // Últimos 3 meses
    const last3Months = new Date(today);
    last3Months.setMonth(last3Months.getMonth() - 3);
    last3Months.setHours(0, 0, 0, 0);

    // Últimos 6 meses
    const last6Months = new Date(today);
    last6Months.setMonth(last6Months.getMonth() - 6);
    last6Months.setHours(0, 0, 0, 0);

    // Último año
    const lastYear = new Date(today);
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    lastYear.setHours(0, 0, 0, 0);

    this.predefinedRanges = [
      {
        label: 'Último mes',
        startDate: formatDateToISO(lastMonth),
        endDate: formatDateToISO(today)
      },
      {
        label: 'Últimos 3 meses',
        startDate: formatDateToISO(last3Months),
        endDate: formatDateToISO(today)
      },
      {
        label: 'Últimos 6 meses',
        startDate: formatDateToISO(last6Months),
        endDate: formatDateToISO(today)
      },
      {
        label: 'Último año',
        startDate: formatDateToISO(lastYear),
        endDate: formatDateToISO(today)
      }
    ];
  }
  // Método para convertir fecha local a UTC
  private toUTCDate(dateStr: string): Date {
    const date = new Date(dateStr);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }

  // Método para convertir LocalDateTime string a Date
  private parseLocalDateTime(dateTimeStr: string): Date {
    // Asumiendo que el formato es "YYYY-MM-DDTHH:mm:ss"
    return new Date(dateTimeStr);
  }

  
  

  public LimpiarGraficos() : void {
    this.dateFilterForm.reset(); // Restablecer el formulario de fecha
     this.loadEmployeeData();
  }
  

  // Nuevo método para actualizar los gráficos con datos filtrados
  private updateChartsWithFilteredData(): void {
    this.pieChartEmployeeStatusDatasets[0].data = [this.inServiceCount, this.inactiveCount];
    
    // Actualizar gráficos
    this.destroyExistingCharts();
    this.initializeCharts();

    // Detectar cambios
    this.cdr.detectChanges();
  }

  // Método para obtener filtros de fecha
  private getDateFilters(): { startDate: string | null; endDate: string | null } {
    const { startDate, endDate } = this.dateFilterForm.value;
  
    console.log('Valores del formulario de fechas:', { startDate, endDate });
  
    return {
      startDate: startDate ? this.formatDateWithoutMilliseconds(startDate) : null,
      endDate: endDate ? this.formatDateWithoutMilliseconds(endDate) : null,
    };
  }
  
  // Nuevo método para formatear fechas
  private formatDateWithoutMilliseconds(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Agrega el 0 si es necesario
    const day = String(date.getDate()).padStart(2, '0'); // Agrega el 0 si es necesario
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
  
  
  // Método para aplicar rango predefinido
  applyPredefinedRange(range: DateRange): void {
    this.dateFilterForm.patchValue({
      startDate: range.startDate,
      endDate: range.endDate,
      selectedRange: range.label
    });
  }
  

  // Sobrescribir calculateMetrics para considerar las fechas
  private updateEmployeeTypeCountMap(): void {
    this.employeeTypeCountMap = {};
    Object.values(EmployeeType).forEach(type => {
      this.employeeTypeCountMap[type] = 0;
    });

    this.employeeList.forEach(employee => {
      if (employee.employeeType) {
        this.employeeTypeCountMap[employee.employeeType] = 
          (this.employeeTypeCountMap[employee.employeeType] || 0) + 1;
      }
    });

    // Actualizar también el Map de employeesByType
    this.employeesByType.clear();
    Object.entries(this.employeeTypeCountMap).forEach(([type, count]) => {
      this.employeesByType.set(type, count);
    });
  }

  private calculateFinancialMetrics(): void {
    this.averageSalary = this.employeeList.reduce((acc, emp) => acc + emp.salary, 0) / this.employeeList.length;
    this.totalPayroll = this.employeeList.reduce((acc, emp) => acc + emp.salary, 0);
    this.retentionRate = (this.inServiceCount / this.employeeList.length) * 100;
    this.avgTenure = this.calculateAverageTenure();
  }
  // fin de nuevo filtro fecha
  ngAfterViewInit(): void {
    // Aseguramos que los gráficos se inicialicen cuando haya datos
    this.cdr.detectChanges();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  applyFilter() {
    this.isLoading = true;
    const selectedPeriod = this.filterForm.get('selectedPeriod')?.value;
    const fromDate = this.filterForm.get('fromDate')?.value;
    const toDate = this.filterForm.get('toDate')?.value;

    // Verifica si el período seleccionado no es personalizado
    if (selectedPeriod !== 'custom') {
        const days = parseInt(selectedPeriod);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        // Llama al método de filtrado con el rango calculado
        this.getDataFilteredByDateRange(startDate, endDate);
    } else if (fromDate && toDate) {
        // Convierte las fechas a objetos Date
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);

        // Llama al método de filtrado con el rango personalizado
        this.getDataFilteredByDateRange(startDate, endDate);
    } else {
        console.warn("Fechas de rango personalizadas no establecidas correctamente");
        this.toastService.sendError("Por favor, selecciona fechas válidas para el rango personalizado.");
    }
    this.isLoading = false;
}

getDataFilteredByDateRange(startDate: Date, endDate: Date): void {
  this.employeesService.getEmployeesPageable(0, 100).subscribe(
      (response) => {
          // Filtra empleados con una fecha de contratación dentro del rango
          this.chartData = response.content.filter(employee => {
              if (!employee.hiringDate) {
                  console.warn(`Employee with ID ${employee.id} is missing hiringDate.`);
                  return false;
              }

              const employeeDate = new Date(employee.hiringDate);
              return employeeDate.getTime() >= startDate.getTime() && employeeDate.getTime() <= endDate.getTime();
          });

          if (this.chartData.length > 0) {
              this.calculateMetrics();
              this.updateCharts();
          } else {
              console.warn('No hay datos disponibles para el rango seleccionado');
              this.toastService.sendError('No hay datos disponibles para el rango seleccionado');
          }
      },
      (error) => {
          console.error('Error fetching data:', error);
          this.toastService.sendError('Error al obtener los datos.');
      }
  );
} 

  
 // Método para actualizar los gráficos
 updateCharts(): void {
  this.destroyExistingCharts();
  this.initializeCharts();
  this.cdr.detectChanges(); // Detectar cambios para forzar la actualización
}



  formatChartData(data: any[]): any {
    // Transformación de `data` para adaptarlo al formato del gráfico
    return {
      labels: data.map(item => item.name), // Ejemplo: usar nombres de empleados como etiquetas
      datasets: [
        {
          label: 'Métricas',
          data: data.map(item => item.value) // Ejemplo: el valor de cada métrica
        }
      ]
    };
  }

  loadDashboardData(): void {
    this.employeesService.getEmployees().subscribe(employees => {
      this.employeeList = employees;
      this.calculateKPIs();
      this.initializeCharts();
    });
    this.loadPayrollData();
  }

  getEmployees(searchTerm?: string): void {
    const filters = { ...this.getFilters() };
  
    if (searchTerm) {
      filters.name = searchTerm;
      filters.cuil = searchTerm;
      filters['service.name'] = searchTerm;
      filters['company.name'] = searchTerm;
      filters.contact = searchTerm;
    }
  
    this.employeesService.getAllEmployeesDashboard().subscribe({
      next: (response) => {
        this.employeeList = this.mapperService.toCamelCase(response);
        this.calculateMetrics();
        this.pieChartEmployeeStatusDatasets[0].data = [this.inServiceCount, this.inactiveCount];
        // Reinicializar los charts después de actualizar los datos
        setTimeout(() => {
          this.initializeCharts();
        });
      },
      error: () => {
        this.toastService.sendError('Error al cargar empleados.');
      }
    });
  }

  calculateKPIs(): void {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    this.inServiceCount = this.employeeList.filter(e => e.state === StatusType.ACTIVE).length;
    this.inactiveCount = this.employeeList.filter(e => e.state === StatusType.INACTIVE).length;
    
    this.employeesHiredLastMonth = this.employeeList.filter(e => {
      const hiringDate = new Date(e.hiringDate);
      return hiringDate >= lastMonth && hiringDate <= now;
    }).length;

    this.averageSalary = this.employeeList.reduce((acc, emp) => acc + emp.salary, 0) / this.employeeList.length;
    this.totalPayroll = this.employeeList.reduce((acc, emp) => acc + emp.salary, 0);
    this.retentionRate = (this.inServiceCount / this.employeeList.length) * 100;
    this.avgTenure = this.calculateAverageTenure();
    this.calculateEmployeesByType();
  }

  calculateMetrics(): void {
    this.inServiceCount = this.employeeList.filter(e => e.state === 'IN_SERVICE').length;
    this.inactiveCount = this.employeeList.filter(e => e.state === 'DOWN').length;

    // Reiniciar el mapa de conteo por tipo
    this.employeeTypeCountMap = {};
    Object.values(EmployeeType).forEach(type => {
        this.employeeTypeCountMap[type] = 0;
    });

    this.employeeList.forEach(employee => {
        if (employee.employeeType) {
            this.employeeTypeCountMap[employee.employeeType] = 
                (this.employeeTypeCountMap[employee.employeeType] || 0) + 1;
        }
    });

    // Actualizar también el Map de employeesByType
    this.employeesByType.clear();
    Object.entries(this.employeeTypeCountMap).forEach(([type, count]) => {
        this.employeesByType.set(type, count);
    });

    //Barra de progreso de empleados
    // Calculo de porcentaje de empleados activos
    this.employeesActivationRate = this.employeeList.length > 0
      ? Math.round((this.inServiceCount / this.employeeList.length) * 100)
      : 0;

    // porcentaje de crecimiento de empleados
    this.employeesGrowthCount = this.inServiceCount - this.previousActiveEmployeesCount;
    this.employeesGrowthRate = this.previousActiveEmployeesCount > 0
      ? Math.round(((this.inServiceCount - this.previousActiveEmployeesCount) / this.previousActiveEmployeesCount) * 100)
      : this.inServiceCount > 0 ? 100 : 0;

    // Verificar si hay una tendencia negativa
    this.isNegativeTrend = this.inactiveCount > this.inServiceCount;

    // Calcular otros KPIs
    if (this.employeeList.length > 0) {
        this.averageSalary = this.employeeList.reduce((acc, emp) => acc + emp.salary, 0) / this.employeeList.length;
        this.totalPayroll = this.employeeList.reduce((acc, emp) => acc + emp.salary, 0);
        this.retentionRate = (this.inServiceCount / this.employeeList.length) * 100;
        this.avgTenure = this.calculateAverageTenure();
    } else {
        this.averageSalary = 0;
        this.totalPayroll = 0;
        this.retentionRate = 0;
        this.avgTenure = 0;
    }
}



  calculateAverageTenure(): number {
    const now = new Date();
    const tenures = this.employeeList.map(emp => {
      const hiringDate = new Date(emp.hiringDate);
      return (now.getTime() - hiringDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    });
    return tenures.reduce((acc, curr) => acc + curr, 0) / tenures.length;
  }

  calculateEmployeesByType(): void {
    Object.values(EmployeeType).forEach(type => {
      const count = this.employeeList.filter(emp => emp.employeeType === type).length;
      this.employeesByType.set(type, count);
    });
  }

  loadPayrollData(): void {
    const paymentRequests = this.employeeList.map(emp => 
      this.employeesService.getEmployeePayments(emp.id)
    );

    forkJoin(paymentRequests).subscribe(allPayments => {
      this.initializePayrollChart(allPayments.flat());
    });
  }

  private getFilters(): any {
    const formValues = this.filterForm.value;
    const filters: any = {};

    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      if (value !== '' && value !== null && value !== undefined) {
        filters[key] = value;
      }
    });

    return filters;
  }

  showInfo(): void {
    this.modalService.open(EmployeeDashboardInfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });
  }

  initializeCharts(): void {
    if (this.barChart && this.lineChart) {

      if (Chart.getChart(this.barChart.nativeElement)) {
        Chart.getChart(this.barChart.nativeElement)?.destroy();
      }
      if (Chart.getChart(this.lineChart.nativeElement)) {
        Chart.getChart(this.lineChart.nativeElement)?.destroy();
      }
  
      this.initializeEmployeeTypeChart();
      this.initializeTenureDistributionChart();
    }
  }


  createBarChart(): void {
    if (!this.barChart) return;
    
    const existingChart = Chart.getChart(this.barChart.nativeElement);
    if (existingChart) {
      existingChart.destroy();
    }
  
    const labels = Object.keys(this.employeeTypeCountMap);
    const data = Object.values(this.employeeTypeCountMap);
  
    new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad de Empleados por Tipo',
          data: data,
          backgroundColor: '#007bff',
          borderColor: '#0056b3',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Distribución de Empleados por Tipo'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad de Empleados'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Tipo de Empleado'
            }
          }
        }
      }
    });
  }
  
  initializeEmployeeTypeChart(): void {
    if (!this.barChart?.nativeElement) return;

    // Destruir el gráfico existente si hay uno
    if (this.charts.barChart) {
      this.charts.barChart.destroy();
    }

    const data = Array.from(this.employeesByType.entries());
    
    this.charts.barChart = new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(([type]) => type),
        datasets: [{
          label: 'Cantidad de Empleados',
          data: data.map(([, count]) => count),
          backgroundColor: [
            '#FF9800',
            '#2196F3',
            '#4CAF50',
            '#9C27B0'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Empleados por Tipo'
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad de Empleados'
            }
          }
        }
      }
    });
}

initializeTenureDistributionChart(): void {
  if (!this.lineChart?.nativeElement) return;

  const ctx = this.lineChart.nativeElement.getContext('2d');
  if (!ctx) return;

  const tenureRanges = this.calculateTenureRanges(); // Datos para el gráfico

  // Destruye cualquier gráfico existente en el canvas
  if (this.charts.lineChart) {
    this.charts.lineChart.destroy();
  }

  this.charts.lineChart = new Chart(ctx, {
    type: 'bar', // Cambiamos el tipo de gráfico a 'bar'
    data: {
      labels: ['0-1 año', '1-2 años', '2-5 años', '5+ años'], // Etiquetas del eje X
      datasets: [{
        label: 'Distribución de Antigüedad',
        data: tenureRanges, // Datos para cada rango
        backgroundColor: ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0'], // Colores de las barras
        borderColor: ['#E65100', '#0D47A1', '#1B5E20', '#4A148C'], // Colores del borde
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Distribución de Antigüedad',
        },
        legend: {
          display: false, // Ocultar la leyenda si no es necesaria
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Rango de Antigüedad (años)',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cantidad de Empleados',
          },
        },
      },
    },
  });
}


  initializePayrollChart(payments: EmployeePayment[]): void {
    if (!this.salaryChart) return;
  
    const ctx = this.salaryChart.nativeElement.getContext('2d');
    if (!ctx) return;
  
    const existingChart = Chart.getChart(this.salaryChart.nativeElement);
    if (existingChart) {
      existingChart.destroy();
    }
  
    const monthlyTotals = this.calculateMonthlyPayroll(payments);
  
    this.charts.salaryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from(monthlyTotals.keys()),
        datasets: [{
          label: 'Total Mensual de Nómina',
          data: Array.from(monthlyTotals.values()),
          backgroundColor: '#FF5722'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Evolución de la Nómina Mensual'
          }
        }
      }
    });
  }

  calculateTenureRanges(): number[] {
    const ranges = [0, 0, 0, 0]; // 0-1, 1-2, 2-5, 5+ años
    const now = new Date();
  
    this.employeeList.forEach(emp => {
      const hiringDate = new Date(emp.hiringDate);
      const years = (now.getTime() - hiringDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
      if (years <= 1) ranges[0]++;
      else if (years <= 2) ranges[1]++;
      else if (years <= 5) ranges[2]++;
      else ranges[3]++;
    });
  
    return ranges;
  }
  
  calculateMonthlyPayroll(payments: EmployeePayment[]): Map<string, number> {
    const monthlyTotals = new Map<string, number>();

    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      const currentTotal = monthlyTotals.get(monthYear) || 0;
      monthlyTotals.set(monthYear, currentTotal + payment.paymentAmount);
    });

    return new Map([...monthlyTotals.entries()].sort());
  }

 // Cargar datos iniciales con validación de `hiringDate`
 loadEmployeeData(): void {
  this.employeesService.getAllEmployeesPaged().subscribe({
    next: (response) => {
      this.employeeList = this.mapperService.toCamelCase(response.content);
      
      // Verifica si todos los empleados tienen `hiringDate` y si es un objeto Date
      this.employeeList.forEach(emp => {
        if (!emp.hiringDate || !(emp.hiringDate instanceof Date)) {
          console.warn(`Employee with ID ${emp.id} has invalid hiringDate:`, emp.hiringDate);
        }
      });

      this.calculateMetrics();
      this.initializeCharts();
    },
    error: (error) => {
      this.toastService.sendError('Error al cargar empleados.');
    }
  });
}



  private initializeAllCharts(): void {
    if (!this.employeeList.length) {
      console.warn('No hay datos para mostrar en los gráficos');
      return;
    }
    // Destruimos los gráficos existentes antes de crear nuevos
    this.destroyExistingCharts();

    if (this.barChart?.nativeElement) {
      this.initializeEmployeeTypeChart();
    }

    if (this.lineChart?.nativeElement) {
      this.initializeTenureDistributionChart();
    }

    if (this.salaryChart?.nativeElement) {
      this.loadPayrollData();
    }
  }
  private destroyExistingCharts(): void {
    const charts = [
      this.barChart?.nativeElement,
      this.lineChart?.nativeElement,
      this.salaryChart?.nativeElement
    ];

    charts.forEach(canvas => {
      if (canvas) {
        const chart = Chart.getChart(canvas);
        if (chart) {
          chart.destroy();
        }
      }
    });
  }
  formatNumber(value: number): string {
    return value.toFixed(1);
  }

  // VER MODAL PARA LOS EMPLEADOS ACTIVOS AL HACER CLICK EN LA CARD.
  showActiveEmployees(): void {
    const activeEmployees = this.employeeList.filter(emp => emp.state === StatusType.ACTIVE);
    
    const modalRef = this.modalService.open(ActiveEmployeesModalComponent, {
      size: 'lg',
      centered: true
    });
    
    modalRef.componentInstance.activeEmployees = activeEmployees;
  }
  
  // VER MODAL PARA LOS EMPLEADOS RECIENTEMENTE CONTRATADOS EN LA CARD.
  showRecentHires(): void {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const recentHires = this.employeeList.filter(emp => {
      const hiringDate = new Date(emp.hiringDate);
      return hiringDate >= oneMonthAgo;
    });
    
    const modalRef = this.modalService.open(EmployeeRecentHireModalComponent, {
      size: 'lg',
      centered: true
    });
    
    modalRef.componentInstance.recentHires = recentHires;
  }
}