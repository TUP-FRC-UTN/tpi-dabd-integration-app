import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-provider-list-info',
  standalone: true,
  imports: [],
  templateUrl: './provider-list-info.component.html',
  styleUrl: './provider-list-info.component.css'
})
export class ProviderListInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
