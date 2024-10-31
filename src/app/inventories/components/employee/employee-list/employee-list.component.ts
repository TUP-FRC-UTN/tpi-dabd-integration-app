import { Component, EventEmitter, inject, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { DocumentType, Employee, EmployeeFilter, EmployeeType, StatusType } from '../../../models/employee.model';
import { EmployeesService } from '../../../services/employees.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Exportar a PDF y Excel
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import { EmployeeEditModalComponent } from '../employee-edit-modal/employee-edit-modal.component';
import { MapperService } from '../../../services/MapperCamelToSnake/mapper.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ToastService } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, EmployeeEditModalComponent, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  employeeList: Employee[] = [];
  originalEmployeeList: Employee[] = [];
  filteredEmployeeList: Employee[] = [];
  currentFilter: 'all' | 'active' | 'inactive' = 'all';

  @ViewChild('infoModal') infoModal!: TemplateRef<any>;
  @Output() showEditModal: EventEmitter<boolean> = new EventEmitter<boolean>();

  filterForm: FormGroup;
  searchFilter = new FormControl('');
  showEditForm: boolean = false;
  showModalFilters: boolean = false;

  currentPage: number = 1;
  totalPages: number = 0;
  itemsPerPage: number = 10;
  totalElements: number = 0;
  selectedStatus?: StatusType;
  statusTypes = Object.values(StatusType);
  employeeTypes = Object.values(EmployeeType);
  documentTypes = Object.values(DocumentType);

  isLoading = false;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private toastService: ToastService,
    private fb: FormBuilder,
    private employeeService: EmployeesService,
    private router: Router,
    private mapperService: MapperService,
    private modalService: NgbModal
  ) {
    this.filterForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      employeeType: [''],
      docType: [''],
      docNumber: [''],
      hiringDate: [''],
      salary: [''],
      state: [''],
      enabled: [true]
    });
  }

  ngOnInit(): void {
    this.getEmployees();
    this.setupFilterSubscription();
  }

  getEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe(
      employeeList => {
        employeeList = this.mapperService.toCamelCase(employeeList);
        this.originalEmployeeList = employeeList;
        this.employeeList = employeeList;
        this.filteredEmployeeList = employeeList;
        this.applyCurrentFilter();
        this.isLoading = false;
      },
      error => {
        console.error('Error al obtener empleados:', error);
        this.toastService.sendError('Error al cargar empleados.');
        this.isLoading = false;
      }
    );
  }

  private setupFilterSubscription(): void {
    this.searchFilter.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        if (!searchTerm || searchTerm.trim() === '') {
          this.employeeList = [...this.originalEmployeeList];
        } else {
          this.employeeList = this.originalEmployeeList.filter(employee =>
            employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.salary.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        this.filteredEmployeeList = [...this.employeeList];
      });
  }

  applyFilters(): void {
    const filter: EmployeeFilter = {
      ...Object.entries(this.filterForm.value).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as EmployeeFilter),
      state: this.currentFilter === 'all' ? undefined :
             this.currentFilter === 'active' ? StatusType.ACTIVE : StatusType.INACTIVE
    };

    this.isLoading = true;
    this.employeeService.searchEmployees(filter).subscribe(
      employees => {
        this.employeeList = employees;
        this.filteredEmployeeList = [...employees];
        this.isLoading = false;
      },
      error => {
        console.error('Error al filtrar empleados:', error);
        //Swal.fire('Error', 'Error filtering employees', 'error');
        this.isLoading = false;
      }
    );
  }

  editEmployee(employee: Employee): void {
    this.router.navigate(['employees/form', employee.id]);
  }

  deleteEmployee(id: number): void {
    Swal.fire({
      title: '¿Estas Seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(id).subscribe(() => {
          this.getEmployees();
          this.toastService.sendSuccess('El Empleado ha sido eliminado con éxito.');
        });
      }
    });
  }

  sort(column: keyof Employee): void {
    this.sortDirection = this.sortColumn === column ? (this.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
    this.sortColumn = column;

    this.employeeList = [...this.employeeList].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (valueA == null || valueB == null) return 0;

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  exportToPDF(): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const title = 'Listado de Empleados';
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    const tableColumn = ['Empleado', 'Tipo', 'Documento', 'Fecha de contratación', 'Estado'];
    const tableRows: any[][] = [];

    this.employeeList.forEach(employee => {
      const hiringDate = new Date(employee.hiringDate).toISOString().split('T')[0];
      const [year, month, day] = hiringDate.split('-');
      const formattedDate = `${day}/${month}/${year}`;

      const employeeData = [
        `${employee.lastName} ${employee.firstName}`,
        employee.employeeType,
        `${employee.documentType}: ${employee.docNumber}`,
        formattedDate,
        employee.state
      ];
      tableRows.push(employeeData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25
    });

    doc.save('lista-empleados.pdf');
  }

  exportToExcel(): void {
    const data = this.employeeList.map(employee => {
      const hiringDate = new Date(employee.hiringDate).toISOString().split('T')[0];
      const [year, month, day] = hiringDate.split('-');
      const formattedDate = `${day}/${month}/${year}`;

      return {
        Empleado: `${employee.lastName} ${employee.firstName}`,
        Tipo: employee.employeeType,
        Documento: `${employee.documentType}: ${employee.docNumber}`,
        'Fecha de contratación': formattedDate,
        Estado: employee.state
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Empleados');

    const columnsWidth = [
      { wch: 25 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 }
    ];
    ws['!cols'] = columnsWidth;

    XLSX.writeFile(wb, 'lista-empleados.xlsx');
  }

  onModalClose(): void {
    this.showEditForm = false;
    this.getEmployees();
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadEmployees();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadEmployees();
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadEmployees();
  }

  filterByStatus(status?: StatusType): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadEmployees();
  }

  openModalFilters(): void {
    this.showModalFilters = !this.showModalFilters;
  }

  private applyCurrentFilter(): void {
    switch (this.currentFilter) {
      case 'active':
        this.employeeList = this.originalEmployeeList.filter(
          employee => employee.state === StatusType.ACTIVE
        );
        break;
      case 'inactive':
        this.employeeList = this.originalEmployeeList.filter(
          employee => employee.state === StatusType.INACTIVE
        );
        break;
      default:
        this.employeeList = [...this.originalEmployeeList];
    }
    this.filteredEmployeeList = [...this.employeeList];
  }

  setFilter(filter: 'all' | 'active' | 'inactive'): void {
    this.currentFilter = filter;
    this.applyCurrentFilter();
    this.applyFilters();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService
      .getEmployeesPageable(this.currentPage - 1, this.itemsPerPage, this.selectedStatus)
      .subscribe({
        next: response => {
          response = this.mapperService.toCamelCase(response);
          this.employeeList = this.mapperService.toCamelCase(response.content);
          this.totalPages = this.mapperService.toCamelCase(response.totalPages);
          this.totalElements = this.mapperService.toCamelCase(response.totalElements);
          this.isLoading = false;
        },
        error: error => {
          this.toastService.sendError('Error al cargar listado de empleados.');
          console.error('Error loading employees:', error);
          this.isLoading = false;
        }
      });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.searchFilter.setValue('');
    this.currentFilter = 'all';
    this.applyFilters();
  }

  filterActiveEmployees(): void {
    this.setFilter('active');
  }

  filterInactiveEmployees(): void {
    this.setFilter('inactive');
  }

  showAllEmployees(): void {
    this.setFilter('all');
  }
}
