import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../../services/inventory.service';
import { Transaction, TransactionType, Inventory, TransactionPost } from '../../../../models/inventory.model';
import { CommonModule } from '@angular/common';
import { Article, MeasurementUnit } from '../../../../models/article.model';
import { ActivatedRoute } from '@angular/router';
import { MapperService } from '../../../../services/MapperCamelToSnake/mapper.service';
import { ToastService } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-transaction',
  templateUrl: './inventory_transaction_form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
    styleUrls: ['./inventory_transaction_form.component.css']
})
export class TransactionComponentForm implements OnInit {

  private mapperService = inject(MapperService);
  private toastService = inject(ToastService);

@Input() inventory: Inventory | null = null;
@Output() closeRegisterTransaction = new EventEmitter<void>();
@Output() showRegisterTransactionForm = new EventEmitter<void>();
isModalOpen : boolean = true;


  transactionForm: FormGroup;

  measure: string = '';
  transactions: Transaction[] = [];
  inventories: Inventory[] = [];
  isEditing: boolean = false;
  editingTransactionId: number= 0;
  selectedTransactionType: TransactionType = TransactionType.ENTRY; // Para el control de tipo de transacción
  articleMap: { [key: number]: Article } = {}; // Mapa para almacenar ítems con sus IDs
  inventoryMap: { [key: number]: Inventory } = {}; // Mapa para almacenar inventarios
  articles: Article[] = [];

  constructor(private fb: FormBuilder, private inventoryService: InventoryService, private route: ActivatedRoute) {
    this.transactionForm = this.fb.group({
      transactionType: [TransactionType.ENTRY, Validators.required],
      quantity: [0, Validators.required],
      price: [0],
      transactionDate: [new Date().toISOString().split('T')[0]]
    });
  }

  ngOnInit(): void {
    if (this.inventory) {
      console.log('ID de inventario recibido:', this.inventory);
    }
    // Escuchar cambios en el tipo de transacción para habilitar/deshabilitar el campo de precio
    this.transactionForm.get('transactionType')?.valueChanges.subscribe((type: TransactionType) => {
    if (type === TransactionType.OUTPUT) {
      this.transactionForm.get('price')?.disable();
    } else {
      this.transactionForm.get('price')?.enable();
    }
  });
  this.getDisplayUnit(this.inventory?.article?.measurementUnit);
  }

  addTransaction(): void {
    if (this.transactionForm.valid) {
        const formValues = this.transactionForm.value;

        // Crear la transacción con el nuevo modelo TransactionPost
        const newTransaction: TransactionPost = {
            transactionType: formValues.transactionType,
            quantity: formValues.quantity,
            price: this.transactionForm.get('transactionType')?.value === 'OUTPUT' ? null : this.transactionForm.get('price')?.value,
            transactionDate: formValues.transactionDate,
        };

        const transactionFormatted = this.mapperService.toSnakeCase(newTransaction);
        console.log(transactionFormatted);
        if (this.inventory?.id) {
            this.inventoryService.addTransaction(transactionFormatted, this.inventory.id.toString()).subscribe({
                next: () => {
                    this.toastService.sendSuccess('Movimiento registrado con éxito.');
                    this.getTransactions();
                    this.onClose();
                },
                error: (error) => {
                  const errorMessage = error.error?.message || 'Error desconocido';
                  this.toastService.sendError(errorMessage);
                }
            });
        } else {
            console.error('Error: inventoryId no está definido');
        }
    }
}

  getTransactions(): void {
    this.inventoryService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
    });
    console.log('Transacciones cargadas:', this.transactions); // Verificar si las transacciones tienen el inventory_id correcto

  }

  onClose(){
    debugger
    this.closeRegisterTransaction.emit();
    this.isModalOpen = false
  }

  getDisplayUnit(unit: MeasurementUnit | undefined): void {
    if (!unit) {
      this.measure= 'Ud.'; // Retorna un valor predeterminado
    }

    switch (unit) {
      case MeasurementUnit.LITERS:
        this.measure='Lts.';
        break;
      case MeasurementUnit.KILOS:
        this.measure='Kg.';
        break;
      case MeasurementUnit.UNITS:
        this.measure='Ud.';
        break;
      default:
        this.measure='Ud.';
        break;
    }
  }
}
