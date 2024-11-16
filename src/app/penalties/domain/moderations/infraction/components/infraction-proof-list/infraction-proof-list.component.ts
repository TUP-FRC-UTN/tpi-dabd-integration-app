import {
  Component,
  inject,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TableColumn, TableComponent } from 'ngx-dabd-grupo01';
import { InfractionResponseDTO } from '../../models/infraction.model';
import { CommonModule } from '@angular/common';
import { InfractionServiceService } from '../../services/infraction-service.service';

@Component({
  selector: 'app-infraction-proof-list',
  standalone: true,
  imports: [TableComponent, CommonModule],
  templateUrl: './infraction-proof-list.component.html',
  styleUrl: './infraction-proof-list.component.scss',
})
export class InfractionProofListComponent {
  @Input() infraction: InfractionResponseDTO | undefined = undefined;

  // Properties:
  @ViewChild('dateTemplate') dateTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

  infractionService = inject(InfractionServiceService);

  columns: TableColumn[] = [];

  // Methods:
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.columns = [
        { headerName: 'Nombre', accessorKey: 'document_identifier' },
        {
          headerName: 'Fecha',
          accessorKey: 'actions',
          cellRenderer: this.dateTemplate,
        },

        {
          headerName: 'Acciones',
          accessorKey: 'actions',
          cellRenderer: this.actionsTemplate,
        },
      ];
    });
  }

  download(documentationId: number, filename: string): void {
    this.infractionService.downloadDocumentation(documentationId, filename);
  }
}
