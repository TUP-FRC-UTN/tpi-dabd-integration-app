import {
  Component,
  ElementRef,
  inject,
  Input,
  input,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { SanctionType } from '../../../sanction-type/models/sanction-type.model';
import { Plot } from '../../../../cadastre/plot/models/plot.model';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CadastreService } from '../../../../cadastre/services/cadastre.service';
import { ClaimService } from '../../../claim/service/claim.service';
import { RoleService } from '../../../../../shared/services/role.service';
import { SanctionTypeService } from '../../../sanction-type/services/sanction-type.service';
import { ToastService } from 'ngx-dabd-grupo01';
import { CommonModule, NgClass } from '@angular/common';
import { InfractionServiceService } from '../../services/infraction-service.service';

@Component({
  selector: 'app-appeal-infraction-modal',
  standalone: true,
  imports: [FormsModule, NgClass, CommonModule, ReactiveFormsModule],
  templateUrl: './appeal-infraction-modal.component.html',
  styleUrl: './appeal-infraction-modal.component.scss',
})
export class AppealInfractionModalComponent {
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
  private modalService = inject(NgbModal);
  activeModal = inject(NgbActiveModal);

  ngOnInit() {
    this.roleService.currentUserId$.subscribe((userId: number) => {
      this.userId = userId;
    });
  }

  //medotod de agregar archivos
  onFilesSelected(event: any) {
    const files = event.target.files;
    this.selectedFiles = [];
    for (let file of files) {
      this.selectedFiles.push(file);
    }
  }

  // Método para enviar el formulario de reclamos
  submitAppeal() {
    if (this.description && this.userId) {
      const formData = new FormData();

      formData.append('description', this.description);

      // Agregar archivos seleccionados
      this.selectedFiles.forEach((file, index) => {
        formData.append(`files`, file, file.name);
      });

      formData.append('user_id', this.userId.toString());

      this.infractionService
        .appealInfraction(formData, this.infractionId!)
        .subscribe({
          next: (response) => {
            this.activeModal.close(response);
            this.toastService.sendSuccess(
              'Se apelo correctamente a la infracción.'
            );
   
          },
          error: (error) => {
            this.toastService.sendError('Error en la apelación.');
          },
        });
    } else {
      console.error('Faltan datos obligatorios en el formulario');
    }
  }
}
