import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { EmailService } from '../../../services/emailService';
import { TemplateModel } from '../../../models/templates/templateModel';
import { EmailData } from '../../../models/notifications/emailData';
import { Variable } from '../../../models/variables';
import { Base64Service } from '../../../services/base64-service.service';
import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
import { TemplateService } from '../../../services/template.service';

@Component({
  selector: 'app-send-notification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainContainerComponent],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css'
})
export class SendEmailComponent implements OnInit {
  emailForm: FormGroup;
  templates: TemplateModel[] = [];
  isLoading = false;
  showModalToRenderHTML = false;
  informationModalTitle: string = '';
  isModalOpen: boolean = false;
  @ViewChild('iframePreview') iframePreview!: ElementRef;
  toastService: ToastService = inject(ToastService);
  templateService: TemplateService = inject(TemplateService);
  emailService: EmailService = inject(EmailService);
  base64Service: Base64Service = inject(Base64Service);

  constructor(private formBuilder: FormBuilder) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      templateID: ['', Validators.required],
      variables: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.templateService.getAllTemplates().subscribe((templates: TemplateModel[]) => {
      this.templates = templates;
    });
    this.emailForm.valueChanges.subscribe(() => {
      this.emailForm.updateValueAndValidity()
    })
  }

  get variables() {
    return (this.emailForm.get('variables') as FormArray);
  }

  addVariable() {
    const variableGroup = this.formBuilder.group({
      key: [''],  // Variable "key" con validación requerida
      value: [''],  // Variable "value" con validación requerida
    });
  
    this.variables.push(variableGroup);  // Agregar el grupo al FormArray
    this.emailForm.updateValueAndValidity();  // Actualiza la validez del formulario
  }
  
  
  removeVariable(index: number) {
    this.variables.removeAt(index);  // Eliminar la variable del FormArray
    this.emailForm.updateValueAndValidity();  // Actualiza la validez del formulario
  }
  
  

  submit() {
    this.isLoading = true;

    const variables = this.variables.value.map((variable: any) => ({
      key: variable.key,
      value: variable.value,
    }));

    const data: EmailData = {
      recipient: this.emailForm.get('email')?.value,
      subject: this.emailForm.get('subject')?.value,
      variables: variables,
      templateId: Number(this.emailForm.get('templateID')?.value),
    };
    console.log(data);
    

    this.emailService.sendEmail(data).subscribe({
      next: () => {
        this.toastService.sendSuccess('Enviado con éxito');
        this.clean();
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 400) {
          this.toastService.sendError("Las variables no coinciden. Por favor, verifique y vuelva a intentar.");
        }

       else this.toastService.sendError('Hubo un error al enviar el correo, pruebe más tarde');
        this.isLoading = false;
      },
    });
  }

  previewSelectedTemplate(): void {

    const selectedTemplate = this.templates.find(t => t.id == parseInt(this.emailForm.get('templateID')?.value));

    if (selectedTemplate) {
      this.showModalToRenderHTML = true;
      // Colocamos el contenido HTML de la plantilla en el iframe
      setTimeout(() => {
        const iframe = this.iframePreview.nativeElement as HTMLIFrameElement;
        iframe.srcdoc = selectedTemplate.body;
        iframe.onload = () => {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDocument) {
            const height = iframeDocument.documentElement.scrollHeight;
            iframe.style.height = `${height}px`;
          }
        };
      }, 5);
    }
  }

  closeModalToRenderHTML() {
    this.showModalToRenderHTML = false;
  }

  clean() {
    this.emailForm.reset();
    this.variables.clear();
  }

  showInfo() {
    this.isModalOpen = true;
    this.informationModalTitle = 'Información sobre el Envío de Notificaciones';
  }  
}
