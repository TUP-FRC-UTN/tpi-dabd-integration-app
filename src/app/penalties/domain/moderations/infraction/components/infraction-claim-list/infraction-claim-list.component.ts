import {
  AfterViewInit,
  Component,
  inject,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ClaimService } from '../../../claim/service/claim.service';
import { Router } from '@angular/router';
import { GetValueByKeyForEnumPipe } from '../../../../../shared/pipes/get-value-by-key-for-status.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { ClaimStatusEnum } from '../../../claim/models/claim.model';
import { FormsModule } from '@angular/forms';
import { TableColumn, TableComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-infraction-claim-list',
  standalone: true,
  imports: [TableComponent, GetValueByKeyForEnumPipe, DatePipe],
  templateUrl: './infraction-claim-list.component.html',
  styleUrl: './infraction-claim-list.component.scss',
})
export class InfractionClaimListComponent implements AfterViewInit {
  // Inputs:
  @Input() claims: any[] = [];

  // Services:
  claimService = inject(ClaimService);
  router = inject(Router);

  // Properties:
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;
  @ViewChild('description') description!: TemplateRef<any>;
  @ViewChild('sanctionType') sanctionType!: TemplateRef<any>;
  @ViewChild('date') date!: TemplateRef<any>;
  @ViewChild('claimStatus') claimStatus!: TemplateRef<any>;
  @ViewChild('infraction') infraction!: TemplateRef<any>;

  columns: TableColumn[] = [];

  ClaimStatusEnum = ClaimStatusEnum;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.columns = [
        {
          headerName: 'N.° Reclamo',
          accessorKey: 'id',
        },
        {
          headerName: 'Alta',
          accessorKey: 'created_date',
          cellRenderer: this.date,
        },
        { headerName: 'Lote', accessorKey: 'plot_id' },
        {
          headerName: 'Tipo',
          accessorKey: 'sanction_type.name',
        },

        {
          headerName: 'Descripción',
          accessorKey: 'description',
        },
        {
          headerName: 'Estado',
          accessorKey: 'claim_status',
          cellRenderer: this.claimStatus,
        },
        {
          headerName: 'Acciones',
          accessorKey: 'actions',
          cellRenderer: this.actionsTemplate,
        },
      ];
    });
  }

  goToClaimDetail(claimId: number) {
    this.router.navigate(['claim', claimId, 'detail']);
  }
}
