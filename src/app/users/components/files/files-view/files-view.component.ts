import { Component, inject } from '@angular/core';
import { ValidateOwner } from '../../../models/ownerXplot';
import { DocumentTypeDictionary, Owner, OwnerStatusDictionary, OwnerTypeDictionary, StateKYC } from '../../../models/owner';
import { OwnerService } from '../../../services/owner.service';
import { mapKycStatus } from '../../../utils/owner-helper';
import { CadastrePlotFilterButtonsComponent } from '../../plots/cadastre-plot-filter-buttons/cadastre-plot-filter-buttons.component';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { Router } from '@angular/router';
import { InfoComponent } from '../../commons/info/info.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-files-view',
  standalone: true,
  imports: [CadastrePlotFilterButtonsComponent, FormsModule, NgbPagination, MainContainerComponent],
  templateUrl: './files-view.component.html',
  styleUrl: './files-view.component.css'
})
export class FilesViewComponent {

  currentPage: number = 0
  pageSize: number = 10
  sizeOptions : number[] = [10, 25, 50]
  lastPage: boolean | undefined;

  totalItems: number = 0;
  filteredFilesList: ValidateOwner[] = [];

  applyFilterWithInput!: boolean;
  filterInput!: any;

  owners: Owner[] = [];
  filteredOwnersList: Owner[] = [];

  documentTypeDictionary = DocumentTypeDictionary;
  ownerTypeDictionary = OwnerTypeDictionary;
  ownerStatusDictionary = OwnerStatusDictionary;
  ownerDicitionaries = [this.documentTypeDictionary, this.ownerTypeDictionary, this.ownerStatusDictionary];

  protected ownerService = inject(OwnerService);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private location = inject(Location);


  ngOnInit() {
    this.getAllOwners();

    console.log("owners length", this.owners.length);
    console.log("filtered owners length", this.filteredOwnersList.length);
    
  }

  mapKYCStatus(type: string){
    return mapKycStatus(type);
  }


  // metodos para obtener owners
  getAllOwners(isActive?: boolean) {
    this.ownerService.getOwners(this.currentPage - 1, this.pageSize, isActive).subscribe({
      next: (response) => {
        this.owners = response.content;
        this.filteredOwnersList = [...this.owners];
        this.lastPage = response.last;
        this.totalItems = response.totalElements;
      },
      error: (error) => console.error('Error al obtener owners: ', error),
    });
  }



  //#region USO DE DICCIONARIOS
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
  //#endregion


  ownerFilesDetail(id: number | undefined) {
    console.log("ver archivos del propietario");
    this.router.navigate([`/files/${id}/view`]);
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
    this.router.navigate([`/plot/detail/${plotId}`])
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.getAllOwners();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllOwners();
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
            strong: 'Nombre y apellido:',
            detail: 'Nombre y apellido del propietario.'
          },
          {
            strong: 'Documento: ',
            detail: 'Número y tipo del documento del propietario.'
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
            strong: 'Ver detalles: ',
            detail: 'Redirige hacia la pantalla para poder visualizar los documentos cargados por el propietario.'
          },
          {
            strong: 'Aprobar: ',
            detail: 'Aprueba la validación del propietario y pasa al estado de validado.'
          },
          {
            strong: 'Rechazar: ',
            detail: 'Rechaza la validación del propietario y pasa al estado de rechazado.'
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
}
