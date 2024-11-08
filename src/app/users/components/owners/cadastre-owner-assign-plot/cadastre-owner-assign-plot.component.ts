import {Component, inject} from '@angular/core';
import {
  Filter,
  FilterConfigBuilder,
  MainContainerComponent,
  TableFiltersComponent,
  ToastService
} from 'ngx-dabd-grupo01';
import {DocumentTypeDictionary, Owner, OwnerTypeDictionary} from '../../../models/owner';
import {OwnerService} from '../../../services/owner.service';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-cadastre-owner-assign-plot',
  standalone: true,
  imports: [
    MainContainerComponent,
    TableFiltersComponent,
    NgbPagination,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './cadastre-owner-assign-plot.component.html',
  styleUrl: './cadastre-owner-assign-plot.component.scss',
  providers: [DatePipe]
})
export class CadastreOwnerAssignPlotComponent {

  protected ownerService = inject(OwnerService);
  private toastService = inject(ToastService);

  currentPage: number = 0;
  pageSize: number = 10;
  sizeOptions: number[] = [10, 25, 50];
  lastPage: boolean | undefined;
  totalItems: number = 0;
  showList = true;
  selectedOwnerId: number | null = null;

  owners: Owner[] = [];
  filterConfig: Filter[] = new FilterConfigBuilder()
    .selectFilter('Tipo de Documento', 'doc_type', 'Seleccione un tipo de documento', [
      { value: 'P', label: 'DNI' },
      { value: 'I', label: 'Cédula' },
      { value: 'T', label: 'Pasaporte' }
    ])
    .selectFilter('Tipo de Propietario', 'owner_type', 'Seleccione un tipo de propietario', [
      { value: 'PERSON', label: 'Persona' },
      { value: 'COMPANY', label: 'Compañía' },
      { value: 'OTHER', label: 'Otro' }
    ])
    .selectFilter('Estado del Propietario', 'owner_kyc', 'Seleccione un estado del propietario', [
      { value: 'INITIATED', label: 'Iniciado' },
      { value: 'TO_VALIDATE', label: 'Para Validar' },
      { value: 'VALIDATED', label: 'Validado' },
    ])
    .selectFilter('Activo', 'is_active', '', [
      {value: 'true', label: 'Activo'},
      {value: 'false', label: 'Inactivo'}
    ])
    .build()

  documentTypeDictionary = DocumentTypeDictionary;
  ownerTypeDictionary = OwnerTypeDictionary;

  ngOnInit(): void {
    this.getAllOwners()
  }

  getAllOwners(isActive?: boolean) {
    this.ownerService.getOwners(this.currentPage - 1, this.pageSize, isActive).subscribe({
      next: (response) => {
        this.owners = response.content;
        this.lastPage = response.last;
        this.totalItems = response.totalElements;
      },
      error: (error) => console.error('Error al obtener owners: ', error),
    });
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

  onItemsPerPageChange() {
    this.currentPage = 1;
    // this.confirmFilterOwner();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    // this.confirmFilterOwner();
  }

  filterChange($event: Record<string, any>) {
    this.ownerService.dinamicFilters(0, this.pageSize, $event).subscribe({
      next : (result) => {
        this.owners = result.content;
        this.lastPage = result.last
        this.totalItems = result.totalElements;
      }
    })
  }

  selectOwner(ownerId: number): void {
    this.selectedOwnerId = this.selectedOwnerId === ownerId ? null : ownerId;
  }

  isSelected(ownerId: number): boolean {
    return this.selectedOwnerId === ownerId;
  }
}
