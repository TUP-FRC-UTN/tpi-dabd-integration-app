import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ArticleCateg, ArticleCategPost } from '../../../../../models/article.model';
import { MapperService } from '../../../../../services/MapperCamelToSnake/mapper.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../../../services/inventory.service';
import { CommonModule } from '@angular/common';
import { ToastService } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-article-category-update',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './article-category-update.component.html',
  styleUrl: './article-category-update.component.css'
})
export class ArticleCategoryUpdateComponent {
  private mapperService = inject(MapperService);
  private inventoryService = inject(InventoryService);
  private toastService = inject(ToastService);

  @Input() category: ArticleCateg | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() showInvantoryUpdate = new EventEmitter<void>();
  isModalOpen : boolean = true;
  categoryUpdateForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Inicializa el formulario de inventario
    this.categoryUpdateForm = this.fb.group({
      denomination: ['', Validators.required]
    });
  }

  ngOnChanges(): void {
    if (this.category) {
      this.categoryUpdateForm.patchValue({
        denomination: this.category.denomination
      });
    }
  }

  saveCategoryChanges(): void {
    // Primero, verifica que el formulario sea válido
    if (this.categoryUpdateForm.valid) {
      // Formateo de los datos del artículo de inventario
      const categoryData = {
        denomination: this.categoryUpdateForm.get('denomination')?.value,
      };
      console.log('Categoría a enviar:', categoryData);
      // Formatea el objeto a snake_case
      const categoryUpdateFormatted = this.mapperService.toSnakeCase(categoryData);

      // Si existe una categoría (actualización), llama al servicio de actualización
      if (this.category) {
        // Actualización de la categoría
        this.inventoryService.updateCategory(this.category.id, categoryUpdateFormatted).subscribe(
          (data) => {
            this.toastService.sendSuccess('La categoría ha sido actualizada con éxito.');
            this.onClose(); // Cierra el modal después de guardar
          },
          (error) => {
            this.toastService.sendError('No se pudo modificar la categoría. ' + error.message);
          }
        );
      } else {
        // Creación de una nueva categoría
        const newCategory: ArticleCategPost = {
          denomination: categoryUpdateFormatted.denomination
        };
        this.inventoryService.createCategory(categoryUpdateFormatted).subscribe(
          (data) => {
            this.toastService.sendSuccess('La categoría ha sido creada con éxito.');
            this.onClose(); // Cierra el modal después de guardar
          },
          (error) => {
            this.toastService.sendError('No se pudo crear la categoría. ' + error.message);
          }
        );
      }
    } else {
      this.toastService.sendError('El formulario no es válido. Por favor, completa todos los campos requeridos.');
    }
  }



  onClose() {
    this.closeModal.emit(); // Cambiado a closeModal
    this.isModalOpen = false;
}
}
