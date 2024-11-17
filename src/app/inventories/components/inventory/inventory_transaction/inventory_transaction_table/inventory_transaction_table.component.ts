import { InventoryService } from './../../../../services/inventory.service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Inventory, Transaction, TransactionType } from '../../../../models/inventory.model';
import { Article } from '../../../../models/article.model';
import { CommonModule } from '@angular/common';
import { MapperService } from '../../../../services/MapperCamelToSnake/mapper.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-inventory-transaction-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory_transaction_table.component.html',
  styleUrl: './inventory_transaction_table.component.css'
})
export class InventoryTransactionTableComponent {

  private mapperService = inject(MapperService);
  private inventoryService = inject(InventoryService);


  @Input() inventory: Inventory | null = null;
  @Output() closeTransactions = new EventEmitter<void>();
  @Output() showTransactions = new EventEmitter<void>();
  isModalOpen : boolean = true;


  constructor(private route: ActivatedRoute) {}

  transactions: Transaction[] = [];
  inventories: Inventory[] = [];
  isEditing: boolean = false;
  editingTransactionId: number = 0;
  selectedTransactionType: TransactionType = TransactionType.ENTRY;
  articleMap: { [key: number]: Article } = {};
  inventoryMap: { [key: number]: Inventory } = {};
  articles: Article[] = [];


ngOnInit(): void {
  if (this.inventory?.id) {
    console.log('ID de inventario recibido:', this.inventory?.id);
    this.loadTransactions(this.inventory?.id.toString());
  }
}

  loadTransactions(inventoryId: string): void {
    this.inventoryService.getTransactionsInventory(inventoryId.toString()).subscribe({
      next: (transactions) => {
        this.transactions = transactions.map(transaction => this.mapperService.toCamelCase(transaction));
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
      }
    });
  }

  getTransactionTypeLabel(type: TransactionType): string {
    switch(type) {
      case TransactionType.ENTRY:
        return 'Entrada';
      case TransactionType.OUTPUT:
        return 'Salida';
      default:
        return 'Desconocido';
    }
  }
deleteTransaction(arg0: any) {
throw new Error('Method not implemented.');
}
editTransaction(_t12: any) {
throw new Error('Method not implemented.');
}

onClose(){
  this.showTransactions.emit();
  this.isModalOpen = false
}

}
