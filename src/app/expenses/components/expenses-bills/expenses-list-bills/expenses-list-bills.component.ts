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
  ToastService,
} from 'ngx-dabd-grupo01';
import { map, of } from 'rxjs';
import { DeleteBillModalComponent } from '../../modals/bills/delete-bill-modal/delete-bill-modal.component';

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

  private readonly toastService = inject(ToastService);

  bills: Bill[] = [];
  filteredBills: Bill[] = [];
  currentPage: number = 1;

  filterConfig: Filter[] = [];
  categoryList: { value: string; label: string }[] = [];
  supplierList: { value: string; label: string }[] = [];
  periodsList: { value: string; label: string }[] = [];
  typesList: { value: string; label: string }[] = [];

  private pageSize = 10;
  totalItems = 0;
  page = 1;
  size = 10;
  sortField = 'billType.name';
  sortDirection: 'asc' | 'desc' = 'asc';

  searchTerm: string = '';
  isLoading: boolean = false;
  today: Date = new Date();
  fileName: string = `Gastos_${this.today.toLocaleDateString()}.xlsx`;

  filters = new FormGroup({
    selectedCategory: new FormControl(0),
    selectedPeriod: new FormControl<number>(0),
    selectedSupplier: new FormControl(0),
    selectedProvider: new FormControl(''),
    selectedStatus: new FormControl(''),
    selectedType: new FormControl(0),
  });

  filterTableByText(value: string) {
    const filterValue = value?.toLowerCase() || '';
    if (filterValue === '') {
      const startIndex = (this.page - 1) * this.size;
      const endIndex = startIndex + this.size;
      this.filteredBills = this.allBills.slice(startIndex, endIndex);
      return;
    }

    const filtered = this.allBills.filter(
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

    this.totalItems = filtered.length;
    const startIndex = (this.page - 1) * this.size;
    const endIndex = startIndex + this.size;
    this.filteredBills = filtered.slice(startIndex, endIndex);
  }

  filterTableBySelects(value: Record<string, any>) {
    const filterCategory = value['category.name'] || 0;
    const filterSupplier = value['supplier.name'] || 0;
    const filterPeriod = value['period.id'] || 0;
    const filterType = value['billType.name'] || 0;
    let filterStatus = '';
    if (value['isActive'] !== 'undefined') 
      filterStatus = value['isActive'] === 'true' ? 'Activo' : 'Cerrado';

    const filtered = this.allBills.filter((bill) => {
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
      const matchesStatus = filterStatus
        ? bill.status === filterStatus
        : true;

      return matchesCategory && matchesSupplier && matchesPeriod && 
             matchesType && matchesStatus;
    });

    this.totalItems = filtered.length;
    const startIndex = (this.page - 1) * this.size;
    const endIndex = startIndex + this.size;
    this.filteredBills = filtered.slice(startIndex, endIndex);
  }

  onSearchValueChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.page = 1;
    this.filterTableByText(searchTerm);
  }

  @ViewChild('amountTemplate', { static: true })
  amountTemplate!: TemplateRef<any>;
  @ViewChild('dateTemplate', { static: true }) dateTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate', { static: true })
  actionsTemplate!: TemplateRef<any>;
  @ViewChild('periodTemplate', { static: true })
  periodTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true })
  statusTemplate!: TemplateRef<any>;

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
          align: 'right'
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
          headerName: 'Estado',
          accessorKey: 'status',
          cellRenderer: this.statusTemplate,

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

  onPageChange = (page: number) => {
    this.page = page;
    const startIndex = (page - 1) * this.size;
    const endIndex = startIndex + this.size;
    this.bills = this.allBills.slice(startIndex, endIndex);
    this.filteredBills = [...this.bills];
  };

  onPageSizeChange = (size: number) => {
    this.size = size;
    this.page = 1;
    const startIndex = 0;
    const endIndex = size;
    this.bills = this.allBills.slice(startIndex, endIndex);
    this.filteredBills = [...this.bills];
  };

  billService = inject(BillService);
  categoryService = inject(CategoryService);
  periodService = inject(PeriodService);
  providerService = inject(ProviderService);
  modalService = inject(NgbModal);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  getCategories() {
    this.categoryService.getAllCategories().subscribe((categories) => {
      this.categoryList = categories.map((category: any) => ({
        value: category.category_id,
        label: category.name,
      }));
      this.initializeFilters();
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
      .selectFilter(
        'Categoría',
        'category.name',
        'Seleccione una categoría',
        this.categoryList
      )
      .radioFilter('Activo', 'isActive', [
        { value: 'ACTIVE', label: 'Activo' },
        { value: 'CANCELLED', label: 'Inactivo' },
        { value: 'NEW', label: 'Nuevo' },
        { value: 'undefined', label: 'Todo' },
      ])
      .radioFilter('Tipo de proveedor', 'supplier.type', [
        { value: 'SUPPLIER', label: 'Proveedor' },
        { value: 'EMPLOYEE', label: 'Empleado' }
      ])
      .build();
  }

  onFilterValueChange($event: Record<string, any>) {

    this.filters.patchValue({
      selectedCategory: $event['category.name'] === "" ? undefined : $event['category.name'],
      selectedPeriod: $event['period.id'] === "" ? undefined : $event['period.id'],
      selectedSupplier: $event['supplier.name'] === "" ? undefined : $event['supplier.name'],
      selectedProvider: $event['supplier.type'] === "" ? undefined : $event['supplier.type'],
      selectedStatus: $event['isActive'] === "" ? undefined : $event['isActive'],
      selectedType: $event['billType.name'] === "" ? undefined : $event['billType.name'],
    })
    this.loadBills();
  }

  private allBills: Bill[] = [];

  private loadBills(): void {
    this.isLoading = true;
    const filters = this.filters.value;
    
    this.billService
      .getAllBillsAndPagination(
        0,
        5000,
        filters.selectedPeriod?.valueOf(),
        filters.selectedCategory?.valueOf(),
        filters.selectedSupplier?.valueOf(),
        filters.selectedType?.valueOf(),
        filters.selectedProvider?.valueOf().toString(),
        filters.selectedStatus?.valueOf().toString(),
      )
      .subscribe({
        next: (response) => {
          this.billService.formatBills(of(response)).subscribe((bills) => {
            if (bills) {
              this.allBills = this.sortBills(bills);
              
              this.totalItems = this.allBills.length;
              
              const startIndex = (this.page - 1) * this.size;
              const endIndex = startIndex + this.size;
              this.bills = this.allBills.slice(startIndex, endIndex);
              this.filteredBills = [...this.bills];
            } else {
              this.allBills = [];
              this.bills = [];
              this.filteredBills = [];
              this.totalItems = 0;
            }
          });
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  private sortBills(bills: Bill[]): Bill[] {
    const statusOrder: { [key: string]: number } = {
        'Nuevo': 1,
        'Activo': 2,
        'Cancelado': 3
    };

    return bills.sort((a, b) => {
        const statusComparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        if (statusComparison !== 0) {
            return statusComparison;
        }
        
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}


  viewBill(bill: Bill) {
    this.openViewModal(bill);
  }

  deleteBill(bill: Bill) {
    const modalRef = this.modalService.open(DeleteBillModalComponent, {
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.bill = bill;
    modalRef.componentInstance.status = "Cancelado"
    modalRef.componentInstance.action = 'eliminar'
    modalRef.result.then(
      (result) => {
        if (result.success) {
          this.toastService.sendSuccess(result.message)
          window.location.reload();
        } else {
          this.toastService.sendError(result.message)
        }
      }
    );
  }

  activeBill(bill: Bill) {
    const modalRef = this.modalService.open(DeleteBillModalComponent, {
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.bill = bill;
    modalRef.componentInstance.status = "Activo"
    modalRef.componentInstance.action = 'activar'
    modalRef.result.then(
      (result) => {
        if (result.success) {
          this.toastService.sendSuccess(result.message)
          window.location.reload();
        } else {
          this.toastService.sendError(result.message)
        }
      }
    );
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

  imprimir() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Lista de Gastos', 14, 20);

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
      });
  }

  // downloadTable() {
  //   const filters = this.filters.value;
  //   this.billService
  //     .getAllBillsAndPaginationAny(
  //       this.page,
  //       this.size,
  //       filters.selectedPeriod?.valueOf(),
  //       filters.selectedCategory?.valueOf(),
  //       filters.selectedSupplier?.valueOf(),
  //       filters.selectedType?.valueOf(),
  //       filters.selectedProvider?.valueOf().toString(),
  //       filters.selectedStatus?.valueOf().toString(),
  //     )
  //     .subscribe((bills) => {
  //       const data = bills.content.map((bill) => ({
  //         Periodo: `${bill?.period?.month} / ${bill?.period?.year}`,
  //         'Monto Total': `$ ${bill.amount}`,
  //         Fecha: bill.date,
  //         Proveedor: bill.supplier?.name,
  //         Estado: bill.status,
  //         Categoría: bill.category.name,
  //         'Tipo de gasto': bill.bill_type?.name,
  //         Descripción: bill.description,
  //       }));

  //       const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  //       const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //       XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  //       XLSX.writeFile(wb, this.fileName);
  //     });
  // }


  getAllItems = () => {
    return this.billService.getAllBillsAndPaginationAny(
      0,
      5000,
      this.filters.get('selectedPeriod')?.value as number,
      this.filters.get('selectedCategory')?.value as number,
      this.filters.get('selectedSupplier')?.value as number,
      this.filters.get('selectedType')?.value as number,
      this.filters.get('selectedProvider')?.value as string,
      this.filters.get('selectedStatus')?.value as string
    ).pipe(
      map((response) => {
        const data = response.content.map((bill) => ({
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
        return response.content;
      })
    );
  };

  nuevoGasto() {
    this.router.navigate(['/gastos/nuevo']);
  }
}
