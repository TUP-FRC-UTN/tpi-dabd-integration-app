import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  TableFiltersComponent,
  ToastService,
} from 'ngx-dabd-grupo01';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { SessionService } from '../../../services/session.service';
import { User } from '../../../models/user';
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Role } from '../../../models/role';
import * as XLSX from 'xlsx';
import { RoleService } from '../../../services/role.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InfoComponent } from '../../commons/info/info.component';

@Component({
  selector: 'app-users-role-list',
  standalone: true,
  imports: [
    FormsModule,
    MainContainerComponent,
    NgbPagination,
    TableFiltersComponent,
    AsyncPipe
  ],
  templateUrl: './users-role-list.component.html',
  styleUrl: './users-role-list.component.scss',
  providers: [DatePipe],
})
export class UsersRoleListComponent {
  private router = inject(Router);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private sessionService = inject(SessionService);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal);

  rolesForCombo: any[] = [];
  //TODO: Cambiar filtro porfavor
  filterConfig: Filter[] = new FilterConfigBuilder()
    .selectFilter('Rol', 'rol', 'Seleccionar un Rol', this.rolesForCombo)
    .build();
  /*
      "Creado": "CREATED",
      "En Venta": "FOR_SALE",
      "Venta": "SALE",
      "Proceso de Venta": "SALE_PROCESS",
      "En construcciones": "CONSTRUCTION_PROCESS",
      "Vacio": "EMPTY"
   */

  userList!: User[];
  userName!: string;
  filteredUsersList: User[] = [];
  roleSelected: string = '';
  defaultRole: string = 'OWNER';
  prettyNameRoleSelected: string = 'Propietario';

  //#region ATT de PAGINADO
  currentPage: number = 0;
  pageSize: number = 10;
  sizeOptions: number[] = [10, 25, 50];
  lastPage: boolean | undefined;
  totalItems: number = 0;
  //#endregion

  ngOnInit() {
    this.getAllRoles();
    this.loadTable(this.defaultRole);
    this.roleSelected = this.defaultRole;
  }

  getAllRoles() {
    this.roleService.getAllRoles(0, 2147483647, true).subscribe((response) => {
      for (const role of response.content) {
        this.rolesForCombo.push({ value: role.name, label: role.prettyName });
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.ngOnInit();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.ngOnInit();
  }

  userDetail(userId?: number) {
    this.router.navigate([`users/user/detail/${userId}`]);
  }

  //#region POR ACOMODAR

  private excelService = inject(CadastreExcelService);

  LIMIT_32BITS_MAX = 2147483647;

  itemsList!: User[];
  objectName: string = '';
  dictionaries: Array<{ [key: string]: any }> = [];

  // Subject to emit filtered results
  private filterSubject = new BehaviorSubject<User[]>([]);
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();

  headers: string[] = [
    'Nombre completo',
    'Nombre de usuario',
    'Email',
    'Activo',
  ];

  private dataMapper = (item: User) => [
    item['firstName'] + ' ' + item['lastName'],
    item['userName'],
    item['email'],
    item['isActive'] ? 'Activo' : 'Inactivo',
  ];

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
    if (this.roleSelected) {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Usuarios con rol de ' + this.prettyNameRoleSelected, 14, 20);

      this.userService
        .getUsersByRole(this.roleSelected, 0, this.LIMIT_32BITS_MAX)
        .subscribe({
          next: (data) => {
            autoTable(doc, {
              startY: 30,
              head: [
                ['Nombre completo', 'Nombre de usuario', 'Email', 'Activo'],
              ],
              body: data.content.map((user: User) => [
                user.firstName + ' ' + user.lastName,
                user.userName,
                user.email,
                user.isActive ? 'Activo' : 'Inactivo',
              ]),
            });
            doc.save(`${this.getActualDayFormat()}_Usuarios.pdf`);
          },
          error: () => {
            console.log('Error retrieved all, on export component.');
          },
        });
    } else {
      this.toastService.sendError(
        'Por favor seleccione un rol para cargar en la sección de filtros'
      );
    }
  }

  exportToExcel() {
    if (this.roleSelected) {
      this.userService
        .getUsersByRole(this.roleSelected, 0, this.LIMIT_32BITS_MAX)
        .subscribe({
          next: (data) => {
            const toExcel = data.content.map((user: User) => ({
              'Nombre completo': user.firstName + ' ' + user.lastName,
              'Nombre de usuario': user.userName,
              Email: user.email,
              Activo: user.isActive ? 'Activo' : 'Inactivo',
            }));
            const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(toExcel);
            const wb: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
            XLSX.writeFile(wb, `${this.getActualDayFormat()}_Usuarios.xlsx`);
          },
          error: () => {
            console.log('Error retrieved all, on export component.');
          },
        });
    } else {
      this.toastService.sendError(
        'Por favor seleccione un rol para cargar en la sección de filtros'
      );
    }
  }

  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target.value?.length <= 2) {
      this.filterSubject.next(this.userList);
    } else {
      const filterValue = target.value.toLowerCase();

      const filteredList = this.userList.filter((item) => {
        return Object.values(item).some((prop) => {
          const propString = prop ? prop.toString().toLowerCase() : '';

          const translations =
            this.dictionaries && this.dictionaries.length
              ? this.dictionaries
                  .map((dict) => this.translateDictionary(propString, dict))
                  .filter(Boolean)
              : [];

          return (
            propString.includes(filterValue) ||
            translations.some((trans) =>
              trans?.toLowerCase().includes(filterValue)
            )
          );
        });
      });

      this.filterSubject.next(filteredList.length > 0 ? filteredList : []);
    }
  }

  translateDictionary(value: any, dictionary?: { [key: string]: any }) {
    if (value !== undefined && value !== null && dictionary) {
      for (const key in dictionary) {
        if (dictionary[key].toString().toLowerCase() === value.toLowerCase()) {
          return key;
        }
      }
    }
    return;
  }

  redirectToForm() {
    this.router.navigate(['/users/user/form']);
  }

  //#endregion
  filterChange($event: Record<string, any>) {

    if (!$event['rol']) {
      return;
    }
    this.loadTable($event['rol']);
    this.roleSelected = $event['rol'];
    this.prettyNameRoleSelected = this.rolesForCombo.find(role => role.value === this.roleSelected).label!;
  }

  loadTable(role: string){
    this.userService
      .getUsersByRole(role, this.currentPage, this.pageSize)
      .subscribe({
        next: (result) => {
          this.roleSelected = role;
          this.userList = result.content;
          this.filteredUsersList = this.userList;
          this.totalItems = result.totalElements;
          this.filterSubject.next(result.content);
        },
        error: (err) =>
          this.toastService.sendError('Error al cargar la lista'),
      });
  }

  //#region Info Button
  openInfo() {
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true,
    });

    modalRef.componentInstance.title = 'Lista de usuarios que tienen el rol';
    modalRef.componentInstance.description =
      'En esta pantalla se permite visualizar todos los usuarios que están registrados en el sistema que tienen asignado el rol seleccionado para buscar.';
    modalRef.componentInstance.body = [
      {
        title: 'Datos',
        content: [
          {
            strong: 'Nombre completo:',
            detail: 'Nombre completo del usuario.',
          },
          {
            strong: 'Nombre de usuario:',
            detail: 'Nombre de usuario.',
          },
          {
            strong: 'Email: ',
            detail: 'Email con el que está registrado el usuario.',
          },
          {
            strong: 'Estado: ',
            detail: 'Estado de activo o inactivo del usuario.',
          },
        ],
      },
      {
        title: 'Acciones',
        content: [
          {
            strong: 'Detalles: ',
            detail:
              'Botón con forma de ojo que redirige hacia la pantalla para poder visualizar detalladamente todos los datos del usuario.',
          },
        ],
      },
      {
        title: 'Filtros',
        content: [
          {
            strong: 'Rol: ',
            detail: 'Filtra los usuarios que tienen el rol seleccionado.',
          },
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
            strong: 'Añadir nuevo usuario: ',
            detail:
              'Botón "+" que redirige hacia la pantalla para dar de alta un nuevo usuario.',
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
      'La interfaz está diseñada para ofrecer una administración eficiente de los usuarios, manteniendo la integridad y precisión de los datos.',
    ];
  }
  //#end region
}
