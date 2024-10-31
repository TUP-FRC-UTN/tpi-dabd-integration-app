import { Component } from '@angular/core';
import { ToastService, ToastsContainer } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ToastsContainer],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {

  constructor(private toastService: ToastService) {}

  showToast() {
    this.toastService.sendSuccess('¡Este es un mensaje de Toast con ng-bootstrap!');
  }

  showError(){
    this.toastService.sendError('¡Este es un mensaje de Toast con ng-bootstrap!');
  }

}
