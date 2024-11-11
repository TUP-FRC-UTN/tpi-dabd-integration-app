import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Form, FormsModule } from '@angular/forms';
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
  imports: [FormsModule, CommonModule,MainContainerComponent],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css'
})

@Inject('EmailService')
@Inject('Base64Service')
@Inject('TemplateService')
export class SendEmailComponent implements OnInit {
  toastService: ToastService = inject(ToastService)

  @ViewChild('iframePreview', { static: false }) iframePreview!: ElementRef;

  emailService = new EmailService();
  templateService = new TemplateService();

  base64Service: Base64Service = new Base64Service();

  emailToSend: string = ""
  subject: string = ""
  name: string = ""
  value: string = ""
  templateID: string = '';

  variables: Variable[] = []
  templates: TemplateModel[] = []

  showModalToRenderHTML: boolean = false;
  isLoading: boolean = false;

    // Estado del modal
    isModalOpen = false;  // Controla si el modal está abierto o cerrado
    informationModalTitle = '';
    informationModalMessage = '';
  

  ngOnInit(): void {

    this.templateService.getAllTemplates().subscribe((data) => {
      this.templates = data;
    });
  }


  previewSelectedTemplate(): void {

    const selectedTemplate = this.templates.find(t => t.id == parseInt(this.templateID));

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


  enviar(form: Form) {
    this.isLoading = true

    const data: EmailData = {
      recipient: this.emailToSend,
      subject: this.subject,
      variables: this.variables,
      templateId: Number(this.templateID)
    }
    this.emailService.sendEmail(data).subscribe({
      next: (data) => {
        this.toastService.sendSuccess("Enviado con exito")
        this.clean()
        this.isLoading = false
      },
      error: (errr) => {
        this.toastService.sendError("Hubo un error al enviar el correo, pruebe más tarde")
        this.isLoading = false
      }
    })
  }
  addVariables() {
    if (this.name != null && this.name !== "" && this.value != null && this.value !== "") {

      const newVariable: Variable = {
        key: this.name,
        value: this.value
      }

      this.variables.push(newVariable)
      this.name = "";
      this.value = "";
    }
  }
  clean() {
    this.emailToSend = ""
    this.subject = ""
    this.name = ""
    this.value = ""
    this.templateID = '';
    this.variables = []
  }



  showInformationModal(title: string, message: string) {
    this.informationModalTitle = title;
    this.informationModalMessage = message;
    this.isModalOpen = true;  // Abre el modal
  }

  closeInformationModal() {
    this.isModalOpen = false;  // Cierra el modal
  }

  // Método para mostrar información sobre el envío de notificaciones
  showInfo() {
    const message = `
      <strong>Envío de Notificaciones</strong><br>
      Esta funcionalidad permite enviar notificaciones a contactos registrados. 
      Asegúrese de completar todos los campos obligatorios antes de enviar.
    `;
    this.showInformationModal('Información', message);
  }

}
