import {AfterViewInit, Component, ElementRef, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {
  Auth,
  AuthFilters,
  AuthRange,
  VisitorTypeAccessDictionary,
  VisitorTypeIconDictionary
} from "../../../models/authorization/authorize.model";
import {Router} from "@angular/router";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../../services/authorized-range/auth.service";
import {AuthorizerCompleterService} from "../../../services/authorized-range/authorizer-completer.service";
import {CadastrePlotFilterButtonsComponent} from "../../../accesses/features/cadastre-access-filter-buttons/cadastre-plot-filter-buttons.component";
import {Filter, FilterConfigBuilder, MainContainerComponent, ToastService} from "ngx-dabd-grupo01";
import {NgbModal, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {AccessActionDictionary, AccessModel} from "../../../models/accesses/access.model";
import {TransformResponseService} from "../../../services/transform-response.service";
import {UserTypeService} from "../../../services/user-type.service";
import {LoginService} from "../../../services/access/login.service";
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {NgClass} from "@angular/common";
import {DaysOfWeek} from "../../../models/authorization/authorizeRequest.model";
import { QrComponent } from '../../../qr/qr.component';

@Component({
  selector: 'app-auth-list',
  standalone: true,
  imports: [
    CommonModule,
    CadastrePlotFilterButtonsComponent,
    MainContainerComponent,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
    NgClass
  ],
  templateUrl: './auth-list.component.html',
  styleUrl: './auth-list.component.css'
})
export class AuthListComponent  implements OnInit, AfterViewInit {


  //#region FILTRADO

   searchParams: { [key: string]: any } = {};

   // Filtro dinámico
   filterType: string = '';
   startDate: string = '';
   endDate: string = '';
   type: string = '';

   setFilterType(type: string): void {
     this.filterType = type;
   }

   applyFilters(): void {
     if (this.filterType === 'Tipo Visitante') {
       this.searchParams = { visitorTypes: [this.type] }
      }
  }

   clearFilters(): void {
  // Restablece todos los filtros a su valor inicial.
   this.filterType = '';
   this.startDate = '';
   this.endDate = '';
   this.type = '';
   this.searchParams = {};

   // Reinicia la página actual a la primera
   this.currentPage = 0;
   }

   filterConfig: Filter[] = new FilterConfigBuilder()
   .selectFilter('Tipo Visitante', 'visitorType', 'Seleccione el tipo de visitante', [
     { value: 'VISITOR', label: 'Visitante' },
     { value: 'WORKER', label: 'Trabajador' },
     { value: 'OWNER', label: 'Propietario' },
     { value: 'PROVIDER', label: 'Proveedor' },
     { value: 'EMPLOYEE', label: 'Empleado' },
     { value: 'COHABITANT', label: 'Conviviente' },
     { value: 'EMERGENCY', label: 'Emergencia' },
     { value: 'PROVIDER_ORGANIZATION', label: 'Entidad' },
   ])
   .numberFilter('Nro de lote', 'plotNumber', 'Ingrese el número de lote')
   .build();


   onFilterValueChange(filters: Record<string, any>) {
    this.searchParams = {
      ...this.searchParams,  // Mantener filtros anteriores
      ...filters            // Agregar nuevos filtros
    };

    this.currentPage = 1;
    
    // Obtener todos los datos primero
    this.authService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
      let filteredData = [...data];

      // Aplicar filtro por tipo de visitante
      if (this.searchParams['visitorType']) {
        filteredData = filteredData.filter(item => 
          item.visitorType === this.searchParams['visitorType']
        );
      }

      // Aplicar filtro por número de lote
      if (this.searchParams['plotNumber']) {
        filteredData = filteredData.filter(item => 
          item.plotId === Number(this.searchParams['plotNumber'])
        );
      }

      // Filtrar por tipo de usuario si es necesario
      if (this.userType === "OWNER") {
        filteredData = filteredData.filter(x => x.plotId == 2);
      }
      if (this.userType === "GUARD") {
        filteredData = filteredData.filter(x => x.isActive);
      }

      // Procesar los datos filtrados
      filteredData.forEach(date => {
        date.authorizer = this.authorizerCompleterService.completeAuthorizer(date.authorizerId);
        if (date.authorizer === undefined) {
          date.authorizer = this.authorizerCompleterService.completeAuthorizer(1);
        }
      });

      // Transformar y actualizar la vista
      this.completeList = this.transformLotListToTableData(filteredData);
      let response = this.transformResponseService.transformResponse(
        filteredData,
        this.currentPage,
        this.pageSize,
        this.retrieveByActive
      );

      this.list = response.content;
      this.filteredList = [...this.list];
      this.lastPage = response.last;
      this.totalItems = filteredData.length;
    }, error => {
      console.error('Error getting:', error);
    });
  }

  @ViewChild('filterComponent') filterComponent!: CadastrePlotFilterButtonsComponent<AccessModel>;
  @ViewChild('table', {static: true}) tableName!: ElementRef<HTMLTableElement>;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  //#region SERVICIOS
  private router = inject(Router)
  private authService = inject(AuthService)
  private transformResponseService = inject(TransformResponseService)
  private authorizerCompleterService = inject(AuthorizerCompleterService)
  private toastService = inject(ToastService)
  private modalService = inject(NgbModal)
  private userTypeService = inject(UserTypeService)
  private loginService = inject(LoginService)
  //#endregion

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 10
  userType: string = "ADMIN"
  sizeOptions: number[] = [10, 25, 50]
  list: Auth[] = [];
  completeList: [] = [];
  filteredList: Auth[] = [];
  lastPage: boolean | undefined
  totalItems: number = 0;
  //#endregion
  heads: string[] =["Nro de Lote",
    "Visitante",
    "Documento",
    "Tipo",
    "Horarios",
    "Autorizador"]
  props: string[] =["Nro de Lote",
    "Visitante",
    "Documento",
    "Tipo",
    "Horarios",
    "Autorizador"]

  //#region ATT de ACTIVE
  retrieveByActive: boolean | undefined = true;
  //#endregion

  //#region ATT de FILTROS
  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  contentForFilterCombo: string[] = []
  actualFilter: string | undefined = AuthFilters.NOTHING;
  filterTypes = AuthFilters;
  filterInput: string = "";
  //#endregion

  //#region ATT de DICCIONARIOS
  typeDictionary = VisitorTypeAccessDictionary;
  actionDictionary = AccessActionDictionary;
  dictionaries = [this.typeDictionary, this.actionDictionary]
  //#endregion

  //#region NgOnInit | BUSCAR
  ngOnInit() {
    this.confirmFilter();
    this.getAll();
  }

  ngAfterViewInit(): void {
   this.filterComponent.filter$.subscribe((filter: string) => {
     this.getAllFiltered(filter)
    });
    this.userType = this.userTypeService.getType()
    this.userTypeService.userType$.subscribe((userType: string) => {
      this.userType = userType
      this.confirmFilter();
    });
  }

  //#endregion

  //#region GET_ALL
  getAll() {
    this.authService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
            if(this.userType === "OWNER"){
                data = data.filter(x => x.plotId == 2)
            }
            if(this.userType === "GUARD"){
                data = data.filter(x => x.isActive)
            }
        data.forEach(date => {
          date.authorizer = this.authorizerCompleterService.completeAuthorizer(date.authorizerId)
          if (date.authorizer === undefined){
            date.authorizer = this.authorizerCompleterService.completeAuthorizer(1)
          }
        })
        this.completeList = this.transformLotListToTableData(data);
        let response = this.transformResponseService.transformResponse(data,this.currentPage, this.pageSize, this.retrieveByActive)


        this.list = response.content;
        this.filteredList = [...this.list]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
        console.log(this.list);
      },
      error => {
        console.error('Error getting:', error);
      }
    );
  }

  getAllFiltered(filter: string) {
    this.authService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
        data = data.filter(x => (x.visitor.name.toLowerCase().includes(filter) || x.visitor.lastName?.toLowerCase().includes(filter)
        || x.visitor.docNumber.toString().includes(filter)))
        let response = this.transformResponseService.transformResponse(data,this.currentPage, this.pageSize, this.retrieveByActive)
        response.content.forEach(data => {
          data.authorizer = this.authorizerCompleterService.completeAuthorizer(data.authorizerId)
        })

        this.list = response.content;
        this.filteredList = [...this.list]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
        console.log(this.list);
      },
      error => {
        console.error('Error getting:', error);
      }
    );
  }

  //#endregion

  //#region FILTROS
  filterByVisitorType(type: string) {
    this.authService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
      data = data.filter(x => x.visitorType == type)
        let response = this.transformResponseService.transformResponse(data,this.currentPage, this.pageSize, this.retrieveByActive)
        response.content.forEach(data => {
          data.authorizer = this.authorizerCompleterService.completeAuthorizer(data.authorizerId)
        })

        this.list = response.content;
        this.filteredList = [...this.list]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting:', error);
      }
    );
  }

  filterByPlot(plot: number) {
    this.authService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
        data = data.filter(x => x.plotId == plot)
        let response = this.transformResponseService.transformResponse(data,this.currentPage, this.pageSize, this.retrieveByActive)
        response.content.forEach(data => {
          data.authorizer = this.authorizerCompleterService.completeAuthorizer(data.authorizerId)
        })

        this.list = response.content;
        this.filteredList = [...this.list]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting:', error);
      }
    );
  }

  //#endregion

  //#region APLICACION DE FILTROS
  changeActiveFilter(isActive?: boolean) {
    this.retrieveByActive = isActive
    this.confirmFilter();
  }


  changeFilterMode(mode: AuthFilters) {
    switch (mode) {
      case AuthFilters.NOTHING:
        this.actualFilter = AuthFilters.NOTHING
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = false;
        this.filterComponent.clearFilter();
        this.confirmFilter();
        break;

      case AuthFilters.PLOT_ID:
        this.actualFilter = AuthFilters.PLOT_ID
        this.applyFilterWithNumber = true;
        this.applyFilterWithCombo = false;
        break;

      case AuthFilters.VISITOR_TYPE:
        this.actualFilter = AuthFilters.VISITOR_TYPE
        this.contentForFilterCombo = this.getKeys(this.typeDictionary)
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        break;

      default:
        break;
    }
  }

  confirmFilter() {
    switch (this.actualFilter) {
      case "NOTHING":
        this.getAll()
        break;

      case "ACTION":
        this.filterByPlot(this.translateCombo(this.filterInput, this.actionDictionary));
        break;

      case "VISITOR_TYPE":
        this.filterByVisitorType(this.translateCombo(this.filterInput, this.typeDictionary));
        break;

      default:
        break;
    }
  }

  //#region RUTEO
  plotOwners(plotId: number) {
    this.router.navigate(["/owners/plot/" + plotId])
  }

  updatePlot(plotId: number) {
    this.router.navigate(["/plot/form/", plotId])
  }

  plotDetail(plotId: number) {
    this.router.navigate([`/plot/detail/${plotId}`])
  }

  //#endregion

  //#region USO DE DICCIONARIOS
  getKeys(dictionary: any) {
    return Object.keys(dictionary);
  }

  translateCombo(value: any, dictionary: any) {
    if (value !== undefined && value !== null) {
      return dictionary[value];
    }
    console.log("Algo salio mal.")
    return;
  }

  translateTable(value: any, dictionary: { [key: string]: any }) {
    if (value !== undefined && value !== null) {
      for (const key in dictionary) {
        if (dictionary[key] === value) {
          return key;
        }
      }
    }
    console.log("Algo salio mal.");
    return;
  }
  transformAuthRanges(ranges: AuthRange[]): string {
    let res = "";
    for (let authRange of ranges) {
        if (!authRange.isActive) {
            continue;
        }

        let temp = "";
        temp += authRange.dateFrom.replaceAll('-', '/') + ' - ' + authRange.dateTo.replaceAll('-', '/') + ' | ';

        // Verificar que daysOfWeek sea un array válido antes de iterar
        if (Array.isArray(authRange.daysOfWeek)) {
            for (let day of authRange.daysOfWeek) {
                switch (day) {
                    case "MONDAY":
                        temp += "L"; // Lunes
                        break;
                    case "TUESDAY":
                        temp += "M"; // Martes
                        break;
                    case "WEDNESDAY":
                        temp += "X"; // Miércoles
                        break;
                    case "THURSDAY":
                        temp += "J"; // Jueves
                        break;
                    case "FRIDAY":
                        temp += "V"; // Viernes
                        break;
                    case "SATURDAY":
                        temp += "S"; // Sábado
                        break;
                    case "SUNDAY":
                        temp += "D"; // Domingo
                        break;
                    default:
                        temp += day.charAt(0); // En caso de un valor inesperado
                }
                temp += ',';
            }
            // Eliminar la última coma
            temp = temp.slice(0, temp.length - 1);
        } else {
            console.warn(`daysOfWeek no es un array en el rango:`, authRange);
            temp += "Días no válidos";
        }

        temp += ' | ' + authRange.hourFrom.slice(0, 5) + ' a ' + authRange.hourTo.slice(0, 5);

        res += temp + ' y ';
    }
    // Eliminar la última ' y '
    res = res.slice(0, res.length - 3);
    return res;
 }


  //#region FUNCIONES PARA PAGINADO
  onItemsPerPageChange() {
    this.confirmFilter();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.confirmFilter();
  }

  //#endregion

  //#region SHOW INFO | TODO
  showInfo() {
    // TODO: En un futuro agregar un modal que mostrara informacion de cada componente
  }

  //#endregion
  transformLotListToTableData(list: any) {
    return list.map((item: { plotId: any; visitor: { name: any; lastName: any; docType: any; docNumber: any; }; visitorType: any; authRanges: AuthRange[]; authFirstName: any; authLastName: any  }) => ({
      'Nro de Lote': item.plotId || 'No aplica', // Manejo de 'No aplica' para plotId
      Visitante: `${item.visitor.name} ${item.visitor.lastName || ''}`, // Combina el nombre y el apellido
      Documento: `${(item.visitor.docType === "PASSPORT" ? "PASAPORTE" : item.visitor.docType)} ${item.visitor.docNumber}`, // Combina el tipo de documento y el número
      Tipo: this.translateTable(item.visitorType, this.typeDictionary), // Traduce el tipo de visitante
      Horarios: this.transformAuthRanges(item.authRanges), // Aplica la función para transformar los rangos de autorización
      Autorizador: `${item.authFirstName} ${item.authLastName}` // Combina el nombre y apellido del autorizador
    }));
  }

  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
    }
  daysOfWeek = [
    DaysOfWeek.MONDAY,
    DaysOfWeek.TUESDAY,
    DaysOfWeek.WEDNESDAY,
    DaysOfWeek.THURSDAY,
    DaysOfWeek.FRIDAY,
    DaysOfWeek.SATURDAY,
    DaysOfWeek.SUNDAY
  ];

  isDayActive(authRange: AuthRange, day: DaysOfWeek): boolean {
    return Array.isArray(authRange.daysOfWeek) && authRange.daysOfWeek.includes(day);
  }

  // Obtener inicial de cada día
  getDayInitial(day: DaysOfWeek): string {
    const dayInitials: { [key in DaysOfWeek]: string } = {
      [DaysOfWeek.MONDAY]: 'L',
      [DaysOfWeek.TUESDAY]: 'M',
      [DaysOfWeek.WEDNESDAY]: 'X',
      [DaysOfWeek.THURSDAY]: 'J',
      [DaysOfWeek.FRIDAY]: 'V',
      [DaysOfWeek.SATURDAY]: 'S',
      [DaysOfWeek.SUNDAY]: 'D'
    };
    return dayInitials[day];
  }

  getDocumentAbbreviation(docType: string): string {
    const abbreviations: { [key: string]: string } = {
      'DNI': 'D -',
      'PASSPORT': 'P -',
      'CUIL': 'CL -',
      'CUIT': 'CT -'
    };

    return abbreviations[docType] || docType; // Devuelve la abreviatura o el tipo original si no está en el mapeo
  }

  // Formatear el rango horario
  formatHour(hour: string): string {
    return hour.substring(0, 5); // Para obtener el formato HH:mm
  }

  edit(docNumber: number) {
    this.router.navigate(['/entries/new/auth'], { queryParams: { authId: docNumber } });
  }

  disable(authId: number) {
  this.authService.delete(authId,this.loginService.getLogin().id).subscribe(data => {
    this.confirmFilter();
  })
  }
  qr(doc: number){
    const modalRef = this.modalService.open(QrComponent, {size: 's'});
    modalRef.componentInstance.docNumber = doc
  }
  enable(authId: number) {
    this.authService.enable(authId,this.loginService.getLogin().id).subscribe(data => {
      this.confirmFilter();
    })
  }

  transformUpperCamelCase(value: string): string {
    if (!value) return value;
    return value
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toUpperCase() : match.toLowerCase()
      )
      .replace(/\s+/g, ''); // Elimina espacios
  }
  
  protected readonly VisitorTypeIconDictionary = VisitorTypeIconDictionary;
}


