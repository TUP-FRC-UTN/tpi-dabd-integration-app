import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../../services/inventory.service';
import { Transaction, TransactionType, Inventory, TransactionPost } from '../../../../models/inventory.model';
import { CommonModule } from '@angular/common';
import { Article } from '../../../../models/article.model';
import { ActivatedRoute } from '@angular/router';
import { MapperService } from '../../../../services/MapperCamelToSnake/mapper.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './inventory_transaction_form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
    styleUrls: ['./inventory_transaction_form.component.css']
})
export class TransactionComponentForm implements OnInit {

  private mapperService = inject(MapperService);

@Input() inventoryId: string | null = null;
@Output() closeRegisterTransaction = new EventEmitter<void>();
@Output() showRegisterTransactionForm = new EventEmitter<void>();
isModalOpen : boolean = true;


  transactionForm: FormGroup;

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
      transactionDate: [{ value: new Date().toISOString().split('T')[0] }]
    });
  }

  ngOnInit(): void {
    if (this.inventoryId) {
      console.log('ID de inventario recibido:', this.inventoryId);
    }
  }

  addTransaction(): void {
    console.log(this.transactionForm.value); // Loguear el estado actual del formulario
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
      if (this.inventoryId) {
        this.inventoryService.addTransaction(transactionFormatted, this.inventoryId).subscribe(() => {
          this.getTransactions();
          this.resetForm();
        });
      } else {
        console.error('Error: inventoryId no está definido');
      }
    }
  }

  getArticles(): void {
    this.inventoryService.getArticles().subscribe(articles => {
      this.articles = articles;
      this.buildArticleMap(); // Construir el mapa de ítems
    });
  }

  buildArticleMap(): void {
    this.articles.forEach(article => {
      if (article && article.id !== undefined) {
        this.articleMap[article.id] = article; // Mapea el ID del ítem al objeto ítem
      }
    });
    console.log('Mapa de ítems:', this.articleMap); // Verificar si el mapa de ítems se construye bien

  }
  buildInventoryMap(): void {
    this.inventoryMap = {}; // Reiniciar el mapa antes de construirlo
    this.inventories.forEach(inventory => {
      if (inventory && inventory.id !== undefined && inventory.id !== null) {
        this.inventoryMap[inventory.id] = inventory;
      }
    });
    console.log('Mapa de inventarios construido:', this.inventoryMap); // Verificar el contenido del mapa
  }



  toggleFieldsByTransactionType(type: TransactionType): void {
    const priceControl = this.transactionForm.get('price');
    if (type === TransactionType.ENTRY) {
      priceControl?.setValidators([Validators.required]);
      priceControl?.enable();
    } else {
      priceControl?.clearValidators();
      priceControl?.disable();
    }
    priceControl?.updateValueAndValidity();
  }

  getInventories(): void {
    this.inventoryService.getInventories().subscribe(inventories => {
      this.inventories = inventories//.filter(inventory => inventory.inventory_status == "Active");
      this.buildInventoryMap(); // Construimos el mapa después de cargar los inventarios
      console.log('Inventarios cargados:', this.inventories); // Verificar los inventarios cargados
    });
  }

  getTransactions(): void {
    this.inventoryService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
    });
    console.log('Transacciones cargadas:', this.transactions); // Verificar si las transacciones tienen el inventory_id correcto

  }



  updateTransaction(): void {
    if (this.transactionForm.valid && this.editingTransactionId) {
      const formValues = this.transactionForm.value;

      // Crear el objeto actualizado de la transacción
      const updatedTransaction: Transaction = {
        id: this.editingTransactionId, // Mantén el ID de la transacción
        inventoryId: formValues.inventory_id,
        quantity: formValues.quantity,
        price: formValues.price,
        transactionType: formValues.transaction_type, // Asegúrate de capturar correctamente el tipo de transacción
        transactionDate: new Date().toISOString() // Si quieres mantener la fecha actualizada
      };

      // Enviar la actualización al servidor
      this.inventoryService.updateTransaction(this.editingTransactionId, updatedTransaction).subscribe(() => {
        this.getTransactions(); // Recargar las transacciones
        this.resetForm(); // Resetea el formulario después de la edición
      });
    }
  }



  editTransaction(transaction: Transaction): void {
    this.isEditing = true;
   // this.editingTransactionId = transaction.id;
    this.transactionForm.patchValue(transaction);
    this.toggleFieldsByTransactionType(transaction.transactionType);
  }

  deleteTransaction(transaction_id: number): void {
    this.inventoryService.deleteTransaction(transaction_id).subscribe(() => {
      this.getTransactions();
    });
  }

  resetForm(): void {
    this.transactionForm.reset({
      transactionType: '',
      inventory_id: '',
      quantity: 0,
      price: 0,
      transaction_date: new Date().toISOString().split('T')[0]
    });
    this.isEditing = false;
  //  this.editingTransactionId = null;
  }

  onClose(){
    this.showRegisterTransactionForm.emit();
    this.isModalOpen = false
  }
}
