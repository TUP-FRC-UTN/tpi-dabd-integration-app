import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConstructionService } from '../../services/construction.service';
import { CommonModule } from '@angular/common';
import { CadastreService } from '../../../cadastre/services/cadastre.service';
import { FormConfig, FormFieldsComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-construction-form',
  standalone: true,
  imports: [CommonModule, FormFieldsComponent],
  templateUrl: './construction-form.component.html',
  styleUrl: './construction-form.component.css',
})
export class ConstructionFormComponent implements OnInit {
  @ViewChild(FormFieldsComponent) formFieldsComponent!: FormFieldsComponent;

  // Services:
  activeModal = inject(NgbActiveModal);
  private cadastreService = inject(CadastreService);
  private constructionService = inject(ConstructionService);

  // Properties:
  isButtonOutside: boolean = true;

  constructionFormConfig: FormConfig = {
    formColumns: 2,
    fields: [
      {
        name: 'plot_id',
        label: 'Plot ID',
        type: 'select',
        options: [
          { name: '1 - Default Plot', value: '1' },
          { name: '2 - Second Plot', value: '2' },
        ],
        validations: { required: true, min: 1 },
      },
      {
        name: 'description',
        label: 'Description',
        type: 'text',
        validations: { required: true },
      },
      {
        name: 'planned_start_date',
        label: 'Planned Start Date',
        type: 'date',
        validations: { required: true },
        fieldSpan: 1,
      },
      {
        name: 'planned_end_date',
        label: 'Planned End Date',
        type: 'date',
        validations: { required: true },
        fieldSpan: 1,
      },
      {
        name: 'project_name',
        label: 'Project Name',
        type: 'text',
        validations: { required: true, maxLength: 50 },
      },
      {
        name: 'project_address',
        label: 'Project Address',
        type: 'text',
        validations: { required: true, maxLength: 100 },
      },
    ],
  };

  ngOnInit(): void {
    this.cadastreService.getPlots().subscribe((plots) => {
      this.constructionFormConfig.fields[0].options = plots.content.map(
        (plot) => {
          return {
            name: plot.plot_number.toString() + ' - ' + plot.plot_type,
            value: plot.plot_number.toString(),
          };
        }
      );
    });
  }

  onSubmit = (formValue: any): void => {
    this.constructionService.registerConstruction(formValue).subscribe(() => {
      this.activeModal.close();
    });
  };

  // In case you want to use the button outside the form
  // @ViewChild(FormFieldsComponent) formFieldsComponent!: FormFieldsComponent; line needed
  submitForm(): void {
    this.formFieldsComponent.submit();
  }
}
