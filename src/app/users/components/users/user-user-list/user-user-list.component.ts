import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import {
  ConfirmAlertComponent,
  ToastService,
  MainContainerComponent,
  TableFiltersComponent,
  Filter, FilterConfigBuilder
} from 'ngx-dabd-grupo01';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import { InfoComponent } from '../../commons/info/info.component';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-user-user-list',
  standalone: true,
  imports: [MainContainerComponent, NgbPagination, FormsModule, TableFiltersComponent],
  templateUrl: './user-user-list.component.html',
  styleUrl: './user-user-list.component.css',
  providers: [DatePipe]
})
export class UserUserListComponent {
    //#region SERVICIOS
    private router = inject(Router)
    private userService = inject(UserService)
    private toastService = inject(ToastService)
    private modalService = inject(NgbModal)
    //#endregion

    //#region ATT de PAGINADO
    currentPage: number = 0
    pageSize: number = 10
    sizeOptions : number[] = [10, 25, 50]
    usersList: User[] = [];
    filteredUsersList: User[] = [];
    lastPage: boolean | undefined
    totalItems: number = 0;
    //#endregion

    //#region ATT de ACTIVE
    retrieveUsersByActive: boolean | undefined = true;
    //#endregion

  filterConfig: Filter[] = new FilterConfigBuilder()
    .textFilter("Nombre", "firstName", "Nombre")
    .textFilter("Apellido", "lastName", "Apellido")
    .textFilter("Nombre de Usuario", "userName", "Nombre de Usuario")
    .textFilter("Correo Electrónico", "email", "Correo Electrónico")
    .selectFilter("Activo", "isActive", "", [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
      { value: '', label: 'Todo' }
    ])
    .build()


  //#region NgOnInit | BUSCAR
    ngOnInit() {
      this.getAllUsers();
    }

    ngAfterViewInit(): void {
    }

    @ViewChild('usersTable', { static: true }) tableName!: ElementRef<HTMLTableElement>;
    //#endregion

    //#region GET_ALL
    getAllUsers() {
      this.userService.getAllUsers(this.currentPage - 1, this.pageSize, this.retrieveUsersByActive).subscribe(
        response => {
          this.usersList = response.content.reverse();
          this.filteredUsersList = [...this.usersList].reverse();
          this.lastPage = response.last
          this.totalItems = response.totalElements;
        },
        error => {
          console.error('Error getting users:', error);
        }
      )
    }
    //#endregion

    //#region APLICACION DE FILTROS
    changeActiveFilter(isActive? : boolean) {
      this.retrieveUsersByActive = isActive
      this.getAllUsers();
    }
    //#endregion

    //#region DELETE
    assignUserToDelete(user: User) {
      const modalRef = this.modalService.open(ConfirmAlertComponent)
      modalRef.componentInstance.alertTitle='Confirmacion';
      modalRef.componentInstance.alertMessage=`Estas seguro que desea eliminar el usuario?`;
      modalRef.componentInstance.alertVariant='delete'

      modalRef.result.then((result) => {
        if (result && user.id) {

        this.userService.deleteUser(user.id, 1).subscribe(
          response => {
            this.toastService.sendSuccess('Usuario eliminado correctamente.')
          }, error => {
            this.toastService.sendError('Error al eliminar usuario.')
          }
        );
        }
      })
    }
    //#endregion

    //#region RUTEO
    updateUser(userId?: number) {
      this.router.navigate([`/users/user/form/${userId}`])
    }

    userDetail(userId? : number) {
      this.router.navigate([`/users/user/detail/${userId}`])
    }
    //#endregion

    //#region REACTIVAR
    reactivateUser(userId? : number) {
      // this.plotService.reactivatePlot(plotId, 1).subscribe(
      //   response => {
      //     location.reload();
      //   }
      // );
    }
    //#endregion

    //#region FUNCIONES PARA PAGINADO
    onItemsPerPageChange() {
      this.currentPage = 1;
      this.getAllUsers();
    }

    onPageChange(page: number) {
      this.currentPage = page;
      this.getAllUsers();
    }
    //#endregion

    //#region SHOW INFO | TODO
    showInfo() {
      // TODO: En un futuro agregar un modal que mostrara informacion de cada componente
    }
    //#endregion

     //#region POR ACOMODAR

  private excelService = inject(CadastreExcelService);

  LIMIT_32BITS_MAX = 2147483647

  itemsList!: User[];
  formPath: string = "";
  objectName : string = ""
  dictionaries: Array<{ [key: string]: any }> = [];

  // Subject to emit filtered results
  private filterSubject = new Subject<User[]>();
  // Observable that emits filtered owner list
  filter$ = this.filterSubject.asObservable();

  headers : string[] = ['Nombre completo', 'Nombre de usuario', 'Email', 'Activo']

  private dataMapper = (item: User) => [
    item["firstName"] + ' ' + item["lastName"],
    item["userName"],
    item["email"],
    item['isActive']? 'Activo' : 'Inactivo',
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
    this.userService.getAllUsers(0, this.LIMIT_32BITS_MAX).subscribe(
      response => {
        this.excelService.exportListToPdf(response.content, `${this.getActualDayFormat()}_${this.objectName}`, [], this.dataMapper);
      },
      error => {
        console.log("Error retrieved all, on export component.")

      }
    )
  }

  exportToExcel() {
    this.userService.getAllUsers(0, this.LIMIT_32BITS_MAX).subscribe(
      response => {
        this.excelService.exportListToExcel(response.content, `${this.getActualDayFormat()}_${this.objectName}`);
      },
      error => {
        console.log("Error retrieved all, on export component.")
      }
    )
  }

  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target.value?.length <= 2) {
      this.filterSubject.next(this.itemsList);
    } else {
      const filterValue = target.value.toLowerCase();

      const filteredList = this.itemsList.filter(item => {
        return Object.values(item).some(prop => {
          const propString = prop ? prop.toString().toLowerCase() : '';

          const translations = this.dictionaries && this.dictionaries.length
            ? this.dictionaries.map(dict => this.translateDictionary(propString, dict)).filter(Boolean)
            : [];

          return propString.includes(filterValue) || translations.some(trans => trans?.toLowerCase().includes(filterValue));
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
    this.router.navigate([this.formPath]);
  }

  filterChange($event: Record<string, any>) {
    this.userService.dinamicFilters(0, this.pageSize, $event).subscribe({
      next : (result) => {
        this.usersList = result.content;
        this.filteredUsersList = [...result.content]
        this.lastPage = result.last
        this.totalItems = result.totalElements;
      }
    })
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

    modalRef.componentInstance.title = 'Lista de Usuarios';
    modalRef.componentInstance.description = 'En esta pantalla se permite visualizar todos los usuarios que están registrados en el sistema.';
    modalRef.componentInstance.body = [
      {
        title: 'Datos',
        content: [
          {
            strong: 'Nombre completo:',
            detail: 'Nombre completo del usuario.'
          },
          {
            strong: 'Nombre de usuario:',
            detail: 'Nombre de usuario.'
          },
          {
            strong: 'Email: ',
            detail: 'Email con el que está registrado el usuario.'
          }
        ]
      },
      {
        title: 'Acciones',
        content: [
          {
            strong: 'Editar: ',
            detail: 'Redirige hacia la pantalla para poder editar los datos del usuario.'
          },
          {
            strong: 'Eliminar: ',
            detail: 'Inactiva el usuario.'
          },
          {
            strong: 'Detalles: ',
            detail: 'Redirige hacia la pantalla para poder visualizar detalladamente todos los datos del usuario.'
          }
        ]
      },
      {
        title: 'Filtros',
        content: [
        ]
      },
      {
        title: 'Funcionalidades de los botones',
        content: [
          {
            strong: 'Filtros: ',
            detail: 'Botón con forma de tolva que despliega los filtros avanzados.'
          },
          {
            strong: 'Añadir nuevo usuario: ',
            detail: 'Botón "+" que redirige hacia la pantalla para dar de alta un nuevo usuario.'
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
      'La interfaz está diseñada para ofrecer una administración eficiente de los usuarios, manteniendo la integridad y precisión de los datos.'
    ];
  }
}
