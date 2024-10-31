import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import Category from "../../../../models/category";
import {CategoryService} from "../../../../services/category.service";

@Component({
  selector: 'app-new-category-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './new-category-modal.component.html',
  styleUrl: './new-category-modal.component.css'
})
export class NewCategoryModalComponent {
  newCategoryForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private categoryService: CategoryService
  ) {
    this.newCategoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  saveNewCategory() {
    if (this.newCategoryForm.valid) {
      let newCategory: Category = this.newCategoryForm.value;
      newCategory.name = newCategory.name?.trim();
      newCategory.description = newCategory.description?.trim();
      newCategory.is_delete = false;

      this.categoryService.addCategory(newCategory).subscribe({
        next: (response: any) => {
          console.log('Añadido correctamente', response);
          this.activeModal.close({
            success: true,
            message: 'La categoria se ha añadido correctamente.',
            data: response
          });
        },
        error: (error: any) => {
          console.error('Error en el post', error);
          let errorMessage = 'Ha ocurrido un error al añadir la categoría. Por favor, inténtelo de nuevo.';

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
