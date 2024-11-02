import { Component, inject } from '@angular/core';
import { ValidateOwner } from '../../../models/ownerXplot';
import { DocumentTypeDictionary, Owner, OwnerStatusDictionary, OwnerTypeDictionary, StateKYC } from '../../../models/owner';
import { OwnerService } from '../../../services/owner.service';
import { mapKycStatus } from '../../../utils/owner-helper';
import { CadastrePlotFilterButtonsComponent } from '../../plots/cadastre-plot-filter-buttons/cadastre-plot-filter-buttons.component';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { MainContainerComponent } from 'ngx-dabd-grupo01';
import { Router } from '@angular/router';

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
  private router = inject(Router)


  ngOnInit() {
    this.getAllOwners();
    console.log(this.owners.length);
    console.log(this.filteredOwnersList.length);
    
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
}
