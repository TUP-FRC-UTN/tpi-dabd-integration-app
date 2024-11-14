import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EmailService } from '../../../services/emailService';
import { TemplateModel } from '../../../models/templates/templateModel';
import { EmailData } from '../../../models/notifications/emailData';
import { Variable } from '../../../models/variables';
import { Base64Service } from '../../../services/base64-service.service';
import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
import { TemplateService } from '../../../services/template.service';

@Component({
  selector: 'app-send-email',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MainContainerComponent],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css',
})
@Inject('EmailService')
@Inject('Base64Service')
@Inject('TemplateService')
export class SendEmailComponent implements OnInit {
  toastService: ToastService = inject(ToastService);

  @ViewChild('iframePreview', { static: false }) iframePreview!: ElementRef;

  emailForm: FormGroup;

  emailService: EmailService = new EmailService();
  templateService: TemplateService = new TemplateService();

  base64Service: Base64Service = new Base64Service();

  variables: Variable[] = [];
  templates: TemplateModel[] = [];

  showModalToRenderHTML: boolean = false;
  isLoading: boolean = false;

  // Estado del modal
  isModalOpen = false;
  informationModalTitle = '';
  informationModalMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    @Inject('EmailService') private _emailService: EmailService,
    @Inject('Base64Service') private _base64Service: Base64Service,
    @Inject('TemplateService') private _templateService: TemplateService,
    private _toastService: ToastService
  ) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      templateID: ['', Validators.required],
      variables: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this._templateService.getAllTemplates().subscribe((data) => {
      this.templates = data;
    });
  }

  previewSelectedTemplate(): void {
    const selectedTemplate = this.templates.find(
      (t) => t.id == parseInt(this.emailForm.get('templateID')?.value)
    );

    if (selectedTemplate) {
      this.showModalToRenderHTML = true;
      // Colocamos el contenido HTML de la plantilla en el iframe
      setTimeout(() => {
        const iframe = this.iframePreview.nativeElement as HTMLIFrameElement;
        iframe.srcdoc = selectedTemplate.body;
        iframe.onload = () => {
          const iframeDocument =
            iframe.contentDocument || iframe.contentWindow?.document;
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

  enviar() {
    this.isLoading = true;

    const data: EmailData = {
      recipient: this.emailForm.get('email')?.value,
      subject: this.emailForm.get('subject')?.value,
      variables: this.variables,
      templateId: Number(this.emailForm.get('templateID')?.value),
    };

    this._emailService.sendEmail(data).subscribe({
      next: (data) => {
        this._toastService.sendSuccess('Enviado con éxito');
        this.clean();
        this.isLoading = false;
      },
      error: (err) => {
        this._toastService.sendError(
          'Hubo un error al enviar el correo, pruebe más tarde'
        );
        this.isLoading = false;
      },
    });
  }

  addVariables() {
    const name = this.emailForm.get('name')?.value;
    const value = this.emailForm.get('value')?.value;

    if (name !== null && name !== '' && value !== null && value !== '') {
      const newVariable: Variable = {
        key: name,
        value: value,
      };

      this.variables.push(newVariable);
      this.emailForm.get('name')?.setValue('');
      this.emailForm.get('value')?.setValue('');
    }
  }

  clean() {
    this.emailForm.reset();
    this.variables = [];
  }

  showInformationModal(title: string, message: string) {
    this.informationModalTitle = title;
    this.informationModalMessage = message;
    this.isModalOpen = true;
  }

  closeInformationModal() {
    this.isModalOpen = false;
  }

  showInfo() {
    const message = `
      <strong>Envío de Notificaciones</strong><br>
      Esta funcionalidad permite enviar notificaciones a contactos registrados. 
      Asegúrese de completar todos los campos obligatorios antes de enviar.
    `;
    this.showInformationModal('Información', message);
  }
}
