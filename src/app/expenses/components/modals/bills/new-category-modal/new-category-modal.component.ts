import { Component } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NgClass} from "@angular/common";
import Category from "../../../../models/category";
import {CategoryService} from "../../../../services/category.service";
import {debounceTime, map, Observable, of, switchMap} from "rxjs";

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
      name: ['', {
        validators: [Validators.required],
        asyncValidators: [this.nameValidator()]
      }],
      description: ['', Validators.required]
    });
  }

  private nameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<any> => {
      const name = control.value?.trim();
      if (!name) {
        return of(null);
      }

      return of(name).pipe(
        debounceTime(500),
        switchMap(value =>
          this.categoryService.validateCategoryName(value)
            .pipe(
              map(exists => exists ? { nameExists: true } : null)
            )
        )
      );
    };
  }

  saveNewCategory() {
    if (this.newCategoryForm.valid) {
      let newCategory: Category = this.newCategoryForm.value;
      newCategory.name = newCategory.name?.trim();
      newCategory.description = newCategory.description?.trim();
      newCategory.is_delete = false;

      this.categoryService.addCategory(newCategory).subscribe({
        next: (response: any) => {
          this.activeModal.close({
            success: true,
            message: 'La categoria se ha añadido correctamente.',
            data: response
          });
        },
        error: (error: any) => {
          let errorMessage = 'Ha ocurrido un error al añadir la categoría. Por favor, inténtelo de nuevo.';
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
