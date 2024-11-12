import { Component, inject, Input } from '@angular/core';
import { Bill } from '../../../../models/bill';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BillService } from '../../../../services/bill.service';

@Component({
  selector: 'app-delete-bill-modal',
  standalone: true,
  imports: [],
  templateUrl: './delete-bill-modal.component.html',
  styleUrl: './delete-bill-modal.component.scss'
})
export class DeleteBillModalComponent {
  @Input() bill!: Bill;

  private readonly billService = inject(BillService);

  constructor(
    public activeModal: NgbActiveModal,
  ) {}

  confirmDelete() {
    console.log(this.bill.expenditureId);

    this.billService.removeBill(this.bill.expenditureId!)
      .subscribe({
        next: (response) => {
          this.activeModal.close({
            success: true,
            message: 'El gasto ha sido eliminado correctamente.',
            data: response
          });
        },
        error: (error) => {
          console.error('Error al eliminar el gasto:', error);
          this.activeModal.close({
            success: false,
            message: 'Ha ocurrido un error al eliminar el gasto. Por favor, inténtelo de nuevo.',
            error: error
          });
        }
      });
  }
}
