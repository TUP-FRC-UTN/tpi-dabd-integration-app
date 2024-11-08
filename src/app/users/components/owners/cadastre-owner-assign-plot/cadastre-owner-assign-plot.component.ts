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
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {plotForOwnerValidatorNoAssociation} from '../../../validators/cadastre-plot-for-owner-no-association';
import {PlotService} from '../../../services/plot.service';
import {OwnerPlotService} from '../../../services/owner-plot.service';
import {plotValidator} from '../../../validators/cadastre-plot-validators';

@Component({
  selector: 'app-cadastre-owner-assign-plot',
  standalone: true,
  imports: [
    MainContainerComponent,
    TableFiltersComponent,
    NgbPagination,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './cadastre-owner-assign-plot.component.html',
  styleUrl: './cadastre-owner-assign-plot.component.scss',
  providers: [DatePipe]
})
export class CadastreOwnerAssignPlotComponent {

  protected ownerService = inject(OwnerService);
  private plotService = inject(PlotService)
  private ownerPlotService = inject(OwnerPlotService)
  private toastService = inject(ToastService);

  plotForm: FormGroup = new FormGroup({
    plotNumber:  new FormControl('', [Validators.required, Validators.min(1)], [plotValidator(this.plotService)]),
    blockNumber: new FormControl('', [Validators.required, Validators.min(1)])
  })

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
    .build()



  documentTypeDictionary = DocumentTypeDictionary;
  ownerTypeDictionary = OwnerTypeDictionary;

  ngOnInit() {
    this.getAllOwners()
  }

  getAllOwners(isActive?: boolean) {
    this.ownerService.getOwners(this.currentPage - 1, this.pageSize, isActive).subscribe({
      next: (response) => {
        this.owners = response.content;
        this.lastPage = response.last;
        this.totalItems = response.totalElements;
        console.log(this.owners)
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
    this.getAllOwners()
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllOwners()
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

  selectOwner(owner: Owner): void {
    if (owner.id) {
      if (this.selectedOwnerId === owner.id) {
        return;
      }
      this.selectedOwnerId = owner.id;
      this.toastService.sendSuccess(`Dueño ${owner.firstName} ${owner.lastName} seleccionado`)
    }
  }

  isSelected(ownerId: number): boolean {
    return this.selectedOwnerId === ownerId;
  }
}
