import {
  Component,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Bill } from '../../../models/bill';
import { BillService } from '../../../services/bill.service';
import { CategoryService } from '../../../services/category.service';
import { ProviderService } from '../../../services/provider.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { PeriodService } from '../../../services/period.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import BillType from '../../../models/billType';
import { CommonModule, DatePipe } from '@angular/common';
import { PeriodSelectComponent } from '../../selects/period-select/period-select.component';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgPipesModule } from 'ngx-pipes';
import { EditBillModalComponent } from '../../modals/bills-modal/edit-bill-modal/edit-bill-modal.component';
import { ViewBillModalComponent } from '../../modals/bills-modal/view-bill-modal/view-bill-modal.component';
import { ListBillsInfoComponent } from '../../modals/info/list-bills-info/list-bills-info.component';
import { Router } from '@angular/router';
import moment from 'moment';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  TableColumn,
  TableComponent,
  TableFiltersComponent,
  TablePagination,
} from 'ngx-dabd-grupo01';
import { of } from 'rxjs';

@Component({
  selector: 'app-list-expenses_bills',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgbModule,
    PeriodSelectComponent,
    FormsModule,
    NgPipesModule,
    CommonModule,
    MainContainerComponent,
    TableFiltersComponent,
    TableComponent,
  ],
  templateUrl: './expenses-list-bills.component.html',
  styleUrl: './expenses-list-bills.component.css',
  providers: [DatePipe],
})
export class ExpensesListBillsComponent implements OnInit {
  //#region VARIABLES
  bills: Bill[] = [];
  filteredBills: Bill[] = [];
  updatedBill: Bill | undefined;
  paginatedBills: Bill[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  // totalPages: number = 0;
  sizeOptions: number[] = [10, 25, 50];

  filterConfig: Filter[] = [];
  categoryList: { value: string; label: string }[] = [];
  supplierList: { value: string; label: string }[] = [];
  periodsList: { value: string; label: string }[] = [];
  typesList: { value: string; label: string }[] = [];


  totalItems = 0;
  page = 0;
  size = 10;
  sortField = 'billType.name';
  sortDirection: 'asc' | 'desc' = 'asc';

  searchTerm: string = '';
  visiblePages: number[] = [];
  maxPagesToShow: number = 5;

  // currentPage: number = 1;
  pageSize: number = 10;
  cantPages: number[] = [];
  indexActive: number = 1;
  isLoading: boolean = false;

  viewList: boolean = true;
  today: Date = new Date();
  fileName: string = `Gastos_${this.today.toLocaleDateString()}.xlsx`;

  selectedBill: Bill | undefined;

  // FormGroup for filters
  filters = new FormGroup({
    selectedCategory: new FormControl(0),
    selectedPeriod: new FormControl<number>(0),
    selectedSupplier: new FormControl(0),
    selectedProvider: new FormControl('SUPPLIER'),
    selectedStatus: new FormControl('ACTIVE'),
    selectedType: new FormControl(0),
  });

  filterTableByText(value: string) {
    const filterValue = value?.toLowerCase() || '';
    if (filterValue === '') {
      this.filteredBills = this.bills;
      return;
    }

    this.filteredBills = this.bills.filter(
      (bill) =>
        (bill.billType?.name
          ? bill.billType.name.toLowerCase().includes(filterValue)
          : false) ||
        (bill.supplier?.name
          ? bill.supplier.name.toLowerCase().includes(filterValue)
          : false) ||
        (bill.category?.name
          ? bill.category.name.toLowerCase().includes(filterValue)
          : false)
    );
  }

  filterTableBySelects(value: Record<string, any>) {
    const filterCategory = value['category.name'] || 0;
    const filterSupplier = value['supplier.name'] || 0;
    const filterPeriod = value['period.id'] || 0;
    const filterType = value['billType.name'] || 0;


    this.filteredBills = this.bills.filter((bill) => {
      const matchesCategory = filterCategory
        ? bill.category?.category_id === filterCategory
        : true;
      const matchesSupplier = filterSupplier
        ? bill.supplier?.id === filterSupplier
        : true;
      const matchesPeriod = filterPeriod
        ? bill.period?.id === filterPeriod
        : true;
      const matchesType = filterType
        ? bill.billType?.bill_type_id === filterType
        : true;
      let filterStatus = '';
      if (value['isActive'] !== 'undefined') filterStatus = value['isActive'] === 'true' ? 'Activo' : 'Inactivo';

      const matchesStatus = filterStatus
        ? bill.status === filterStatus
        : true;


      return matchesCategory && matchesSupplier && matchesPeriod && matchesType && matchesStatus;
    });
  }

  onSearchValueChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.page = 1;
    this.filterTableByText(searchTerm);
  }

  onFilterChange() {
    const filters = this.filters.value;
    this.filterTableBySelects(filters);
  }

  onFilterValueChange($event: Record<string, any>) {
    this.filterTableBySelects($event);
  }
  //#endregion

  @ViewChild('amountTemplate', { static: true })
  amountTemplate!: TemplateRef<any>;
  @ViewChild('dateTemplate', { static: true }) dateTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate', { static: true })
  actionsTemplate!: TemplateRef<any>;
  @ViewChild('periodTemplate', { static: true })
  periodTemplate!: TemplateRef<any>;

  columns: TableColumn[] = [];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.columns = [
        { headerName: 'Tipo', accessorKey: 'billType.name' },
        { headerName: 'Proveedor', accessorKey: 'supplier.name' },
        {
          headerName: 'Monto',
          accessorKey: 'amount',
          cellRenderer: this.amountTemplate,
        },
        {
          headerName: 'Periodo',
          accessorKey: 'period.end_date',
          cellRenderer: this.periodTemplate,
        },
        { headerName: 'Categoría', accessorKey: 'category.name' },
        {
          headerName: 'Fecha',
          accessorKey: 'date',
          cellRenderer: this.dateTemplate,
        },
        {
          headerName: 'Acciones',
          accessorKey: 'actions',
          cellRenderer: this.actionsTemplate,
        },
      ];
    });
  }

  ngOnInit(): void {
    this.filteredBills = this.bills;
    this.getAllLists();
    this.initializeFilters();
  }

  getAllLists() {
    this.getCategories();
    this.getProviders();
    this.getPeriods();
    this.getBillTypes();
    this.loadBills();
  }

  onSortChange(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadBills();
  }

  onPageChange = (page: number) => {
    this.page = page - 1;
    this.loadBills();
  };

  onPageSizeChange = (size: number) => {
    this.size = size;
    this.page = 0;
    this.loadBills();
  };

  openFormModal() {
    throw new Error('Method not implemented.');
  }

  //#region DEPENDENCY INJECTION
  billService = inject(BillService);
  categoryService = inject(CategoryService);
  periodService = inject(PeriodService);
  providerService = inject(ProviderService);
  modalService = inject(NgbModal);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  //#endregion

  getCategories() {
    this.categoryService.getAllCategories().subscribe((categories) => {
      this.categoryList = categories.map((category: any) => ({
        value: category.category_id,
        label: category.name,
      }));
      this.initializeFilters(); // Actualiza el filtro después de obtener datos
    });
  }


  getBillTypes() {
    this.billService.getBillTypes().subscribe((types) => {
      this.typesList = types.map((type: any) => ({
        value: type.bill_type_id,
        label: type.name,
      }));
      this.initializeFilters();
    });
  }
  getProviders() {
    this.providerService.getAllProviders().subscribe((providers) => {
      this.supplierList = providers.map((provider: any) => ({
        value: provider.id,
        label: provider.name,
      }));
      this.initializeFilters();
    });
  }

  getPeriods() {
    this.periodService.get().subscribe((periods) => {
      this.periodsList = periods.map((period: any) => ({
        value: period.id,
        label: `${period.month}/${period.year}`,
      }));
      this.initializeFilters();
    });
  }
  // Initialize filter configurations
  initializeFilters(): void {
    this.filterConfig = new FilterConfigBuilder()
      .selectFilter(
        'Tipo',
        'billType.name',
        'Seleccione un tipo',
        this.typesList
      )
      .selectFilter(
        'Proveedor',
        'supplier.name',
        'Seleccione un proveedor',
        this.supplierList
      )
      .selectFilter(
        'Periodo',
        'period.id',
        'Seleccione un periodo',
        this.periodsList
      )
      // .numberFilter('Monto', 'amount', 'Ingrese el monto')
      // .dateFilter('Fecha', 'date', 'Seleccione una fecha')
      .selectFilter(
        'Categoría',
        'category.name',
        'Seleccione una categoría',
        this.categoryList
      )
      .radioFilter('Activo', 'isActive', [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' },
        { value: 'undefined', label: 'Todo' },
      ])
      .build();
  }

  // Load select values for filter options
  loadSelect() {
    this.getCategories();
    this.getProviders();
    this.getPeriods();
    this.getBillTypes();
  }

  // Load all bills with pagination and filters
  private loadBills(): void {
    this.isLoading = true;
    const filters = this.filters.value;
    this.billService
      .getAllBillsAndPagination(
        this.page,
        this.size,
        // filters.selectedPeriod?.valueOf(),
        // filters.selectedCategory?.valueOf(),
        // filters.selectedSupplier?.valueOf(),
        // filters.selectedType?.valueOf(),
        // filters.selectedProvider?.valueOf().toString(),
        //filters.selectedStatus?.valueOf().toString(),
      )
      .subscribe({
        next: (response) => {
          this.totalItems = response.totalElements;
          //this.totalPages = Math.ceil(this.totalItems / this.size);
          this.billService.formatBills(of(response)).subscribe((bills) => {
            if (bills) {
              this.bills = this.sortBills(bills);
              this.filteredBills = [...this.bills];
            } else {
              this.bills = [];
              this.filteredBills = [];
            }
          });
        },
        error: (error) => console.error('Error al cargar las facturas:', error),
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  sortBills(bills: Bill[]): Bill[] {
    return [...bills].sort((a, b) => {
      // Primero ordenamos por categoría
      const categoryComparison = a.category.name.localeCompare(b.category.name);
      if (categoryComparison !== 0) return categoryComparison;

      // Luego por proveedor
      const supplierComparison = a.supplier.name.localeCompare(b.supplier.name);
      if (supplierComparison !== 0) return supplierComparison;

      // Finalmente por fecha (asumiendo que date es un string o Date)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Orden descendente por fecha
    });
  }
  //#endregion

  //#region FILTER OPERATIONS
  unFilterBills() {
    this.filters.setValue({
      selectedCategory: 0,
      selectedPeriod: 0,
      selectedSupplier: 0,
      selectedProvider: 'SUPPLIER',
      selectedStatus: 'ACTIVE',
      selectedType: 0,
    });
    this.loadSelect();
    this.loadBills();
  }

  filterChange($event: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  //#endregion

  //#region PAGINATION AND PAGE SIZE
  onItemsPerPageChange() {
    this.currentPage = 1;
  }

  updatePageSize() {
    this.currentPage = 0;
    this.loadBills();
  }
  //#endregion

  //#region MODAL OPERATIONS
  viewBill(bill: Bill) {
    this.openViewModal(bill);
  }

  editBill(bill: Bill) {
    this.openEditModal(bill);
  }

  openViewModal(bill: Bill) {
    const modalRef = this.modalService.open(ViewBillModalComponent, {
      size: 'lg',
    });
    modalRef.componentInstance.bill = bill;
  }

  openEditModal(bill: Bill) {
    const modalRef = this.modalService.open(EditBillModalComponent, {
      size: 'lg',
    });
    modalRef.componentInstance.bill = bill;

    modalRef.result.then((result) => {
      if (result === 'updated') {
        this.loadBills();
      }
    });
  }

  showInfo(): void {
    this.modalService.open(ListBillsInfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true,
    });
  }
  //#endregion

  //#region DOCUMENT GENERATION
  imprimir() {
    console.log('Imprimiendo');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Bills Report', 14, 20);

    const filters = this.filters.value;
    this.billService
      .getAllBills(
        100000,
        0,
        filters.selectedPeriod?.valueOf(),
        filters.selectedCategory?.valueOf(),
        filters.selectedSupplier?.valueOf(),
        filters.selectedType?.valueOf(),
        filters.selectedProvider?.valueOf().toString(),
        filters.selectedStatus?.valueOf().toString()
      )
      .subscribe((bills) => {
        autoTable(doc, {
          startY: 30,
          head: [
            [
              'Periodo',
              'Monto total',
              'Fecha',
              'Estado',
              'Proveedor',
              'Categoría',
              'Tipo',
              'Descripción',
            ],
          ],
          body: bills.map((bill) => [
            bill.period ? `${bill.period.month}/${bill.period.year}` : null,
            bill.amount ? `$ ${bill.amount}` : null,
            moment(bill.date).format('DD/MM/YYYY'),
            bill.status ? bill.status : null,
            bill.supplier ? bill.supplier.name : null,
            bill.category ? bill.category.name : null,
            bill.billType ? bill.billType.name : null,
            bill.description,
          ]),
        });
        doc.save(
          `Gastos_${this.today.getDay()}-${this.today.getMonth()}-${this.today.getFullYear()}/${this.today.getHours()}hs:${this.today.getMinutes()}min.pdf`
        );
        console.log('Impreso');
      });
  }

  downloadTable() {
    const filters = this.filters.value;
    this.billService
      .getAllBillsAndPagination(
        500000,
        0,
        filters.selectedPeriod?.valueOf(),
        filters.selectedCategory?.valueOf(),
        filters.selectedSupplier?.valueOf(),
        filters.selectedType?.valueOf(),
        filters.selectedProvider?.valueOf().toString(),
        filters.selectedStatus?.valueOf().toString()
      )
      .subscribe((bills) => {
        const data = bills.content.map((bill) => ({
          Periodo: `${bill?.period?.month} / ${bill?.period?.year}`,
          'Monto Total': `$ ${bill.amount}`,
          Fecha: bill.date,
          Proveedor: bill.supplier?.name,
          Estado: bill.status,
          Categoría: bill.category.name,
          'Tipo de gasto': bill.bill_type?.name,
          Descripción: bill.description,
        }));

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
        XLSX.writeFile(wb, this.fileName);
      });
  }
  //#endregion

  //#region NAVIGATION
  nuevoGasto() {
    this.router.navigate(['expenses/gastos/nuevo']);
  }
  //#endregion
}
