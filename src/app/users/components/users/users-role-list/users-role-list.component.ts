import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  TableFiltersComponent,
  ToastService
} from 'ngx-dabd-grupo01';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user.service';
import {SessionService} from '../../../services/session.service';
import {User} from '../../../models/user';
import {CadastreExcelService} from '../../../services/cadastre-excel.service';
import {Subject} from 'rxjs';
import {DatePipe} from '@angular/common';
import {Role} from '../../../models/role';
import {RoleService} from '../../../services/role.service';

@Component({
  selector: 'app-users-role-list',
  standalone: true,
  imports: [
    FormsModule,
    MainContainerComponent,
    NgbPagination,
    TableFiltersComponent
  ],
  templateUrl: './users-role-list.component.html',
  styleUrl: './users-role-list.component.scss',
  providers: [DatePipe]
})
export class UsersRoleListComponent {
  private router = inject(Router)
  private userService = inject(UserService)
  private roleService = inject(RoleService)
  private sessionService = inject(SessionService);
  private toastService = inject(ToastService)
  private modalService = inject(NgbModal)

  rolesForCombo : any[] = []
  //TODO: Cambiar filtro porfavor
  filterConfig: Filter[] = new FilterConfigBuilder()
    .selectFilter("Rol", "rol", "Seleccionar un Rol", this.rolesForCombo)
    .build();
  /*
      "Creado": "CREATED",
      "En Venta": "FOR_SALE",
      "Venta": "SALE",
      "Proceso de Venta": "SALE_PROCESS",
      "En construcciones": "CONSTRUCTION_PROCESS",
      "Vacio": "EMPTY"
   */

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
    this.getAllRoles();
  }

  getAllRoles() {
    this.roleService.getAllRoles(0, 2147483647, true).subscribe(
      response => {
        for (const role of response.content) {
          this.rolesForCombo.push({ value: role.name, label: role.prettyName })
        }
      }
    )
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
    this.router.navigate(["/users/user/form"]);
  }

  //#endregion
  filterChange($event: Record<string, any>) {
    console.log($event['rol'])


    this.userService.getUsersByRole($event['rol'], this.currentPage, this.pageSize).subscribe({
      next: result => {
        this.userList = result.content;
        this.filteredUsersList = this.userList
        this.totalItems = result.totalElements;
      },
      error : err => this.toastService.sendError("Error al cargar la lista.")
    })
  }
}
