import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastsContainer, ToastService } from 'ngx-dabd-grupo01';
import { VisitorService } from '../../../../services/visitors/visitor.service';
import { LoginService } from '../../../../../users/services/login.service';
import { LoginModel } from '../../../../models/login.model';

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    FormsModule,
    NgClass,
    ToastsContainer
  ],
  templateUrl: './entity-form.component.html',
  styleUrl: './entity-form.component.scss',
})
export class EntityFormComponent {
  entityForm: FormGroup = {} as FormGroup;
  url = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  activeModal = inject(NgbActiveModal);
  isUpdate: boolean = false;

  @Input() visitorId?: number;
  @Output() entitySaved = new EventEmitter<boolean>();
  @Output() entityCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private visitorService: VisitorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.visitorId) {
      this.loadData(this.visitorId);
    }

    this.entityForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      docType: ['DNI', Validators.required],
      docNumber: [null, Validators.required],
      birthDate: [null],
    });
  }

  onCancel() {
    this.router.navigate(['/entity/list']);
    this.activeModal.dismiss(); // Cierra el modal
  }

  onSubmit(): void {
    if (this.entityForm.valid) {
      const formData = this.entityForm.value;

      if (formData.birthDate) {
        formData.birthDate = formatFormDate(formData.birthDate);
      }

      this.visitorService
        .upsertVisitor(
          formData,
          this.getLogin().id,
          this.visitorId
        )
        .subscribe({
          next: (response) => {
            if (this.isUpdate) {
              this.toastService.sendSuccess('Actualización exitosa!');
            } else {
              this.toastService.sendSuccess('Registro exitoso!');
              this.entityCreated.emit();
            }

            this.entitySaved.emit(true);

            // Aquí cerramos el modal después de mostrar el toast
            setTimeout(() => {
              this.activeModal.close();
              this.toastService.remove(this.toastService.toasts[0]); // Cierra el modal
              this.isUpdate = false;
            }, 1500);
          },
          error: (error) => {
            console.log(error);
            if (error.status === 400) {
              this.toastService.sendError('Error, Documento ya registrado.');
            } else {
              this.toastService.sendError(
                'Ocurrió un error inesperado. Intente de nuevo más tarde.'
              );
            }
          },
        });
    } else {
      this.markAllAsTouched();
    }
  }

  private markAllAsTouched(): void {
    Object.values(this.entityForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  loadData(id: number) {
    this.visitorService.getVisitorById(id).subscribe({
      next: (data) => {
        let birthDate = null;
        if (data.body?.birthDate) {
          const [day, month, year] = data.body.birthDate.split('-');
          birthDate = `${year}-${month}-${day}`;
        }

        this.entityForm.patchValue({
          name: data.body?.name,
          lastName: data.body?.lastName,
          docType: data.body?.docType,
          docNumber: data.body?.docNumber,
          birthDate: birthDate,
        });
        this.isUpdate = true;
      },
      error: (error) => {
        console.error('Error getting visitors:', error);
      },
    });
  }

  getLogin():LoginModel{
    return {
      birthDate: "", docNumber: 0, docType: "", id: 2, lastName: "R.", name: "Juan"
    }
  }
}

function formatFormDate(inputDate: string): string {
  // Verificar que la entrada sea una fecha válida en el formato yyyy-MM-dd
  const dateParts = inputDate.split('-');
  if (dateParts.length !== 3) {
    throw new Error('Fecha no válida. Debe estar en formato yyyy-MM-dd');
  }

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  // Devolver la fecha en el formato dd-MM-yyyy
  return `${day}-${month}-${year}`;
}
