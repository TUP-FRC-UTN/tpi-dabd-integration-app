import { Component,Input } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import { CategoryCharge } from '../../../../../models/charge';
import { ChargeService } from '../../../../../services/charge.service';

@Component({
  selector: 'app-delete-category-modal',
  standalone: true,
  imports: [],
  templateUrl: './delete-categoryCharge-modal.component.html',
  styleUrl: './delete-categoryCharge-modal.component.css'
})
export class DeleteCategoryModalComponent {
  @Input() category!: CategoryCharge;

  constructor(
    public activeModal: NgbActiveModal,
    private categoryService: ChargeService
  ) {}

  confirmDelete() {

    this.categoryService.deleteCategoryCharge(this.category.categoryChargeId!)
      .subscribe({
        next: (response) => {
          this.activeModal.close({
            success: true,
            message: 'La categoría ha sido eliminada correctamente.',
            data: response
          });
        },
        error: (error) => {
          console.error('Error al eliminar la categoría:', error);
          this.activeModal.close({
            success: false,
            message: 'Ha ocurrido un error al eliminar la categoría. Por favor, inténtelo de nuevo.',
            error: error
          });
        }
      });
  }
}
