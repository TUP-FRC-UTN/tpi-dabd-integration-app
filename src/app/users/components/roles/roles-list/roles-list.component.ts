import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RolesFilterButtonsComponent } from '../roles-filter-buttons/roles-filter-buttons.component';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import { Operations } from '../../../constants/operationContants';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import {
  ConfirmAlertComponent,
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  TableFiltersComponent,
  ToastService,
} from 'ngx-dabd-grupo01';
import { BehaviorSubject, Subject } from 'rxjs';
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import { InfoComponent } from '../../commons/info/info.component';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ModalService } from 'ngx-dabd-2w1-core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    RolesFilterButtonsComponent,
    FormsModule,
    NgbPagination,
    MainContainerComponent,
    AsyncPipe,
    TableFiltersComponent,
  ],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.css',
  providers: [DatePipe],
})
export class RolesListComponent implements OnInit {
  @ViewChild('filterComponent')
  filterComponent!: RolesFilterButtonsComponent<Role>;
  @ViewChild('rolesTable', { static: true })
  tableName!: ElementRef<HTMLTableElement>;

  roles: Role[] = [];
  //filteredRoles: Role[] = []
  currentPage: number = 0;
  pageSize: number = 10;
  totalItems: number = 0;
  sizeOptions: number[] = [10, 25, 50];
  roleId: number | undefined;
  lastPage: boolean | undefined;
  retrieveRolesByActive: boolean | undefined = true;
  //itemsList!: Role[];
  formPath: string = 'users/plots/list';
  objectName: string = '';
  headers: string[] = [
    'Código',
    'Nombre',
    'Nombre especial',
    'Descripción',
    'Activo',
  ];
  private LIMIT_32BITS_MAX = 2147483647;
  private filteredRoles = new BehaviorSubject<Role[]>([]);
  filter$ = this.filteredRoles.asObservable();

  filters? : Record<string, any>

  private excelService = inject(CadastreExcelService);
  private roleService = inject(RoleService);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);

  filterConfig: Filter[] = new FilterConfigBuilder()
    .textFilter('Codigo', 'code', 'Codigo')
    .selectFilter('Activo', 'is_active', '', [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
      { value: '', label: 'Todo' },
    ])
    .build();

  constructor() {}

  ngOnInit(): void {
    this.getAllRoles();
  }

  ngAfterViewInit(): void {
    /* this.filterComponent.filter$.subscribe((filteredList: Role[]) => {
      this.filteredRoles = filteredList;
      this.currentPage = 0;
    }); */
  }

  //#region Role crud
  getAllRoles(isActive?: boolean) {
    let filter: Record<string, any> = { "is_active" : true }
    this.roleService.dinamicFilters(this.currentPage - 1, this.pageSize, filter).subscribe({
      next: (result) => {
        this.roles = result.content;
        this.filteredRoles.next([...result.content]);
        this.lastPage = result.last;
        this.totalItems = result.totalElements;
      },
    });
  }

  assignPlotToDelete(role: Role) {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertTitle = 'Confirmacion';
    modalRef.componentInstance.alertMessage = `Está seguro que desea eliminar el rol: ${role.prettyName}?`;
    modalRef.componentInstance.alertVariant = 'delete';

    modalRef.result.then((result) => {
      if (result) {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            this.toastService.sendSuccess('Rol eliminado correctamente.');
            this.getAllRoles();
          },
          error: () => {
            this.toastService.sendError('Error al eliminar Rol.');
          },
        });
      }
    });
  }

  reactivatePlot(roleId: number) {
    this.roleService.reactiveRole(roleId).subscribe({
      next: () => {
        this.toastService.sendSuccess('Rol reactivado correctamente.');
        this.getAllRoles();
      },
      error: () => {
        this.toastService.sendError('Error al reactivar Rol.');
      },
    });
  }

  updateRole(roleId: number | undefined) {
    if (roleId != undefined) {
      this.router.navigate(['/users/roles/form/' + roleId]);
    }
  }

  detailRole(roleId: number | undefined) {
    if (roleId != undefined) {
      this.router.navigate(['users/roles/detail/' + roleId]);
    }
  }
  //#end region

  //#region Filters
  /**
   * Filters the list of owners based on the input value in the text box.
   * The filter checks if any property of the owner contains the search string (case-insensitive).
   * The filtered list is then emitted through the `filterSubject`.
   *
   * @param event - The input event from the text box.
   */
  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value?.length <= 2) {
      this.filteredRoles.next(this.roles);
    } else {
      let filterValue = target.value.toLowerCase();
      let filteredList = this.roles.filter((item) => {
        return Object.values(item).some((prop) => {
          const propString = prop ? prop.toString().toLowerCase() : '';

          // Se puede usar `includes` para verificar si hay coincidencias
          return propString.includes(filterValue);
        });
      });

      this.filteredRoles.next(filteredList);
    }
  }

  filterChange($event: Record<string, any>) {
    this.filters = $event;
    this.currentPage = 0
    this.confirmSearch()
  }

  dinamicFilter() {
    this.roleService.dinamicFilters(this.currentPage - 1, this.pageSize, this.filters).subscribe({
      next: (result) => {
        this.roles = result.content;
        this.filteredRoles.next([...result.content]);
        this.lastPage = result.last;
        this.totalItems = result.totalElements;
      },
    });
  }

  confirmSearch() {
    this.filters == undefined ? this.getAllRoles() : this.dinamicFilter();
  }

/*   filterChange($event: Record<string, any>) {
    this.roleService.dinamicFilters(0, this.pageSize, $event).subscribe({
      next: (result) => {
        this.roles = result.content;
        this.filteredRoles.next([...result.content]);
        this.lastPage = result.last;
        this.totalItems = result.totalElements;
      },
    });
  } */

  clearFilter() {
    this.filters = undefined;
    this.confirmSearch()
  }


  //#end region

  //#region Rounting
  /**
   * Redirects to the specified form path.
   */
  redirectToForm() {
    console.log(this.formPath);
    this.router.navigate([this.formPath]);
  }

  //#endregion

  //#region Pageable
  onItemsPerPageChange() {
    this.currentPage = 1;
    this.confirmSearch()
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.confirmSearch()
  }
  //#end region

  //#regin Export
  /**
   * Export the HTML table to a PDF file.
   * Calls the `exportTableToPdf` method from the `CadastreExcelService`.
   */
  exportToPdf() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Roles', 14, 20);

    this.roleService.getAllRoles(0, this.LIMIT_32BITS_MAX).subscribe({
      next: (data) => {
        autoTable(doc, {
          startY: 30,
          head: [['Código', 'Nombre', 'Nombre especial', 'Descripción', 'Activo']],
          body: data.content.map(role => [
            role.code,
            role.name,
            role.prettyName,
            role.description,
            role.active? 'Activo' : 'Inactivo'
          ])
        });
        doc.save(`${this.getActualDayFormat()}_Roles.pdf`);
      },
      error: () => {console.log("Error retrieved all, on export component.")}
    });
  }

  /**
   * Export the HTML table to an Excel file (.xlsx).
   * Calls the `exportTableToExcel` method from the `CadastreExcelService`.
   */
  exportToExcel() {
    this.roleService.getAllRoles(0, this.LIMIT_32BITS_MAX).subscribe({
      next: (data) => {
        const toExcel = data.content.map(role => ({
          'Código': role.code,
          'Nombre': role.name,
          'Nombre especial': role.prettyName,
          'Descripción': role.description,
          'Activo': role.active? 'Activo' : 'Inactivo'
        }));
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(toExcel);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Roles');
        XLSX.writeFile(wb, `${this.getActualDayFormat()}_Roles.xlsx`);
      },
      error: () => { console.log("Error retrieved all, on export component.") }
    });
  }

  getActualDayFormat() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    return formattedDate;
  }

  dataMapper(item: Role) {
    return [
      item['code'],
      item['name'],
      item['prettyName'],
      item['description'],
      item['active'] ? 'Activo' : 'Inactivo',
    ];
  }
  //#end region

  //#region Info Button
  openInfo() {
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true,
    });

    modalRef.componentInstance.title = 'Lista de Roles';
    modalRef.componentInstance.description =
      'En esta pantalla se podrán visualizar todos los roles que se pueden asignar a un usuario.';
    modalRef.componentInstance.body = [
      {
        title: 'Datos',
        content: [
          {
            strong: 'Código:',
            detail: 'Código del rol.',
          },
          {
            strong: 'Nombre especial:',
            detail: 'Nombre detallado del rol.',
          },
          {
            strong: 'Descripción: ',
            detail: 'Descripción breve de lo que define el rol.',
          },
          {
            strong: 'Activo: ',
            detail: 'Estado de activo del rol.',
          },
        ],
      },
      {
        title: 'Acciones',
        content: [
          {
            strong: 'Detalles: ',
            detail:
              'Redirige hacia la pantalla para poder visualizar detalladamente todos los datos del rol.',
          },
          {
            strong: 'Eliminar: ',
            detail: 'Inactiva el rol.',
          },
        ],
      },
      {
        title: 'Filtros',
        content: [
          {
            strong: 'Código: ',
            detail: 'Filtra por el código del rol.',
          },
          {
            strong: 'Activo: ',
            detail: 'Filtra por la condición de activo o inactivo del rol.',
          }
        ],
      },
      {
        title: 'Funcionalidades de los botones',
        content: [
          {
            strong: 'Filtros: ',
            detail:
              'Botón con forma de tolva que despliega los filtros avanzados.',
          },
          {
            strong: 'Exportar a Excel: ',
            detail: 'Botón verde que exporta la grilla a un archivo de Excel.',
          },
          {
            strong: 'Exportar a PDF: ',
            detail: 'Botón rojo que exporta la grilla a un archivo de PDF.',
          },
          {
            strong: 'Paginación: ',
            detail: 'Botones para pasar de página en la grilla.',
          },
        ],
      },
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una administración eficiente de los roles, manteniendo la integridad y precisión de los datos.',
    ];
  }
  //#end region

  //#region Old Filters
  changeActiveFilter(isActive?: boolean) {
    this.retrieveRolesByActive = isActive;
    this.getAllRoles();
  }
  //#end region
}
