import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { RolesFilterButtonsComponent } from '../roles-filter-buttons/roles-filter-buttons.component';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import { Operations } from '../../../constants/operationContants';
import { Router } from '@angular/router';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ConfirmAlertComponent, MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
import { Subject } from 'rxjs';
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import { InfoComponent } from '../../commons/info/info.component';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [RolesFilterButtonsComponent, FormsModule, NgbPagination, MainContainerComponent],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.css',
  providers: [DatePipe]
})
export class RolesListComponent implements OnInit{
  @ViewChild('filterComponent') filterComponent!: RolesFilterButtonsComponent<Role>;
  @ViewChild('rolesTable', { static: true }) tableName!: ElementRef<HTMLTableElement>;

  roles: Role[] = [];
  filteredRoles: Role[] = []
  currentPage: number = 0
  pageSize: number = 10
  totalItems: number = 0;
  sizeOptions : number[] = [10, 25, 50]
  roleId: number | undefined;
  lastPage: boolean | undefined;
  retrieveRolesByActive: boolean | undefined = true;

  constructor( private roleService: RoleService,
               private router: Router,
               private modalService: NgbModal,
               private toastService: ToastService)
  { }

  ngOnInit(): void {
    this.getAllRoles();
  }

  ngAfterViewInit(): void {
    this.filterComponent.filter$.subscribe((filteredList: Role[]) => {
      this.filteredRoles = filteredList;
      this.currentPage = 0;
    });
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    // this.confirmFilterPlot(); funcion para filtrar roles
  }

  onPageChange(page: number) {
    this.currentPage = page;
    // this.confirmFilterPlot(); funcion para filtrar roles
  }

  changeActiveFilter(isActive? : boolean) {
    this.retrieveRolesByActive = isActive;
    this.getAllRoles();
  }

  getAllRoles(){
    this.roleService.getAllRoles(this.currentPage, this.pageSize, this.retrieveRolesByActive).subscribe({
      next: (response: any) => {
        this.roles = response.content;
        this.filteredRoles = [...this.roles];
        this.lastPage = response.last;
        this.totalItems = response.totalElements;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      },
    });
  }

  assignPlotToDelete(role: Role) {
    const modalRef = this.modalService.open(ConfirmAlertComponent)
    modalRef.componentInstance.alertTitle='Confirmacion';
    modalRef.componentInstance.alertMessage=`Esta seguro que desea eliminar el rol: ${role.prettyName}?`;
    modalRef.componentInstance.alertVariant='delete'

    modalRef.result.then((result) => {
      if (result) {
        this.roleService.deleteRole(role.id, 1).subscribe({
          next: () => {
            this.toastService.sendSuccess('Rol eliminado correctamente.');
            this.getAllRoles();
          },
          error: () => { this.toastService.sendError('Error al eliminar Rol.'); }
        });
      }
    })
  }

  reactivatePlot(roleId : number) {
    this.roleService.reactiveRole(roleId, 1).subscribe({
      next: () => {
        this.toastService.sendSuccess('Rol reactivado correctamente.');
        this.getAllRoles();
      },
      error: () => { this.toastService.sendError('Error al reactivar Rol.'); }
    });
  }

  updateRole(roleId: number | undefined) {
    if(roleId != undefined){
      this.router.navigate(['roles/form/' + roleId]);
    }
  }

  detailRole(roleId: number | undefined) {
    if(roleId != undefined){
      this.router.navigate(['users/roles/detail/' + roleId]);
    }
  }

  //#region POR ACOMODAR

  itemsList!: Role[];
  formPath: string = "";
  objectName : string = ""

  headers : string[] = ['Código', 'Nombre', 'Nombre especial', 'Descripción', 'Activo']

  private dataMapper = (item: Role) => [
    item["code"],
    item["name"],
    item["prettyName"],
    item['description'],
    item['active']? 'Activo' : 'Inactivo',
  ];

  private LIMIT_32BITS_MAX = 2147483647
  // Subject to emit filtered results
  private filterSubject = new Subject<Role[]>();
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();

  // Inject the Excel service for export functionality
  private excelService = inject(CadastreExcelService);

  // Se va a usar para los nombres de los archivos.
  getActualDayFormat() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    return formattedDate;
  }

  /**
   * Export the HTML table to a PDF file.
   * Calls the `exportTableToPdf` method from the `CadastreExcelService`.
   */
  exportToPdf() {
    this.roleService.getAllRoles(0, this.LIMIT_32BITS_MAX).subscribe({
      next: (data) => {
        this.excelService.exportListToPdf(data.content, `${this.getActualDayFormat()}_${this.objectName}`, this.headers, this.dataMapper);
      },
      error: () => { console.log("Error retrieved all, on export component.") }
    });
  }

  /**
   * Export the HTML table to an Excel file (.xlsx).
   * Calls the `exportTableToExcel` method from the `CadastreExcelService`.
   */
  exportToExcel() {
    this.roleService.getAllRoles(0, this.LIMIT_32BITS_MAX).subscribe({
      next: (data) => {
        this.excelService.exportListToExcel(data.content, `${this.getActualDayFormat()}_${this.objectName}`);
      },
      error: () => { console.log("Error retrieved all, on export component.") }
    });
  }

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
      this.filterSubject.next(this.itemsList);
    } else {
      let filterValue = target.value.toLowerCase();
      let filteredList = this.itemsList.filter(item => {
        return Object.values(item).some(prop => {
          const propString = prop ? prop.toString().toLowerCase() : '';

          // Se puede usar `includes` para verificar si hay coincidencias
          return propString.includes(filterValue);
        });
      });

      this.filterSubject.next(filteredList);
    }
  }

  /**
   * Redirects to the specified form path.
   */
  redirectToForm() {
    console.log(this.formPath);
    this.router.navigate([this.formPath]);
  }

  //#endregion

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });

    modalRef.componentInstance.title = 'Lista de Roles';
    modalRef.componentInstance.description = 'En esta pantalla se podrán visualizar todos los roles que se pueden asignar a un usuario.';
    modalRef.componentInstance.body = [
      {
        title: 'Datos',
        content: [
          {
            strong: 'Código:',
            detail: 'Código del rol.'
          },
          {
            strong: 'Nombre especial:',
            detail: 'Nombre detallado del rol.'
          },
          {
            strong: 'Descripción: ',
            detail: 'Descripción breve de lo que define el rol.'
          },
          {
            strong: 'Activo: ',
            detail: 'Estado de activo del rol.'
          }
        ]
      },
      {
        title: 'Acciones',
        content: [
          {
            strong: 'Detalles: ',
            detail: 'Redirige hacia la pantalla para poder visualizar detalladamente todos los datos del rol.'
          },
          {
            strong: 'Eliminar: ',
            detail: 'Inactiva el rol.'
          }
        ]
      },
      {
        title: 'Filtros',
        content: []
      },
      {
        title: 'Funcionalidades de los botones',
        content: [
          {
            strong: 'Filtros: ',
            detail: 'Botón con forma de tolva que despliega los filtros avanzados.'
          },
          {
            strong: 'Exportar a Excel: ',
            detail: 'Botón verde que exporta la grilla a un archivo de Excel.'
          },
          {
            strong: 'Exportar a PDF: ',
            detail: 'Botón rojo que exporta la grilla a un archivo de PDF.'
          },
          {
            strong: 'Paginación: ',
            detail: 'Botones para pasar de página en la grilla.'
          }
        ]
      }
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una administración eficiente de los roles, manteniendo la integridad y precisión de los datos.'
    ];
  }
}
