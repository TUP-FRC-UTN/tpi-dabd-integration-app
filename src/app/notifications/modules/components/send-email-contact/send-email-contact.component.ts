import { Component, inject, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from 'ngx-dabd-grupo01';
import { ContactModel } from '../../../models/contacts/contactModel';
import { EmailDataContact } from '../../../models/notifications/emailDataContact';
import { TemplateModel } from '../../../models/templates/templateModel';
import { Variable } from '../../../models/variables';
import { Base64Service } from '../../../services/base64-service.service';
import { ContactService } from '../../../services/contact.service';
import { EmailService } from '../../../services/emailService';
import { TemplateService } from '../../../services/template.service';

@Component({
  selector: 'app-send-email-contact',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './send-email-contact.component.html',
  styleUrl: './send-email-contact.component.css'
})
@Inject('TemplateService')
@Inject('EmailService')
@Inject('ContactService')
@Inject('Base64Service')
export class SendEmailContactComponent implements OnInit {

  subjectToSend: string = ""
  variables: Variable[] = []
  template_id: string = '';
  contacts_id: number[] = []

  templateService = new TemplateService()
  emailService = new EmailService();
  serviceContacts = new ContactService()
  base64Service: Base64Service = new Base64Service()
  toastService: ToastService = inject(ToastService)

  allContacts: ContactModel[] = []
  allTemplates: TemplateModel[] = []
  selectedContactId: number = 0
  variableName: string = ""
  variableValue: string = ""

  //Estado para modal de preview template
  showModalToRenderHTML: boolean = false;

  //ViewChild para preview de template
  @ViewChild('iframePreview', { static: false }) iframePreview!: ElementRef;



  ngOnInit(): void {
    this.serviceContacts.getAllContacts().subscribe((data) => {
      this.allContacts = data
        .filter(contact => contact.contactType === "Correo eléctronico")
        .sort((a, b) => a.contactValue.localeCompare(b.contactValue));
    });
    this.templateService.getAllTemplates().subscribe((data) => {
      this.allTemplates = data
    })
  }
  addContact() {
    if (this.selectedContactId != 0) {
      this.contacts_id.push(this.selectedContactId)
    }
    this.selectedContactId = 0
  }
  showContactById(id: number): string {
    const contact = this.allContacts.find(contact => contact.id == id);
    return contact ? contact.contactValue : '';
  }
  addVariables() {
    if (this.variableName != null && this.variableName !== "" && this.variableValue != null && this.variableValue !== "") {

      const newVariable: Variable = {
        key: this.variableName,
        value: this.variableValue
      }

      this.variables.push(newVariable)
      this.variableName = "";
      this.variableValue = "";
    }
  }
  submit() {
    const data: EmailDataContact = {
      subject: this.subjectToSend,
      variables: this.variables,
      templateId: Number(this.template_id),
      contactIds: this.contacts_id
    }
    this.emailService.sendEmailWithContacts(data).subscribe({
      next: (response) => {
        this.toastService.sendSuccess("Enviado con exito")
        this.clean()
      },
      error: (errr) => {
        this.toastService.sendError("Hubo un error al enviar el correo, pruebe más tarde")
      }
    })
  }
  clean() {
    this.subjectToSend = ""
    this.variables = []
    this.template_id = ''
    this.contacts_id = []
  }

  //Previsualizacion de template

  previewSelectedTemplate(): void {
    const selectedTemplate = this.allTemplates.find(t => t.id == parseInt(this.template_id));
    console.log('selectedTemplate: ', selectedTemplate)

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


}
