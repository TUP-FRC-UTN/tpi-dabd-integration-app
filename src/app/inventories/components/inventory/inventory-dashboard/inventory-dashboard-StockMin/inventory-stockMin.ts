import { Console } from 'console';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Inventory } from '../../../../models/inventory.model';

@Component({
  selector: 'app-invenotry-stock-min-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Artículos con Stock Bajo</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of lowStockItems">
              <td>{{ item.article.name }}</td>
              <td>{{ item.article.articleCategory.denomination}}</td>
              <td>{{ item.stock }}</td>
              <td>{{ item.minStock }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div *ngIf="lowStockItems.length === 0" class="text-center py-3">
        <p class="text-muted">No hay artículos con stock bajo</p>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.close()">Cerrar</button>
    </div>
  `
})
export class InventoryStockMinModalComponent {
  @Input() lowStockItems: Inventory[] = [];
  constructor(public activeModal: NgbActiveModal) {}
}
