import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-ng-modal',
  standalone: true,
  imports: [],
  templateUrl: './ng-modal.component.html',
  styleUrl: './ng-modal.component.css'
})
export class NgModalComponent {
  title = '';
  message = '';
  constructor(public activeModal: NgbActiveModal) {}
}
