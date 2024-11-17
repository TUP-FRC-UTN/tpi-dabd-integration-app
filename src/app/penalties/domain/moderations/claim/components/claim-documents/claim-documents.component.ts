import {
  Component,
  inject,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ConfirmAlertComponent,
  TableColumn,
  TableComponent,
  ToastService,
} from 'ngx-dabd-grupo01';
import { ClaimService } from '../../service/claim.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-claim-documents',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './claim-documents.component.html',
  styleUrl: './claim-documents.component.scss',
})
export class ClaimDocumentsComponent {
  // Inputs:
  @Input() claim: any = undefined;

  // Services:
  private modalService = inject(NgbModal);
  claimService = inject(ClaimService);
  toastService = inject(ToastService);

  // Properties:
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

  columns: TableColumn[] = [];

  // Methods:
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.columns = [
        { headerName: 'Id', accessorKey: 'id' },

        { headerName: 'Nombre', accessorKey: 'document_identifier' },

        {
          headerName: 'Acciones',
          accessorKey: 'actions',
          cellRenderer: this.actionsTemplate,
        },
      ];
    });
  }

  openFormModal(): void {
    // const modalRef = this.modalService.open(
    //   ConstructionDocumentationFormComponent
    // );
    // modalRef.componentInstance.constructionId =
    //   this.construction.construction_id;
    // modalRef.result
    //   .then((result) => {
    //     if (result) {
    //       this.constructionUpdated.emit();
    //     }
    //   })
    //   .catch(() => {});
  }

  rejectDocument(document: any) {
    // const modalRef = this.modalService.open(ConfirmAlertComponent);
    // modalRef.componentInstance.alertMessage = `¿Estás seguro de que desea rechazar el documento ${document.documentPath}?`;
    // modalRef.result
    //   .then((result) => {
    //     if (result) {
    //       this.constructionDocumentationService
    //         .updateConstructionDocStatus({
    //           documentation_id: document.id,
    //           status: 'REJECTED',
    //         })
    //         .subscribe(() => {
    //           document.state = 'REJECTED';
    //         });
    //     }
    //   })
    //   .catch(() => {});
  }

  approveDocument(document: any) {
    // this.constructionDocumentationService
    //   .updateConstructionDocStatus({
    //     documentation_id: document.id,
    //     status: 'APPROVED',
    //   })
    //   .subscribe(() => {
    //     document.state = 'APPROVED';
    //   });
  }

  deleteDocument(document: any) {
    // const modalRef = this.modalService.open(ConfirmAlertComponent);
    // modalRef.componentInstance.alertMessage =
    //   '¿Está seguro de que desea eliminar el documento?';
    // modalRef.componentInstance.alertVariant = 'delete';
    // modalRef.result
    //   .then((result) => {
    //     if (result) {
    //       this.constructionDocumentationService
    //         .deleteConstructionDoc(document.id)
    //         .subscribe({
    //           next: () => {
    //             this.constructionUpdated.emit();
    //             this.toastService.sendSuccess(
    //               'Documento eliminado correctamente'
    //             );
    //           },
    //           error: () => {
    //             this.toastService.sendError(
    //               'Ocurrio un error al eliminar el documento'
    //             );
    //           },
    //         });
    //     }
    //   })
    //   .catch(() => {});
  }

  downnload(documentationId: number, filename: string): void {
    this.claimService.downloadDocumentation(documentationId, filename);
  }
}
