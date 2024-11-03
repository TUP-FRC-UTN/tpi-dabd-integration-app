import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Plot, PlotFilters, PlotStatusDictionary, PlotTypeDictionary } from '../../../models/plot';
import { PlotService } from '../../../services/plot.service';
import { Router } from '@angular/router';
import { CadastrePlotFilterButtonsComponent } from '../cadastre-plot-filter-buttons/cadastre-plot-filter-buttons.component';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfirmAlertComponent, ToastService, MainContainerComponent, Filter, FilterConfigBuilder, TableFiltersComponent } from 'ngx-dabd-grupo01';
import { Subject } from 'rxjs';
import { CadastreExcelService } from '../../../services/cadastre-excel.service';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-plots-list',
  standalone: true,
  imports: [CadastrePlotFilterButtonsComponent, FormsModule, NgbPagination, MainContainerComponent, CurrencyPipe, CommonModule, TableFiltersComponent],
  templateUrl: './plots-list.component.html',
  styleUrl: './plots-list.component.css',
  schemas: [],
  providers: [DatePipe]
})
export class PlotsListComponent {
  //#region SERVICIOS
  private router = inject(Router)
  private plotService = inject(PlotService)
  private toastService = inject(ToastService)
  private modalService = inject(NgbModal)
  private excelService = inject(CadastreExcelService);
  //#endregion

  //#region ATT de PAGINADO
  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
  plotsList: Plot[] = [];
  filteredPlotsList: Plot[] = [];
  lastPage: boolean | undefined
  totalItems: number = 0;
  //#endregion

  //#region ATT de ACTIVE
  retrievePlotsByActive: boolean | undefined = true;
  //#endregion

  //#region ATT de FILTROS
  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  contentForFilterCombo : string[] = []
  actualFilter : string | undefined = PlotFilters.NOTHING;
  filterTypes = PlotFilters;
  filterInput : string = "";

  filterConfig: Filter[] = new FilterConfigBuilder()

    .numberFilter('Nro. Manzana', 'plotNumber', 'Seleccione una Manzana')
    .selectFilter('Tipo', 'plotType', 'Seleccione un tipo', [
      {value: 'COMMERCIAL', label: 'Comercial'},
      {value: 'PRIVATE', label: 'Privado'},
      {value: 'COMMUNAL', label: 'Comunal'},
    ])
    .selectFilter('Estado', 'plotStatus', 'Seleccione un estado', [
      {value: 'CREATED', label: 'Creado'},
      {value: 'FOR_SALE', label: 'En Venta'},
      {value: 'SALE', label: 'Venta'},
      {value: 'SALE_PROCESS', label: 'Proceso de Venta'},
      {value: 'CONSTRUCTION_PROCESS', label: 'En construcciones'},
      {value: 'EMPTY', label: 'Vacio'},
    ])
    .radioFilter('Activo', 'isActive', [
      {value: 'true', label: 'Activo'},
      {value: 'false', label: 'Inactivo'},
      {value: 'undefined', label: 'Todo'},
    ])
    .build()

  //#endregion

  //#region ATT FILTER BUTTONS
  itemsList!: Plot[];
  formPath: string = "/plot/form";
  objectName : string = ""
  LIMIT_32BITS_MAX = 2147483647
  filterSubject = new Subject<Plot[]>();
  filter$ = this.filterSubject.asObservable();

  headers : string[] = ['Nro. de Manzana', 'Nro. de Lote', 'Area Total', 'Area Construida', 'Tipo de Lote', 'Estado del Lote', 'Activo']

  dataMapper = (item: Plot) => [
    item["blockNumber"],
    item["plotNumber"],
    item["totalArea"],
    item['builtArea'],
    this.translateDictionary(item["plotType"], this.dictionaries[0]),
    this.translateDictionary(item["plotStatus"], this.dictionaries[1]),
    item['isActive']? 'Activo' : 'Inactivo',
  ];
  //#endregion

  //#region ATT de DICCIONARIOS
  plotTypeDictionary = PlotTypeDictionary;
  plotStatusDictionary = PlotStatusDictionary;
  dictionaries: Array<{ [key: string]: any }> = [this.plotStatusDictionary, this.plotTypeDictionary];
  //#endregion

  //#region NgOnInit | BUSCAR
  ngOnInit() {
    this.confirmFilterPlot();
  }

  ngAfterViewInit(): void {
    // this.filterComponent.filter$.subscribe((filteredList: Plot[]) => {
    //   this.filteredPlotsList = filteredList;
    //   this.currentPage = 0;
    // });
  }

  //@ViewChild('filterComponent') filterComponent!: CadastrePlotFilterButtonsComponent<Plot>;
  @ViewChild('plotsTable', { static: true }) tableName!: ElementRef<HTMLTableElement>;
  //#endregion

  //#region GET_ALL
  getAllPlots() {
    this.plotService.getAllPlots(this.currentPage - 1, this.pageSize, this.retrievePlotsByActive).subscribe(
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
  //#endregion

  //#region FILTROS
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
  //#endregion

  //#region APLICACION DE FILTROS
  changeActiveFilter(isActive? : boolean) {
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
  //#endregion

  //#region DELETE
  assignPlotToDelete(plot: Plot) {
    const modalRef = this.modalService.open(ConfirmAlertComponent)
    modalRef.componentInstance.alertTitle='Confirmacion';
    modalRef.componentInstance.alertMessage=`Estas seguro que desea eliminar el lote nro ${plot.plotNumber} de la manzana ${plot.blockNumber}?`;
    modalRef.componentInstance.alertVariant='delete'

    modalRef.result.then((result) => {
      if (result) {

        this.plotService.deletePlot(plot.id, 1).subscribe(
          response => {
            this.toastService.sendSuccess('Lote eliminado correctamente.')
            this.confirmFilterPlot();
          }, error => {
            this.toastService.sendError('Error al eliminar lote.')
          }
        );
      }
    })
  }
  //#endregion

  //#region RUTEO
  plotOwners(plotId: number) {
    this.router.navigate(["/owners/plot/" + plotId])
  }

  updatePlot(plotId: number) {
    this.router.navigate(["/plot/form/", plotId])
  }

  plotDetail(plotId : number) {
    this.router.navigate([`/plot/detail/${plotId}`])
  }

  redirectToForm() {
    this.router.navigate([this.formPath]);
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
  //#endregion

  //#region REACTIVAR
  reactivatePlot(plotId : number) {
    this.plotService.reactivatePlot(plotId, 1).subscribe(
      response => {
        location.reload();
      }
    );
  }
  //#endregion

  //#region FUNCIONES PARA PAGINADO
  onItemsPerPageChange() {
    this.currentPage = 1;
    this.confirmFilterPlot();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.confirmFilterPlot();
  }
  //#endregion

  //#region SHOW INFO | TODO
  showInfo() {
    // TODO: En un futuro agregar un modal que mostrara informacion de cada componente
  }
  //#endregion

  //#region METODOS FILTER BUTTONS
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

  //#region EXPORT FUNCTIONS
  exportToPdf() {
    let actualPageSize = this.pageSize;

    this.plotService.getAllPlots(0, this.LIMIT_32BITS_MAX, true).subscribe(
      response => {
        this.excelService.exportListToPdf(response.content, `${this.getActualDayFormat()}_${this.objectName}`, this.headers, this.dataMapper);
      },
      error => {
        console.log("Error retrieved all, on export component.")
      }
    )
  }

  exportToExcel() {
    this.plotService.getAllPlots(0, this.LIMIT_32BITS_MAX, true).subscribe(
      response => {
        this.excelService.exportListToExcel(response.content, `${this.getActualDayFormat()}_${this.objectName}`);
      },
      error => {
        console.log("Error retrieved all, on export component.")
      }
    )
  }

  getActualDayFormat() {
    const today = new Date();

    return today.toISOString().split('T')[0];
  }
  //#endregion
  filterChange($event: Record<string, any>) {
    console.log($event)
    this.plotService.dinamicFilters(0, this.pageSize, $event).subscribe({
      next: result => {
        console.log(result.content);
        this.plotsList = result.content
        this.plotsList = result.content;
        this.filteredPlotsList = [...this.plotsList]
        this.lastPage = result.last
        this.totalItems = result.totalElements;
      },
      error: err => console.log(err)
    })
  }
}
