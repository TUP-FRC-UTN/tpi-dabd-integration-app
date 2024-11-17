import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterModule } from '@angular/router';
import { EmployeesService } from '../../../services/employees.service';
import { Employee, EmployeeType, StatusType, DocumentType } from '../../../models/employee.model';
import { ToastService, MainContainerComponent, ConfirmAlertComponent } from 'ngx-dabd-grupo01';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { Chart, ChartType } from 'chart.js';
import { EmployeeListInfoComponent } from './employee-list-info/employee-list-info.component';
import { TableFiltersComponent, Filter, FilterConfigBuilder } from 'ngx-dabd-grupo01';
import { EmployeeViewAcessComponent } from '../employee-view-acess/employee-view-acess.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule,
    MainContainerComponent, TableFiltersComponent, EmployeeViewAcessComponent
  ],
  providers:[DatePipe],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmployeeListComponent implements OnInit {
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;
  @ViewChild('pieChart') pieChartRef!: ElementRef;
  @ViewChild('employeeAccess') employeeAccess!: EmployeeViewAcessComponent;
  showModalFilters: boolean = false;
  
  // Metrics
  inServiceCount = 0;
  inactiveCount = 0;
  typeCountMap: { [key: string]: number } = {};
  pieChart!: Chart;
  barChart!: Chart;

  // Lists
  employeeList: Employee[] = [];
  filteredEmployeeList: Employee[] = [];
  isLoading = false;
  currentFilters! : Record<string,any>;

  // Forms and Filters
  filterForm!: FormGroup;
  searchFilter:FormControl = new FormControl('');
  statusTypes = Object.values(StatusType);
  employeeTypes = Object.values(EmployeeType);
  documentTypes = Object.values(DocumentType);

  filterConfig: Filter[] = new FilterConfigBuilder()
    .textFilter(
     'Nombre',
     'firstName',
     '' 
    )
    .textFilter(
      'Apellido',
      'lastName',
      ''
    )
    .selectFilter(
      'Tipo de Empleado',
      'type',
      'Seleccione un Tipo',
      [
        { value: '', label: 'Todos' },
        { value: 'ADMINISTRATIVO', label: 'Administrativo' },
        { value: 'GUARDIA', label: 'Guardia' },
        { value: 'CONTADOR', label: 'Contador'},
        { value: 'MANTENIMIENTO', label: 'Mantenimiento'}
      ]
    )
    .textFilter(
      'Número de Documento',
      'docNumber',
      ''
    )
    .selectFilter(
      'Estado',
      'state',
      'Seleccione un Estado',
      [
        { value: '', label: 'Todos' },
        { value: 'IN_SERVICE', label: 'Activo' },
        { value: 'DOWN', label: 'Inactivo' },
      ]
    )
    .build();

    filterChange($event: Record<string, any>) {
      console.log('[Filter Change] Evento originl:', $event);

      const filters = {
        ...$event
      };

      this.currentFilters = filters;
      this.getEmployees();
    }
  
  // Pagination
  currentPage: number = 0; // Changed to 0-based for backend compatibility
  totalItems: number = 0;
  totalPages:number = 0;
  pageSize: number = 10;
  sizeOptions: number[] = [5, 10, 20, 50, 100];

  selectedEmployee?: Employee;

  // Services

  private employeeService = inject(EmployeesService);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private mapperService = inject(MapperService);

  constructor() {
    this.filterForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      employeeType: [''],
      docType: [''],
      docNumber: [''],
      hiringDate: [''],
      salary: [''],
      state: ['']
    });

    this.searchFilter.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.searchEmployees());
  }

  ngOnInit(): void {
    this.getEmployees();
  }

  searchEmployees(){
    if (!this.searchFilter.value||this.searchFilter.value == null) {
      this.getEmployees();
   }

   this.filteredEmployeeList= this.filteredEmployeeList.filter(emp =>
     emp.firstName.toLowerCase().includes(this.searchFilter.value.toLowerCase() ?? '')
     ||emp.lastName.toLowerCase().includes(this.searchFilter.value.toLowerCase() ?? '')
     ||emp.docNumber.toLowerCase().includes(this.searchFilter.value.toLowerCase() ?? '')
   );
  }

  getEmployees(page: number = 0, size: number = this.pageSize, searchTerm?: string): void {
    this.isLoading = true;

    const filters = this.currentFilters;
    this.employeeService.getAllEmployeesPaged(this.currentPage,this.pageSize,filters).subscribe({

      next: (response) => {
        response = this.mapperService.toCamelCase(response);
        
        //this.employeeList = this.mapperService.toCamelCase(response.content);
        this.employeeList = response.content.map((empleado: any) => {
          const hiringDate = empleado.hiringDate || empleado.hiring_date;
          
          return {
            ...empleado,
            hiringDate: hiringDate ? this.formatearFecha(hiringDate) : ''
          };
        });    
        this.filteredEmployeeList = [...this.employeeList];
        this.totalItems = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
        this.toastService.sendError('Error al cargar empleados.');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 0; // Reset to first page when applying filters
    this.getEmployees();
    this.showModalFilters = false;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.searchFilter.setValue('');
    this.currentPage = 0;
    this.getEmployees();
  }

  onPageChange(page: number): void {
    this.currentPage = page - 1; // Convert to 0-based for backend
    this.getEmployees();
  }

  onItemsPerPageChange(): void {
    this.currentPage = 0;
    this.getEmployees();
  }

  // Metrics methods
  calculateMetrics(): void {
    this.inServiceCount = this.employeeList.filter(employee => employee.state === 'IN_SERVICE').length;
    this.inactiveCount = this.employeeList.filter(employee => employee.state === 'DOWN').length;
    
    this.typeCountMap = this.employeeList.reduce((acc, employee) => {
      const type = employee.employeeType;
      if (type) {
        acc[type] = (acc[type] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });
  }

  // Chart methods remain the same...
  createPieChart(): void {
    if (!this.pieChartRef?.nativeElement) {
      console.warn('Elemento del gráfico circular no encontrado');
      return;
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    this.pieChart = new Chart(this.pieChartRef.nativeElement, {
      type: 'pie' as ChartType,
      data: {
        labels: ['En Servicio', 'Inactivo'],
        datasets: [{
          data: [this.inServiceCount, this.inactiveCount],
          backgroundColor: ['#28a745', '#dc3545'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  createBarChart(): void {
    if (this.barChart) {
      this.barChart.destroy();
    }

    const ctx = document.getElementById('barChart') as HTMLCanvasElement;
    const employeeTypes = Object.keys(this.typeCountMap);
    const typeCounts = Object.values(this.typeCountMap);

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: employeeTypes,
        datasets: [{
          label: 'Cantidad de Empleados',
          data: typeCounts,
          backgroundColor: '#007bff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { title: { display: true, text: 'Tipo de Empleado' } },
          y: { title: { display: true, text: 'Cantidad' }, beginAtZero: true }
        }
      }
    });
  }

  // Export methods
  exportToPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Empleado', 'Tipo', 'Documento', 'Fecha de contratación', 'Estado']],
      body: this.employeeList.map(employee => [
        `${employee.lastName} ${employee.firstName}`,
        employee.employeeType,
        `${employee.documentType}: ${employee.docNumber}`,
        new Date(employee.hiringDate).toLocaleDateString(),
        employee.state
      ])
    });
    doc.save('lista-empleados.pdf');
  }

  exportToExcel(): void {
    const data = this.employeeList.map(employee => ({
      Empleado: `${employee.lastName} ${employee.firstName}`,
      Tipo: employee.employeeType,
      Documento: `${employee.documentType}: ${employee.docNumber}`,
      'Fecha de contratación': new Date(employee.hiringDate).toLocaleDateString(),
      Estado: employee.state
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Empleados');
    XLSX.writeFile(wb, 'lista-empleados.xlsx');
  }

  // Modal methods
  openModalFilters(): void {
    this.showModalFilters = true;
  }

  closeModalFilters(): void {
    this.showModalFilters = false;
  }

  // CRUD operations
  editEmployee(employee: Employee): void {
    this.router.navigate(['inventories/employees/form', employee.id]);
  }

  deleteEmployee(id: number): void {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertTitle = 'Confirmación';
    modalRef.componentInstance.alertMessage = '¿Estás seguro de eliminar este empleado?';
    modalRef.componentInstance.alertVariant = 'delete';

    modalRef.result.then((result) => {
      if (result) {
        this.employeeService.deleteEmployee(id).subscribe({
          next: () => {
            this.toastService.sendSuccess('Empleado eliminado con éxito.');
            this.getEmployees();
          },
          error: () => {
            this.toastService.sendError('Error al eliminar el empleado.');
          }
        });
      }
    });
  }


  showDetailModal(content: any, id: number) {
    console.log("Este es el metodo de showDetailModal");
    //debugger
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        console.log('Detalles del empleado:', employee);
        console.log('this.selectedEmployee', this.selectedEmployee);
        console.log('este es el numero de telefono de this.selectedEmployee', this.selectedEmployee?.contactValue);
        this.selectedEmployee = employee;
        //debugger
        this.modalService.open(content, {
          ariaLabelledBy: 'modal-basic-title',
          size: 'lg'
        });
        console.log('this.selectedEmployee', this.selectedEmployee);
        console.log('este es el numero de telefono de this.selectedEmployee', this.selectedEmployee?.contactValue);
        console.log(this.selectedEmployee);
      },
      error: (error) => {
        console.error('Error al cargar los detalles del empleado:', error);
        this.toastService.sendError('Error al cargar los detalles del empleado.');
      }
    });
  }


  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getEmployees();
    }
  }
  
  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.getEmployees();
    }
  }

  showInfo(): void {
    this.modalService.open(EmployeeListInfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });
  }

  private formatearFecha(fecha: string | Date | null): string {
    if (!fecha) return '';
    
    // Si ya es un objeto Date
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }
    
    // Si es un string, manejar diferentes formatos
    try {
      // Manejar formato LocalDateTime (yyyy-MM-dd'T'HH:mm:ss)
      if (fecha.includes('T')) {
        return fecha.split('T')[0];
      }
      
      // Si es solo un string de fecha (yyyy-MM-dd)
      return fecha;
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return '';
    }
  }

  showEmployeeAccess(employeeId: number) {
    console.log('Showing access for employee:', employeeId);
    if (this.employeeAccess) {
      this.employeeAccess.showEmployeeSchedule(employeeId);
    } else {
      console.error('Employee access component not found');
    }
  }
  showEmployeeAssistance(employeeId: number) {
    // Usar el Router para navegar a la vista de asistencias con el ID del empleado
    this.router.navigate(['inventories/employees/assistance', employeeId]);
  }
}

