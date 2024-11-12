import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  TemplateRef,
  Type,
  ViewChild,
} from '@angular/core';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  ToastService,
} from 'ngx-dabd-grupo01';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';
import { TransformResponseService } from '../../../../services/transform-response.service';
import { VisitorTypeAccessDictionary, VisitorTypeIconDictionary } from '../../../../models/authorization/authorize.model';
import { Visitor } from '../../../../models/visitors/visitor.model';
import { VisitorFilter, VisitorService } from '../../../../services/visitors/visitor.service';
import { UserTypeService } from '../../../../services/user-type.service';
import { EntityFormComponent } from '../../entity-form/entity-form/entity-form.component';

import { AccessActionDictionary, AccessFilters } from '../../../../models/accesses/access.model';
import { LoginService } from '../../../../services/access/login.service';
import { CadastrePlotFilterButtonsComponent } from '../../../../accesses/cadastre-access-filter-buttons/cadastre-plot-filter-buttons.component';

@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [
    CadastrePlotFilterButtonsComponent,
    MainContainerComponent,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './entity-list.component.html'
})
export class EntityListComponent implements OnInit, AfterViewInit {

  @ViewChild('filterComponent')
  filterComponent!: CadastrePlotFilterButtonsComponent<Visitor>;
  @ViewChild('table', { static: true })
  tableName!: ElementRef<HTMLTableElement>;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  //#region SERVICIOS
  private router = inject(Router);
  private visitorService = inject(VisitorService);
  private transformResponseService = inject(TransformResponseService);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal);
  private userTypeService = inject(UserTypeService);
  private loginService = inject(LoginService);

  //#endregion

  //#region ATT de PAGINADO
  currentPage: number = 1;
  pageSize: number = 10;
  sizeOptions: number[] = [10, 25, 50];
  list: Visitor[] = [];
  completeList: [] = [];
  filteredList: Visitor[] = [];
  lastPage: boolean | undefined;
  totalItems: number = 0;

  visitorFilter : VisitorFilter ={
    active: true,
    textFilter: ''
  }
  //#endregion
  heads: string[] = ['Nombre', 'Documento', 'Tipos'];
  props: string[] = ['Nombre', 'Documento', 'Tipos'];

  //#region ATT de ACTIVE
  retrieveByActive: boolean | undefined = true;
  userType: string = 'ADMIN';
  //#endregion

  //#region ATT de FILTROS
  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  contentForFilterCombo: string[] = [];
  actualFilter: string | undefined = AccessFilters.NOTHING;
  filterTypes = AccessFilters;
  filterInput: string = '';
  //#endregion

  //#region ATT de DICCIONARIOS
  typeDictionary = VisitorTypeAccessDictionary;
  actionDictionary = AccessActionDictionary;
  dictionaries = [this.typeDictionary, this.actionDictionary];
  //#endregion

  //#region FILTRADO

  searchParams: { [key: string]: any } = {};

  // Filtro dinámico
  filterType: string = '';
  type: string = '';
  EntityFormComponent: Type<any> = EntityFormComponent;

  setFilterType(type: string): void {
    this.filterType = type;
  }

  applyFilters(): void {
    if (this.filterType === 'Tipo Visitante') {
      this.searchParams = { visitorTypes: [this.type] };
    }
  }

  clearFilters(): void {
    // Restablece todos los filtros a su valor inicial.
    this.filterType = '';
    this.type = '';
    this.searchParams = {};

    // Reinicia la página actual a la primera
    this.currentPage = 0;

    // Llama a getAll para cargar todos los registros sin filtros
    this.getAll();
  }

  filterConfig: Filter[] = new FilterConfigBuilder()
    .selectFilter(
      'Tipo Visitante',
      'visitorTypes',
      'Seleccione el tipo de visitante',
      [
        { value: 'VISITOR', label: 'Visitante' },
        { value: 'WORKER', label: 'Trabajador' },
        { value: 'OWNER', label: 'Propietario' },
        { value: 'PROVIDER', label: 'Proveedor' },
        { value: 'EMPLOYEE', label: 'Empleado' },
        { value: 'COHABITANT', label: 'Conviviente' },
        { value: 'EMERGENCY', label: 'Emergencia' },
        { value: 'PROVIDER_ORGANIZATION', label: 'Entidad' },
      ]
    )
    .build();


  onFilterValueChange(filters: Record<string, any>) {
    this.searchParams = {
      ...filters,
    };

    if (this.searchParams['visitorTypes']?.length > 0) {
      this.filterByVisitorType(this.searchParams['visitorTypes']);
    } else {
      this.getAll();
    }
  }
  //#endregion

  //#region NgOnInit | BUSCAR
  ngOnInit() {
    this.confirmFilter();
    this.getAll()
  }

  ngAfterViewInit(): void {
    this.filterComponent.filter$.subscribe((filter: string) => {
      this.getAllFiltered(filter);
    });
    this.userType = this.userTypeService.getType();
    this.userTypeService.userType$.subscribe((userType: string) => {
      this.userType = userType;
    });
  }

  //#endregion

  //#region GET_ALL
  getAll() {
    this.visitorService
      .getAllPaginated(this.currentPage-1, this.pageSize)
      .subscribe({
        next: (data) => {
          this.completeList = this.transformListToTableData(data.items);
          let response = this.transformResponseService.transformResponse(
            data.items,
            this.currentPage,
            this.pageSize,
            this.retrieveByActive
          );
          console.log(data)
          this.list = response.content;
          this.filteredList = [...this.list];
          this.lastPage = response.last;
          this.totalItems = data.totalElements;
          console.log(this.totalItems)
        },
        error: (error) => {
          console.error('Error getting visitors:', error);
        },
      });
  }

  getAllFiltered(filter: string) {
    //this.visitorService.getAllPaginated(this.currentPage, this.pageSize, {active : undefined , textFilter : filter})
    this.visitorService.getAllFiltered(filter)
      .subscribe({
        next: (data) => {
  
          if(filter === '' || filter=== null){
            this.getAll();
          }

          const filteredItems = data.items.filter(
            (x) =>
              x.name.toLowerCase().includes(filter.toLowerCase()) ||
              (x.lastName &&
                x.lastName.toLowerCase().includes(filter.toLowerCase())) ||
              x.docNumber.toString().includes(filter)
          );

          let response = this.transformResponseService.transformResponse(
            filteredItems,
            this.currentPage,
            this.pageSize,
            this.retrieveByActive
          );

          this.completeList = this.transformListToTableData(filteredItems);
          this.list = response.content;
          this.filteredList = [...this.list];
          this.lastPage = response.last;
          this.totalItems = filteredItems.length;
        },
        error: (error) => {
          console.error('Error getting visitors:', error);
        },
      });
  }

  getDocumentAbbreviation(docType: string): string {
    const abbreviations: { [key: string]: string } = {
      DNI: 'D -',
      PASSPORT: 'P -',
      CUIL: 'CL -',
      CUIT: 'CT -',
    };

    return abbreviations[docType] || docType; // Devuelve la abreviatura o el tipo original si no está en el mapeo
  }
  //#endregion

  //#region FILTROS
  filterByVisitorType(type: string[]) {
    this.visitorService
      .getAll(this.currentPage - 1, this.pageSize, this.retrieveByActive)
      .subscribe({
        next: (data) => {
          // Filtrar los items que contienen al menos uno de los tipos seleccionados
          const filteredItems = data.items.filter((x) =>
            x.visitorTypes.some((visitorType: string) =>
              type.includes(visitorType)
            )
          );

          let response = this.transformResponseService.transformResponse(
            filteredItems,
            this.currentPage,
            this.pageSize,
            this.retrieveByActive
          );

          this.completeList = this.transformListToTableData(filteredItems);
          this.list = response.content;
          this.filteredList = [...this.list];
          this.lastPage = response.last;
          this.totalItems = filteredItems.length;
        },
        error: (error) => {
          console.error('Error getting visitors:', error);
        },
      });
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
    console.log('Algo salio mal.');
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
    console.log('Algo salio mal.');
    return;
  }

  //#endregion
  //#region FUNCIONES PARA PAGINADO

  confirmFilter(): void {
    this.visitorService.getAllPaginated(this.currentPage - 1, this.pageSize, { active: true , textFilter: undefined}).subscribe(response => {
      this.filteredList = response.items;
      this.list = response.items
      this.totalItems = response.totalElements;
    });
  }

  onItemsPerPageChange() {
    this.confirmFilter();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.confirmFilter();
  }

  //#endregion

  transformListToTableData(list: any) {
    return list.map(
      (item: {
        name: any;
        lastName: any;
        docType: any;
        docNumber: any;
        visitorTypes: any[]; 
      }) => ({
        Nombre: `${item.name} ${item.lastName}`,
        Documento: `${
          item.docType === 'PASSPORT' ? 'PASAPORTE' : item.docType
        } ${item.docNumber}`,
        Tipos: item.visitorTypes
          ?.map((type) => this.translateTable(type, this.typeDictionary))
          .join(', '), // Traducir cada tipo y unirlos en una cadena
      })
    );
  }

  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { centered: true, size: 'lg' });
  }

  edit(id: any) {
    const modalRef = this.modalService.open(EntityFormComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.visitorId = id;

    // Suscribirse al evento 'entitySaved' del modal para recargar la lista
    modalRef.componentInstance.entitySaved.subscribe(() => {
      this.ngOnInit()
    });
  }
  // aca escucho el evento de que una entidad fue creada en el modal y actualizo la lista
  updateEntityList() {
    this.ngOnInit()
  }

  disable(visitorId: number) {
    this.visitorService.delete(visitorId,this.loginService.getLogin().id).subscribe(data => {
      this.getAll();
    })
  }

  enable(visitorId: number) {
    this.visitorService.enable(visitorId,this.loginService.getLogin().id).subscribe(data => {
      this.getAll();
    })
  }
  protected readonly VisitorTypeIconDictionary = VisitorTypeIconDictionary;
}
