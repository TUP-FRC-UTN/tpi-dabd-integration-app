import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormConfig, FormFieldsComponent, ToastService } from 'ngx-dabd-grupo01';
import { ChargeTypeEnum } from '../../models/sanction-type.model';
import { SanctionTypeService } from '../../services/sanction-type.service';
@Component({
  selector: 'app-sanction-type-form',
  standalone: true,
  imports: [CommonModule, FormFieldsComponent],
  templateUrl: './sanction-type-form.component.html',
  styleUrl: './sanction-type-form.component.scss',
})
export class SanctionTypeFormComponent {
  @ViewChild(FormFieldsComponent) formFieldsComponent!: FormFieldsComponent;

  // Services:
  activeModal = inject(NgbActiveModal);
  private sanctionTypeService = inject(SanctionTypeService);
  private toastService = inject(ToastService);
  // private getValueByKeyForEnumPipe = inject(GetValueByKeyForEnumPipe);
  // private constructionService = inject(ConstructionService);

  // Properties:
  isButtonOutside: boolean = true;

  constructionFormConfig: FormConfig = {
    formColumns: 2,
    fields: [
      {
        name: 'name',
        label: 'Nombre',
        type: 'text',
        validations: { required: true },
      },
      {
        name: 'charge_type',
        label: 'Tipo',
        type: 'select',
        fieldSpan: 1,
        options: this.sanctionTypeService.getChargeTypeKeys().map((key) => ({
          name: ChargeTypeEnum[key as keyof typeof ChargeTypeEnum] || key,
          value: key,
        })),

        validations: { required: true, min: 1 },
      },
      {
        name: 'amount',
        label: 'Monto',
        type: 'number',
        fieldSpan: 1,
        validations: { required: true, pattern: '^[0-9]+(.[0-9]{1,2})?$' },
      },
      {
        name: 'infraction_days_to_expire',
        label: 'Dias de vencimiento',
        type: 'number',
        fieldSpan: 1,
        validations: { required: true, pattern: '^[0-9]+$' },
      },
      {
        name: 'amount_of_infractions_for_fine',
        label: 'Strikes',
        type: 'number',
        fieldSpan: 1,
        validations: { required: true, pattern: '^[0-9]+$' },
      },
      {
        name: 'description',
        label: 'Descripción',
        type: 'textarea',
        validations: { required: true },
      },
    ],
  };

  onSubmit = (formValue: any): void => {
    this.sanctionTypeService.registerSanctionType(formValue).subscribe({
      next: (result) => {
        this.activeModal.close();
        this.toastService.sendSuccess(`Se creó el tipo ${result.id}`);
      },
      error: (error) => {
        this.toastService.sendError('Ocurrió un error al crear el tipo');
      },
    });
  };

  // In case you want to use the button outside the form
  // @ViewChild(FormFieldsComponent) formFieldsComponent!: FormFieldsComponent; line needed
  submitForm(): void {
    this.formFieldsComponent.submit();
  }
}
