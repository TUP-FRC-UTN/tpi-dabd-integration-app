import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { NewInfractionModalComponent } from '../new-infraction-modal/new-infraction-modal.component';
import { FineService } from '../../../fine/services/fine.service';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  InfractionDto,
  InfractionResponseDTO,
  InfractionStatusEnum,
} from '../../models/infraction.model';
import { InfractionServiceService } from '../../services/infraction-service.service';

import { MainContainerComponent, TableColumn, TableComponent } from 'ngx-dabd-grupo01';
import { InfractionListInfoComponent } from '../infraction-list-info/infraction-list-info.component';
import { FormsModule } from '@angular/forms';
import { GetValueByKeyForEnumPipe } from '../../../../../shared/pipes/get-value-by-key-for-status.pipe';
import { RoleService } from '../../../../../shared/services/role.service';
import { Router } from '@angular/router';
import { ConfirmAlertComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-infraction-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NewInfractionModalComponent,
    MainContainerComponent,
    TableComponent,
    NgbDropdownModule,
    GetValueByKeyForEnumPipe,
  ],
  templateUrl: './infraction-list.component.html',
  styleUrl: './infraction-list.component.scss',
})
export class InfractionListComponent {
  // Services:
  private infractionService = inject(InfractionServiceService);
  private modalService = inject(NgbModal);
  private router = inject(Router);
  private roleService = inject(RoleService);

  // Properties:
  items$: Observable<InfractionResponseDTO[]> = this.infractionService.items$;
  totalItems$: Observable<number> = this.infractionService.totalItems$;
  isLoading$: Observable<boolean> = this.infractionService.isLoading$;

  InfractionStatusEnum = InfractionStatusEnum;

  page: number = 1;
  size: number = 10;
  searchParams: { [key: string]: string | string[] } = {};

  // Role
  role: string = '';
  userId: number | undefined;
  userPlotsIds: number[] = [];

  // Filtro dinámico
  filterType: string = '';
  startDate: string = '';
  endDate: string = '';
  status: string = '';

  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('dateTemplate') dateTemplate!: TemplateRef<any>;
  @ViewChild('fineTemplate') fineTemplate!: TemplateRef<any>;

  columns: TableColumn[] = [];

  // Methods:
  ngOnInit(): void {
    this.roleService.currentUserId$.subscribe((userId: number) => {
      this.userId = userId;
      this.loadItems();
    });

    this.roleService.currentLotes$.subscribe((plots: number[]) => {
      this.userPlotsIds = plots;
      this.loadItems();
    });

    this.roleService.currentRole$.subscribe((role: string) => {
      this.role = role;
      this.loadItems();
    });

    this.loadItems();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.columns = [
        { headerName: 'N.° Infracción', accessorKey: 'id' },
        {
          headerName: 'Alta',
          accessorKey: 'created_date',
          cellRenderer: this.dateTemplate,
        },
        { headerName: 'Descripción', accessorKey: 'description' },
        {
          headerName: 'N.° Multa',
          accessorKey: 'fine_id',
          cellRenderer: this.fineTemplate,
        },
        {
          headerName: 'Estado',
          accessorKey: 'infraction_state',
          cellRenderer: this.statusTemplate,
        },
        { headerName: 'Lote', accessorKey: 'plot_id' },
        {
          headerName: 'Acciones',
          accessorKey: 'actions',
          cellRenderer: this.actionsTemplate,
        },
      ];
    });
  }

  loadItems(): void {
    this.infractionService
      .getAllInfractions(this.page, this.size, this.searchParams)
      .subscribe((response) => {
        this.infractionService.setItems(response.items);
        this.infractionService.setTotalItems(response.total);
      });
  }

  onPageChange = (page: number): void => {
    this.page = page;
    this.loadItems();
  };

  onPageSizeChange = (size: number): void => {
    this.size = size;
    this.loadItems();
  };

  onSearchValueChange = (searchValue: any): void => {
    this.searchParams = { searchValue };
    this.page = 1;
    this.loadItems();
  };

  openFormModal(itemId: number | null = null): void {
    const modalRef = this.modalService.open(NewInfractionModalComponent);
    modalRef.componentInstance.itemId = itemId;
    modalRef.result
      .then((result) => {
        if (result) {
          this.loadItems();
        }
      })
      .catch(() => {});
  }

  setFilterType(type: string): void {
    this.filterType = type;
  }

  applyFilters(): void {
    if (this.filterType === 'fecha') {
      this.searchParams = {
        startDate: this.startDate,
        endDate: this.endDate,
      };
    } else if (this.filterType === 'estado') {
      this.searchParams = { infractionState: [this.status] };
    }
    this.page = 1;
    this.loadItems();
  }

  clearFilters(): void {
    this.filterType = '';
    this.startDate = '';
    this.endDate = '';
    this.status = '';
    this.searchParams = {};
    this.loadItems();
  }

  onInfoButtonClick() {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertType = 'info';

    modalRef.componentInstance.alertTitle = 'Ayuda';
    modalRef.componentInstance.alertMessage = `Esta pantalla te permite consultar tus infracciones recibidos, y al administrador gestionarlo para generar multas. \n Considerá que de tener mas multas que las configuradas para cada tipo, entonces serás multado, podes ver mas en "Tipos de sanciones"`;
  }

  rejectInfraction(id: number) {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertTitle = 'Confirmación';
    modalRef.componentInstance.alertMessage = `¿Está seguro de que desea desestimar esta infracción?`;

    modalRef.result
      .then((result) => {
        if (result) {
          this.infractionService
            .rejectInfraction(id, this.userId)
            .subscribe(() => {
              this.loadItems();
            });
        }
      })
      .catch(() => {});
  }

  goToDetails(id: number) {
    this.router.navigate(['/infraction', id]);
  }
}
