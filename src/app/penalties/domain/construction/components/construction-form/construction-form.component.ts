import { Component, inject, NgModule, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConstructionService } from '../../services/construction.service';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  AbstractControlOptions,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RoleService } from '../../../../shared/services/role.service';
import { ToastService } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-construction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './construction-form.component.html',
  styleUrl: './construction-form.component.css',
})
export class ConstructionFormComponent implements OnInit {
  fb = inject(FormBuilder);
  toastService = inject(ToastService);

  roleService = inject(RoleService);

  userPlots: number[] = [];
  constructionForm: FormGroup = new FormGroup(
    {
      plot_id: new FormControl('', [Validators.required]),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20),
      ]),
      planned_start_date: new FormControl('', [
        Validators.required,
        this.startDateValidator(),
      ]),

      planned_end_date: new FormControl('', [Validators.required]),
      start_time: new FormControl('08:00', [Validators.required]),
      end_time: new FormControl('18:00', [Validators.required]),
      project_address: new FormControl('', []),
    },
    {
      validators: [this.dateRangeValidator, this.timeValidation],
    } as AbstractControlOptions
  );

  // Services:
  activeModal = inject(NgbActiveModal);
  private constructionService = inject(ConstructionService);

  // Properties:
  isButtonOutside: boolean = true;

  ngOnInit(): void {
    this.roleService.currentLotes$.subscribe((plots) => {
      this.userPlots = plots;
    });
  }
  onSubmit(): void {
    if (this.constructionForm.invalid) {
      this.constructionForm.markAllAsTouched();
      return;
    }

    this.constructionService
      .registerConstruction(this.constructionForm.value)
      .subscribe({
        next: (response) => {
          this.toastService.sendSuccess(
            'Construcción ' + response.construction_id + ' creada exitosamente'
          );
          this.activeModal.close(response);
        },
        error: (error) => {
          this.toastService.sendError('Error al crear la construcción');
        },
      });
  }

  startDateValidator() {
    return (control: AbstractControl) => {
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Para comparar solo la fecha

      return selectedDate > today ? null : { invalidStartDate: true };
    };
  }

  // Validación para que la fecha de finalización sea posterior a la de inicio
  dateRangeValidator(form: AbstractControl) {
    const start = form.get('planned_start_date')?.value;
    const end = form.get('planned_end_date')?.value;

    if (start && end) {
      return new Date(end) > new Date(start) ? null : { invalidEndDate: true };
    }
    return null;
  }

  onClose() {
    this.activeModal.close();
  }
  convertTimeToDate(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  timeValidation(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: boolean } | null => {
      const startTime = form.get('start_time')?.value;
      const endTime = form.get('end_time')?.value;
  
      if (startTime && endTime) {
        const start = this.convertTimeToDate(startTime);
        const end = this.convertTimeToDate(endTime);
  
        if (start >= end) {
          return { invalidTimeRange: true };
        }
      }
      return null;
    };
  }
  
}
