import {
  Component,
  inject,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConstructionNotesFormComponent } from '../construction-notes-form/construction-notes-form.component';
import { TableColumn, TableComponent } from 'ngx-dabd-grupo01';
import { RoleService } from '../../../../shared/services/role.service';

@Component({
  selector: 'app-construction-notes-list',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './construction-notes-list.component.html',
  styleUrl: './construction-notes-list.component.scss',
})
export class ConstructionNotesListComponent implements OnInit {
  // Inputs:
  @Input() notes: any[] = [];

  // Services:
  private modalService = inject(NgbModal);

  // Properties:
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

  columns: TableColumn[] = [];

  roleService = inject(RoleService);

  role = '';

  ngOnInit(): void {
    this.roleService.currentRole$.subscribe((role) => {
      this.role = role;
    });
  }

  // Methods:
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.columns = [
        { headerName: 'N° de Nota', accessorKey: 'id' },
        { headerName: 'Nota', accessorKey: 'description' },
        /*         { headerName: 'Usuario', accessorKey: 'createdBy' },
        { headerName: 'Fecha', accessorKey: 'createdDate' }, */
      ];
    });
  }

  openFormModal(itemId: number | null = null): void {
    const modalRef = this.modalService.open(ConstructionNotesFormComponent);
    modalRef.componentInstance.itemId = itemId;
  }
}
