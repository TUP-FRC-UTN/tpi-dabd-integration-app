import { Component, inject, Input } from '@angular/core';
import { InfractionServiceService } from '../../services/infraction-service.service';
import { RoleService } from '../../../../../shared/services/role.service';
import { ToastService } from 'ngx-dabd-grupo01';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-reject-infraction-modal',
  standalone: true,
  imports: [FormsModule, NgClass, CommonModule, ReactiveFormsModule],
  templateUrl: './reject-infraction-modal.component.html',
  styleUrl: './reject-infraction-modal.component.scss',
})
export class RejectInfractionModalComponent {
  @Input() infractionId: number | undefined;

  //services

  private infractionService = inject(InfractionServiceService);
  private roleService = inject(RoleService);

  private toastService = inject(ToastService);

  //variables
  description: string | undefined;

  userId: number | undefined;

  //variable para los archivos
  selectedFiles: File[] = [];

  // Modal logic
  activeModal = inject(NgbActiveModal);

  ngOnInit() {
    this.roleService.currentUserId$.subscribe((userId: number) => {
      this.userId = userId;
    });
  }

  // Método para enviar el formulario de reclamos
  submit() {
    if (this.description && this.userId) {
      const formData = new FormData();

      formData.append('description', 'Rechazo: ' + this.description);
      formData.append('user_id', this.userId.toString());
      formData.append('status', 'REJECTED');

      this.infractionService
        .changeInfractionStatus(formData, this.infractionId!)
        .subscribe({
          next: (response) => {
            this.activeModal.close(response);
            this.toastService.sendSuccess(
              'Se rechazó correctamente a la infracción.'
            );
          },
          error: (error) => {
            this.toastService.sendError('Error en el rechazo.');
          },
        });
    } else {
      console.error('Faltan datos obligatorios en el formulario');
    }
  }
}
