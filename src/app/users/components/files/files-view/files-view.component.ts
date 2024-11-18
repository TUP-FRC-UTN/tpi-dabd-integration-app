import { Component, inject } from '@angular/core';
import { ValidateOwner } from '../../../models/ownerXplot';
import { DocumentTypeDictionary, Owner, OwnerFilters, OwnerStatusDictionary, OwnerTypeDictionary, StateKYC } from '../../../models/owner';
import { OwnerService } from '../../../services/owner.service';
import { mapKycStatus } from '../../../utils/owner-helper';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Filter, FilterConfigBuilder, MainContainerComponent, TableFiltersComponent } from 'ngx-dabd-grupo01';
import { Router } from '@angular/router';
import { InfoComponent } from '../../commons/info/info.component';
import { AsyncPipe, CommonModule, DatePipe, Location } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as XLSX from 'xlsx';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-files-view',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NgbPagination, MainContainerComponent,
     TableFiltersComponent, AsyncPipe],
  templateUrl: './files-view.component.html',
  styleUrl: './files-view.component.css',
  providers: [DatePipe],
})
export class FilesViewComponent {

  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
  lastPage: boolean | undefined;

  totalItems: number = 0;
  filteredFilesList: ValidateOwner[] = [];

  filterConfig: Filter[] = new FilterConfigBuilder()
    .selectFilter(
      'Tipo de Documento',
      'doc_type',
      'Seleccione un tipo de documento',
      [
        { value: 'DNI', label: 'DNI' },
        { value: 'ID', label: 'Cédula' },
        { value: 'PASSPORT', label: 'Pasaporte' },
      ]
    )
    .selectFilter(
      'Estado del Propietario',
      'owner_kyc',
      'Seleccione un estado del propietario',
      [
        { value: 'INITIATED', label: 'Iniciado' },
        { value: 'TO_VALIDATE', label: 'Para Validar' },
        { value: 'VALIDATED', label: 'Validado' }
      ]
    )
    .build();

  owners: Owner[] = [];
  private filteredOwnersList = new BehaviorSubject<Owner[]>([]);
  filter$ = this.filteredOwnersList.asObservable();


  dictionaries: Array<{ [key: string]: any }> = [];
  LIMIT_32BITS_MAX = 2147483647;
  headers: string[] = ['Nombre', 'Apellido', 'Documento', 'Tipo propietario'];

  protected ownerService = inject(OwnerService);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private location = inject(Location);


  ngOnInit() {
    this.confirmSearch();
    this.filteredOwnersList.subscribe(ow => console.log(ow));

  }

  mapKYCStatus(type: string){
    return mapKycStatus(type);
  }

  filters?: Record<string, any>


  // metodos para obtener owners
  getAllOwners() {
    let fixFilter = {
      ...this.filters,
      "is_active" : true,
      "owner_kyc" : "TO_VALIDATE"
    }
    this.ownerService.dinamicFilters(this.currentPage - 1, this.pageSize, fixFilter).subscribe({
      next: (response) => {
        this.owners = response.content;
        this.filteredOwnersList.next([...this.owners]);
        this.lastPage = response.last;
        this.totalItems = response.totalElements;
      },
      error: (error) => console.error('Error al obtener owners: ', error),
    });
  }



  ownerFilesDetail(id: number | undefined) {
    console.log("ver archivos del propietario");
    this.router.navigate([`/users/files/${id}/view`]);
  }


  // metodo para aprobar el estado completo del owner
  approbeOwnerFiles(id: number | undefined) {
    console.log("aprobar archivos del propietario ", id);
  }

  // metodo para rechazar el estado completo del owner
  rejectOwnerFiles(id: number | undefined) {
    console.log("rechazar archivos del propietario ", id);
  }



  plotDetail(plotId : number) {
    this.router.navigate([`/users/plot/detail/${plotId}`])
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.confirmSearch();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.confirmSearch();
  }

  toggleView(type: string){}
  applyFilter(type: string){}
  clearFilters(){}
  confirmFilter(){}



  goBack() {
    this.location.back()
  }

  openInfo(){
    const modalRef = this.modalService.open(InfoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      scrollable: true
    });

    modalRef.componentInstance.title = 'Propietarios en proceso de Validación';
    modalRef.componentInstance.description = 'Esta pantalla proporciona información a cera de los propietarios que están en proceso de validación.';
    modalRef.componentInstance.body = [
      {
        title: 'Datos',
        content: [
          {
            strong: 'Nombre:',
            detail: 'Nombre del propietario.'
          },
          {
            strong: 'Apellido:',
            detail: 'Apellido del propietario.'
          },
          {
            strong: 'Tipo Doc: ',
            detail: 'Tipo de documento del propietario.'
          },
          {
            strong: 'Doc N°: ',
            detail: 'Número de documento del propietario.'
          },
          {
            strong: 'Estado: ',
            detail: 'Estado de la validación del propietario.'
          }
        ]
      },
      {
        title: 'Acciones',
        content: [
          {
            strong: 'Detalle: ',
            detail: 'Redirige hacia la pantalla para poder visualizar los documentos cargados por el propietario.'
          }
        ]
      },
      {
        title: 'Funcionalidades de los botones',
        content: [
          {
            strong: 'Limpieza de Filtros:',
            detail: 'Botón rojo "Limpiar" para remover todos los filtros aplicados.'
          },
          {
            strong: 'Aplicación de Filtros:',
            detail: 'Botón azul "Filtros" para desplegar las opciones de filtrado.'
          },
          {
            strong: 'Filtros de activos:',
            detail: ''
          },
          {
            strong: 'Paginación: ',
            detail: 'Botones para pasar de página en la grilla.'
          }
        ]
      }
    ];
    modalRef.componentInstance.notes = [
      'La interfaz está diseñada para ofrecer una administración eficiente de los procesos de validación de propietarios.'
    ];
  }



  //#region Dictionaries
  getKeys(dictionary: any) {
    return Object.keys(dictionary);
  }

  translateCombo(value: any, dictionary: any) {
    if (value !== undefined && value !== null) {
      return dictionary[value];
    }
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
    return;
  }

  dataMapper(item: Owner) {
    return [
      item['firstName'] + (item['secondName'] ? ' ' + item['secondName'] : ''),
      item['lastName'],
      this.translateDictionary(item['documentType'], this.dictionaries[0]) +
        ': ' +
        item['documentNumber'],
      this.translateDictionary(item['ownerType'], this.dictionaries[1]),
    ];
  }
  /**
   * Translates a value using the provided dictionary.
   *
   * @param value - The value to translate.
   * @param dictionary - The dictionary used for translation.
   * @returns The key that matches the value in the dictionary, or undefined if no match is found.
   */
  translateDictionary(value: any, dictionary?: { [key: string]: any }) {
    debugger
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

  //#region Filters
  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  contentForFilterCombo: string[] = [];
  actualFilter: string | undefined = OwnerFilters.NOTHING;
  filterTypes = OwnerFilters;
  filterInput: string = '';

  documentTypeDictionary = DocumentTypeDictionary;
  ownerTypeDictionary = OwnerTypeDictionary;
  ownerStatusDictionary = OwnerStatusDictionary;
  ownerDictionaries = [this.documentTypeDictionary, this.ownerTypeDictionary, this.ownerStatusDictionary];


  filterChange($event: Record<string, any>) {
    this.filters = $event;
    this.currentPage = 0
    this.confirmSearch();
  }

  /**
   * Filters the list of owners based on the input value in the text box.
   * The filter checks if any property of the owner contains the search string (case-insensitive).
   * The filtered list is then emitted through the `filterSubject`.
   *
   * @param event - The input event from the text box.
   */
  onFilterTextBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    const filterValue = target.value.toLowerCase();

    let filteredList = this.owners.filter((owner) => {
      return Object.values(owner).some((prop) => {
        const propString = prop
          ? prop
              .toString()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f.]/g, '')
          : '';

        // Validar que dictionaries esté definido y tenga elementos antes de mapear
        const translations = this.ownerDictionaries && this.ownerDictionaries.length
          ? this.ownerDictionaries.map(dict => this.translateDictionary(propString, dict)).filter(Boolean)
          : [];

        // Se puede usar `includes` para verificar si hay coincidencias
        return propString.includes(filterValue); //|| translations.some(trans => trans?.toLowerCase().includes(filterValue));
      });
    });

    //console.log("LISTA FILTRADA->", filteredList);

    this.filteredOwnersList.next(filteredList);
  }

  //#end region



  //#region Export
  // Se va a usar para los nombres de los archivos.
  getActualDayFormat() {
    const today = new Date();

    const formattedDate = today.toISOString().split('T')[0];

    return formattedDate;
  }

  exportToPdf() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Propietarios', 14, 20);

    this.ownerService.getOwners(0, this.LIMIT_32BITS_MAX, true).subscribe({
      next: (data) => {
        autoTable(doc, {
          startY: 30,
          head: [['Nombre', 'Apellido', 'Documento', 'Tipo propietario', 'Estado KYC']],
          body: data.content.map(owner => [
            owner.firstName,
            owner.lastName,
            this.translateDictionary(owner.documentType, this.ownerDictionaries[0])! + ': ' + owner.documentNumber,
            this.translateDictionary(owner.ownerType, this.ownerDictionaries[1])!,
            this.translateDictionary(owner.kycStatus, this.ownerStatusDictionary)!
          ])
        });
        doc.save(`${this.getActualDayFormat()}_Propietarios.pdf`);
      },
      error: () => {console.log("Error retrieved all, on export component.")}
    });
  }

  exportToExcel() {
    this.ownerService.getOwners(0, this.LIMIT_32BITS_MAX, true).subscribe({
      next: (data) => {
        const toExcel = data.content.map(owner => ({
          'Nombre': owner.firstName,
          'Apellido': owner.lastName,
          'Documento': this.translateDictionary(owner.documentType, this.ownerDictionaries[0])! + ': ' + owner.documentNumber,
          'Tipo propietario': this.translateDictionary(owner.ownerType, this.ownerDictionaries[1])!,
          'Estado KYC': this.translateDictionary(owner.kycStatus, this.ownerStatusDictionary)!,
        }));
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(toExcel);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Propietarios');
        XLSX.writeFile(wb, `${this.getActualDayFormat()}_Propietarios.xlsx`);
      },
      error: () => { console.log("Error retrieved all, on export component.") }
    });
  }
  //#end region

  clearFilter() {
    this.filters = undefined;
    this.confirmSearch();
  }

  confirmSearch() {
    this.filters == undefined ? this.getAllOwners() : this.dinamicFilters()
  }

  dinamicFilters() {
    let fixFilter = {
      ...this.filters,
      "is_active" : true
    }
    this.ownerService.dinamicFilters(this.currentPage - 1, this.pageSize, fixFilter).subscribe({
      next: (response) => {
        this.owners = response.content;
        this.filteredOwnersList.next([...this.owners]);
        this.lastPage = response.last;
        this.totalItems = response.totalElements;
      },
      error: (error) => console.error('Error al obtener owners: ', error),
    });
  }
}
