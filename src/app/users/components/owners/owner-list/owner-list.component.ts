import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { OwnerService } from '../../../services/owner.service';
import {
  DocumentTypeDictionary,
  Owner,
  OwnerFilters,
  OwnerTypeDictionary,
} from '../../../models/owner';
import { Router } from '@angular/router';
import { CadastreFilterButtonsComponent } from '../../commons/cadastre-filter-buttons/cadastre-filter-buttons.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ConfirmAlertComponent,
  ToastService,
  MainContainerComponent,
} from 'ngx-dabd-grupo01';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-owner-list',
  standalone: true,
  imports: [
    CommonModule,
    CadastreFilterButtonsComponent,
    FormsModule,
    MainContainerComponent,
    NgbPagination,
    ConfirmAlertComponent,
  ],
  templateUrl: './owner-list.component.html',
  styleUrl: './owner-list.component.css',
})
export class OwnerListComponent implements OnInit {
  constructor() {}

  private router = inject(Router);
  protected ownerService = inject(OwnerService);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal);

  currentPage: number = 0;
  pageSize: number = 10;
  sizeOptions: number[] = [10, 25, 50];
  lastPage: boolean | undefined;
  totalItems: number = 0;

  //#region ATT de ACTIVE
  retrieveOwnersByActive: boolean | undefined = true;
  //#endregion

  owners: Owner[] = [];
  filteredOwnersList: Owner[] = [];
  ownerFirstName: string | undefined;
  ownerLastName: string | undefined;
  ownerId: number | undefined;
  selectedDocType: string = '';

  applyFilterWithNumber: boolean = false;
  applyFilterWithCombo: boolean = false;
  contentForFilterCombo: string[] = [];
  actualFilter: string | undefined = OwnerFilters.NOTHING;
  filterTypes = OwnerFilters;
  filterInput: string = '';

  documentTypeDictionary = DocumentTypeDictionary;
  ownerTypeDictionary = OwnerTypeDictionary;
  ownerDicitionaries = [this.documentTypeDictionary, this.ownerTypeDictionary];

  @ViewChild('filterComponent')
  filterComponent!: CadastreFilterButtonsComponent;
  @ViewChild('ownersTable', { static: true })
  tableName!: ElementRef<HTMLTableElement>;

  ngOnInit(): void {
    this.confirmFilterOwner();
  }

  ngAfterViewInit(): void {
    this.filterComponent.filter$.subscribe((filteredList: Owner[]) => {
      this.filteredOwnersList = filteredList;
      this.currentPage = 0;
    });
  }

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

  //#region FILTROS
  filterOwnerByDocType(docType: string, isActive?: boolean) {
    this.ownerService
      .filterOwnerByDocType(this.currentPage, this.pageSize, docType, isActive)
      .subscribe({
        next: (response) => {
          console.log('Respuesta', response);
          
          this.owners = response.content;
          this.filteredOwnersList = [...this.owners];
          this.lastPage = response.last;
          this.totalItems = response.totalElements;
        },
        error: (error) => console.error('Error getting owners:', error),
      });
  }

  filterOwnerByOwnerType(ownerType: string, isActive?: boolean) {
    this.ownerService
      .filterOwnerByOwnerType(this.currentPage, this.pageSize, ownerType, isActive)
      .subscribe({
        next: (response) => {
          this.owners = response.content;
          this.filteredOwnersList = [...this.owners];
          this.lastPage = response.last;
          this.totalItems = response.totalElements;
        },
        error: (error) => console.error('Error getting owners:', error),
      });
  }

  changeActiveFilter(isActive?: boolean) {
    this.retrieveOwnersByActive = isActive;
    this.confirmFilterOwner();
  }

  changeFilterMode(mode: OwnerFilters) {
    switch (mode) {
      case OwnerFilters.NOTHING:
        this.actualFilter = OwnerFilters.NOTHING;
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = false;
        this.confirmFilterOwner();
        break;

      case OwnerFilters.DOC_TYPE:
        this.actualFilter = OwnerFilters.DOC_TYPE;
        this.contentForFilterCombo = this.getKeys(this.documentTypeDictionary);
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        break;

      case OwnerFilters.OWNER_TYPE:
        this.actualFilter = OwnerFilters.OWNER_TYPE;
        this.contentForFilterCombo = this.getKeys(this.ownerTypeDictionary);
        this.applyFilterWithNumber = false;
        this.applyFilterWithCombo = true;
        break;

      default:
        break;
    }
  }

  confirmFilterOwner() {
    switch (this.actualFilter) {
      case 'NOTHING':
        this.getAllOwners(this.retrieveOwnersByActive);
        break;

      case 'DOC_TYPE':
        this.filterOwnerByDocType(
          this.translateCombo(this.filterInput, this.documentTypeDictionary),
          this.retrieveOwnersByActive          
        );
        break;

      case 'OWNER_TYPE':
        this.filterOwnerByOwnerType(
          this.translateCombo(this.filterInput, this.ownerTypeDictionary),
          this.retrieveOwnersByActive
        );
        break;

      default:
        break;
    }
  }

  assignOwnerToDelete(owner: Owner) {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertTitle = 'Eliminar Propietario';
    modalRef.componentInstance.alertMessage = `Esta seguro que desea eliminar el propietario ${owner.firstName} ${owner.lastName} ?`;
    modalRef.componentInstance.alertVariant='delete'

    modalRef.result.then((result) => {
      if (result && owner.id) {
        this.ownerService.deleteOwner(owner.id, '1').subscribe({
          next: () => {
            this.toastService.sendSuccess(
              'Propietario eliminado correctamente.'
            );
            this.confirmFilterOwner();
            location.reload();
          },
          error: () =>
            this.toastService.sendError('Error al eliminar propietario.'),
        });
      }
    });
  }

  editOwner(id: any) {
    this.router.navigate(['/owner/form/', id]);
  }

  deleteOwner() {
    if (this.ownerId !== undefined) {
      this.ownerService.deleteOwner(this.ownerId, '1').subscribe((response) => {
        location.reload();
      });
    }
  }

  detailOwner(id: any) {
    this.router.navigate(['/owner/detail/', id]);
  }

  cleanOwnerId() {
    this.ownerId = undefined;
  }

  searchByDocType(docType: string) {
    this.filteredOwnersList = this.owners.filter(
      (owner) => owner.documentType == docType
    );
  }

  ownerPlot(ownerId: any) {
    this.router.navigate(['plots/owner/' + ownerId]);
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

    onItemsPerPageChange() {
      this.currentPage = 1;
      this.confirmFilterOwner();
    }

    onPageChange(page: number) {
      this.currentPage = page;
      this.confirmFilterOwner();
    }
}
