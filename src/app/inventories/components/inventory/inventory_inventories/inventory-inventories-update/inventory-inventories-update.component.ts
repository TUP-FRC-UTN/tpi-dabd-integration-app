import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../../services/inventory.service';
import { Inventory } from '../../../../models/inventory.model';
import { MapperService } from '../../../../services/MapperCamelToSnake/mapper.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory-inventories-update',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-inventories-update.component.html',
  styleUrls: ['./inventory-inventories-update.component.css']
})
export class InventoryInventoriesUpdateComponent {

  private mapperService = inject(MapperService);
  private router = inject(Router);

  @Input() inventory: Inventory | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() showInvantoryUpdate = new EventEmitter<void>();
  isModalOpen : boolean = true;
  inventoryUpdateForm: FormGroup;

  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    // Inicializa el formulario de inventario
    this.inventoryUpdateForm = this.fb.group({
      location: ['', Validators.required],
      minStock: [, Validators.required], // Asegúrate de incluir min_stock en el formulario
    });
  }

  ngOnChanges(): void {
console.log(this.inventory)

    if (this.inventory) {
      console.log('validado')
      this.inventoryUpdateForm.patchValue({
        location: this.inventory.location,
        minStock: this.inventory.minStock ?? 0,
        stock: this.inventory.stock
      });
    }
  }

  saveInventoryChanges(): void {
    if (this.inventoryUpdateForm.valid && this.inventory) {
      // Formateo de los datos del artículo de inventario
      const inventoryUpdate = {
        stock: this.inventory.stock,
        minStock: this.inventoryUpdateForm.value.minStock ?? 0, // Valor por defecto si es undefined
        location: this.inventoryUpdateForm.value.location,
      };

      // Formatea el objeto a snake_case
      const inventoryUpdateFormatted = this.mapperService.toSnakeCase(inventoryUpdate);

      // Llama al servicio para actualizar el inventario
      if(this.inventory.id) {
        this.inventoryService.updateInventory(this.inventory.id, inventoryUpdateFormatted).subscribe(
          (data) => {
            console.log('Inventario actualizado:', data);
            this.onClose(); // Cierra el modal después de guardar

          },
          (error) => {
            console.error("Error al actualizar el inventario", error);
          }
        );
      }
    }
  }

  onClose() {
    this.closeModal.emit(); // Cambiado a closeModal
    this.isModalOpen = false;
}
}
