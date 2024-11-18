import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import {
  Plot,
  PlotFilters,
  PlotStatusDictionary,
  PlotTypeDictionary,
} from '../../../models/plot';
import { PlotService } from '../../../services/plot.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import * as XLSX from 'xlsx';
import {
  ConfirmAlertComponent,
  ToastService,
  MainContainerComponent,
  Filter,
  FilterConfigBuilder,
  TableFiltersComponent,
} from 'ngx-dabd-grupo01';
import { BehaviorSubject, Subject } from 'rxjs';
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import {
  AsyncPipe,
  CommonModule,
  CurrencyPipe,
  DatePipe,
} from '@angular/common';
import { InfoComponent } from '../../commons/info/info.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-plots-list',
  standalone: true,
  imports: [
    FormsModule,
    NgbPagination,
    MainContainerComponent,
    CurrencyPipe,
    CommonModule,
    TableFiltersComponent,
    AsyncPipe,
  ],
  templateUrl: './plots-list.component.html',
  styleUrl: './plots-list.component.css',
  schemas: [],
  providers: [DatePipe],
})
export class PlotsListComponent {
  //#region SERVICIOS
  private router = inject(Router);
  private plotService = inject(PlotService);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal);
  private excelService = inject(CadastreExcelService);
  //#endregion

  //#region ATT de PAGINADO
  currentPage: number = 0;
  pageSize: number = 10;
  sizeOptions: number[] = [10, 25, 50];
  plotsList: Plot[] = [];
  //filteredPlotsList: Plot[] = [];
  lastPage: boolean | undefined;
  totalItems: number = 0;
  //#endregion

  //#region ATT de ACTIVE
  retrievePlotsByActive: boolean | undefined = true;
  //#endregion

  //#region ATT de FILTROS

  //itemsList!: Plot[];
  formPath: string = '/users/plot/form';
  objectName: string = '';
  LIMIT_32BITS_MAX = 2147483647;
  filteredPlotsList = new BehaviorSubject<Plot[]>([]);
  filter$ = this.filteredPlotsList.asObservable();

  headers: string[] = [
    'Nro. de Manzana',
    'Nro. de Lote',
    'Área Total',
    'Área Construida',
    'Tipo de Lote',
    'Estado del Lote',
    'Activo',
  ];

  filterConfig: Filter[] = new FilterConfigBuilder()

    //.numberFilter('Nro. Manzana', 'blockNumber', 'Seleccione una Manzana')
    .selectFilter('Tipo', 'plotType', 'Seleccione un tipo', [
      { value: 'COMMERCIAL', label: 'Comercial' },
      { value: 'PRIVATE', label: 'Privado' },
      { value: 'COMMUNAL', label: 'Comunal' },
    ])
    .selectFilter('Estado', 'plotStatus', 'Seleccione un estado', [
      { value: 'CREATED', label: 'Creado' },
      { value: 'FOR_SALE', label: 'En Venta' },
      { value: 'SALE', label: 'Venta' },
      { value: 'SALE_PROCESS', label: 'Proceso de Venta' },
      { value: 'CONSTRUCTION_PROCESS', label: 'En construcciones' },
      { value: 'EMPTY', label: 'Vacío' },
    ])
    .selectFilter('Activo', 'isActive', '', [
      { value: 'true', label: 'Activo' },
      { value: 'false', label: 'Inactivo' },
      { value: '', label: 'Todo' },
    ])
    .build();

  //#endregion

  //#region ATT de DICCIONARIOS
  plotTypeDictionary = PlotTypeDictionary;
  plotStatusDictionary = PlotStatusDictionary;
  dictionaries: Array<{ [key: string]: any }> = [
    this.plotStatusDictionary,
    this.plotTypeDictionary,
  ];
  //#endregion

  filters?: Record<string, any>

  //#region NgOnInit | BUSCAR
  ngOnInit() {
    //this.confirmFilterPlot();
    this.confirmSearch();
  }

  ngAfterViewInit(): void {
    // this.filterComponent.filter$.subscribe((filteredList: Plot[]) => {
    //   this.filteredPlotsList = filteredList;
    //   this.currentPage = 0;
    // });
  }

  //@ViewChild('filterComponent') filterComponent!: CadastrePlotFilterButtonsComponent<Plot>;
  @ViewChild('plotsTable', { static: true })
  tableName!: ElementRef<HTMLTableElement>;
  //#endregion

  //#region Plot Crud
  getAllPlots() {
    let filter = { "is_active" : true }
    this.plotService
      .dinamicFilters(
        this.currentPage - 1,
        this.pageSize,
        filter
      )
      .subscribe(
        (response) => {
          this.plotsList = response.content;
          this.filteredPlotsList.next([...this.plotsList]);
          this.lastPage = response.last;
          this.totalItems = response.totalElements;
        },
        (error) => {
          console.error('Error getting plots:', error);
        }
      );
  }

  assignPlotToDelete(plot: Plot) {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertTitle = 'Confirmación';
    modalRef.componentInstance.alertMessage = `Estás seguro que desea eliminar el lote nro ${plot.plotNumber} de la manzana ${plot.blockNumber}?`;
    modalRef.componentInstance.alertVariant = 'delete';

    modalRef.result.then((result) => {
      if (result) {
        this.plotService.deletePlot(plot.id).subscribe(
          (response) => {
            this.toastService.sendSuccess('Lote eliminado correctamente.');
            this.confirmSearch();
          },
          (error) => {
            this.toastService.sendError('Error al eliminar lote.');
          }
        );
      }
    });
  }
  //#endregion

  //#region Filters
  dinamicFilterInput: string = ""

  filterChange($event: Record<string, any>) {
    this.filters = {
      ...this.filters,
      ...$event
    };
    this.currentPage = -1
    this.confirmSearch()
  }

  clearFilter() {
    this.filters = undefined;
    this.currentPage = -1
    this.dinamicFilterInput = ""
    this.confirmSearch();
  }

  dinamicFilter() {
    const page = this.currentPage == 0 ? this.currentPage : this.currentPage - 1;
    this.plotService.dinamicFilters(page, this.pageSize, this.filters).subscribe({
      next: (result) => {
        this.plotsList = result.content;
        this.filteredPlotsList.next([...result.content]);
        this.lastPage = result.last;
        this.totalItems = result.totalElements;
      },
      error: (err) => console.log(err),
    });
  }

  confirmSearch() {
    this.filters == undefined ? this.getAllPlots() : this.dinamicFilter();
  }

  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this.currentPage = 0
    if (target.value?.length >= 3) {
      this.filters = {
        ...this.filters,
        "searchValue" : target.value
      }
    } else {
      this.filters = {
        ...this.filters,
        "searchValue" : ""
      }
    }
    this.confirmSearch()
  }

  /**
   * Translates a value using the provided dictionary.
   *
   * @param value - The value to translate.
   * @param dictionary - The dictionary used for translation.
   * @returns The key that matches the value in the dictionary, or undefined if no match is found.
   */
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
  //#endregion

  //#region Dictionaries
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

  dataMapper(item: Plot) {
    return [
      item['blockNumber'],
      item['plotNumber'],
      item['totalArea'],
      item['builtArea'],
      this.translateDictionary(item['plotType'], this.dictionaries[0]),
      this.translateDictionary(item['plotStatus'], this.dictionaries[1]),
      item['isActive'] ? 'Activo' : 'Inactivo',
    ];
  }
  //#endregion

  //#region REACTIVAR
  reactivatePlot(plotId: number) {
    this.plotService.reactivatePlot(plotId).subscribe({
      next: (response) => {
        this.toastService.sendSuccess("Lote reactivado")
        location.reload();
      },
      error: (error) => {
        this.toastService.sendError("No se pudo reactivar el lote")
      }
    })
  }
  //#endregion

  //#region RUTEO
  plotOwners(plotId: number) {
    this.router.navigate(['/users/owners/plot/' + plotId]);
  }

  updatePlot(plotId: number) {
    this.router.navigate(['/users/plot/form/', plotId]);
  }

  plotDetail(plotId: number) {
    this.router.navigate([`/users/plot/detail/${plotId}`]);
  }

  currentAccount(plotId: number) {
    this.router.navigate([`/users/account/concept/${plotId}`]);
  }

  redirectToForm() {
    this.router.navigate([this.formPath]);
  }
  //#endregion

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

  //#region EXPORT FUNCTIONS
  exportToPdf() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Lotes', 14, 20);

    this.plotService.dinamicFilters(0, this.LIMIT_32BITS_MAX, this.filters).subscribe({
      next: (data) => {
        autoTable(doc, {
          startY: 30,
          head: [['Nro. de Manzana', 'Nro. de Lote', 'Área Total', 'Área Construida', 'Tipo de Lote', 'Estado del Lote', 'Balance', 'Activo']],
          body: data.content.map(plot => [
            plot.blockNumber,
            plot.plotNumber,
            plot.totalArea,
            plot.builtArea,
            this.translateDictionary(plot.plotType, this.dictionaries[1]) || plot.plotType,
            this.translateDictionary(plot.plotStatus, this.dictionaries[0]) || plot.plotStatus,
            this.formatCurrency(plot.balance),
            plot.isActive? 'Activo' : 'Inactivo'
          ])
        });
        doc.save(`${this.getActualDayFormat()}_Lotes.pdf`);
      },
      error: () => {console.log("Error retrieved all, on export component.")}
    });
  }

  exportToExcel() {
    this.plotService.dinamicFilters(0, this.LIMIT_32BITS_MAX, this.filters).subscribe({
      next: (data) => {
        const toExcel = data.content.map(plot => ({
          'Nro. de Manzana': plot.blockNumber,
          'Nro. de Lote': plot.plotNumber,
          'Área Total': plot.totalArea,
          'Área Construida': plot.builtArea,
          'Tipo de Lote': this.translateDictionary(plot.plotType, this.dictionaries[1]) || plot.plotType,
          'Estado del Lote': this.translateDictionary(plot.plotStatus, this.dictionaries[0]) || plot.plotStatus,
          'Balance': this.formatCurrency(plot.balance),
          'Activo': plot.isActive? 'Activo' : 'Inactivo',
        }));
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(toExcel);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Lotes');
        XLSX.writeFile(wb, `${this.getActualDayFormat()}_Lotes.xlsx`);
      },
      error: () => { console.log("Error retrieved all, on export component.") }
    });
  }

  getActualDayFormat() {
    const today = new Date();

    return today.toISOString().split('T')[0];
  }
  //#endregion

  //#region Info Button
  openInfo() {
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true,
    });

    modalRef.componentInstance.title = 'Lista de Lotes';
    modalRef.componentInstance.description =
      'En esta pantalla se podrán visualizar todos los lotes que tiene el consorcio.';
    modalRef.componentInstance.body = [
      {
        title: 'Datos',
        content: [
          {
            strong: 'N° de manzana:',
            detail: 'Número de manzana del lote.',
          },
          {
            strong: 'N° de lote:',
            detail: 'Número del lote.',
          },
          {
            strong: 'Área total: ',
            detail: 'Área que ocupa el lote (en metros cuadrados).',
          },
          {
            strong: 'Área construida: ',
            detail: 'Área construida dentro del lote (en metros cuadrados).',
          },
          {
            strong: 'Tipo de lote: ',
            detail: 'Clasificación del lote.',
          },
          {
            strong: 'Estado del lote: ',
            detail: 'Estado del lote.',
          },
        ],
      },
      {
        title: 'Acciones',
        content: [
          {
            strong: 'Detalle dueños: ',
            detail:
              'Redirige hacia la pantalla para poder ver los dueños del lote.',
          },
          {
            strong: 'Editar: ',
            detail:
              'Redirige hacia la pantalla para poder editar los datos del lote',
          },
          {
            strong: 'Eliminar: ',
            detail: 'Inactiva el lote.',
          },
          {
            strong: 'Detalles: ',
            detail:
              'Redirige hacia la pantalla para poder visualizar detalladamente todos los datos del lote.',
          },
        ],
      },
      {
        title: 'Filtros',
        content: [
          {
            strong: 'Nro. manzana: ',
            detail:
              'Busca los lotes que coincida con el número de manzana ingresado.',
          },
          {
            strong: 'Tipo: ',
            detail: 'Busca los lotes que tengan el tipo de lote seleccionado.',
          },
          {
            strong: 'Estado: ',
            detail:
              'Busca los lotes que tengan el estado del lote seleccionado.',
          },
          {
            strong: 'Activo: ',
            detail:
              'Busca los lotes según la clasificación de activo seleccionado.',
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
            strong: 'Añadir nuevo lote: ',
            detail:
              'Botón "+" que redirige hacia la pantalla para dar de alta un nuevo lote.',
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
      'La interfaz está diseñada para ofrecer una administración eficiente de los lotes, manteniendo la integridad y precisión de los datos.',
    ];
  }
  //#end region

  //#region Old Filters
  /*   changeActiveFilter(isActive? : boolean) {
    this.retrievePlotsByActive = isActive
    this.confirmFilterPlot();
  }


  changeFilterMode(mode : PlotFilters) {
    switch (mode) {
      case PlotFilters.NOTHING:
        this.actualFilter = PlotFilters.NOTHING
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = false;
        this.confirmFilterPlot();
        break;

      case PlotFilters.BLOCK_NUMBER:
        this.actualFilter = PlotFilters.BLOCK_NUMBER
        this.applyFilterWithNumber = true;
        this.applyFilterWithCombo = false;
        break;

      case PlotFilters.PLOT_STATUS:
        this.actualFilter = PlotFilters.PLOT_STATUS
        this.contentForFilterCombo = this.getKeys(this.plotStatusDictionary)
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        break;

      case PlotFilters.PLOT_TYPE:
        this.actualFilter = PlotFilters.PLOT_TYPE
        this.contentForFilterCombo = this.getKeys(this.plotTypeDictionary)
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        break;

      default:
        break;
    }
  }

  cleanAllFilters() {

  }

  confirmFilterPlot() {
    switch (this.actualFilter) {
      case "NOTHING":
        this.getAllPlots();
        break;

      case "BLOCK_NUMBER":
        this.filterPlotByBlock(this.filterInput);
        break;

      case "PLOT_STATUS":
        this.filterPlotByStatus(this.translateCombo(this.filterInput, this.plotStatusDictionary));
        break;

      case "PLOT_TYPE":
        this.filterPlotByType(this.translateCombo(this.filterInput, this.plotTypeDictionary));
        break;

      default:
        break;
    }
  }

  filterPlotByBlock(blockNumber : string, isActive? : boolean) {
    this.plotService.filterPlotByBlock(this.currentPage, this.pageSize, blockNumber, this.retrievePlotsByActive).subscribe(
      response => {
        this.plotsList = response.content;
        this.filteredPlotsList = [...this.plotsList]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting plots:', error);
      }
    )
  }

  filterPlotByStatus(plotStatus : string, isActive? : boolean) {
    this.plotService.filterPlotByStatus(this.currentPage, this.pageSize, plotStatus, this.retrievePlotsByActive).subscribe(
      response => {
        this.plotsList = response.content;
        this.filteredPlotsList = [...this.plotsList]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting plots:', error);
      }
    )
  }

  filterPlotByType(plotType : string) {
    this.plotService.filterPlotByType(this.currentPage, this.pageSize, plotType, this.retrievePlotsByActive).subscribe(
      response => {
        this.plotsList = response.content;
        this.filteredPlotsList = [...this.plotsList]
        this.lastPage = response.last
        this.totalItems = response.totalElements;
      },
      error => {
        console.error('Error getting plots:', error);
      }
    )
  }

  */
  //#endregion

  formatCurrency(value: number): string {
    const formatted = (Math.round(value * 100) / 100).toFixed(2);
    return `$ ${formatted.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }


}
