  import { Component, inject, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { RouterLink } from '@angular/router';
  import { TemplateService } from '../../../services/template.service';
  import { Variable } from '../../../models/variables';
  import { ContactModel } from '../../../models/contacts/contactModel';
  import { ContactService } from '../../../services/contact.service';
  import { TemplateModel } from '../../../models/templates/templateModel';
  import { Base64Service } from '../../../services/base64-service.service';
  import { EmailDataContact } from '../../../models/notifications/emailDataContact';
  import { CommonModule } from '@angular/common';
  import { MainContainerComponent, ToastService } from 'ngx-dabd-grupo01';
  import { EmailService } from '../../../services/emailService';
  import { NgSelectModule } from '@ng-select/ng-select';


  @Component({
    selector: 'app-send-email-contact',
    standalone: true,
    imports: [RouterLink, FormsModule, CommonModule,MainContainerComponent, NgSelectModule],
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
    isLoading: boolean = false;

    templateService = new TemplateService()
    emailService = new EmailService();
    serviceContacts = new ContactService()
    base64Service: Base64Service = new Base64Service()
    toastService: ToastService = inject(ToastService)

    allContacts: ContactModel[] = []
    allTemplates: TemplateModel[] = []
    selectedContactId: number[] | null = null;
    variableName: string = ""
    variableValue: string = ""
    isModalOpen: boolean = false;
    isInformationModalOpen = false;
    informationModalTitle = '';
    informationModalMessage = '';
    
    //Estado para modal de preview template
    showModalToRenderHTML: boolean = false;

    //ViewChild para preview de template
    @ViewChild('iframePreview', { static: false }) iframePreview!: ElementRef;



    ngOnInit(): void {
      this.serviceContacts.getAllContacts().subscribe((data) => {
        this.allContacts = data
          .filter(contact => contact.contactType === "Correo electrónico")
          .sort((a, b) => a.contactValue.localeCompare(b.contactValue))
          .filter(contact => !this.contacts_id.includes(contact.id))
      });
      this.templateService.getAllTemplates().subscribe((data) => {
        this.allTemplates = data
      })
    }
    addContact() {
      if (this.selectedContactId && this.selectedContactId.length > 0) {
        this.contacts_id.push(...this.selectedContactId);
      }
      this.selectedContactId = [];
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
      this.isLoading = true; // Mostrar el spinner al iniciar el envío
    
      console.log(this.variables)
      const data: EmailDataContact = {
        subject: this.subjectToSend,
        variables: this.variables,
        templateId: Number(this.template_id),
        contactIds: this.contacts_id
      };
    
      this.emailService.sendEmailWithContacts(data).subscribe({
        next: (response) => {
          this.toastService.sendSuccess("Enviado con éxito");
          this.clean();
        },
        error: (errr) => {
          if (errr.status === 400) {
            this.toastService.sendError("Las variables no coinciden. Por favor, verifique y vuelva a intentar.");
          }
          else this.toastService.sendError("Hubo un error al enviar el correo, pruebe más tarde");
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false; // Ocultar el spinner al finalizar
        }
      });
    }
    
    clean() {
      this.subjectToSend = ""
      this.variables = []
      this.template_id = ''
      this.contacts_id = []
    }

    filterAvailableContacts(): ContactModel[] {
      console.log('ejecutandose')
      return this.allContacts.filter(contact => !this.contacts_id.includes(contact.id));
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

    showInformationModal(title: string, message: string) {
      this.isModalOpen = true;  // Abre el modal

      this.informationModalTitle = title;
      this.informationModalMessage = message;
      this.isInformationModalOpen = true;
    }

    closeInformationModal() {
      this.isInformationModalOpen = false;
      this.isModalOpen = false;
    }

    showInfo() {
      const message = `
        <strong>Notificaciones a Varios Contactos</strong><br>
        Envío de notificaciones a múltiples contactos registrados.<br><br>
        Debe seleccionar al menos un contacto para continuar.
      `;
      this.showInformationModal('Información', message);
    }

  }
