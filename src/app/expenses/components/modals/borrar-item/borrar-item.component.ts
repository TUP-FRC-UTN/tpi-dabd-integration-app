import { Component, inject, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-borrar-item',
  standalone: true,
  imports: [],
  templateUrl: './borrar-item.component.html',
  styleUrl: './borrar-item.component.css'
})
export class BorrarItemComponent {
  @Input() chargeId!: number;

  constructor(public activeModal: NgbActiveModal) {}

  confirmDelete() {
    this.activeModal.close(this.chargeId);
  }

  cancelDelete() {
    this.activeModal.dismiss();
  }
}
