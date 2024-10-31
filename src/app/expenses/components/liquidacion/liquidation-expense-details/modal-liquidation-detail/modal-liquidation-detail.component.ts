import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-liquidation-detail',
  standalone: true,
  imports: [],
  templateUrl: './modal-liquidation-detail.component.html',
  styleUrl: './modal-liquidation-detail.component.css'
})
export class ModalLiquidationDetailComponent {
  constructor(public activeModal: NgbActiveModal) {}

  close(){
    this.activeModal.dismiss();
  }
}
