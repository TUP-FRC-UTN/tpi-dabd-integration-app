import {Component, inject} from '@angular/core';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  TableFiltersComponent,
  ToastService
} from "ngx-dabd-grupo01";
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import {DatePipe, NgClass} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import { routes } from '../../../../app.routes';
import {NgbModal, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import {Subject} from "rxjs";
import { InfoComponent } from '../../commons/info/info.component';
import {SessionService} from '../../../services/session.service';

@Component({
  selector: 'app-users-created-by-user',
  standalone: true,
  imports: [
    MainContainerComponent,
    NgClass,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
    TableFiltersComponent,
    DatePipe
  ],
  providers: [DatePipe],
  templateUrl: './users-created-by-user.component.html',
  styleUrl: './users-created-by-user.component.css'
})
export class UsersCreatedByUserComponent {
  private router = inject(Router)
  private userService = inject(UserService)
  private sessionService = inject(SessionService);
  private toastService = inject(ToastService)
  private modalService = inject(NgbModal)


  userList!: User[]
  userName!: string;
  filteredUsersList: User[] = [];

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
  lastPage: boolean | undefined
  totalItems: number = 0;
  //#endregion

  ngOnInit() {
    let id = this.sessionService.getItem("user")
    id = 1

    if (id) {
      this.userService.getUserById(id).subscribe({
        next: result => {
          this.userName = result.firstName + " " + result.lastName
        }
      })
      // this.userService.getUsersCreatedBy(id, this.currentPage, this.pageSize).subscribe({
      this.userService.getUsersCreatedBy(id, this.currentPage, this.pageSize).subscribe({
        next: result => {
          this.userList = result.content;
          this.filteredUsersList = this.userList
          this.totalItems = result.totalElements;
        }
      })
    } else {
      this.toastService.sendError("Error al cargar la pagina, reintente.")
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.ngOnInit();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.ngOnInit();
  }

  userDetail(userId? : number) {
    this.router.navigate([`users/user/detail/${userId}`])
  }

  //#region POR ACOMODAR

  private excelService = inject(CadastreExcelService);

  LIMIT_32BITS_MAX = 2147483647

  itemsList!: User[];
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
    this.router.navigate(["/users/user/tenant/form"]);
  }

  //#endregion
  filterChange($event: Record<string, any>) {
    console.log($event)
  }

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });

    modalRef.componentInstance.title = 'Listado de usuarios creados por un usuario';
    modalRef.componentInstance.description = 'En esta pantalla se permite ver que usuarios han sido creados por otro usuario.';
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
      'La interfaz está diseñada para ofrecer una administración eficiente de los usuarios creados por un usuario, manteniendo la integridad y precisión de los datos.'
    ];


  }
}
