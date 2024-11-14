import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbPagination, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MainContainerComponent, Filter, FilterConfigBuilder } from 'ngx-dabd-grupo01';
import { AccessModel, AccessFilters, AccessActionDictionary } from '../../../../models/accesses/access.model';
import { VisitorTypeAccessDictionary, VisitorTypeIconDictionary } from '../../../../models/authorization/authorize.model';
import { AccessService } from '../../../../services/access/access.service';
import { TransformResponseService } from '../../../../services/transform-response.service';
import { CadastrePlotFilterButtonsComponent } from '../../cadastre-access-filter-buttons/cadastre-plot-filter-buttons.component';
import { AuthorizerCompleterService } from '../../../../services/authorizer-completer.service';

@Component({
  selector: 'app-access-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CadastrePlotFilterButtonsComponent,
    NgbPagination,
    MainContainerComponent,
    FormsModule,
  ],
  templateUrl: './access-list.component.html'
})
export class AccessListComponent implements OnInit, AfterViewInit {

  @ViewChild('filterComponent') filterComponent!: CadastrePlotFilterButtonsComponent<AccessModel>;
  @ViewChild('table', {static: true}) tableName!: ElementRef<HTMLTableElement>;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  //#region SERVICIOS
  private router = inject(Router)
  private accessService = inject(AccessService)
  private transformResponseService = inject(TransformResponseService)
  private authorizerCompleterService = inject(AuthorizerCompleterService)
  //private toastService = inject(ToastService)
  private modalService = inject(NgbModal)
  //#endregion

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 10
  sizeOptions: number[] = [10, 25, 50]
  list: AccessModel[] = [];
  completeList: AccessModel[] = [];
  filteredList: AccessModel[] = [];
  lastPage: boolean | undefined
  totalItems: number = 0;
  //#endregion

  heads: string[] = ["Día", "Hora", "Accion", "Vehículo", "Documento", "Visitante", "Autorizador"]
  props: string[] = ["Día", "Hora", "Accion", "Vehículo", "Documento", "Visitante", "Autorizador"]

  //#region ATT de ACTIVE
  retrieveByActive: boolean | undefined = true;
  //#endregion

  //#region ATT de FILTROS
  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  applyFilterWithDate: boolean = false;
  contentForFilterCombo: string[] = []
  actualFilter: string | undefined = AccessFilters.NOTHING;
  filterTypes = AccessFilters;
  filterInput: string = "";
  dateFrom: Date = new Date();
  dateTo: Date = new Date();
  //#endregion

  //#region ATT de DICCIONARIOS
  typeDictionary = VisitorTypeAccessDictionary;
  actionDictionary = AccessActionDictionary;
  dictionaries = [this.typeDictionary, this.actionDictionary]
  //#endregion

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
 .selectFilter('Tipo Visitante', 'visitorTypes', 'Seleccione el tipo de visitante', [
   { value: 'VISITOR', label: 'Visitante' },
   { value: 'WORKER', label: 'Trabajador' },
   { value: 'OWNER', label: 'Propietario' },
   { value: 'PROVIDER', label: 'Proveedor' },
   { value: 'EMPLOYEE', label: 'Empleado' },
   { value: 'COHABITANT', label: 'Conviviente' },
   { value: 'EMERGENCY', label: 'Emergencia' },
   { value: 'PROVIDER_ORGANIZATION', label: 'Entidad' },
  ])
  .selectFilter('Acción' , 'action' , 'Seleccione una acción',[
    {value : 'ENTRY' , label:'Entrada'},
    {value : 'EXIT' , label:'Salida' }
  ])
  .dateFilter(
      'Fecha desde',
      'startDate',
      'Placeholder',
      "yyyy-MM-dd"
    )
    .dateFilter(
      'Fecha hasta',
      'endDate',
      'Placeholder',
      "yyyy-MM-dd"
    )

 .build();


  onFilterValueChange(filters: Record<string,any>) {
   this.searchParams = {
     ...filters,
   };

   this.currentPage = 1;
   console.log(this.searchParams);

   if(this.searchParams['visitorTypes']){
     this.filterByVisitorType(this.searchParams['visitorTypes']);
   } else if(this.searchParams['action']){
    this.filterByAction(this.searchParams['action'])
   }else if(this.searchParams['startDate'] && this.searchParams['endDate'] ){
    console.log('hhhh')
    this.filterByDate(this.searchParams['startDate'] , this.searchParams['endDate'] )
   }
   else{
    this.getAll();
   }
}

  //#region NgOnInit | BUSCAR
  ngOnInit() {
    this.confirmFilter();
  }

  ngAfterViewInit(): void {
    this.filterComponent.filter$.subscribe((filter: string) => {
      this.getAllFiltered(filter)
    });
  }

  //#endregion

  //#region GET_ALL
  getAll() {
    this.accessService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
        data.items.forEach(date => {
          if (date.authorizerId != undefined && date.authorizerId< 10){
            date.authorizer = this.authorizerCompleterService.completeAuthorizer(date.authorizerId)
          } else {
            date.authorizer = this.authorizerCompleterService.completeAuthorizer(3)
          }
        })
      this.completeList = this.transformListToTableData(data.items);
        let response = this.transformResponseService.transformResponse(data.items,this.currentPage, this.pageSize, this.retrieveByActive)


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
  //#region GET_ALL
  getAllFiltered(filter: string) {
    this.accessService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
      data.items = data.items.filter(x => (x.firstName?.toLowerCase().includes(filter)
      || x.lastName?.toLowerCase().includes(filter) || x.docNumber?.toString().includes(filter) || x.vehicleReg?.toLowerCase().includes(filter)))
        let response = this.transformResponseService.transformResponse(data.items,this.currentPage, this.pageSize, this.retrieveByActive)
        response.content.forEach(data => {
          if (data.authorizerId != undefined && data.authorizerId< 10){
            data.authorizer = this.authorizerCompleterService.completeAuthorizer(data.authorizerId)
          } else {
            data.authorizer = this.authorizerCompleterService.completeAuthorizer(3)
          }
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

  //#region FILTROS
  filterByVisitorType(type: string) {
    this.accessService.getByType(this.currentPage, this.pageSize, type, this.retrieveByActive).subscribe(data => {
        let response = this.transformResponseService.transformType(data.items,this.currentPage, this.pageSize, type, this.retrieveByActive)
        response.content.forEach(data => {
          if (data.authorizerId != undefined && data.authorizerId < 10){
            data.authorizer = this.authorizerCompleterService.completeAuthorizer(data.authorizerId)
          } else {
            data.authorizer = this.authorizerCompleterService.completeAuthorizer(3)
          }
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
  filterByDate(dateFrom: Date, dateTo: Date) {
    console.log(dateFrom , dateTo)
    if((new Date(new Date(dateFrom+"T00:00:00"))) > (new Date(new Date(dateTo+"T00:00:00")))){
      alert("aa")
      return
    }
    this.accessService.getAll(this.currentPage, this.pageSize, this.retrieveByActive).subscribe(data => {
        data.items = data.items.filter(x =>
          (new Date(new Date(x.actionDate).setHours(0,0,0,0))
          >= new Date(new Date(dateFrom+"T00:00:00").setHours(0,0,0,0))
          && new Date(new Date(x.actionDate).setHours(0,0,0,0))
          <= new Date(new Date(dateTo+"T00:00:00").setHours(0,0,0,0))))
        let response = this.transformResponseService.transformResponse(data.items,this.currentPage, this.pageSize, this.retrieveByActive)
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

  filterByAction(action: string) {
    this.accessService.getByAction(this.currentPage, this.pageSize, action, this.retrieveByActive).subscribe(data => {
      let response = this.transformResponseService.transformAction(data.items,this.currentPage, this.pageSize, action, this.retrieveByActive)
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


  changeFilterMode(mode: AccessFilters) {
    switch (mode) {
      case AccessFilters.NOTHING:
        this.actualFilter = AccessFilters.NOTHING
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = false;
        this.applyFilterWithDate = false;
        this.filterComponent.clearFilter();
        this.confirmFilter();
        break;

      case AccessFilters.ACTION:
        this.actualFilter = AccessFilters.ACTION
        this.contentForFilterCombo = this.getKeys(this.actionDictionary)
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        this.applyFilterWithDate = false;
        break;

      case AccessFilters.VISITOR_TYPE:
        this.actualFilter = AccessFilters.VISITOR_TYPE
        this.contentForFilterCombo = this.getKeys(this.typeDictionary)
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        this.applyFilterWithDate = false;
        break;

      case AccessFilters.DATE:
        this.actualFilter = AccessFilters.DATE
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = false;
        this.applyFilterWithDate = true;
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
        this.filterByAction(this.translateCombo(this.filterInput, this.actionDictionary));
        break;

      case "VISITOR_TYPE":
        this.filterByVisitorType(this.translateCombo(this.filterInput, this.typeDictionary));
        break;

      case "DATE":
        this.filterByDate(this.dateFrom, this.dateTo);
        break;

      default:
        break;
    }
  }

  //#endregion

  //#region DELETE
  /*  assignPlotToDelete(plot: Plot) {
      //TODO: Este modal se va a modificar por otro mas especifico de Eliminar.
      const modalRef = this.modalService.open(ConfirmAlertComponent)
      modalRef.componentInstance.alertTitle = 'Confirmacion';
      modalRef.componentInstance.alertMessage = `Estas seguro que desea eliminar el lote nro ${plot.plotNumber} de la manzana ${plot.blockNumber}?`;

      modalRef.result.then((result) => {
        if (result) {

          this.plotService.deletePlot(plot.id, 1).subscribe(
            response => {
              this.toastService.sendSuccess('Lote eliminado correctamente.')
              this.confirmFilter();
            }, error => {
              this.toastService.sendError('Error al eliminar lote.')
            }
          );
        }
      })
    }*/

  //#endregion

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

  getDocumentAbbreviation(docType: string): string {
    const abbreviations: { [key: string]: string } = {
      'DNI': 'D -',
      'PASSPORT': 'P -',
      'CUIL': 'CL -',
      'CUIT': 'CT -'
    };

    return abbreviations[docType] || docType; // Devuelve la abreviatura o el tipo original si no está en el mapeo
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

  transformDate(dateString: string): string{
    const date = new Date(dateString);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}-${month}-${year}`;
}

transformDateTable(dateString: string): string{
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

  transformHourTable(dateString: string): string{
    const date = new Date(dateString);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  }

  //#endregion

  //#region REACTIVAR
  /*  reactivatePlot(plotId: number) {
      this.plotService.reactivatePlot(plotId, 1).subscribe(
        response => {
          location.reload();
        }
      );
    }*/

  //#endregion

  //#region FUNCIONES PARA PAGINADO
  onItemsPerPageChange() {
    this.confirmFilter();
  }

  filterChange(data: any){
    console.log(data)
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.confirmFilter();
  }

  //#endregion

  //#endregion

  protected readonly oninput = oninput;

transformListToTableData(list :any) {
  return list.map((item: { firstName: any; lastName: any; docType: any; docNumber: any; visitorType: any; action: any; actionDate: any; vehicleReg: any; authorizer: { name: any; lastName: any; }; }) => ({
    Día: this.transformDateTable(item.actionDate),
    Hora: this.transformHourTable(item.actionDate),
    Accion: this.translateTable(item.action, this.actionDictionary),
    Vehículo: item.vehicleReg || 'N/A',
    Documento: `${(item.docType === "PASSPORT" ? "PASAPORTE" : item.docType)} ${item.docNumber}`,
    Visitante: `${item.firstName} ${item.lastName}`,
    Autorizador: `${item.authorizer?.name || ''} ${item.authorizer?.lastName || ''}`
  }));
}

transformUpperCamelCase(value: string): string {
  if (!value) return value;
  return value
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
      index === 0 ? match.toUpperCase() : match.toLowerCase()
    )
    .replace(/\s+/g, ''); // Elimina espacios
}

  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
    }

  protected readonly VisitorTypeIconDictionary = VisitorTypeIconDictionary;
}
