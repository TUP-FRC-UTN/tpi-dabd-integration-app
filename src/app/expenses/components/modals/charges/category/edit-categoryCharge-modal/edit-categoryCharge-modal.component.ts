import { Component, Input,OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import { ChargeService } from '../../../../../services/charge.service';
import { CategoryCharge } from '../../../../../models/charge';


@Component({
  selector: 'app-edit-category-modal',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule
  ],
  templateUrl: './edit-categoryCharge-modal.component.html',
  styleUrl: './edit-categoryCharge-modal.component.css'
})
export class EditCategoryModalComponent implements OnInit{
  @Input() category!: CategoryCharge;
  editCategoryForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private categoryService: ChargeService
  ) {
    this.editCategoryForm = this.formBuilder.group({
      name: [{ value: '', disabled: true }, Validators.required],
      description: ['', Validators.required],
      amount_Sign: [{ value: '', disabled: true },Validators.required]
    });
  }

  ngOnInit() {
    // Inicializar el formulario con los datos de la categoría
    
    this.editCategoryForm.patchValue({
      name: this.category.name,
      description: this.category.description,
      amount_Sign : this.category.amountSign.toString()
    });
  }

  updateCategory() {
    if (this.editCategoryForm.valid) {
      const updatedCategory: CategoryCharge = {
        ...this.category,
        name: this.editCategoryForm.get('name')?.value,
        description: this.editCategoryForm.get('description')?.value,
        amountSign: this.editCategoryForm.get('amount_Sign')?.value
      };

      this.categoryService.updateCategory(updatedCategory).subscribe({
        next: (response: any) => {
          console.log('Actualizado correctamente', response);
          this.activeModal.close({
            success: true,
            message: 'La categoría se ha actualizado correctamente.',
            data: response
          });
        },
        error: (error: any) => {
          console.error('Error en el update', error);
          let errorMessage = 'Ha ocurrido un error al actualizar la categoría. Por favor, inténtelo de nuevo.';

          if (error.status === 409) {
            errorMessage = 'Ya existe una categoría con este nombre. Por favor, elija un nombre diferente.';
          }

          this.activeModal.close({
            success: false,
            message: errorMessage,
            error: error
          });
        }
      });
    } else {
      this.activeModal.close({
        success: false,
        message: 'Por favor, complete todos los campos requeridos correctamente.'
      });
    }
  }
}
