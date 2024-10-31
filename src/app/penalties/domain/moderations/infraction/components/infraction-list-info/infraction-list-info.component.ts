import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-infraction-list-info',
  standalone: true,
  imports: [],
  templateUrl: './infraction-list-info.component.html',
  styleUrl: './infraction-list-info.component.scss',
})
export class InfractionListInfoComponent {
  activeModal = inject(NgbActiveModal);
}
