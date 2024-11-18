import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import {
  ConfirmAlertComponent,
  ToastService,
  MainContainerComponent,
  TableFiltersComponent,
  Filter,
  FilterConfigBuilder,
} from 'ngx-dabd-grupo01';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import { InfoComponent } from '../../commons/info/info.component';
import { AsyncPipe, DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-user-user-list',
  standalone: true,
  imports: [
    MainContainerComponent,
    NgbPagination,
    FormsModule,
    TableFiltersComponent,
    AsyncPipe
  ],
  templateUrl: './user-user-list.component.html',
  styleUrl: './user-user-list.component.css',
  providers: [DatePipe],
})
export class UserUserListComponent {
  //#region SERVICIOS
  private router = inject(Router);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal);
  private excelService = inject(CadastreExcelService);
  //#endregion

  //#region Variables
  currentPage: number = 0;
  pageSize: number = 10;
  sizeOptions: number[] = [10, 25, 50];
  usersList: User[] = [];
  //filteredUsersList: User[] = [];
  lastPage: boolean | undefined;
  totalItems: number = 0;
  LIMIT_32BITS_MAX = 2147483647;
  //itemsList!: User[];
  formPath: string = 'users/user/form';
  objectName: string = '';
  dictionaries: Array<{ [key: string]: any }> = [];
  retrieveUsersByActive: boolean | undefined = true;

  private filteredUsersList = new BehaviorSubject<User[]>([]);
  // Observable that emits filtered owner list
  filter$ = this.filteredUsersList.asObservable();

  headers: string[] = [
    'Nombre completo',
    'Nombre de usuario',
    'Email',
    'Activo',
  ];

  filterConfig: Filter[] = new FilterConfigBuilder()
    .textFilter('Nombre', 'firstName', 'Nombre')
    .textFilter('Apellido', 'lastName', 'Apellido')
    .textFilter('Nombre de Usuario', 'userName', 'Nombre de Usuario')
    .textFilter('Correo Electrónico', 'email', 'Correo Electrónico')
    .selectFilter('Activo', 'isActive', '', [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
      { value: '', label: 'Todo' },
    ])
    .build();
  //#endregion

  //#region NgOnInit
  ngOnInit() {
    this.getAllUsers();
  }

  ngAfterViewInit(): void {}

  @ViewChild('usersTable', { static: true })
  tableName!: ElementRef<HTMLTableElement>;
  //#endregion

  //#region User crud
  getAllUsers() {
    this.userService
      .getAllUsers(
        this.currentPage - 1,
        this.pageSize,
        this.retrieveUsersByActive
      )
      .subscribe(
        (response) => {
          this.usersList = response.content.reverse();
          this.filteredUsersList.next([...this.usersList].reverse());
          this.lastPage = response.last;
          this.totalItems = response.totalElements;
        },
        (error) => {
          console.error('Error getting users:', error);
        }
      );
  }

  assignUserToDelete(user: User) {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertTitle = 'Confirmación';
    modalRef.componentInstance.alertMessage = `Estás seguro que desea eliminar el usuario?`;
    modalRef.componentInstance.alertVariant = 'delete';

    modalRef.result.then((result) => {
      if (result && user.id) {
        this.userService.deleteUser(user.id).subscribe(
          (response) => {
            this.toastService.sendSuccess('Usuario eliminado correctamente');
            this.confirmSearch();
          },
          (error) => {
            this.toastService.sendError('Error al eliminar usuario');
          }
        );
      }
    });
  }

  reactivateUser(userId?: number) {
    // this.plotService.reactivatePlot(plotId, 1).subscribe(
    //   response => {
    //     location.reload();
    //   }
    // );
  }
  //#endregion

  //#region Filters

  filters?: Record<string, any>

  filterChange($event: Record<string, any>) {
    this.filters = $event
    this.confirmSearch();
  }

  dinamicFilter() {
    this.userService.dinamicFilters(0, this.pageSize, this.filters).subscribe({
      next: (result) => {
        this.usersList = result.content;
        this.filteredUsersList.next([...result.content]);
        this.lastPage = result.last;
        this.totalItems = result.totalElements;
      },
    });
  }

  clearFilter() {
    this.filters = undefined;
    this.currentPage = 0
    this.confirmSearch();
  }

  confirmSearch() {
    this.filters == undefined ? this.getAllUsers() : this.dinamicFilter();
  }

  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target.value?.length <= 2) {
      this.filteredUsersList.next(this.usersList);
    } else {
      const filterValue = target.value.toLowerCase();

      const filteredList = this.usersList.filter((item) => {
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

      this.filteredUsersList.next(filteredList.length > 0 ? filteredList : []);
    }
  }

  //#region Pageable
  onItemsPerPageChange() {
    this.currentPage = 0;
    this.confirmSearch();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.confirmSearch();
  }
  //#endregion

  //#region Dictionaries
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

  dataMapper(item: User) {
    return [
      item['firstName'] + ' ' + item['lastName'],
      item['userName'],
      item['email'],
      item['isActive'] ? 'Activo' : 'Inactivo',
    ];
  }
  //#endregion

  //#region RUTEO
  updateUser(userId?: number) {
    this.router.navigate([`/users/user/form/${userId}`]);
  }

  userDetail(userId?: number) {
    this.router.navigate([`/users/user/detail/${userId}`]);
  }

  redirectToForm() {
    this.router.navigate([this.formPath]);
  }
  //#endregion

  //#region Export
  /**
   * Export the HTML table to a PDF file.
   * Calls the `exportTableToPdf` method from the `CadastreExcelService`.
   */
  exportToPdf() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Usuarios', 14, 20);

    this.userService.getAllUsers(0, this.LIMIT_32BITS_MAX).subscribe({
      next: (data) => {
        autoTable(doc, {
          startY: 30,
          head: [['Nombre completo', 'Nombre de usuario', 'Email', 'Activo',]],
          body: data.content.map(user => [
            user.firstName + ' ' + user.lastName,
            user.userName,
            user.email,
            user.isActive? 'Activo' : 'Inactivo'
          ])
        });
        doc.save(`${this.getActualDayFormat()}_Usuarios.pdf`);
      },
      error: () => {console.log("Error retrieved all, on export component.")}
    });
  }

  /**
   * Export the HTML table to an Excel file (.xlsx).
   * Calls the `exportTableToExcel` method from the `CadastreExcelService`.
   */
  exportToExcel() {
    this.userService.getAllUsers(0, this.LIMIT_32BITS_MAX).subscribe({
      next: (data) => {
        const toExcel = data.content.map(user => ({
          'Nombre completo': user.firstName + ' ' + user.lastName,
          'Nombre de usuario': user.userName,
          'Email': user.email,
          'Activo': user.isActive? 'Activo' : 'Inactivo'
        }));
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(toExcel);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
        XLSX.writeFile(wb, `${this.getActualDayFormat()}_Usuarios.xlsx`);
      },
      error: () => { console.log("Error retrieved all, on export component.") }
    });
  }

  getActualDayFormat() {
    const today = new Date();

    const formattedDate = today.toISOString().split('T')[0];

    return formattedDate;
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

    modalRef.componentInstance.title = 'Lista de Usuarios';
    modalRef.componentInstance.description =
      'En esta pantalla se permite visualizar todos los usuarios que están registrados en el sistema.';
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
        ],
      },
      {
        title: 'Acciones',
        content: [
          {
            strong: 'Editar: ',
            detail:
              'Redirige hacia la pantalla para poder editar los datos del usuario.',
          },
          {
            strong: 'Eliminar: ',
            detail: 'Inactiva el usuario.',
          },
          {
            strong: 'Detalles: ',
            detail:
              'Redirige hacia la pantalla para poder visualizar detalladamente todos los datos del usuario.',
          },
        ],
      },
      {
        title: 'Filtros',
        content: [
          {
            strong: 'Nombre: ',
            detail:
              'Filtra los usuarios por el nombre personal del usuario.',
          },
          {
            strong: 'Apellido: ',
            detail:
              'Filtra los usuarios por el apellido personal del usuario.',
          },
          {
            strong: 'Nombre de usuario: ',
            detail:
              'Filtra los usuarios por el nombre del usuario.',
          },
          {
            strong: 'Correo electrónico: ',
            detail:
              'Filtra los usuarios por el correo electrónico del usuario.',
          },
          {
            strong: 'Activo: ',
            detail:
              'Filtra los usuarios por la condición de activo o inactivo.',
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

  //#region Old Filters
  changeActiveFilter(isActive?: boolean) {
    this.retrieveUsersByActive = isActive;
    this.getAllUsers();
  }
}
